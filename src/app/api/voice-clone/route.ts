import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { VOICE_CONSENT_VERSION } from "@/lib/voice-clone/constants";
import {
  createInstantVoiceClone,
  deleteElevenLabsVoice,
  enableAgentVoiceOverrides,
  type ElevenLabsApiError,
} from "@/lib/voice-clone/elevenlabs";
import { getVoiceCloneErrorMessage } from "@/lib/voice-clone/errors";
import { isVoiceCloningEnabled } from "@/lib/voice-clone/env";
import {
  getActiveVoiceProfile,
  insertVoiceProfile,
  logVoiceCloneEvent,
  markOnboardingCompleted,
  patchVoiceProfileSettings,
  revokeActiveVoiceProfile,
  toPublicVoiceProfile,
  updateVoiceProfile,
} from "@/lib/voice-clone/repository";
import {
  validateConsentFields,
  validateVoiceSamples,
} from "@/lib/voice-clone/validation";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import type { VoiceInteractionMode } from "@/lib/voice-clone/constants";

const AGENT_ID =
  process.env.ELEVENLABS_AGENT_ID ?? "agent_3701kwr53y6qeberkrgckd9xkhdb";

import type { DbUserVoiceProfile } from "@/types/database";

const patchBodySchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  useForSuspiciousCalls: z.boolean().optional(),
  interactionMode: z.enum(["prudente", "equilibrado", "detective"]).optional(),
  completeOnboarding: z.boolean().optional(),
});

function featureDisabledResponse() {
  return Response.json(
    { error: "Voice cloning is disabled", code: "feature_disabled" },
    { status: 503 },
  );
}

function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

function configErrorResponse() {
  return Response.json(
    { error: "Voice cloning backend is not configured", code: "not_configured" },
    { status: 503 },
  );
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return unauthorizedResponse();

  if (!isSupabaseAdminConfigured()) {
    return configErrorResponse();
  }

  try {
    const profile = await getActiveVoiceProfile(userId);

    if (!profile) {
      return Response.json({ profile: null });
    }

    return Response.json({ profile: toPublicVoiceProfile(profile) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load voice profile";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorizedResponse();

  if (!isVoiceCloningEnabled()) {
    return featureDisabledResponse();
  }

  if (!isSupabaseAdminConfigured()) {
    return configErrorResponse();
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "Invalid form data", code: "invalid_form" },
      { status: 400 },
    );
  }

  const consentError = validateConsentFields(
    formData.get("consent"),
    formData.get("consent_version"),
    VOICE_CONSENT_VERSION,
  );

  if (consentError) {
    return Response.json(
      { error: consentError.message, code: consentError.code },
      { status: 400 },
    );
  }

  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File);

  const sampleError = validateVoiceSamples(files);
  if (sampleError) {
    return Response.json(
      { error: sampleError.message, code: sampleError.code },
      { status: 400 },
    );
  }

  const displayName =
    (formData.get("display_name") as string | null)?.trim() || "Mi voz";

  let profile: DbUserVoiceProfile | undefined;

  try {
    profile = await insertVoiceProfile({
      userId,
      displayName,
      consentVersion: VOICE_CONSENT_VERSION,
      sampleCount: files.length,
    });

    await logVoiceCloneEvent({
      userId,
      voiceProfileId: profile.id,
      eventType: "consent_given",
      payload: { consent_version: VOICE_CONSENT_VERSION },
    });

    await logVoiceCloneEvent({
      userId,
      voiceProfileId: profile.id,
      eventType: "clone_requested",
      payload: { sample_count: files.length },
    });

    const cloneResult = await createInstantVoiceClone({
      name: `${displayName} (${userId.slice(0, 8)})`,
      files,
      description: "GhostLine voice clone for suspicious call handling",
    });

    const status = cloneResult.requiresVerification
      ? ("verification_required" as const)
      : ("ready" as const);

    profile = await updateVoiceProfile(profile.id, userId, {
      elevenlabs_voice_id: cloneResult.voiceId,
      status,
      requires_verification: cloneResult.requiresVerification,
      error_message: null,
    });

    await logVoiceCloneEvent({
      userId,
      voiceProfileId: profile.id,
      eventType: "clone_succeeded",
      payload: {
        voice_id: cloneResult.voiceId,
        requires_verification: cloneResult.requiresVerification,
      },
    });

    await enableAgentVoiceOverrides(AGENT_ID);
  } catch (error) {
    let message = getVoiceCloneErrorMessage(error);

    if (message.includes("user_voice_profiles")) {
      message =
        "Falta la tabla de perfiles de voz en Supabase. Ejecuta: bun run db:migrate";
    }

    if (profile) {
      try {
        profile = await updateVoiceProfile(profile.id, userId, {
          status: "failed",
          error_message: message.slice(0, 500),
        });

        await logVoiceCloneEvent({
          userId,
          voiceProfileId: profile.id,
          eventType: "clone_failed",
          payload: { error: message.slice(0, 500) },
        });
      } catch {
        // Best-effort failure persistence
      }
    }

    const elevenLabsError = error as ElevenLabsApiError;

    const status =
      typeof elevenLabsError?.status === "number" &&
      elevenLabsError.status >= 400 &&
      elevenLabsError.status < 500
        ? 400
        : 502;

    return Response.json({ error: message, code: "clone_failed" }, { status });
  }

  return Response.json({ profile: toPublicVoiceProfile(profile) });
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorizedResponse();

  if (!isSupabaseAdminConfigured()) {
    return configErrorResponse();
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchBodySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", code: "invalid_body" },
      { status: 400 },
    );
  }

  const { displayName, useForSuspiciousCalls, interactionMode, completeOnboarding } =
    parsed.data;

  try {
    const profile = await patchVoiceProfileSettings(userId, {
      ...(displayName !== undefined && { display_name: displayName }),
      ...(useForSuspiciousCalls !== undefined && {
        use_for_suspicious_calls: useForSuspiciousCalls,
      }),
      ...(interactionMode !== undefined && {
        interaction_mode: interactionMode as VoiceInteractionMode,
      }),
    });

    if (!profile) {
      return Response.json(
        { error: "No active voice profile", code: "not_found" },
        { status: 404 },
      );
    }

    await logVoiceCloneEvent({
      userId,
      voiceProfileId: profile.id,
      eventType: "profile_updated",
      payload: parsed.data,
    });

    if (completeOnboarding) {
      await markOnboardingCompleted(userId);
    }

    return Response.json({ profile: toPublicVoiceProfile(profile) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update voice profile";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return unauthorizedResponse();

  if (!isSupabaseAdminConfigured()) {
    return configErrorResponse();
  }

  try {
    const profile = await getActiveVoiceProfile(userId);

    if (!profile) {
      return Response.json(
        { error: "No active voice profile", code: "not_found" },
        { status: 404 },
      );
    }

    if (profile.elevenlabs_voice_id) {
      try {
        await deleteElevenLabsVoice(profile.elevenlabs_voice_id);
      } catch (error) {
        console.error("[voice-clone] ElevenLabs delete failed:", error);
      }
    }

    await revokeActiveVoiceProfile(userId);

    await logVoiceCloneEvent({
      userId,
      voiceProfileId: profile.id,
      eventType: "profile_revoked",
      payload: { voice_id: profile.elevenlabs_voice_id },
    });

    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to revoke voice profile";
    return Response.json({ error: message }, { status: 500 });
  }
}
