/**
 * Stands in for the `server-only` marker module, which Next.js resolves during
 * a build but Node cannot resolve on its own. See the alias in
 * `vitest.config.mts`: this file exists so importing a server module under
 * Vitest does not fail on a missing package, and it asserts nothing.
 */
export {};
