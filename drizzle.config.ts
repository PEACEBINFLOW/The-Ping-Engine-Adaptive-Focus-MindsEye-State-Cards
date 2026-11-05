import { config } from "dotenv";

// drizzle-kit does not auto-load .env.local; Neon writes DATABASE_URL_UNPOOLED
// there. Load it before defineConfig reads process.env.
config({ path: ".env.local" });

import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  throw new Error(
    "DATABASE_URL_UNPOOLED is not set. Run `neon deploy` or `neon env pull` first.",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
