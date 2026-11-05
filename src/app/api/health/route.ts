export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { sql } from "drizzle-orm";
import { db } from "@/db/client";

async function probe(): Promise<number> {
  const started = Date.now();
  await db.execute(sql`select 1 as ok`);
  return Date.now() - started;
}

export async function GET() {
  const maxAttempts = 2; // one retry for Neon autosuspend cold start
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const latency = await probe();
      return Response.json({
        ok: true,
        db: "ok",
        latency_ms: latency,
        attempts: attempt,
      });
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  return Response.json(
    {
      ok: false,
      db: "error",
      error: String(lastError),
      attempts: maxAttempts,
    },
    { status: 503 },
  );
}
