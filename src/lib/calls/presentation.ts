import type { VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import {
  Ban,
  Clock3,
  Languages,
  Loader2,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  PhoneOff,
  VolumeX,
} from "lucide-react";

import { badgeVariants } from "@/components/ui/badge";
import type {
  CallDecision,
  CallListItem,
  CallOutcome,
  CallSummaryCategory,
  CallSummaryUrgency,
} from "@/types/call";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export type CallOutcomeMeta = {
  label: string;
  variant: BadgeVariant;
  icon: LucideIcon;
  description: string;
};

export type CallCategoryMeta = {
  label: string;
  variant: BadgeVariant;
};

export type CallUrgencyMeta = {
  label: string;
  variant: BadgeVariant;
};

const outcomeMeta: Record<CallOutcome, CallOutcomeMeta> = {
  completed: {
    label: "Atendida",
    variant: "success",
    icon: PhoneCall,
    description: "El agente conversó y generó un resumen.",
  },
  rejected: {
    label: "Bloqueada",
    variant: "destructive",
    icon: Ban,
    description: "Rechazada por tus reglas de filtrado.",
  },
  silent_hangup: {
    label: "Silencio",
    variant: "warning",
    icon: VolumeX,
    description: "Colgada por silencio inicial del emisor.",
  },
  caller_hangup: {
    label: "Colgó el emisor",
    variant: "secondary",
    icon: PhoneMissed,
    description: "El emisor terminó la llamada antes del resumen.",
  },
  agent_error: {
    label: "Error del agente",
    variant: "destructive",
    icon: PhoneOff,
    description: "Hubo un problema al procesar la conversación.",
  },
  pending_summary: {
    label: "Generando resumen",
    variant: "accent",
    icon: Loader2,
    description: "La transcripción está lista; el resumen llegará en breve.",
  },
  in_progress: {
    label: "En curso",
    variant: "default",
    icon: PhoneIncoming,
    description: "Llamada activa en este momento.",
  },
  language_mismatch: {
    label: "Idioma distinto",
    variant: "warning",
    icon: Languages,
    description: "No se pudo continuar en el idioma configurado.",
  },
};

const categoryMeta: Record<CallSummaryCategory, CallCategoryMeta> = {
  spam_comercial: { label: "Spam comercial", variant: "destructive" },
  encuesta: { label: "Encuesta", variant: "secondary" },
  cobranza: { label: "Cobranza", variant: "warning" },
  posible_legitima: { label: "Posible legítima", variant: "success" },
  desconocida: { label: "Sin clasificar", variant: "outline" },
};

const urgencyMeta: Record<CallSummaryUrgency, CallUrgencyMeta> = {
  baja: { label: "Urgencia baja", variant: "outline" },
  media: { label: "Urgencia media", variant: "warning" },
  alta: { label: "Urgencia alta", variant: "destructive" },
};

const decisionLabels: Record<CallDecision, string> = {
  answer: "Contestada por el agente",
  reject: "Rechazada automáticamente",
};

export function getOutcomeMeta(outcome: CallOutcome): CallOutcomeMeta {
  return outcomeMeta[outcome];
}

export function getCategoryMeta(
  category: CallSummaryCategory,
): CallCategoryMeta {
  return categoryMeta[category];
}

export function getUrgencyMeta(urgency: CallSummaryUrgency): CallUrgencyMeta {
  return urgencyMeta[urgency];
}

export function getDecisionLabel(decision: CallDecision): string {
  return decisionLabels[decision];
}

export function getCallerDisplayName(call: CallListItem): string {
  if (call.callerName) {
    return call.callerCompany
      ? `${call.callerName} · ${call.callerCompany}`
      : call.callerName;
  }

  return call.callerNumber ?? "Número desconocido";
}

export function getCallerShortName(call: CallListItem): string {
  return call.callerName ?? call.callerNumber ?? "Desconocido";
}

export function formatCallDate(iso: string, style: "short" | "full" = "short") {
  return new Date(iso).toLocaleString("es-SV", {
    dateStyle: style === "full" ? "full" : "medium",
    timeStyle: "short",
  });
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "Hace un momento";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return formatCallDate(iso, "short");
}

export function formatDuration(seconds?: number): string | null {
  if (seconds == null) return null;

  if (seconds < 60) return `${seconds} s`;

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder > 0 ? `${minutes} min ${remainder} s` : `${minutes} min`;
}

export type CallMetrics = {
  total: number;
  blocked: number;
  silent: number;
  answered: number;
};

export function computeCallMetrics(calls: CallListItem[]): CallMetrics {
  return {
    total: calls.length,
    blocked: calls.filter((call) => call.outcome === "rejected").length,
    silent: calls.filter((call) => call.outcome === "silent_hangup").length,
    answered: calls.filter(
      (call) =>
        call.outcome === "completed" || call.outcome === "pending_summary",
    ).length,
  };
}
