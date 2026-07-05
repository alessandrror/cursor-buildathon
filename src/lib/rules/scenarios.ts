// Escenarios de ejemplo para el simulador — reproducen exactamente los ejemplos
// documentados en las specs, para demostrar los flujos sin integrar n8n.
// spec: evaluacion §Ejemplos; deteccion-silencio-inicial §Ejemplos.

import { DEFAULT_PROFILE } from "@/lib/rules/defaults";
import type {
  AnsweringRule,
  Decision,
  Profile,
  RejectAction,
} from "@/lib/rules/types";
import type { SilenceInput } from "@/lib/rules/silence";

export type EvaluateScenario = {
  id: string;
  title: string;
  description: string;
  /** null representa fallo/timeout de la consulta de reglas (fail-closed). */
  rules: AnsweringRule[] | null;
  call: { callerNumber: string | null; timestampIso: string };
  profile: Profile;
  expected: { decision: Decision; rejectAction?: RejectAction; matchedRule: string };
};

const anonReject: AnsweringRule = {
  id: "s-anon",
  ruleType: "anonymous",
  value: { action: "reject" },
  isActive: true,
};
const rejectBusy: AnsweringRule = {
  id: "s-reject-busy",
  ruleType: "reject_action",
  value: { action: "busy" },
  isActive: true,
};
const rejectMessage: AnsweringRule = {
  id: "s-reject-msg",
  ruleType: "reject_action",
  value: { action: "message" },
  isActive: true,
};
const schedule247: AnsweringRule = {
  id: "s-sched-247",
  ruleType: "schedule",
  value: { start: "00:00", end: "00:00" },
  isActive: true,
};

// America/El_Salvador es UTC-6 todo el año. Las horas locales de los ejemplos se
// expresan aquí como su equivalente en UTC.
export const EVALUATE_SCENARIOS: EvaluateScenario[] = [
  {
    id: "ej-1-blacklist",
    title: "Número en lista negra",
    description: "Emisor en lista negra, martes 10:00 local → rechazo por regla #1.",
    rules: [
      {
        id: "s1-bl",
        ruleType: "blacklist",
        value: { number: "+50377778888" },
        isActive: true,
      },
      schedule247,
      anonReject,
      rejectBusy,
    ],
    call: { callerNumber: "+50377778888", timestampIso: "2026-07-07T16:00:00Z" },
    profile: DEFAULT_PROFILE,
    expected: { decision: "reject", rejectAction: "busy", matchedRule: "blacklist" },
  },
  {
    id: "ej-2-anonimo",
    title: "Llamada anónima",
    description: "Emisor oculto con ajuste anónimos = rechazar → regla #3.",
    rules: [schedule247, anonReject, rejectBusy],
    call: { callerNumber: null, timestampIso: "2026-07-07T16:00:00Z" },
    profile: DEFAULT_PROFILE,
    expected: { decision: "reject", rejectAction: "busy", matchedRule: "anonymous" },
  },
  {
    id: "ej-3-horario",
    title: "Fuera de horario",
    description:
      "Sin coincidencias, horario 08:00–20:00, llamada 21:30 local → rechazo con mensaje (regla #5).",
    rules: [
      {
        id: "s3-sched",
        ruleType: "schedule",
        value: { start: "08:00", end: "20:00" },
        isActive: true,
      },
      anonReject,
      rejectMessage,
    ],
    call: { callerNumber: "+50376543210", timestampIso: "2026-07-08T03:30:00Z" },
    profile: DEFAULT_PROFILE,
    expected: { decision: "reject", rejectAction: "message", matchedRule: "schedule" },
  },
  {
    id: "ej-4-nocturno",
    title: "Horario nocturno (cruza medianoche)",
    description:
      "Horario 22:00–06:00, llamada 23:15 local → dentro del rango, se atiende (regla #6).",
    rules: [
      {
        id: "s4-sched",
        ruleType: "schedule",
        value: { start: "22:00", end: "06:00" },
        isActive: true,
      },
      anonReject,
      rejectBusy,
    ],
    call: { callerNumber: "+50376543210", timestampIso: "2026-07-08T05:15:00Z" },
    profile: DEFAULT_PROFILE,
    expected: { decision: "answer", matchedRule: "default" },
  },
  {
    id: "ej-5-fail-closed",
    title: "Fallo de reglas (fail-closed)",
    description: "La consulta de reglas no responde en 5s → rechazo con mensaje.",
    rules: null,
    call: { callerNumber: "+50376543210", timestampIso: "2026-07-07T16:00:00Z" },
    profile: DEFAULT_PROFILE,
    expected: { decision: "reject", rejectAction: "message", matchedRule: "fail_closed" },
  },
];

export type SilenceScenario = {
  id: string;
  title: string;
  description: string;
  input: SilenceInput;
  expectedOutcome: "in_progress" | "silent_hangup" | "caller_hangup";
};

export const SILENCE_SCENARIOS: SilenceScenario[] = [
  {
    id: "sil-1-habla",
    title: "El emisor habla",
    description: 'Agente saluda, el emisor dice "Hola, le llamo de..." a los 2s.',
    input: { spokeWithinWindow: true },
    expectedOutcome: "in_progress",
  },
  {
    id: "sil-2-silencio",
    title: "Silencio total",
    description: "Agente saluda, 6s de silencio → se corta como robocall.",
    input: { spokeWithinWindow: false },
    expectedOutcome: "silent_hangup",
  },
  {
    id: "sil-3-dtmf",
    title: "Solo tonos DTMF",
    description: "Solo se detectan tonos (no cuentan como comunicar) → se corta.",
    input: { spokeWithinWindow: true, onlyDtmf: true },
    expectedOutcome: "silent_hangup",
  },
  {
    id: "sil-4-cuelga",
    title: "El emisor cuelga",
    description: "El emisor cuelga al segundo 1 → caller_hangup, sin resumen.",
    input: { spokeWithinWindow: false, callerHungUpBeforeWindow: true },
    expectedOutcome: "caller_hangup",
  },
];
