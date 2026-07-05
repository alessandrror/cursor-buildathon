export type CallDecision = "answer" | "reject";

export type CallOutcome =
  | "in_progress"
  | "rejected"
  | "completed"
  | "silent_hangup"
  | "caller_hangup"
  | "agent_error"
  | "pending_summary"
  | "language_mismatch";

export type CallSummaryCategory =
  | "spam_comercial"
  | "encuesta"
  | "cobranza"
  | "posible_legitima"
  | "desconocida";

export type CallSummaryUrgency = "baja" | "media" | "alta";

export type TranscriptTurn = {
  role: "agent" | "user";
  message: string;
  time_in_call_secs?: number;
};

export type CallListItem = {
  id: string;
  callerNumber: string | null;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  decision: CallDecision;
  outcome: CallOutcome;
  reason?: string;
  summary?: string;
  category?: CallSummaryCategory;
  urgency?: CallSummaryUrgency;
  isDegraded?: boolean;
  callerName?: string | null;
  callerCompany?: string | null;
};

export type CallDetail = CallListItem & {
  matchedRule?: string | null;
  transcript?: TranscriptTurn[];
};
