import {
  VOICE_ALLOWED_MIME_TYPES,
  VOICE_SAMPLE_MAX_BYTES,
  VOICE_SAMPLE_MAX_COUNT,
  VOICE_SAMPLE_MIN_BYTES,
  VOICE_SAMPLE_MIN_COUNT,
  VOICE_SAMPLE_MIN_DURATION_MS,
} from "@/lib/voice-clone/constants";

export type VoiceSampleValidationError = {
  code: string;
  message: string;
};

function isAllowedMimeType(type: string): boolean {
  const normalized = type.split(";")[0]?.trim().toLowerCase() ?? "";
  return (VOICE_ALLOWED_MIME_TYPES as readonly string[]).includes(normalized);
}

export function validateVoiceSamples(
  files: File[],
): VoiceSampleValidationError | null {
  if (files.length < VOICE_SAMPLE_MIN_COUNT) {
    return {
      code: "too_few_samples",
      message: `Se requiere al menos ${VOICE_SAMPLE_MIN_COUNT} muestra de audio.`,
    };
  }

  if (files.length > VOICE_SAMPLE_MAX_COUNT) {
    return {
      code: "too_many_samples",
      message: `Máximo ${VOICE_SAMPLE_MAX_COUNT} muestras por clon.`,
    };
  }

  for (const [index, file] of files.entries()) {
    if (file.size === 0) {
      return {
        code: "empty_file",
        message: `La muestra ${index + 1} está vacía.`,
      };
    }

    if (file.size < VOICE_SAMPLE_MIN_BYTES) {
      return {
        code: "sample_too_short",
        message: `La muestra ${index + 1} es demasiado corta. Graba al menos ${Math.round(VOICE_SAMPLE_MIN_DURATION_MS / 1000)} segundos por frase.`,
      };
    }

    if (file.size > VOICE_SAMPLE_MAX_BYTES) {
      return {
        code: "file_too_large",
        message: `La muestra ${index + 1} supera el límite de 10 MB.`,
      };
    }

    if (file.type && !isAllowedMimeType(file.type)) {
      return {
        code: "invalid_mime",
        message: `Formato no permitido en la muestra ${index + 1}: ${file.type}`,
      };
    }
  }

  return null;
}

export function validateConsentFields(
  consent: FormDataEntryValue | null,
  consentVersion: FormDataEntryValue | null,
  expectedVersion: string,
): VoiceSampleValidationError | null {
  if (consent !== "true") {
    return {
      code: "consent_required",
      message: "Debes aceptar el consentimiento para crear el clon.",
    };
  }

  if (typeof consentVersion !== "string" || consentVersion !== expectedVersion) {
    return {
      code: "invalid_consent_version",
      message: "Versión de consentimiento no válida. Recarga la página.",
    };
  }

  return null;
}
