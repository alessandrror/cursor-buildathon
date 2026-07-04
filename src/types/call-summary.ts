export type CallSummaryStatus =
  | "completed"
  | "closed_by_silence"
  | "rejected_by_rules"
  | "failed";

export type CallSummary = {
  id: string;
  callerNumber: string;
  alternativeNumber: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  status: CallSummaryStatus;
  closeReason?: string;
  title: string;
  summary: string;
  transcript?: string;
};
