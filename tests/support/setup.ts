/**
 * Runs before every test file in both projects.
 *
 * The suite must never reach a developer's own database. Vitest loads no
 * `.env*` file, so `.env.local` is already invisible here; deleting these
 * variables additionally stops a value exported in the surrounding shell from
 * standing in as a default. Tests that need a database set `DATABASE_URL`
 * themselves, to a database the harness created and will drop.
 */
delete process.env.DATABASE_URL;
delete process.env.DATABASE_MIGRATION_URL;
