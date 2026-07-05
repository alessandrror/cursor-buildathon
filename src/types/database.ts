export type DbUser = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  timezone: string;
  country_code: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type PhoneNumberStatus = "active" | "suspended" | "released";

export type DbPhoneNumber = {
  id: string;
  user_id: string;
  e164_number: string;
  twilio_sid: string;
  status: PhoneNumberStatus;
  created_at: string;
};

export type AnsweringRuleType =
  | "whitelist"
  | "blacklist"
  | "schedule"
  | "anonymous"
  | "prefix_block";

export type DbAnsweringRule = {
  id: string;
  user_id: string;
  rule_type: AnsweringRuleType;
  value: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

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

export type DbCall = {
  id: string;
  user_id: string;
  phone_number_id: string;
  twilio_call_sid: string;
  caller_number: string | null;
  decision: CallDecision;
  matched_rule: string | null;
  outcome: CallOutcome;
  duration_seconds: number | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
};

export type DbCallTranscript = {
  id: string;
  call_id: string;
  conversation_id: string;
  transcript: unknown;
  created_at: string;
};

export type CallSummaryCategory =
  | "spam_comercial"
  | "encuesta"
  | "cobranza"
  | "posible_legitima"
  | "desconocida";

export type CallSummaryUrgency = "baja" | "media" | "alta";

export type DbCallSummary = {
  id: string;
  call_id: string;
  user_id: string;
  caller_name: string | null;
  caller_company: string | null;
  reason: string;
  summary: string;
  category: CallSummaryCategory;
  urgency: CallSummaryUrgency;
  is_degraded: boolean;
  created_at: string;
};

export type NotificationChannel = "email" | "push";
export type NotificationStatus = "pending" | "sent" | "failed";

export type DbNotification = {
  id: string;
  user_id: string;
  call_id: string | null;
  channel: NotificationChannel;
  status: NotificationStatus;
  attempts: number;
  payload: Record<string, unknown>;
  created_at: string;
  sent_at: string | null;
};

export type DbSystemEvent = {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type VoiceProfileStatus =
  | "pending"
  | "ready"
  | "verification_required"
  | "failed"
  | "revoked";

export type VoiceInteractionMode = "prudente" | "equilibrado" | "detective";

export type VoiceCloneEventType =
  | "consent_given"
  | "clone_requested"
  | "clone_succeeded"
  | "clone_failed"
  | "profile_updated"
  | "profile_revoked";

export type DbUserVoiceProfile = {
  id: string;
  user_id: string;
  elevenlabs_voice_id: string | null;
  display_name: string;
  status: VoiceProfileStatus;
  requires_verification: boolean;
  consented_at: string | null;
  consent_version: string | null;
  use_for_suspicious_calls: boolean;
  interaction_mode: VoiceInteractionMode;
  sample_count: number;
  error_message: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DbVoiceCloneEvent = {
  id: string;
  user_id: string;
  voice_profile_id: string | null;
  event_type: VoiceCloneEventType;
  payload: Record<string, unknown>;
  created_at: string;
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
          timezone?: string;
          country_code?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          image_url?: string | null;
          timezone?: string;
          country_code?: string;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      phone_numbers: {
        Row: DbPhoneNumber;
        Insert: {
          id?: string;
          user_id: string;
          e164_number: string;
          twilio_sid: string;
          status?: PhoneNumberStatus;
          created_at?: string;
        };
        Update: {
          e164_number?: string;
          twilio_sid?: string;
          status?: PhoneNumberStatus;
        };
        Relationships: [];
      };
      answering_rules: {
        Row: DbAnsweringRule;
        Insert: {
          id?: string;
          user_id: string;
          rule_type: AnsweringRuleType;
          value?: Record<string, unknown>;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rule_type?: AnsweringRuleType;
          value?: Record<string, unknown>;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      calls: {
        Row: DbCall;
        Insert: {
          id?: string;
          user_id: string;
          phone_number_id: string;
          twilio_call_sid: string;
          caller_number?: string | null;
          decision: CallDecision;
          matched_rule?: string | null;
          outcome?: CallOutcome;
          duration_seconds?: number | null;
          started_at?: string;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          caller_number?: string | null;
          decision?: CallDecision;
          matched_rule?: string | null;
          outcome?: CallOutcome;
          duration_seconds?: number | null;
          ended_at?: string | null;
        };
        Relationships: [];
      };
      call_transcripts: {
        Row: DbCallTranscript;
        Insert: {
          id?: string;
          call_id: string;
          conversation_id: string;
          transcript?: unknown;
          created_at?: string;
        };
        Update: {
          transcript?: unknown;
        };
        Relationships: [];
      };
      call_summaries: {
        Row: DbCallSummary;
        Insert: {
          id?: string;
          call_id: string;
          user_id: string;
          caller_name?: string | null;
          caller_company?: string | null;
          reason: string;
          summary: string;
          category: CallSummaryCategory;
          urgency: CallSummaryUrgency;
          is_degraded?: boolean;
          created_at?: string;
        };
        Update: {
          caller_name?: string | null;
          caller_company?: string | null;
          reason?: string;
          summary?: string;
          category?: CallSummaryCategory;
          urgency?: CallSummaryUrgency;
          is_degraded?: boolean;
        };
        Relationships: [];
      };
      notifications: {
        Row: DbNotification;
        Insert: {
          id?: string;
          user_id: string;
          call_id?: string | null;
          channel: NotificationChannel;
          status?: NotificationStatus;
          attempts?: number;
          payload?: Record<string, unknown>;
          created_at?: string;
          sent_at?: string | null;
        };
        Update: {
          status?: NotificationStatus;
          attempts?: number;
          payload?: Record<string, unknown>;
          sent_at?: string | null;
        };
        Relationships: [];
      };
      system_events: {
        Row: DbSystemEvent;
        Insert: {
          id?: string;
          event_type: string;
          payload?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          event_type?: string;
          payload?: Record<string, unknown>;
        };
        Relationships: [];
      };
      user_voice_profiles: {
        Row: DbUserVoiceProfile;
        Insert: {
          id?: string;
          user_id: string;
          elevenlabs_voice_id?: string | null;
          display_name?: string;
          status?: VoiceProfileStatus;
          requires_verification?: boolean;
          consented_at?: string | null;
          consent_version?: string | null;
          use_for_suspicious_calls?: boolean;
          interaction_mode?: VoiceInteractionMode;
          sample_count?: number;
          error_message?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          elevenlabs_voice_id?: string | null;
          display_name?: string;
          status?: VoiceProfileStatus;
          requires_verification?: boolean;
          consented_at?: string | null;
          consent_version?: string | null;
          use_for_suspicious_calls?: boolean;
          interaction_mode?: VoiceInteractionMode;
          sample_count?: number;
          error_message?: string | null;
          deleted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      voice_clone_events: {
        Row: DbVoiceCloneEvent;
        Insert: {
          id?: string;
          user_id: string;
          voice_profile_id?: string | null;
          event_type: VoiceCloneEventType;
          payload?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          voice_profile_id?: string | null;
          event_type?: VoiceCloneEventType;
          payload?: Record<string, unknown>;
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
