import { VOICE_PHRASE_COUNT } from "@/lib/voice-clone/phrases";

export const VOICE_CONSENT_VERSION = "2026-07-05-v1";

/** ElevenLabs IVC: importa el tiempo total, no el número de archivos. Usamos 3 frases. */
export const VOICE_SAMPLE_MIN_COUNT = VOICE_PHRASE_COUNT;
export const VOICE_SAMPLE_MAX_COUNT = VOICE_PHRASE_COUNT;
export const VOICE_SAMPLE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
/** ~5 s por frase × 3 ≈ 15 s total (mínimo práctico; calidad del clon puede variar). */
export const VOICE_SAMPLE_MIN_DURATION_MS = 5_000;
export const VOICE_SAMPLE_MIN_BYTES = 8_000;

export const VOICE_ALLOWED_MIME_TYPES = [
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/x-m4a",
  "audio/aac",
] as const;

export const VOICE_INTERACTION_MODES = [
  "prudente",
  "equilibrado",
  "detective",
] as const;

export type VoiceInteractionMode = (typeof VOICE_INTERACTION_MODES)[number];

export const VOICE_PROFILE_STATUSES = [
  "pending",
  "ready",
  "verification_required",
  "failed",
  "revoked",
] as const;

export type VoiceProfileStatus = (typeof VOICE_PROFILE_STATUSES)[number];
