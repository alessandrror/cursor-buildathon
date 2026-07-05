import { VOICE_CONSENT_VERSION } from "@/lib/voice-clone/constants";
import type {
  PublicVoiceProfile,
  VoiceCloneApiResponse,
  VoiceCloneErrorResponse,
} from "@/lib/voice-clone/types";

export async function fetchVoiceProfile(): Promise<PublicVoiceProfile | null> {
  const response = await fetch("/api/voice-clone");
  if (!response.ok) {
    const data = (await response.json()) as VoiceCloneErrorResponse;
    throw new Error(data.error ?? "No se pudo cargar el perfil de voz.");
  }

  const data = (await response.json()) as { profile: PublicVoiceProfile | null };
  return data.profile;
}

export async function createVoiceClone(params: {
  samples: Blob[];
  displayName?: string;
}): Promise<PublicVoiceProfile> {
  const formData = new FormData();
  formData.append("consent", "true");
  formData.append("consent_version", VOICE_CONSENT_VERSION);

  if (params.displayName) {
    formData.append("display_name", params.displayName);
  }

  params.samples.forEach((blob, index) => {
    const extension = blob.type.includes("webm") ? "webm" : "audio";
    formData.append("files", blob, `phrase-${index + 1}.${extension}`);
  });

  const response = await fetch("/api/voice-clone", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as
    | VoiceCloneApiResponse
    | VoiceCloneErrorResponse;

  if (!response.ok || !("profile" in data)) {
    throw new Error(
      "error" in data ? data.error : "No se pudo crear el clon de voz.",
    );
  }

  return data.profile;
}

export async function updateVoiceProfileSettings(params: {
  displayName?: string;
  useForSuspiciousCalls?: boolean;
  interactionMode?: "prudente" | "equilibrado" | "detective";
  completeOnboarding?: boolean;
}): Promise<PublicVoiceProfile> {
  const response = await fetch("/api/voice-clone", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      displayName: params.displayName,
      useForSuspiciousCalls: params.useForSuspiciousCalls,
      interactionMode: params.interactionMode,
      completeOnboarding: params.completeOnboarding,
    }),
  });

  const data = (await response.json()) as
    | VoiceCloneApiResponse
    | VoiceCloneErrorResponse;

  if (!response.ok || !("profile" in data)) {
    throw new Error(
      "error" in data ? data.error : "No se pudo actualizar el perfil de voz.",
    );
  }

  return data.profile;
}
