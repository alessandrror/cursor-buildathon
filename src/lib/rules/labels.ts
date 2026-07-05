// Etiquetas legibles y variantes de Badge para la UI de reglas.
// Centraliza el texto en español y el mapeo a variantes del design system.

import type {
  CallOutcome,
  Decision,
  RejectAction,
  RuleType,
} from "@/lib/rules/types";

type BadgeVariant =
  | "default"
  | "secondary"
  | "accent"
  | "destructive"
  | "success"
  | "warning"
  | "outline";

export const decisionLabel: Record<Decision, string> = {
  answer: "Atender",
  reject: "Rechazar",
};

export const decisionVariant: Record<Decision, BadgeVariant> = {
  answer: "success",
  reject: "destructive",
};

export const rejectActionLabel: Record<RejectAction, string> = {
  busy: "Ocupado (busy)",
  hangup: "Colgar",
  message: "Mensaje breve y colgar",
};

export const anonymousActionLabel = {
  answer: "Atender",
  reject: "Rechazar",
} as const;

export const matchedRuleLabel: Record<string, string> = {
  blacklist: "Lista negra",
  whitelist: "Lista blanca",
  anonymous: "Anónimos",
  prefix_block: "Prefijo bloqueado",
  schedule: "Fuera de horario",
  default: "Sin coincidencias",
  fail_closed: "Fail-closed",
};

export const ruleTypeLabel: Record<RuleType, string> = {
  whitelist: "Lista blanca",
  blacklist: "Lista negra",
  schedule: "Horario de atención",
  anonymous: "Llamadas anónimas",
  prefix_block: "Prefijos bloqueados",
  reject_action: "Acción de rechazo",
};

export const outcomeLabel: Record<CallOutcome, string> = {
  rejected: "Rechazada",
  in_progress: "Conversación en curso",
  completed: "Completada",
  silent_hangup: "Silencio (robocall)",
  caller_hangup: "Colgó el emisor",
  agent_error: "Error del agente",
  pending_summary: "Resumen pendiente",
};

export const outcomeVariant: Record<CallOutcome, BadgeVariant> = {
  rejected: "destructive",
  in_progress: "success",
  completed: "success",
  silent_hangup: "warning",
  caller_hangup: "secondary",
  agent_error: "destructive",
  pending_summary: "accent",
};
