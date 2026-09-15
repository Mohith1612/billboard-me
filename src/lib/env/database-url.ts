/**
 * Postgres connection-string validation, shared by the running app and the
 * Drizzle CLI.
 *
 * This module deliberately reads nothing from `process.env` and carries no
 * `server-only` marker: `drizzle.config.ts` runs outside Next.js and cannot
 * resolve that marker (Next aliases `server-only` internally; it is not an
 * installed package). The module that actually reads the secret — `./server.ts`
 * — is the server-only boundary.
 *
 * A connection string contains a password, so no error below ever includes the
 * value. They name the variable and say what shape is expected instead.
 */

const ALLOWED_PROTOCOLS = new Set(["postgres:", "postgresql:"]);

const EXPECTED_SHAPE =
  "Expected postgresql://user:password@host:port/database. See .env.example and docs/development/setup.md.";

/**
 * Returns the connection string unchanged, or throws an error naming
 * `variableName` when it is missing or clearly not a Postgres URL.
 */
export function parseDatabaseUrl(value: string | undefined, variableName: string): string {
  const connectionString = value?.trim();

  if (!connectionString) {
    throw new Error(
      `${variableName} is not set. Point it at your own non-production Postgres database. ${EXPECTED_SHAPE}`,
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new Error(`${variableName} is not a valid URL. ${EXPECTED_SHAPE}`);
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new Error(`${variableName} must use the postgres:// or postgresql:// scheme. ${EXPECTED_SHAPE}`);
  }

  if (!parsed.hostname) {
    throw new Error(`${variableName} must include a host. ${EXPECTED_SHAPE}`);
  }

  return connectionString;
}
