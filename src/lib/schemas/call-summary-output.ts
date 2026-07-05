import { z } from "zod";

export const callSummaryCategorySchema = z.enum([
  "spam_comercial",
  "encuesta",
  "cobranza",
  "posible_legitima",
  "desconocida",
]);

export const callSummaryUrgencySchema = z.enum(["baja", "media", "alta"]);

export const callSummaryOutputSchema = z.object({
  caller_name: z.string().nullable(),
  caller_company: z.string().nullable(),
  reason: z.string().min(1),
  summary: z.string().min(1),
  category: callSummaryCategorySchema,
  urgency: callSummaryUrgencySchema,
});

export type CallSummaryOutput = z.infer<typeof callSummaryOutputSchema>;
export type CallSummaryCategory = z.infer<typeof callSummaryCategorySchema>;
export type CallSummaryUrgency = z.infer<typeof callSummaryUrgencySchema>;

/** Strip markdown fences and parse JSON from OpenAI response text. */
export function parseCallSummaryOutput(raw: string): CallSummaryOutput {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed: unknown = JSON.parse(cleaned);
  return callSummaryOutputSchema.parse(parsed);
}

/** Minimum useful transcript length before invoking OpenAI (spec: 20 chars). */
export function isTranscriptTooShort(text: string): boolean {
  const useful = text.replace(/\s+/g, "").length;
  return useful < 20;
}

export const DEGRADED_SUMMARY_FALLBACK = {
  reason: "Resumen no disponible",
  summary: "",
  category: "desconocida" as const,
  urgency: "baja" as const,
};

export function buildDegradedSummary(transcriptText: string) {
  return {
    caller_name: null,
    caller_company: null,
    reason: DEGRADED_SUMMARY_FALLBACK.reason,
    summary: transcriptText.slice(0, 500),
    category: DEGRADED_SUMMARY_FALLBACK.category,
    urgency: DEGRADED_SUMMARY_FALLBACK.urgency,
    is_degraded: true,
  };
}

export function buildEmptyTranscriptSummary() {
  return {
    caller_name: null,
    caller_company: null,
    reason: "Sin contenido",
    summary: "Llamada sin contenido relevante",
    category: "desconocida" as const,
    urgency: "baja" as const,
    is_degraded: false,
  };
}

/** Flatten ElevenLabs transcript turns to text for the summary prompt. */
export function flattenTranscript(
  turns: Array<{ role: string; message: string }>,
  maxChars = 8000,
): string {
  const lines = turns.map(
    (t) => `[${t.role === "agent" ? "agente" : "usuario"}]: ${t.message}`,
  );
  const full = lines.join("\n");
  if (full.length <= maxChars) return full;
  return full.slice(-maxChars);
}
