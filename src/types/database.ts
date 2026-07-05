import type { CallSummaryStatus } from "@/types/call-summary";

export type DbUser = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type DbCallSummary = {
  id: string;
  user_id: string;
  caller_number: string;
  alternative_number: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  status: CallSummaryStatus;
  close_reason: string | null;
  title: string;
  summary: string;
  transcript: string | null;
  created_at: string;
  updated_at: string;
};

export type DbAnsweringRule = {
  id: string;
  user_id: string;
  rule_type:
    | "whitelist"
    | "blacklist"
    | "schedule"
    | "anonymous"
    | "prefix_block"
    | "reject_action";
  value: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: DbUser;
        Insert: {
          id: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          image_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      call_summaries: {
        Row: DbCallSummary;
        Insert: {
          id: string;
          user_id: string;
          caller_number: string;
          alternative_number: string;
          started_at: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          status: CallSummaryStatus;
          close_reason?: string | null;
          title: string;
          summary: string;
          transcript?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          caller_number?: string;
          alternative_number?: string;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          status?: CallSummaryStatus;
          close_reason?: string | null;
          title?: string;
          summary?: string;
          transcript?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      answering_rules: {
        Row: DbAnsweringRule;
        Insert: {
          id?: string;
          user_id: string;
          rule_type: DbAnsweringRule["rule_type"];
          value: Record<string, string>;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rule_type?: DbAnsweringRule["rule_type"];
          value?: Record<string, string>;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
