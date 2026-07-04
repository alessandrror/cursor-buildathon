export type IntegrationProvider = "twilio" | "elevenlabs" | "n8n" | "supabase";

export type IntegrationStatus = {
  provider: IntegrationProvider;
  label: string;
  description: string;
  status: "pending" | "connected" | "error";
};
