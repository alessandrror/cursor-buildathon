// Regla de negocio: detección de silencio inicial tras el saludo del agente.
// Es una regla de comportamiento del agente (ElevenLabs turn timeout); aquí se
// modela como función pura para poder demostrar el escenario sin integración.
// spec: specs/rules/deteccion-silencio-inicial.md

import type { CallOutcome } from "@/lib/rules/types";

/** Ventana por defecto para considerar la llamada silenciosa. spec: 5s (±2s). */
export const DEFAULT_SILENCE_WINDOW_SECONDS = 5;

export type SilenceInput = {
  /** El emisor emitió voz/habla audible dentro de la ventana. */
  spokeWithinWindow: boolean;
  /** El emisor colgó antes de que venciera la ventana. */
  callerHungUpBeforeWindow?: boolean;
  /** Solo se detectaron tonos DTMF (no cuentan como "comunicar algo"). spec: §Excepciones. */
  onlyDtmf?: boolean;
};

export type SilenceResult = {
  earlyHangup: boolean;
  outcome: Extract<CallOutcome, "silent_hangup" | "caller_hangup" | "in_progress">;
  /** ¿Se genera resumen/consumo de tokens? Silencio y cuelgue → no. spec: §Output. */
  generatesSummary: boolean;
  reason: string;
};

/**
 * Determina el desenlace de una llamada ya atendida según el silencio inicial.
 * spec: deteccion-silencio-inicial §Condiciones.
 */
export function evaluateInitialSilence(input: SilenceInput): SilenceResult {
  // El emisor cuelga antes de los 5s. spec: §Condiciones (caller_hangup).
  if (input.callerHungUpBeforeWindow) {
    return {
      earlyHangup: true,
      outcome: "caller_hangup",
      generatesSummary: false,
      reason: "El emisor colgó antes de la ventana; sin resumen.",
    };
  }

  // Habla humana dentro de la ventana (los DTMF no cuentan). spec: §Excepciones.
  if (input.spokeWithinWindow && !input.onlyDtmf) {
    return {
      earlyHangup: false,
      outcome: "in_progress",
      generatesSummary: true,
      reason: "El emisor comunicó algo dentro de la ventana; la conversación continúa.",
    };
  }

  // Silencio (o solo DTMF/ruido) > ventana → robocall. spec: §Condiciones (silent_hangup).
  return {
    earlyHangup: true,
    outcome: "silent_hangup",
    generatesSummary: false,
    reason:
      "Silencio o solo tonos/ruido tras el saludo: se corta como robocall, sin resumen.",
  };
}
