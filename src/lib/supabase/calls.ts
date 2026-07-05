import type { CallDetail, CallListItem, TranscriptTurn } from "@/types/call";
import type {
  DbCall,
  DbCallSummary,
  DbCallTranscript,
} from "@/types/database";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type CallWithSummary = DbCall & {
  call_summaries: DbCallSummary | DbCallSummary[] | null;
};

type CallWithRelations = DbCall & {
  call_summaries: DbCallSummary | DbCallSummary[] | null;
  call_transcripts: DbCallTranscript | DbCallTranscript[] | null;
};

function firstRelation<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapSummaryFields(
  summary: DbCallSummary | null,
): Pick<
  CallListItem,
  | "reason"
  | "summary"
  | "category"
  | "urgency"
  | "isDegraded"
  | "callerName"
  | "callerCompany"
> {
  if (!summary) {
    return {};
  }

  return {
    reason: summary.reason,
    summary: summary.summary,
    category: summary.category,
    urgency: summary.urgency,
    isDegraded: summary.is_degraded,
    callerName: summary.caller_name,
    callerCompany: summary.caller_company,
  };
}

export function mapDbCallToListItem(row: CallWithSummary): CallListItem {
  const summary = firstRelation(row.call_summaries);

  return {
    id: row.id,
    callerNumber: row.caller_number,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? undefined,
    durationSeconds: row.duration_seconds ?? undefined,
    decision: row.decision,
    outcome: row.outcome,
    ...mapSummaryFields(summary),
  };
}

export function mapDbCallToDetail(row: CallWithRelations): CallDetail {
  const summary = firstRelation(row.call_summaries);
  const transcriptRow = firstRelation(row.call_transcripts);
  const transcript = transcriptRow?.transcript as TranscriptTurn[] | undefined;

  return {
    ...mapDbCallToListItem(row),
    matchedRule: row.matched_rule,
    transcript: transcript ?? undefined,
  };
}

export async function getCallsForCurrentUser(): Promise<CallListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("calls")
    .select("*, call_summaries(*)")
    .order("started_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as CallWithSummary[]).map(mapDbCallToListItem);
}

export async function getCallById(id: string): Promise<CallDetail | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("calls")
    .select("*, call_summaries(*), call_transcripts(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapDbCallToDetail(data as CallWithRelations) : null;
}
