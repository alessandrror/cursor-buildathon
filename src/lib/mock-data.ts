import type { CallSummary } from "@/types/call-summary";
import type { IntegrationStatus } from "@/types/integration";

export const mockCallSummaries: CallSummary[] = [
  {
    id: "summary_001",
    callerNumber: "+503 XXXX XXXX",
    alternativeNumber: "+1 XXX XXX XXXX",
    startedAt: "2026-07-04T10:30:00Z",
    endedAt: "2026-07-04T10:34:00Z",
    durationSeconds: 240,
    status: "completed",
    title: "Consulta general recibida",
    summary:
      "La persona realizó una consulta general. La IA respondió en español y la conversación finalizó correctamente.",
    transcript: "Transcripción de ejemplo pendiente de integración real.",
  },
  {
    id: "summary_002",
    callerNumber: "+503 XXXX XXXX",
    alternativeNumber: "+1 XXX XXX XXXX",
    startedAt: "2026-07-04T11:15:00Z",
    durationSeconds: 5,
    status: "closed_by_silence",
    closeReason: "El emisor no comunicó nada durante el tiempo de espera.",
    title: "Llamada cerrada por silencio",
    summary: "La llamada fue cerrada porque no hubo comunicación del emisor.",
    transcript: "",
  },
  {
    id: "summary_003",
    callerNumber: "+503 XXXX XXXX",
    alternativeNumber: "+1 XXX XXX XXXX",
    startedAt: "2026-07-04T09:00:00Z",
    endedAt: "2026-07-04T09:02:00Z",
    durationSeconds: 120,
    status: "rejected_by_rules",
    closeReason: "Número no autorizado según reglas configuradas.",
    title: "Llamada rechazada por reglas",
    summary:
      "La llamada fue rechazada automáticamente por no cumplir las reglas de filtrado.",
  },
  {
    id: "summary_004",
    callerNumber: "+503 XXXX XXXX",
    alternativeNumber: "+1 XXX XXX XXXX",
    startedAt: "2026-07-04T08:45:00Z",
    durationSeconds: 0,
    status: "failed",
    closeReason: "Error al procesar la llamada.",
    title: "Llamada fallida",
    summary: "No se pudo completar el procesamiento de la llamada.",
  },
];

export const mockIntegrationStatuses: IntegrationStatus[] = [
  {
    provider: "twilio",
    label: "Twilio",
    description: "Gestión de números telefónicos y llamadas entrantes.",
    status: "pending",
  },
  {
    provider: "elevenlabs",
    label: "ElevenLabs",
    description: "Síntesis de voz para el agente de IA.",
    status: "pending",
  },
  {
    provider: "n8n",
    label: "n8n",
    description: "Automatización de flujos y webhooks.",
    status: "pending",
  },
  {
    provider: "supabase",
    label: "Supabase",
    description: "Persistencia de datos y resúmenes de llamadas.",
    status: "pending",
  },
];
