/**
 * Wipes GhostLine pipeline tables in Supabase (users + all n8n-written data).
 * Usage: bun --env-file=.env scripts/reset-pipeline-data.ts
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PIPELINE_TABLES = [
  "notifications",
  "call_summaries",
  "call_transcripts",
  "calls",
  "answering_rules",
  "phone_numbers",
  "voice_clone_events",
  "user_voice_profiles",
  "system_events",
  "users",
] as const;

async function countTable(table: string) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  return count ?? 0;
}

async function deleteAll(table: string) {
  const { error } = await supabase.from(table).delete().not("id", "is", null);

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
}

async function main() {
  console.log("Counts before reset:");
  for (const table of PIPELINE_TABLES) {
    console.log(`  ${table}: ${await countTable(table)}`);
  }

  console.log("\nDeleting pipeline data (order respects FKs)...");
  for (const table of PIPELINE_TABLES) {
    await deleteAll(table);
    console.log(`  cleared ${table}`);
  }

  console.log("\nCounts after reset:");
  for (const table of PIPELINE_TABLES) {
    console.log(`  ${table}: ${await countTable(table)}`);
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
