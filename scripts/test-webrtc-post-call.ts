/**
 * Simulates an ElevenLabs post-call webhook (WebRTC/gadget path) against n8n.
 * Usage: bun --env-file=.env scripts/test-webrtc-post-call.ts <clerk_user_id>
 */
const clerkUserId = process.argv[2];
const n8nBase = process.env.N8N_WEBHOOK_URL?.replace(/\/$/, "");

if (!clerkUserId) {
  console.error("Usage: bun --env-file=.env scripts/test-webrtc-post-call.ts <clerk_user_id>");
  process.exit(1);
}

if (!n8nBase) {
  console.error("Missing N8N_WEBHOOK_URL");
  process.exit(1);
}

const conversationId = `conv_test_${Date.now()}`;
const payload = {
  type: "post_call_transcription",
  data: {
    conversation_id: conversationId,
    agent_id: process.env.ELEVENLABS_AGENT_ID ?? "agent_test",
    status: "done",
    transcript: [
      {
        role: "agent",
        message: "Hola, ha llamado al asistente de prueba.",
        time_in_call_secs: 0,
      },
      {
        role: "user",
        message: "Hola, llamo para probar GhostLine.",
        time_in_call_secs: 2,
      },
    ],
    metadata: {
      call_duration_secs: 12,
    },
    conversation_initiation_client_data: {
      dynamic_variables: {
        owner_name: "Usuario de prueba",
        clerk_user_id: clerkUserId,
      },
    },
  },
};

const url = `${n8nBase}/webhook/elevenlabs/post-call`;
const response = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const text = await response.text();
console.log(`POST ${url}`);
console.log(`Status: ${response.status}`);
console.log(`Body: ${text}`);

if (!response.ok) {
  process.exit(1);
}

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

await new Promise((resolve) => setTimeout(resolve, 2000));

const { data: calls, error } = await supabase
  .from("calls")
  .select("id, user_id, outcome, twilio_call_sid")
  .eq("user_id", clerkUserId)
  .order("started_at", { ascending: false })
  .limit(3);

if (error) {
  console.error("Supabase verify failed:", error.message);
  process.exit(1);
}

console.log("\nCalls for user after webhook:");
console.log(JSON.stringify(calls, null, 2));

const matched = calls?.some((call) => call.twilio_call_sid === conversationId);
if (!matched) {
  console.error("\nExpected call row was not created for this clerk user.");
  process.exit(1);
}

console.log("\nOK — call persisted for the correct clerk user.");
