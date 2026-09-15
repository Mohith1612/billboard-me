import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type DisposableDatabase, createDisposableDatabase, readMigrationJournal } from "../support/test-database";

/**
 * Both paths a real database can take are exercised: created from nothing, and
 * upgraded in place with rows already in it. Each case owns a database that is
 * dropped afterwards.
 */

async function rowLevelSecurity(database: DisposableDatabase, table: string): Promise<boolean> {
  const [row] = await database.sql<{ enabled: boolean }[]>`
    select c.relrowsecurity as enabled
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = ${table}
  `;
  return row.enabled;
}

const WAITLIST_TABLES = ["seller_waitlist", "brand_waitlist"];

describe("a fresh database", () => {
  let database: DisposableDatabase;

  beforeAll(async () => {
    database = await createDisposableDatabase();
    await database.applyMigrations();
  });

  afterAll(async () => {
    await database?.drop();
  });

  it.each(WAITLIST_TABLES)("creates public.%s", async (table) => {
    const tables = await database.sql`
      select table_name from information_schema.tables
      where table_schema = 'public' and table_name = ${table}
    `;

    expect(tables).toHaveLength(1);
  });

  it.each(WAITLIST_TABLES)("enables row level security on public.%s", async (table) => {
    expect(await rowLevelSecurity(database, table)).toBe(true);
  });

  it.each(WAITLIST_TABLES)("adds no client policy to public.%s", async (table) => {
    const policies = await database.sql`
      select policyname from pg_catalog.pg_policies where schemaname = 'public' and tablename = ${table}
    `;

    expect(policies).toHaveLength(0);
  });

  it("fills in the generated columns and leaves unanswered questions null", async () => {
    const [row] = await database.sql<
      { id: string; createdAt: Date; location: string | null }[]
    >`
      insert into public.seller_waitlist (name, email)
      values ('Fresh seller', 'fresh-seller@example.test')
      returning id, created_at as "createdAt", location
    `;

    expect(row.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(row.createdAt).toBeInstanceOf(Date);
    expect(row.location).toBeNull();
  });

  it("refuses a lead with no contact address", async () => {
    await expect(
      database.sql`insert into public.seller_waitlist (name) values ('No address')`,
    ).rejects.toMatchObject({ code: "23502" });
  });
});

describe("an existing database upgraded in place", () => {
  let database: DisposableDatabase;

  beforeAll(async () => {
    database = await createDisposableDatabase();
    // Stop at the first migration: this is a database that was created before
    // the RLS migration existed, and already holds leads.
    await database.applyMigrations({ through: 0 });
    await database.sql`
      insert into public.seller_waitlist (name, email)
      values ('Before the upgrade', 'before-upgrade@example.test')
    `;
  });

  afterAll(async () => {
    await database?.drop();
  });

  it("keeps existing leads and locks the tables down when the rest is applied", async () => {
    const journal = await readMigrationJournal();
    expect(journal.length).toBeGreaterThan(1);
    // The first migration predates the lockdown, so the tables start open.
    expect(await rowLevelSecurity(database, "seller_waitlist")).toBe(false);

    await database.applyMigrations({ from: 1 });

    const rows = await database.sql`
      select email from public.seller_waitlist where email = 'before-upgrade@example.test'
    `;

    expect(rows).toHaveLength(1);
    for (const table of WAITLIST_TABLES) {
      expect(await rowLevelSecurity(database, table)).toBe(true);
    }
  });
});
