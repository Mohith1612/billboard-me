import { describe, expect, it } from "vitest";
import { readMigrationFiles, readMigrationJournal } from "../support/test-database";

/**
 * Drizzle applies migrations from the journal, not from the directory listing.
 * A generated `.sql` file committed without its journal entry — or the reverse —
 * silently skips the migration everywhere it is applied, including in the
 * integration harness.
 */

describe("the migration journal", () => {
  it("lists every committed migration file exactly once", async () => {
    const journalTags = (await readMigrationJournal()).map((entry) => `${entry.tag}.sql`);

    expect(journalTags.slice().sort()).toEqual(await readMigrationFiles());
  });

  it("is numbered from zero without gaps, so a range can be applied by index", async () => {
    const indexes = (await readMigrationJournal()).map((entry) => entry.idx);

    expect(indexes).toEqual(indexes.map((_value, position) => position));
  });
});
