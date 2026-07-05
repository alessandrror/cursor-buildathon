import type { ElevenLabsApiError } from "@/lib/voice-clone/elevenlabs";

export function isElevenLabsApiError(error: unknown): error is ElevenLabsApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error &&
    typeof (error as ElevenLabsApiError).status === "number" &&
    typeof (error as ElevenLabsApiError).message === "string"
  );
}

export function parseElevenLabsErrorBody(body: string): string {
  try {
    const parsed = JSON.parse(body) as {
      detail?:
        | string
        | { message?: string }
        | Array<{ msg?: string; message?: string }>;
    };

    if (Array.isArray(parsed.detail)) {
      const messages = parsed.detail
        .map((entry) => entry.msg ?? entry.message)
        .filter((value): value is string => Boolean(value));

      if (messages.length > 0) {
        return messages.join(" ");
      }
    } else if (
      parsed.detail &&
      typeof parsed.detail === "object" &&
      "message" in parsed.detail &&
      typeof parsed.detail.message === "string"
    ) {
      return parsed.detail.message;
    } else if (typeof parsed.detail === "string") {
      return parsed.detail;
    }
  } catch {
    // keep raw body
  }

  return body;
}

export function getVoiceCloneErrorMessage(error: unknown): string {
  if (isElevenLabsApiError(error)) {
    return parseElevenLabsErrorBody(error.message);
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "No se pudo crear el clon de voz.";
}
