import "./env";
import { sql } from "drizzle-orm";
import { db } from "./client";

async function main() {
  const result = await db.execute(sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `);

  const rows = result.rows as Array<{ table_name: string }>;
  console.log(rows.map((r) => r.table_name).join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
