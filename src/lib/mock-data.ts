import type { CallDetail, CallListItem } from "@/types/call";
import type { IntegrationStatus } from "@/types/integration";

/** Llamada completada con resumen completo (caso típico del pipeline). */
const mockCallCompleted: CallDetail = {
  id: "00000000-0000-4000-8000-000000000001",
  callerNumber: "+50370001234",
  startedAt: "2026-07-04T10:30:00Z",
  endedAt: "2026-07-04T10:34:00Z",
  durationSeconds: 240,
  decision: "answer",
  outcome: "completed",
  matchedRule: "default_answer",
  callerName: "Carlos",
  callerCompany: "Telecom Promo",
  reason: "Oferta comercial de plan de internet.",
  summary:
    "Carlos de Telecom Promo ofreció un cambio de plan de fibra con descuento promocional. Llamada comercial identificada como posible spam.",
  category: "spam_comercial",
  urgency: "baja",
  isDegraded: false,
  transcript: [
    {
      role: "agent",
      message:
        "Hola, ha llamado al asistente de María. ¿De parte de quién y cuál es el motivo de su llamada?",
      time_in_call_secs: 0,
    },
    {
      role: "user",
      message: "Buenas, soy Carlos de Telecom Promo con una oferta de fibra.",
      time_in_call_secs: 3,
    },
    {
      role: "agent",
      message: "Gracias Carlos. ¿Podría decirme el motivo en una frase?",
      time_in_call_secs: 12,
    },
    {
      role: "user",
      message:
        "Queremos cambiarle el plan de internet con descuento por tres meses.",
      time_in_call_secs: 18,
    },
  ],
};

const mockCallSilent: CallDetail = {
  id: "00000000-0000-4000-8000-000000000002",
  callerNumber: "+50370005678",
  startedAt: "2026-07-04T11:15:00Z",
  endedAt: "2026-07-04T11:15:05Z",
  durationSeconds: 5,
  decision: "answer",
  outcome: "silent_hangup",
  matchedRule: "default_answer",
  summary: "Llamada cerrada por silencio inicial del emisor.",
  transcript: [
    {
      role: "agent",
      message:
        "Hola, ha llamado al asistente de María. ¿De parte de quién y cuál es el motivo de su llamada?",
      time_in_call_secs: 0,
    },
  ],
};

const mockCallRejected: CallDetail = {
  id: "00000000-0000-4000-8000-000000000003",
  callerNumber: "+50370009999",
  startedAt: "2026-07-04T09:00:00Z",
  decision: "reject",
  outcome: "rejected",
  matchedRule: "blacklist:+50370009999",
  reason: "Número en lista negra.",
  summary: "Llamada rechazada automáticamente por reglas de filtrado.",
  category: "spam_comercial",
  urgency: "baja",
};

const mockCallPendingSummary: CallDetail = {
  id: "00000000-0000-4000-8000-000000000004",
  callerNumber: "+50371234567",
  startedAt: "2026-07-04T14:20:00Z",
  endedAt: "2026-07-04T14:22:30Z",
  durationSeconds: 150,
  decision: "answer",
  outcome: "pending_summary",
  matchedRule: "default_answer",
  callerName: "Desconocido",
  transcript: [
    {
      role: "agent",
      message: "Hola, ha llamado al asistente de María. ¿En qué puedo ayudarle?",
      time_in_call_secs: 0,
    },
    {
      role: "user",
      message: "Llamo por una encuesta de satisfacción del municipio.",
      time_in_call_secs: 4,
    },
  ],
};

export const mockCallDetails: CallDetail[] = [
  mockCallCompleted,
  mockCallSilent,
  mockCallRejected,
  mockCallPendingSummary,
];

export const mockCalls: CallListItem[] = mockCallDetails.map(
  ({ transcript: _t, matchedRule: _m, ...listItem }) => listItem,
);

export function getMockCallById(id: string): CallDetail | null {
  return mockCallDetails.find((call) => call.id === id) ?? null;
}

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
