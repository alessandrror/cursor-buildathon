import { auth } from "@clerk/nextjs/server";

import { resolveVoiceIdForAgent } from "@/lib/voice-clone/agent-voice";
import {
  enableAgentVoiceOverrides,
} from "@/lib/voice-clone/elevenlabs";
import { getElevenLabsApiKey } from "@/lib/voice-clone/env";
import { getActiveVoiceProfile } from "@/lib/voice-clone/repository";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";

const AGENT_ID =
  process.env.ELEVENLABS_AGENT_ID ?? "agent_3701kwr53y6qeberkrgckd9xkhdb";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let apiKey: string;

  try {
    apiKey = getElevenLabsApiKey();
  } catch {
    return Response.json(
      { error: "ElevenLabs is not configured", code: "not_configured" },
      { status: 503 },
    );
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${AGENT_ID}`,
    { headers: { "xi-api-key": apiKey } },
  );

  if (!res.ok) {
    return Response.json({ error: "Failed to get signed URL" }, { status: 502 });
  }

  const { signed_url } = await res.json();

  let overrideVoiceId: string | null = null;

  if (isSupabaseAdminConfigured()) {
    try {
      const profile = await getActiveVoiceProfile(userId);
      overrideVoiceId = resolveVoiceIdForAgent(profile);

      if (overrideVoiceId) {
        await enableAgentVoiceOverrides(AGENT_ID);
      }
    } catch (error) {
      console.error("[agent/signed-url] voice profile lookup failed:", error);
    }
  }

  return Response.json({
    signed_url,
    agent_id: AGENT_ID,
    override_voice_id: overrideVoiceId,
  });
}
