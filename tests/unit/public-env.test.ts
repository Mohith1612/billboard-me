import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The canonical origin is inlined at build time, so this module is evaluated
 * once per import. Each case resets the registry and re-imports it.
 */

async function resolveSiteUrl(siteUrl: string | undefined, nodeEnv = "development"): Promise<string> {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", nodeEnv);
  if (siteUrl === undefined) {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined);
  } else {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", siteUrl);
  }
  const { publicEnv } = await import("@/lib/env/public");
  return publicEnv.siteUrl;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("accepted origins", () => {
  it("normalises away a trailing slash and a default port", async () => {
    await expect(resolveSiteUrl("https://billboard.example/")).resolves.toBe("https://billboard.example");
    await expect(resolveSiteUrl("https://billboard.example:443")).resolves.toBe("https://billboard.example");
  });

  it("keeps a non-default port", async () => {
    await expect(resolveSiteUrl("http://127.0.0.1:3001")).resolves.toBe("http://127.0.0.1:3001");
  });

  it("falls back to localhost outside a production build", async () => {
    await expect(resolveSiteUrl(undefined)).resolves.toBe("http://localhost:3000");
    await expect(resolveSiteUrl("   ")).resolves.toBe("http://localhost:3000");
  });
});

describe("rejected origins", () => {
  it("refuses a production build with no origin configured", async () => {
    await expect(resolveSiteUrl(undefined, "production")).rejects.toThrowError(/NEXT_PUBLIC_SITE_URL is not set/);
  });

  it.each([
    ["a bare host", "billboard.example"],
    ["a non-http scheme", "ftp://billboard.example"],
    ["embedded credentials", "https://user:pass@billboard.example"],
    ["a path", "https://billboard.example/landing"],
    ["a query", "https://billboard.example/?utm=1"],
    ["a fragment", "https://billboard.example/#top"],
  ])("rejects %s", async (_description, value) => {
    await expect(resolveSiteUrl(value)).rejects.toThrowError(/NEXT_PUBLIC_SITE_URL/);
  });
});
