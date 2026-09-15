import { vi } from "vitest";

/**
 * Loads the real waitlist route bound to one database.
 *
 * `getDb()` caches its client for the lifetime of the module, which is right
 * for a server and wrong for a suite that points the same route at a healthy
 * database, then at one that denies inserts, then at one that is not listening.
 * Resetting the module registry gives each case its own client, and `close`
 * ends it so the run can exit.
 */
export async function withWaitlistRoute<T>(
  databaseUrl: string,
  run: (post: (request: Request) => Promise<Response>) => Promise<T>,
): Promise<T> {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", databaseUrl);

  const { POST } = await import("@/app/api/waitlist/route");
  const db = await import("@/lib/db");

  try {
    return await run(POST);
  } finally {
    await db.closeDb();
    vi.unstubAllEnvs();
  }
}

/** A waitlist request whose body is either a JSON value or a raw string. */
export function waitlistRequest(body: unknown, options: { raw?: boolean } = {}): Request {
  return new Request("http://localhost/api/waitlist", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: options.raw ? String(body) : JSON.stringify(body),
  });
}
