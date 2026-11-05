import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Run `neon deploy` or `neon env pull` to write .env.local.",
  );
}

 // HTTP driver: single statements, no transactions. Cheap on serverless.
 const sql = neon(url);
 
+// This client talks to Neon Postgres directly via DATABASE_URL.
+// PostgREST reads go through src/db/data-api.ts (NEON_DATA_API_URL).
+// Transactional writes go through src/db/transaction.ts (Pool driver).
 export const db = drizzle({ client: sql, schema });
