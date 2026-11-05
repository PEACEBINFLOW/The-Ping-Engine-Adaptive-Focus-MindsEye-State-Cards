import {
  bigserial,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/* -------------------------------------------------------------------------- */
/* sessions                                                                    */
/* -------------------------------------------------------------------------- */

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicCode: text("public_code").notNull().unique(),
  title: text("title"),
  domain: text("domain").notNull(),
  model: text("model"),
  templateMode: text("template_mode").notNull().default("AFST"),
  prefs: jsonb("prefs")
    .$type<{ length?: string; style?: string; depth?: string }>()
    .notNull()
    .default({}),
  patterns: jsonb("patterns").$type<string[]>().notNull().default([]),
  count: text("count"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* topics                                                                      */
/* -------------------------------------------------------------------------- */

export const topics = pgTable(
  "topics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    tid: text("tid").notNull(),
    name: text("name").notNull(),
    status: text("status").notNull().default("active"),
    parentTid: text("parent_tid"),
    subBusiness: text("sub_business"),
    summary: text("summary"),
    keyPoints: jsonb("key_points").$type<string[]>().notNull().default([]),
    reentryHook: text("reentry_hook"),
    revisitCount: integer("revisit_count").notNull().default(1),
  },
  (table) => [
    uniqueIndex("topics_session_tid_unique").on(table.sessionId, table.tid),
    index("topics_session_idx").on(table.sessionId),
    check(
      "topics_status_check",
      sql`${table.status} in ('active','parked','resolved')`,
    ),
  ],
);

/* -------------------------------------------------------------------------- */
/* events — append-only. Never UPDATE or DELETE.                               */
/* -------------------------------------------------------------------------- */

export const events = pgTable(
  "events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    t: integer("t").notNull(),
    kind: text("kind").notNull(),
    fromTid: text("from_tid"),
    toTid: text("to_tid"),
    trigger: text("trigger").notNull(),
    payload: jsonb("payload")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("events_session_t_unique").on(table.sessionId, table.t),
    index("events_session_idx").on(table.sessionId),
    check(
      "events_kind_check",
      sql`${table.kind} in ('focus','switch','deeper','refine','compare','export','show_map','note')`,
    ),
  ],
);

/* -------------------------------------------------------------------------- */
/* edges                                                                       */
/* -------------------------------------------------------------------------- */

export const edges = pgTable(
  "edges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    fromTid: text("from_tid").notNull(),
    toTid: text("to_tid").notNull(),
    kind: text("kind").notNull(),
    meta: jsonb("meta")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
  },
  (table) => [
    index("edges_session_idx").on(table.sessionId),
    check(
      "edges_kind_check",
      sql`${table.kind} in ('dependency','comparison','parent','loop')`,
    ),
  ],
);

/* -------------------------------------------------------------------------- */
/* cards — immutable exports                                                   */
/* -------------------------------------------------------------------------- */

export const cards = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    cardText: text("card_text").notNull(),
    cardJson: jsonb("card_json")
      .$type<Record<string, unknown>>()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("cards_session_version_unique").on(
      table.sessionId,
      table.version,
    ),
    index("cards_session_idx").on(table.sessionId),
  ],
);

/* -------------------------------------------------------------------------- */
/* prompt_templates — used from T7                                             */
/* -------------------------------------------------------------------------- */

export const promptTemplates = pgTable(
  "prompt_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    model: text("model").notNull(),
    locale: text("locale").notNull().default("en"),
    body: text("body").notNull(),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("prompt_templates_slug_model_locale_unique").on(
      table.slug,
      table.model,
      table.locale,
    ),
  ],
);
