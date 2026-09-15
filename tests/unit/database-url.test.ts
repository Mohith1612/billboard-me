import { describe, expect, it } from "vitest";
import { parseDatabaseUrl } from "@/lib/env/database-url";

/**
 * The connection-string validator is the last place a misconfiguration is still
 * cheap to diagnose, and the first place a password could leak into a log.
 */

const VALID = "postgresql://app:s3cr3t@db.example.test:5432/billboard";

describe("accepted connection strings", () => {
  it("accepts both Postgres schemes", () => {
    expect(parseDatabaseUrl(VALID, "DATABASE_URL")).toBe(VALID);
    expect(parseDatabaseUrl("postgres://app@db.example.test/billboard", "DATABASE_URL")).toBe(
      "postgres://app@db.example.test/billboard",
    );
  });

  it("trims a value that picked up whitespace in an env file", () => {
    expect(parseDatabaseUrl(`  ${VALID}  `, "DATABASE_URL")).toBe(VALID);
  });
});

describe("rejected connection strings", () => {
  const rejected: ReadonlyArray<[string, string | undefined, RegExp]> = [
    ["undefined", undefined, /is not set/],
    ["empty", "", /is not set/],
    ["only whitespace", "   ", /is not set/],
    ["a value that is not a URL at all", "your database here", /is not a valid URL/],
    // `new URL` reads this as the scheme "localhost:", so it fails on the
    // scheme rather than on parsing. Either way it never reaches postgres.js.
    ["a bare host and port", "localhost:5432", /postgres:\/\/ or postgresql:\/\//],
    ["the wrong scheme", "mysql://app:s3cr3t@db.example.test/billboard", /postgres:\/\/ or postgresql:\/\//],
    ["an http URL", "https://db.example.test/billboard", /postgres:\/\/ or postgresql:\/\//],
    ["no host", "postgresql:///billboard", /must include a host/],
  ];

  it.each(rejected)("rejects %s", (_description, value, expected) => {
    expect(() => parseDatabaseUrl(value, "DATABASE_URL")).toThrowError(expected);
  });

  it("names the variable it was asked about", () => {
    expect(() => parseDatabaseUrl(undefined, "TEST_DATABASE_URL")).toThrowError(/TEST_DATABASE_URL/);
  });

  it("never echoes the value, because it contains a password", () => {
    // A mistyped scheme is the realistic case: the string is wrong, but the
    // password inside it is real.
    let message: string | undefined;
    try {
      parseDatabaseUrl("postgresq://app:s3cr3t@db.example.test/billboard", "DATABASE_URL");
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toMatch(/DATABASE_URL/);
    expect(message).not.toContain("s3cr3t");
  });
});
