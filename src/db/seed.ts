import "./env";
import { eq } from "drizzle-orm";
import { sessions, topics } from "./schema";
import { withTransaction } from "./transaction";

const DEMO_CODE = "demo-session";

const topicSeed = [
  { tid: "T1", name: "repo_scaffold", status: "resolved" },
  { tid: "T2", name: "neon_schema", status: "active" },
  { tid: "T3", name: "engine_core", status: "parked" },
  { tid: "T4", name: "card_codec", status: "parked" },
  { tid: "T5", name: "api_persistence", status: "parked" },
  { tid: "T6", name: "command_deck_ui", status: "parked" },
  { tid: "T7", name: "prompt_generator", status: "parked" },
  { tid: "T8", name: "vercel_deploy", status: "parked" },
  { tid: "T9", name: "oss_polish", status: "parked" },
  { tid: "T10", name: "parked_future", status: "parked" },
] as const;

async function main() {
  await withTransaction(async (tx) => {
    const existing = await tx
      .select()
      .from(sessions)
      .where(eq(sessions.publicCode, DEMO_CODE))
      .limit(1);

    if (existing.length > 0) {
      console.log("Seed already present; nothing to do.");
      return;
    }

    const [session] = await tx
      .insert(sessions)
      .values({
        publicCode: DEMO_CODE,
        title: "Ping Engine build — demo session",
        domain: "software build",
        model: "deepseek",
        templateMode: "AFST",
        prefs: {
          length: "long for code, short for prose",
          style: "mixed",
          depth: "expert",
        },
        patterns: ["one step at a time", "delta over rewrite"],
        count: "P1.1",
        status: "active",
      })
      .returning();

    await tx
      .insert(topics)
      .values(
        topicSeed.map((t) => ({
          sessionId: session.id,
          tid: t.tid,
          name: t.name,
          status: t.status,
          summary: null,
          keyPoints: [],
          reentryHook: `Resume ${t.name}`,
          revisitCount: 1,
        })),
      )
      .onConflictDoNothing();

    console.log(
      `Seeded session ${session.publicCode} with ${topicSeed.length} topics.`,
    );
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
