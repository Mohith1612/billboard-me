/**
 * Public environment.
 *
 * Everything here is inlined into the browser bundle by `next build`, so it
 * must never hold a secret. Next.js only inlines *literal*
 * `process.env.NEXT_PUBLIC_*` references — not dynamic or destructured lookups
 * — so each variable is read by name
 * (node_modules/next/dist/docs/01-app/02-guides/environment-variables.md).
 *
 * Because the value is frozen at build time, a production build is the only
 * place a missing canonical origin can still be caught. Failing here is
 * deliberate: the alternative is shipping localhost canonical URLs, robots.txt
 * and sitemap to real visitors.
 */

const DEVELOPMENT_SITE_URL = "http://localhost:3000";

const SITE_URL_HELP =
  "Set it to the full public origin, for example https://billboard.me (scheme and host only, no trailing path).";

function invalid(reason: string, value: string): never {
  // The site URL is public by definition, so echoing it here leaks nothing and
  // makes a typo in a deployment variable obvious.
  throw new Error(`NEXT_PUBLIC_SITE_URL ${reason}: ${JSON.stringify(value)}. ${SITE_URL_HELP}`);
}

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `NEXT_PUBLIC_SITE_URL is not set. A production build inlines it into canonical URLs, robots.txt and the sitemap, so it cannot fall back to localhost. ${SITE_URL_HELP}`,
      );
    }
    return DEVELOPMENT_SITE_URL;
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    invalid("is not a valid URL", raw);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    invalid("must use http:// or https://", raw);
  }

  if (parsed.username || parsed.password) {
    invalid("must not contain credentials", raw);
  }

  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    invalid("must be an origin, without a path, query or fragment", raw);
  }

  // `origin` normalises away a trailing slash and any default port, so callers
  // can always append a path without producing a double slash.
  return parsed.origin;
}

export const publicEnv = {
  siteUrl: resolveSiteUrl(),
} as const;
