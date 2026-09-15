import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url));

/**
 * Two projects share one runner:
 *
 * - `unit` runs pure validation and guard functions and needs nothing but Node.
 * - `integration` runs against a disposable PostgreSQL database and needs
 *   TEST_DATABASE_URL, which `pnpm test` provides from a throwaway container.
 *
 * Neither project may reach a real database: Vitest loads no `.env*` file, and
 * `tests/support/setup.ts` removes the application's own variables so a value
 * exported in a developer shell cannot leak in either.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fromRoot("./src"),
      // `server-only` is not an installed package — Next.js aliases it during a
      // build, which is how it refuses to bundle `src/lib/db` into a Client
      // Component. Node has no such alias, so tests map it to an empty module.
      // The boundary itself stays proven by `pnpm test:client-boundary`, which
      // asserts that a real client import fails the build.
      "server-only": fromRoot("./tests/support/server-only-stub.ts"),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/unit/**/*.test.ts"],
          setupFiles: ["tests/support/setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          include: ["tests/integration/**/*.test.ts"],
          setupFiles: ["tests/support/setup.ts"],
          // Creating a database, applying migrations and starting connections is
          // slower than a unit test, and the first case pays container warm-up.
          testTimeout: 30_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
