import Link from "next/link";
import { ArrowLeft, Ban, Flag, ShieldCheck, UserRoundCheck } from "lucide-react";

import { CallTranscript } from "@/components/dashboard/call-transcript";
<<<<<<< HEAD
import { MockDataBanner } from "@/components/dashboard/mock-data-banner";
=======
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatDuration,
  formatRelativeTime,
  getCallerShortName,
  getCategoryMeta,
  getOutcomeMeta,
  getUrgencyMeta,
} from "@/lib/calls/presentation";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { CallDetail } from "@/types/call";

type CallSummaryViewProps = {
  call: CallDetail;
<<<<<<< HEAD
  showMockBanner?: boolean;
=======
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
};

function getStatusLabel(call: CallDetail) {
  if (call.outcome === "completed") return "Completada";
  if (call.outcome === "pending_summary") return "Pendiente";
  return getOutcomeMeta(call.outcome).label;
}

function getCompactDuration(seconds?: number) {
  if (seconds == null) return "Sin duración";
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

function getHeaderTitle(call: CallDetail) {
  return call.callerCompany ?? call.callerName ?? getCallerShortName(call);
}

function getHeaderMeta(call: CallDetail) {
  return [
    call.callerNumber,
    formatRelativeTime(call.startedAt),
    formatDuration(call.durationSeconds),
  ]
    .filter(Boolean)
    .join(" · ");
}

function getConclusion(call: CallDetail) {
  if (call.category === "posible_legitima") {
    return {
      title: "Contacto legítimo, sin riesgo",
      body:
        "La llamada corresponde a una gestión real y no hubo intento de fraude. Puedes marcar este número como seguro.",
    };
  }

  if (call.outcome === "rejected" || call.category === "spam_comercial") {
    return {
      title: "Riesgo detectado",
      body:
        "GhostLine encontró señales de llamada no deseada. Mantén este número bloqueado si no reconoces al emisor.",
    };
  }

  return {
    title: "Llamada revisada",
    body:
      "GhostLine registró el contexto principal de la conversación para que puedas decidir qué hacer con este número.",
  };
}

function getSummaryReason(call: CallDetail) {
  return call.reason ?? call.summary ?? getOutcomeMeta(call.outcome).description;
}

<<<<<<< HEAD
export function CallSummaryView({ call, showMockBanner }: CallSummaryViewProps) {
=======
export function CallSummaryView({ call }: CallSummaryViewProps) {
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
  const outcome = getOutcomeMeta(call.outcome);
  const OutcomeIcon = outcome.icon;
  const category = call.category ? getCategoryMeta(call.category) : null;
  const urgency = call.urgency ? getUrgencyMeta(call.urgency) : null;
  const conclusion = getConclusion(call);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Button variant="ghost" size="sm" className="-ml-2 mb-4 text-muted-foreground" asChild>
        <Link href={routes.callDetail(call.id)}>
          <ArrowLeft data-icon="inline-start" />
          Volver a la llamada
        </Link>
      </Button>

<<<<<<< HEAD
      {showMockBanner && <MockDataBanner />}

=======
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
      <Card className="gap-0 py-0 shadow-none">
        <CardContent className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className={cn(
                "flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary",
                call.outcome === "rejected" && "text-destructive",
                call.outcome === "silent_hangup" && "text-warning",
                call.outcome === "completed" && "text-success",
                call.outcome === "pending_summary" && "text-accent-foreground",
              )}
            >
              <OutcomeIcon
                className={cn(
                  "size-7",
                  call.outcome === "pending_summary" && "animate-spin",
                )}
                aria-hidden
              />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-black tracking-tight sm:text-3xl">
                {getHeaderTitle(call)}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {getHeaderMeta(call)}
              </p>
            </div>
          </div>
          <Badge variant={outcome.variant} className="self-start sm:self-center">
            {getStatusLabel(call)}
          </Badge>
        </CardContent>
      </Card>

      <Card className="mt-4 gap-0 border-primary/20 bg-secondary/60 py-0 shadow-none">
        <CardContent className="flex gap-4 px-5 py-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-success">
            <ShieldCheck className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-success">
              Conclusión
            </p>
            <h2 className="mt-1 font-display text-base font-black tracking-tight">
              {conclusion.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {conclusion.body}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 gap-0 py-0 shadow-none">
        <CardContent className="px-5 py-5">
          <h2 className="font-display text-xl font-black tracking-tight">Resumen</h2>
          <p className="mt-4 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Motivo
          </p>
          <h3 className="mt-2 font-display text-base font-black tracking-tight">
            {getSummaryReason(call)}
          </h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {call.summary ?? outcome.description}
          </p>
        </CardContent>
      </Card>

      <section aria-label="Datos de la llamada" className="mt-4 grid gap-3 sm:grid-cols-4">
        <SummaryStat label="Estado" value={getStatusLabel(call)} />
        <SummaryStat label="Duración" value={getCompactDuration(call.durationSeconds)} />
        <SummaryStat label="Categoría" value={category?.label ?? "Sin clasificar"} />
        <SummaryStat
          label="Urgencia"
          value={urgency?.label.replace("Urgencia ", "") ?? "Sin urgencia"}
        />
      </section>

      {call.transcript && call.transcript.length > 0 && (
        <div className="mt-4">
          <CallTranscript turns={call.transcript} />
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Button variant="outline" className="bg-card">
          <UserRoundCheck data-icon="inline-start" />
          Confiar en este número
        </Button>
        <Button variant="destructive">
          <Ban data-icon="inline-start" />
          Bloquear
        </Button>
        <Button variant="outline" className="bg-card">
          <Flag data-icon="inline-start" />
          Reportar
        </Button>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardContent className="px-4 py-4">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 font-display text-base font-black tracking-tight">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
