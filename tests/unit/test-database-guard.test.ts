import { describe, expect, it } from "vitest";
import {
  DISPOSABLE_PREFIX,
  assertDisposableName,
  parseProtectedTargets,
  resolveAdminUrl,
} from "../support/test-database";

/**
 * The harness creates and drops databases and roles. These guards are the only
 * thing standing between a mistyped TEST_DATABASE_URL and someone's real data,
 * so they are tested like production code.
 */

const TEST_URL = "postgresql://postgres:throwaway@127.0.0.1:55432/postgres";

// Each case passes its own protected targets, so no test reads this checkout's
// own `.env.local`.

describe("resolveAdminUrl", () => {
  it("returns a disposable cluster URL", () => {
    expect(resolveAdminUrl({ TEST_DATABASE_URL: TEST_URL }, [])).toBe(TEST_URL);
  });

  it("refuses to guess when the variable is unset or blank", () => {
    expect(() => resolveAdminUrl({}, [])).toThrowError(/TEST_DATABASE_URL is not set/);
    expect(() => resolveAdminUrl({ TEST_DATABASE_URL: "   " }, [])).toThrowError(/TEST_DATABASE_URL is not set/);
  });

  it("never falls back to the application's own configuration", () => {
    const applicationUrl = "postgresql://app:s3cr3t@db.example.test/billboard";

    expect(() => resolveAdminUrl({ DATABASE_URL: applicationUrl }, [])).toThrowError(/TEST_DATABASE_URL is not set/);
  });

  it("rejects a connection string that is not Postgres", () => {
    expect(() => resolveAdminUrl({ TEST_DATABASE_URL: "mysql://root@127.0.0.1/test" }, [])).toThrowError(
      /TEST_DATABASE_URL/,
    );
    expect(() => resolveAdminUrl({ TEST_DATABASE_URL: "127.0.0.1:5432" }, [])).toThrowError(/TEST_DATABASE_URL/);
  });

  it("refuses the database the application is configured to use", () => {
    const env = {
      TEST_DATABASE_URL: "postgresql://postgres:throwaway@db.example.test:5432/billboard",
      DATABASE_URL: "postgresql://app:s3cr3t@db.example.test:5432/billboard",
    };

    expect(() => resolveAdminUrl(env, [])).toThrowError(/same database as DATABASE_URL/);
  });

  it("refuses the migration database too, and ignores a trailing slash", () => {
    const env = {
      TEST_DATABASE_URL: "postgresql://postgres:throwaway@db.example.test:5432/billboard/",
      DATABASE_MIGRATION_URL: "postgresql://owner:s3cr3t@db.example.test:5432/billboard",
    };

    expect(() => resolveAdminUrl(env, [])).toThrowError(/same database as DATABASE_MIGRATION_URL/);
  });

  it("allows a different database on the same host", () => {
    const env = {
      TEST_DATABASE_URL: TEST_URL,
      DATABASE_URL: "postgresql://app:s3cr3t@127.0.0.1:55432/billboard",
    };

    expect(resolveAdminUrl(env, [])).toBe(TEST_URL);
  });

  it("refuses the database configured in an env file, which it reads only to refuse it", () => {
    const env = { TEST_DATABASE_URL: "postgresql://postgres:throwaway@db.example.test:5432/billboard" };
    const targets = [
      { label: "DATABASE_URL in .env.local", url: "postgresql://app:s3cr3t@db.example.test:5432/billboard" },
    ];

    expect(() => resolveAdminUrl(env, targets)).toThrowError(/same database as DATABASE_URL in \.env\.local/);
  });

  it("never echoes a connection string it rejected", () => {
    let message: string | undefined;
    try {
      resolveAdminUrl({ TEST_DATABASE_URL: "postgresq://postgres:s3cr3t@127.0.0.1/test" }, []);
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toMatch(/TEST_DATABASE_URL/);
    expect(message).not.toContain("s3cr3t");
  });
});

describe("parseProtectedTargets", () => {
  it("finds both application variables in an env file", () => {
    const targets = parseProtectedTargets(
      [
        "# Copy to .env.local",
        "NEXT_PUBLIC_SITE_URL=http://localhost:3000",
        "DATABASE_URL=postgresql://app:s3cr3t@db.example.test/billboard",
        "DATABASE_MIGRATION_URL=postgresql://owner:s3cr3t@db.example.test/billboard",
      ].join("\n"),
      ".env.local",
    );

    expect(targets.map((target) => target.label)).toEqual([
      "DATABASE_URL in .env.local",
      "DATABASE_MIGRATION_URL in .env.local",
    ]);
  });

  it("ignores variables that are commented out or left blank", () => {
    const targets = parseProtectedTargets(
      ["DATABASE_URL=", "# DATABASE_MIGRATION_URL=postgresql://owner@db.example.test/billboard"].join("\n"),
      ".env.example",
    );

    expect(targets).toEqual([]);
  });
});

describe("assertDisposableName", () => {
  it("accepts a name the harness generated", () => {
    expect(() => assertDisposableName(`${DISPOSABLE_PREFIX}db_0a1b2c3d4e`, "database")).not.toThrow();
    expect(() => assertDisposableName(`${DISPOSABLE_PREFIX}app_0a1b2c3d4e`, "role")).not.toThrow();
  });

  it.each([
    ["the maintenance database", "postgres"],
    ["an application database", "billboard"],
    ["a name that merely contains the prefix", `x_${DISPOSABLE_PREFIX}db`],
    ["a Supabase client role", "authenticated"],
    ["a quoted statement smuggled into the name", `${DISPOSABLE_PREFIX}db"; drop database billboard --`],
    ["an empty name", ""],
  ])("refuses %s", (_description, name) => {
    expect(() => assertDisposableName(name, "database")).toThrowError(/Refusing to create or drop/);
  });
});
