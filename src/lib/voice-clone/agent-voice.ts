import type { DbUserVoiceProfile } from "@/types/database";

const USABLE_STATUSES = new Set(["ready", "verification_required"]);

/** Voice ID to pass to the ConvAI agent/widget for this user, if any. */
export function resolveVoiceIdForAgent(
  profile: DbUserVoiceProfile | null,
): string | null {
  if (!profile?.elevenlabs_voice_id) {
    return null;
  }

  if (!profile.use_for_suspicious_calls) {
    return null;
  }

  if (!USABLE_STATUSES.has(profile.status)) {
    return null;
  }

  return profile.elevenlabs_voice_id;
}
