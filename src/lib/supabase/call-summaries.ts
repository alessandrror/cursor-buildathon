import type { CallSummary } from "@/types/call-summary";
import type { DbCallSummary } from "@/types/database";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export function mapDbCallSummaryToCallSummary(row: DbCallSummary): CallSummary {
  return {
    id: row.id,
    callerNumber: row.caller_number,
    alternativeNumber: row.alternative_number,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? undefined,
    durationSeconds: row.duration_seconds ?? undefined,
    status: row.status,
    closeReason: row.close_reason ?? undefined,
    title: row.title,
    summary: row.summary,
    transcript: row.transcript ?? undefined,
  };
}

export async function getCallSummariesForCurrentUser() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("call_summaries")
    .select("*")
    .order("started_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapDbCallSummaryToCallSummary);
}

export async function getCallSummaryById(id: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("call_summaries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapDbCallSummaryToCallSummary(data) : null;
}
