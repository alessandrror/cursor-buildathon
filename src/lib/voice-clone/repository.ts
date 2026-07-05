import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import type {
  DbUserVoiceProfile,
  VoiceCloneEventType,
  VoiceInteractionMode,
  VoiceProfileStatus,
} from "@/types/database";

function getAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase admin is not configured");
  }
  return createAdminSupabaseClient();
}

export async function getActiveVoiceProfile(
  userId: string,
): Promise<DbUserVoiceProfile | null> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("user_voice_profiles")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function revokeActiveVoiceProfile(userId: string): Promise<void> {
  const supabase = getAdminClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("user_voice_profiles")
    .update({
      status: "revoked" satisfies VoiceProfileStatus,
      deleted_at: now,
      updated_at: now,
    })
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function insertVoiceProfile(params: {
  userId: string;
  displayName: string;
  consentVersion: string;
  sampleCount: number;
}): Promise<DbUserVoiceProfile> {
  const supabase = getAdminClient();
  const now = new Date().toISOString();

  await revokeActiveVoiceProfile(params.userId);

  const { data, error } = await supabase
    .from("user_voice_profiles")
    .insert({
      user_id: params.userId,
      display_name: params.displayName,
      status: "pending",
      consented_at: now,
      consent_version: params.consentVersion,
      sample_count: params.sampleCount,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create voice profile");
  }

  return data;
}

export async function updateVoiceProfile(
  profileId: string,
  userId: string,
  patch: Partial<{
    elevenlabs_voice_id: string;
    display_name: string;
    status: VoiceProfileStatus;
    requires_verification: boolean;
    use_for_suspicious_calls: boolean;
    interaction_mode: VoiceInteractionMode;
    error_message: string | null;
  }>,
): Promise<DbUserVoiceProfile> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("user_voice_profiles")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update voice profile");
  }

  return data;
}

export async function patchVoiceProfileSettings(
  userId: string,
  patch: {
    display_name?: string;
    use_for_suspicious_calls?: boolean;
    interaction_mode?: VoiceInteractionMode;
  },
): Promise<DbUserVoiceProfile | null> {
  const existing = await getActiveVoiceProfile(userId);
  if (!existing) {
    return null;
  }

  return updateVoiceProfile(existing.id, userId, patch);
}

export async function markOnboardingCompleted(userId: string): Promise<void> {
  const supabase = getAdminClient();

  const { error } = await supabase
    .from("users")
    .update({
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function logVoiceCloneEvent(params: {
  userId: string;
  voiceProfileId?: string;
  eventType: VoiceCloneEventType;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getAdminClient();

  const { error } = await supabase.from("voice_clone_events").insert({
    user_id: params.userId,
    voice_profile_id: params.voiceProfileId ?? null,
    event_type: params.eventType,
    payload: params.payload ?? {},
  });

  if (error) {
    console.error("[voice-clone] audit event failed:", error.message);
  }
}

export function toPublicVoiceProfile(profile: DbUserVoiceProfile) {
  return {
    id: profile.id,
    displayName: profile.display_name,
    status: profile.status,
    requiresVerification: profile.requires_verification,
    useForSuspiciousCalls: profile.use_for_suspicious_calls,
    interactionMode: profile.interaction_mode,
    sampleCount: profile.sample_count,
    errorMessage: profile.error_message,
    consentedAt: profile.consented_at,
    consentVersion: profile.consent_version,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}
