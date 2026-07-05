import Link from "next/link";
import { ArrowLeft, Ban, Flag, UserRoundCheck } from "lucide-react";

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

type CallDetailViewProps = {
  call: CallDetail;
};

function getDetailStatusLabel(call: CallDetail) {
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

function getCallMetaLine(call: CallDetail) {
  const duration = formatDuration(call.durationSeconds);

  return [
    call.callerCompany,
    formatRelativeTime(call.startedAt),
    duration,
  ]
    .filter(Boolean)
    .join(" · ");
}

function getPrimaryReason(call: CallDetail) {
  const outcome = getOutcomeMeta(call.outcome);
  return call.reason ?? call.summary ?? outcome.description;
}

function getSummaryDetail(call: CallDetail) {
  if (call.reason && call.summary && call.reason !== call.summary) {
    return call.summary;
  }

  return getOutcomeMeta(call.outcome).description;
}

export function CallDetailView({ call }: CallDetailViewProps) {
  const outcome = getOutcomeMeta(call.outcome);
  const OutcomeIcon = outcome.icon;
  const category = call.category ? getCategoryMeta(call.category) : null;
  const urgency = call.urgency ? getUrgencyMeta(call.urgency) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Button variant="ghost" size="sm" className="-ml-2 mb-4 text-muted-foreground" asChild>
        <Link href={routes.dashboard}>
          <ArrowLeft data-icon="inline-start" />
          Volver al panel
        </Link>
      </Button>

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
                {getCallerShortName(call)}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {getCallMetaLine(call)}
              </p>
            </div>
          </div>
          <Badge variant={outcome.variant} className="self-start sm:self-center">
            {getDetailStatusLabel(call)}
          </Badge>
        </CardContent>
      </Card>

      <section aria-label="Resumen de la llamada" className="mt-4 grid gap-3 sm:grid-cols-4">
        <DetailStat label="Estado" value={getDetailStatusLabel(call)} />
        <DetailStat label="Duración" value={getCompactDuration(call.durationSeconds)} />
        <DetailStat label="Categoría" value={category?.label ?? "Sin clasificar"} />
        <DetailStat
          label="Urgencia"
          value={urgency?.label.replace("Urgencia ", "") ?? "Sin urgencia"}
        />
      </section>

      <Card className="mt-4 gap-0 py-0 shadow-none">
        <CardContent className="px-5 py-5">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Motivo
          </p>
          <h2 className="mt-3 font-display text-lg font-black tracking-tight">
            {getPrimaryReason(call)}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {getSummaryDetail(call)}
          </p>
          <Button variant="link" className="mt-2 h-auto px-0" asChild>
            <Link href={routes.summaryDetail(call.id)}>
              Ver resumen completo
              <ArrowLeft className="rotate-180" data-icon="inline-end" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Button variant="outline" className="bg-card">
          <UserRoundCheck data-icon="inline-start" />
          Confiar
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

function DetailStat({ label, value }: { label: string; value: string }) {
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
