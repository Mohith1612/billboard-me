import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { TRAP_FIELD } from "@/lib/waitlist/schema";
import { type DisposableDatabase, createDisposableDatabase } from "../support/test-database";
import { waitlistRequest, withWaitlistRoute } from "../support/waitlist-route";

/**
 * The waitlist route against a real database: every status it can return, and
 * what each one leaves behind. The route is the only public write path in the
 * product today, so "nothing was stored" matters as much as the status code.
 */

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

afterEach(() => {
  vi.restoreAllMocks();
});

/** Silences the route's own error log and hands back what it reported. */
function captureServerErrors(): { messages: unknown[][] } {
  const captured: unknown[][] = [];
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    captured.push(args);
  });
  return { messages: captured };
}

async function countRows(table: string, column: string, value: string): Promise<number> {
  const [row] = await database.sql<{ total: string }[]>`
    select count(*)::text as total
    from ${database.sql(table)}
    where ${database.sql(column)} = ${value}
  `;
  return Number(row.total);
}

describe("a request the route cannot read", () => {
  it("answers 400 when the body is not JSON", async () => {
    await withWaitlistRoute(applicationUrl, async (post) => {
      const response = await post(waitlistRequest("this is not JSON", { raw: true }));

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({ error: expect.any(String) });
    });
  });

  it.each([
    ["an array", []],
    ["null", null],
    ["a bare string", "seller"],
  ])("answers 400 when the body is %s", async (_description, body) => {
    await withWaitlistRoute(applicationUrl, async (post) => {
      expect((await post(waitlistRequest(body))).status).toBe(400);
    });
  });
});

describe("a submission that fails validation", () => {
  it("answers 422 with an error per field and stores nothing", async () => {
    await withWaitlistRoute(applicationUrl, async (post) => {
      const response = await post(
        waitlistRequest({ kind: "seller", name: "   ", email: "not-an-address" }),
      );

      expect(response.status).toBe(422);
      const body = (await response.json()) as { fieldErrors: Record<string, string> };
      expect(Object.keys(body.fieldErrors).sort()).toEqual(["email", "name"]);
    });

    expect(await countRows("seller_waitlist", "email", "not-an-address")).toBe(0);
  });

  it("answers 422 for a kind the product does not have", async () => {
    await withWaitlistRoute(applicationUrl, async (post) => {
      const response = await post(
        waitlistRequest({ kind: "operator", name: "Ada", email: "operator@example.test" }),
      );

      expect(response.status).toBe(422);
    });

    expect(await countRows("seller_waitlist", "email", "operator@example.test")).toBe(0);
  });
});

describe("a submission from a bot", () => {
  it("answers 202 and stores nothing, giving the filled trap no signal", async () => {
    await withWaitlistRoute(applicationUrl, async (post) => {
      const response = await post(
        waitlistRequest({
          kind: "seller",
          name: "Trap filler",
          email: "trap@example.test",
          [TRAP_FIELD]: "https://spam.example",
        }),
      );

      expect(response.status).toBe(202);
      await expect(response.json()).resolves.toEqual({ ok: true });
    });

    expect(await countRows("seller_waitlist", "email", "trap@example.test")).toBe(0);
  });

  it("treats an empty trap as a person and stores the lead", async () => {
    await withWaitlistRoute(applicationUrl, async (post) => {
      const response = await post(
        waitlistRequest({
          kind: "seller",
          name: "Real person",
          email: "empty-trap@example.test",
          [TRAP_FIELD]: "   ",
        }),
      );

      expect(response.status).toBe(201);
    });

    expect(await countRows("seller_waitlist", "email", "empty-trap@example.test")).toBe(1);
  });
});

describe("a valid submission", () => {
  it("answers 201 and stores the seller exactly as validated", async () => {
    await withWaitlistRoute(applicationUrl, async (post) => {
      const response = await post(
        waitlistRequest({
          kind: "seller",
          name: "  Ada Lovelace  ",
          email: "  route-seller@example.test  ",
          xHandle: "",
          assetType: "MacBook",
          eventContext: "  Coffee shops in Bengaluru  ",
        }),
      );

      expect(response.status).toBe(201);
      await expect(response.json()).resolves.toEqual({ ok: true });
    });

    const [row] = await database.sql<
      { name: string; xHandle: string | null; assetType: string | null; eventContext: string | null }[]
    >`
      select name, x_handle as "xHandle", asset_type as "assetType", event_context as "eventContext"
      from public.seller_waitlist
      where email = 'route-seller@example.test'
    `;

    expect(row).toEqual({
      name: "Ada Lovelace",
      xHandle: null,
      assetType: "MacBook",
      eventContext: "Coffee shops in Bengaluru",
    });
  });

  it("answers 201 and stores the brand", async () => {
    await withWaitlistRoute(applicationUrl, async (post) => {
      const response = await post(
        waitlistRequest({
          kind: "brand",
          companyName: "Acme",
          contactEmail: "route-brand@example.test",
          budgetRange: "₹50k – ₹2L",
          industry: "",
        }),
      );

      expect(response.status).toBe(201);
    });

    const [row] = await database.sql<{ companyName: string; budgetRange: string | null; industry: string | null }[]>`
      select company_name as "companyName", budget_range as "budgetRange", industry
      from public.brand_waitlist
      where contact_email = 'route-brand@example.test'
    `;

    expect(row).toEqual({ companyName: "Acme", budgetRange: "₹50k – ₹2L", industry: null });
  });
});

describe("a submission the route cannot store", () => {
  it("answers 500 when the database refuses the insert", async () => {
    const readOnlyUrl = await database.createApplicationRole({ grantInsert: false });
    const serverErrors = captureServerErrors();

    await withWaitlistRoute(readOnlyUrl, async (post) => {
      const response = await post(
        waitlistRequest({ kind: "seller", name: "Denied", email: "denied@example.test" }),
      );

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toMatchObject({ error: expect.any(String) });
    });

    expect(serverErrors.messages).toHaveLength(1);
    expect(await countRows("seller_waitlist", "email", "denied@example.test")).toBe(0);
  });

  it("answers 500 when the database is not reachable", async () => {
    const serverErrors = captureServerErrors();

    // Port 1 is never a Postgres server, so the client fails to connect rather
    // than failing on the statement.
    await withWaitlistRoute("postgresql://nobody:nobody@127.0.0.1:1/nothing", async (post) => {
      const response = await post(
        waitlistRequest({ kind: "brand", companyName: "Unreachable", contactEmail: "unreachable@example.test" }),
      );

      expect(response.status).toBe(500);
    });

    expect(serverErrors.messages).toHaveLength(1);
  });

  it("answers 500 naming the variable when the database is not configured", async () => {
    const serverErrors = captureServerErrors();

    await withWaitlistRoute("not-a-postgres-url", async (post) => {
      const response = await post(
        waitlistRequest({ kind: "seller", name: "Unconfigured", email: "unconfigured@example.test" }),
      );

      expect(response.status).toBe(500);
    });

    const [, reported] = serverErrors.messages[0];
    expect((reported as Error).message).toMatch(/DATABASE_URL/);
  });

  it("never tells the sender what went wrong", async () => {
    captureServerErrors();

    await withWaitlistRoute("postgresql://nobody:nobody@127.0.0.1:1/nothing", async (post) => {
      const response = await post(
        waitlistRequest({ kind: "seller", name: "Quiet", email: "quiet@example.test" }),
      );
      const body = (await response.json()) as { error: string };

      expect(body.error).not.toMatch(/postgres|connect|ECONNREFUSED|nobody/i);
    });
  });
});
