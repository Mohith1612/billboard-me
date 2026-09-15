import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type DisposableDatabase, createDisposableDatabase } from "../support/test-database";

/**
 * Role-level access to the waitlists, ported from `tests/db/waitlist-access.sql`
 * so the same guarantees hold inside the reusable harness: the browser's
 * database roles can do nothing at all, and the application role can do exactly
 * one thing.
 *
 * `pnpm test:db:waitlist` still proves this through `psql` and a real HTTP
 * server; this suite proves it through the client the application actually uses.
 */

const INSUFFICIENT_PRIVILEGE = "42501";
const CLIENT_ROLES = ["anon", "authenticated"];
const WAITLIST_TABLES = ["seller_waitlist", "brand_waitlist"];
const OPERATIONS = ["select", "insert", "update", "delete"];

let database: DisposableDatabase;
let applicationUrl: string;

beforeAll(async () => {
  database = await createDisposableDatabase();
  await database.applyMigrations();
  applicationUrl = await database.createApplicationRole();
});

afterAll(async () => {
  await database?.drop();
});

describe("the browser's database roles", () => {
  it("hold no privilege on either waitlist", async () => {
    const granted: string[] = [];

    for (const role of CLIENT_ROLES) {
      for (const table of WAITLIST_TABLES) {
        for (const operation of OPERATIONS) {
          const [row] = await database.sql<{ allowed: boolean }[]>`
            select has_table_privilege(${role}, ${`public.${table}`}, ${operation}) as allowed
          `;
          if (row.allowed) granted.push(`${role} may ${operation} public.${table}`);
        }
      }
    }

    expect(granted).toEqual([]);
  });

  it("cannot read leads", async () => {
    await expect(
      database.asRole("anon", (sql) => sql`select id from public.seller_waitlist`),
    ).rejects.toMatchObject({ code: INSUFFICIENT_PRIVILEGE });
  });

  it("cannot write leads", async () => {
    await expect(
      database.asRole(
        "authenticated",
        (sql) => sql`
          insert into public.brand_waitlist (company_name, contact_email)
          values ('Blocked brand', 'blocked-brand@example.test')
        `,
      ),
    ).rejects.toMatchObject({ code: INSUFFICIENT_PRIVILEGE });
  });
});

describe("the application role", () => {
  it("bypasses row level security, which is infrastructure authority and not a user permission", async () => {
    const [row] = await database.sql<{ bypassrls: boolean; canlogin: boolean }[]>`
      select rolbypassrls as bypassrls, rolcanlogin as canlogin
      from pg_catalog.pg_roles
      where rolname = ${new URL(applicationUrl).username}
    `;

    expect(row).toMatchObject({ bypassrls: true, canlogin: true });
  });

  it("can append a lead to either waitlist", async () => {
    const sql = postgres(applicationUrl, { prepare: false, max: 1 });
    try {
      await sql`
        insert into public.seller_waitlist (name, email)
        values ('Harness seller', 'harness-seller@example.test')
      `;
      await sql`
        insert into public.brand_waitlist (company_name, contact_email)
        values ('Harness brand', 'harness-brand@example.test')
      `;
    } finally {
      await sql.end();
    }

    const sellers = await database.sql`
      select id from public.seller_waitlist where email = 'harness-seller@example.test'
    `;
    const brands = await database.sql`
      select id from public.brand_waitlist where contact_email = 'harness-brand@example.test'
    `;

    expect(sellers).toHaveLength(1);
    expect(brands).toHaveLength(1);
  });

  it("cannot read back what it wrote, because appending is all it is granted", async () => {
    const sql = postgres(applicationUrl, { prepare: false, max: 1 });
    try {
      await expect(sql`select id from public.seller_waitlist`).rejects.toMatchObject({
        code: INSUFFICIENT_PRIVILEGE,
      });
    } finally {
      await sql.end();
    }
  });
});
