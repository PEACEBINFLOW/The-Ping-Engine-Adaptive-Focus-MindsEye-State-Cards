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
// s3-client.ts
import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.S3_ENDPOINT) {
  throw new Error("S3_ENDPOINT is not set. Copy it from Neon Console > Storage.");
}

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION ?? "us-east-1",
  forcePathStyle: true, // required by Neon Object Storage
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
});

export default s3;
export const BUCKET = process.env.S3_BUCKET ?? "assets";
