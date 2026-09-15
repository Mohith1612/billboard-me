import "server-only";

import { parseDatabaseUrl } from "./database-url";

/**
 * Server environment.
 *
 * `server-only` makes Next.js refuse to bundle this module into a Client
 * Component, so a connection string can never reach the browser. That boundary
 * is asserted by `pnpm test:client-boundary`.
 *
 * Values are read on use rather than at import time. `next build` imports the
 * waitlist route while collecting page data, and a build that only needs to
 * render static pages must not require a database to be configured.
 */

/** The connection string for the running application, or a clear error. */
export function requireDatabaseUrl(): string {
  return parseDatabaseUrl(process.env.DATABASE_URL, "DATABASE_URL");
}
