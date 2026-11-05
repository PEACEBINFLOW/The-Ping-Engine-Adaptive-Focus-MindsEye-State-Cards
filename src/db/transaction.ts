import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// Node needs a WebSocket constructor for the Pool driver.
neonConfig.webSocketConstructor = ws;

function makeDb() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  return { pool, db: drizzle({ client: pool, schema }) };
}

// Drizzle's transaction callback type is awkward to name generically without
// exporting the full database instance type.
type Tx = Parameters<
  Parameters<ReturnType<typeof makeDb>["db"]["transaction"]>[0]
>[0];

/**
 * Use this for multi-statement writes that must be atomic.
 * Creates a Pool per call and closes it in `finally` — safe for serverless.
 * Do NOT use for reads; use `db` (HTTP) from ./client.
 */
export async function withTransaction<T>(
  fn: (tx: Tx) => Promise<T>,
): Promise<T> {
  const { pool, db } = makeDb();
  try {
    return await db.transaction(fn);
  } finally {
    await pool.end();
  }
}
