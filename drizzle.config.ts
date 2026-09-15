import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { parseDatabaseUrl } from "./src/lib/env/database-url";

// drizzle-kit runs outside Next.js, so the local env file is loaded explicitly.
// dotenv does not overwrite variables already present in the environment, which
// matches how Next.js resolves `process.env` first.
config({ path: ".env.local" });

// Schema changes may use stronger credentials than the running app: the
// migration role creates and alters tables, while the app role only needs the
// runtime privileges the waitlist route uses. Where the environment does not
// separate them, DATABASE_URL is used for both.
const variableName = process.env.DATABASE_MIGRATION_URL ? "DATABASE_MIGRATION_URL" : "DATABASE_URL";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: parseDatabaseUrl(process.env[variableName], variableName),
  },
});
