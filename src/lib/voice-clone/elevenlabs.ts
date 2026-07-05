import { parseElevenLabsErrorBody } from "@/lib/voice-clone/errors";
import {
  getElevenLabsApiKey,
  getElevenLabsBaseUrl,
} from "@/lib/voice-clone/env";

export type CreateVoiceCloneResult = {
  voiceId: string;
  requiresVerification: boolean;
};

export type ElevenLabsApiError = {
  status: number;
  message: string;
};

function extensionForMime(mime: string): string {
  const normalized = mime.split(";")[0]?.trim().toLowerCase() ?? "";

  switch (normalized) {
    case "audio/webm":
      return "webm";
    case "audio/mp4":
    case "audio/x-m4a":
      return "m4a";
    case "audio/mpeg":
      return "mp3";
    case "audio/wav":
      return "wav";
    case "audio/ogg":
      return "ogg";
    default:
      return "webm";
  }
}

async function toUploadBlob(file: File): Promise<{ blob: Blob; filename: string }> {
  const mime = file.type || "audio/webm";
  const buffer = await file.arrayBuffer();
  const blob = new Blob([buffer], { type: mime });

  const baseName = file.name?.replace(/\.[^.]+$/, "") || "sample";
  const filename = `${baseName}.${extensionForMime(mime)}`;

  return { blob, filename };
}

export async function createInstantVoiceClone(params: {
  name: string;
  files: File[];
  description?: string;
}): Promise<CreateVoiceCloneResult> {
  const formData = new FormData();
  formData.append("name", params.name);
  formData.append("remove_background_noise", "false");

  if (params.description) {
    formData.append("description", params.description);
  }

  for (const file of params.files) {
    const { blob, filename } = await toUploadBlob(file);
    formData.append("files", blob, filename);
  }

  const response = await fetch(`${getElevenLabsBaseUrl()}/v1/voices/add`, {
    method: "POST",
    headers: {
      "xi-api-key": getElevenLabsApiKey(),
    },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text();
    const message =
      parseElevenLabsErrorBody(body) ||
      `ElevenLabs rechazó el clon (${response.status})`;

    throw {
      status: response.status,
      message,
    } satisfies ElevenLabsApiError;
  }

  const data = (await response.json()) as {
    voice_id: string;
    requires_verification: boolean;
  };

  return {
    voiceId: data.voice_id,
    requiresVerification: data.requires_verification,
  };
}

export async function enableAgentVoiceOverrides(agentId: string): Promise<void> {
  const response = await fetch(
    `${getElevenLabsBaseUrl()}/v1/convai/agents/${encodeURIComponent(agentId)}`,
    {
      method: "PATCH",
      headers: {
        "xi-api-key": getElevenLabsApiKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        platform_settings: {
          overrides: {
            conversation_config_override: {
              tts: { voice_id: true },
            },
          },
        },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    console.warn(
      "[voice-clone] Could not enable agent voice overrides:",
      parseElevenLabsErrorBody(body) || response.status,
    );
  }
}

export async function deleteElevenLabsVoice(voiceId: string): Promise<void> {
  const response = await fetch(
    `${getElevenLabsBaseUrl()}/v1/voices/${encodeURIComponent(voiceId)}`,
    {
      method: "DELETE",
      headers: {
        "xi-api-key": getElevenLabsApiKey(),
      },
    },
  );

  if (!response.ok && response.status !== 404) {
    const body = await response.text();
    throw {
      status: response.status,
      message:
        parseElevenLabsErrorBody(body) ||
        `ElevenLabs voice delete failed (${response.status})`,
    } satisfies ElevenLabsApiError;
  }
}
