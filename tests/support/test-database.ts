import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parse as parseEnvFile } from "dotenv";
import postgres from "postgres";
import { parseDatabaseUrl } from "@/lib/env/database-url";

/**
 * Disposable PostgreSQL harness.
 *
 * Every integration test gets its own database, created from a maintenance
 * connection, migrated from the committed Drizzle files and dropped afterwards.
 * Nothing is shared between test files, so a failed run cannot leave another
 * one with dirty fixtures.
 *
 * The harness creates and drops databases and roles, which is destructive by
 * nature. Two guards keep that contained:
 *
 *   1. `resolveAdminUrl` refuses a connection string that matches a database
 *      this checkout is configured to use, whether that comes from the
 *      environment or from an `.env` file it reads only in order to refuse it.
 *   2. `assertDisposableName` is checked before every create and drop, so the
 *      harness can only ever touch names it generated itself.
 *
 * Connection strings contain passwords, so no error below echoes one.
 */

const DRIZZLE_DIR = fileURLToPath(new URL("../../drizzle/", import.meta.url));

/** Prefix carried by every database and role this harness creates. */
export const DISPOSABLE_PREFIX = "billboard_test_";

const DISPOSABLE_NAME = /^billboard_test_[a-z0-9_]+$/;

/** Throws unless `name` is one the harness generated and may destroy. */
export function assertDisposableName(name: string, kind: "database" | "role"): void {
  if (!DISPOSABLE_NAME.test(name)) {
    throw new Error(
      `Refusing to create or drop the ${kind} "${name}": the test harness only touches names matching ${DISPOSABLE_NAME.source}.`,
    );
  }
}

/** A database the harness must never create, migrate or drop anything in. */
export interface ProtectedTarget {
  /** How the target is described in an error. Never the connection string. */
  readonly label: string;
  readonly url: string;
}

/** Just enough of an environment for the guard; `process.env` satisfies it. */
export type EnvironmentLike = Record<string, string | undefined>;

const APPLICATION_VARIABLES = ["DATABASE_URL", "DATABASE_MIGRATION_URL"] as const;
const ENV_FILES = [".env.local", ".env"];

/**
 * The application databases named in an env file.
 *
 * The suite never *uses* `.env.local` — Vitest loads no env file and
 * `tests/support/setup.ts` clears these variables. It is read here for the
 * opposite reason: so the harness can recognise a developer's own database and
 * refuse to run against it. The values are compared and discarded, never
 * returned to a test and never echoed in an error.
 */
export function parseProtectedTargets(contents: string, source: string): ProtectedTarget[] {
  const parsed = parseEnvFile(contents);
  return APPLICATION_VARIABLES.flatMap((variableName) => {
    const url = parsed[variableName]?.trim();
    return url ? [{ label: `${variableName} in ${source}`, url }] : [];
  });
}

function envFileTargets(): ProtectedTarget[] {
  return ENV_FILES.flatMap((source) => {
    try {
      return parseProtectedTargets(readFileSync(new URL(`../../${source}`, import.meta.url), "utf8"), source);
    } catch {
      // No such file in this checkout; there is simply nothing to protect.
      return [];
    }
  });
}

function sameTarget(a: string, b: string): boolean {
  try {
    const left = new URL(a);
    const right = new URL(b);
    return left.host === right.host && left.pathname.replace(/\/$/, "") === right.pathname.replace(/\/$/, "");
  } catch {
    return false;
  }
}

/**
 * The maintenance connection for the disposable cluster, or a clear error.
 *
 * `env` and `protectedTargets` are parameters so the guard itself can be
 * unit-tested without touching the real environment or this checkout's files.
 */
export function resolveAdminUrl(
  env: EnvironmentLike = process.env,
  protectedTargets: ProtectedTarget[] = envFileTargets(),
): string {
  const configured = env.TEST_DATABASE_URL?.trim();

  if (!configured) {
    throw new Error(
      "TEST_DATABASE_URL is not set. `pnpm test` starts a disposable PostgreSQL container and sets it for you; set it yourself only to point at another throwaway cluster. See docs/development/testing.md.",
    );
  }

  const adminUrl = parseDatabaseUrl(configured, "TEST_DATABASE_URL");

  const targets: ProtectedTarget[] = [
    ...APPLICATION_VARIABLES.flatMap((variableName) => {
      const url = env[variableName]?.trim();
      return url ? [{ label: variableName, url }] : [];
    }),
    ...protectedTargets,
  ];

  for (const target of targets) {
    if (sameTarget(target.url, adminUrl)) {
      throw new Error(
        `TEST_DATABASE_URL points at the same database as ${target.label}. This harness creates and drops databases and roles, so it refuses to run against a configured application database. Point it at a throwaway cluster instead.`,
      );
    }
  }

  return adminUrl;
}

/** One committed migration, in the order the journal applies it. */
export interface MigrationEntry {
  readonly idx: number;
  readonly tag: string;
}

/** The committed migrations, ordered. Read from the journal, not the directory. */
export async function readMigrationJournal(): Promise<MigrationEntry[]> {
  const journal = JSON.parse(await readFile(`${DRIZZLE_DIR}meta/_journal.json`, "utf8")) as {
    entries: MigrationEntry[];
  };
  return [...journal.entries]
    .sort((left, right) => left.idx - right.idx)
    .map(({ idx, tag }) => ({ idx, tag }));
}

/** The migration files actually present in `drizzle/`, ordered by name. */
export async function readMigrationFiles(): Promise<string[]> {
  const entries = await readdir(DRIZZLE_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort();
}

/** Which migrations to apply, by journal index. Both bounds are inclusive. */
export interface MigrationRange {
  from?: number;
  through?: number;
}

export interface ApplicationRoleOptions {
  /**
   * Whether the role may insert into the waitlist tables. A role without the
   * grant is how a storage failure is produced on a healthy database.
   */
  grantInsert?: boolean;
}

export interface DisposableDatabase {
  /** Generated name, always prefixed with {@link DISPOSABLE_PREFIX}. */
  readonly name: string;
  /** Owner connection to this database, for fixtures and assertions. */
  readonly sql: postgres.Sql;
  /** Applies the committed migrations, in journal order. */
  applyMigrations(range?: MigrationRange): Promise<void>;
  /** Creates a least-privilege application role and returns its connection string. */
  createApplicationRole(options?: ApplicationRoleOptions): Promise<string>;
  /** Runs `run` with the session's role set to `roleName`. */
  asRole<T>(roleName: string, run: (sql: postgres.ReservedSql) => Promise<T>): Promise<T>;
  /** Drops the database and every role this instance created. */
  drop(): Promise<void>;
}

function connectionOptions(): postgres.Options<Record<string, never>> {
  // `prepare: false` matches the application client; `onnotice` keeps expected
  // notices such as "role already exists, skipping" out of the test output.
  return { prepare: false, max: 2, onnotice: () => {} };
}

function urlFor(adminUrl: string, databaseName: string, credentials?: { user: string; password: string }): string {
  const url = new URL(adminUrl);
  url.pathname = `/${databaseName}`;
  if (credentials) {
    url.username = encodeURIComponent(credentials.user);
    url.password = encodeURIComponent(credentials.password);
  }
  return url.toString();
}

function disposableName(suffix: string): string {
  return `${DISPOSABLE_PREFIX}${suffix}_${randomBytes(5).toString("hex")}`;
}

/**
 * Migration `0001` revokes privileges from the Supabase client roles, so they
 * have to exist before it runs. They are cluster-wide, carry no privileges and
 * cannot log in, so they are created once and left in place; the disposable
 * cluster is discarded with them.
 *
 * Roles live in the cluster, not in a database, so test files running in
 * parallel would otherwise race between the check and the create. The
 * transaction-scoped advisory lock serialises exactly that, and is released
 * with the transaction rather than depending on which pooled connection ran it.
 */
const CLIENT_ROLE_LOCK = 8675309;

async function ensureClientRoles(maintenance: postgres.Sql): Promise<void> {
  await maintenance.begin(async (tx) => {
    await tx.unsafe(`select pg_advisory_xact_lock(${CLIENT_ROLE_LOCK})`);
    await tx.unsafe(`
      do $$
      begin
        if not exists (select 1 from pg_catalog.pg_roles where rolname = 'anon') then
          create role anon nologin;
        end if;
        if not exists (select 1 from pg_catalog.pg_roles where rolname = 'authenticated') then
          create role authenticated nologin;
        end if;
      end
      $$;
    `);
  });
}

/** Creates a fresh, empty, disposable database. Migrations are applied separately. */
export async function createDisposableDatabase(): Promise<DisposableDatabase> {
  const adminUrl = resolveAdminUrl();
  const name = disposableName("db");
  assertDisposableName(name, "database");

  const maintenance = postgres(adminUrl, connectionOptions());
  const createdRoles: string[] = [];

  try {
    await ensureClientRoles(maintenance);
    await maintenance.unsafe(`create database "${name}"`);
  } catch (error) {
    await maintenance.end();
    throw error;
  }

  const sql = postgres(urlFor(adminUrl, name), connectionOptions());

  return {
    name,
    sql,

    async applyMigrations({ from = 0, through = Number.POSITIVE_INFINITY }: MigrationRange = {}) {
      const entries = await readMigrationJournal();
      for (const entry of entries) {
        if (entry.idx < from || entry.idx > through) continue;
        const file = await readFile(`${DRIZZLE_DIR}${entry.tag}.sql`, "utf8");
        // Drizzle separates statements with this marker; each migration is
        // applied as one transaction so a partial migration cannot persist.
        const statements = file
          .split("--> statement-breakpoint")
          .map((statement) => statement.trim())
          .filter((statement) => statement.length > 0);
        await sql.begin(async (tx) => {
          for (const statement of statements) {
            await tx.unsafe(statement);
          }
        });
      }
    },

    async createApplicationRole({ grantInsert = true }: ApplicationRoleOptions = {}) {
      const roleName = disposableName("app");
      assertDisposableName(roleName, "role");
      // Random, single-use and never written to disk, so inlining it in the
      // statement below cannot leak a real credential.
      const password = randomBytes(16).toString("hex");

      // The privileges mirror what docs/development/setup.md requires of the
      // application role: connect, use the schema, insert into the waitlists and
      // bypass their RLS. Deliberately no SELECT, UPDATE or DELETE.
      await maintenance.unsafe(`create role "${roleName}" login password '${password}' bypassrls`);
      createdRoles.push(roleName);
      await sql.unsafe(`grant usage on schema public to "${roleName}"`);
      if (grantInsert) {
        await sql.unsafe(
          `grant insert on table public.seller_waitlist, public.brand_waitlist to "${roleName}"`,
        );
      }

      return urlFor(adminUrl, name, { user: roleName, password });
    },

    async asRole(roleName, run) {
      // A reserved session, not a transaction: a denied statement aborts a
      // transaction and every later statement in it, which would hide the error
      // code the caller is asserting on.
      const reserved = await sql.reserve();
      try {
        await reserved.unsafe(`set role "${roleName}"`);
        return await run(reserved);
      } finally {
        await reserved.unsafe("reset role").catch(() => {});
        reserved.release();
      }
    },

    async drop() {
      await sql.end();
      assertDisposableName(name, "database");
      await maintenance.unsafe(`drop database if exists "${name}" with (force)`);
      for (const roleName of createdRoles) {
        assertDisposableName(roleName, "role");
        await maintenance.unsafe(`drop role if exists "${roleName}"`);
      }
      await maintenance.end();
    },
  };
}
