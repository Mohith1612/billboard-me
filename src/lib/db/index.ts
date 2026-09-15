import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { requireDatabaseUrl } from "../env/server";
import * as schema from "./schema";

/**
 * Database access.
 *
 * The client is created on first use, not at import time. `next build` imports
 * this module while collecting the waitlist route, and a static-only build must
 * still succeed without a database configured. A missing or malformed
 * DATABASE_URL then fails loudly at the first query, naming the variable,
 * instead of silently connecting to a postgres.js default.
 */

let database: ReturnType<typeof createDatabase> | undefined;

function createDatabase() {
  // `prepare: false` keeps the client usable through a transaction pooler,
  // which does not support named prepared statements.
  const client = postgres(requireDatabaseUrl(), { prepare: false });
  return drizzle(client, { schema });
}

export function getDb() {
  database ??= createDatabase();
  return database;
}
