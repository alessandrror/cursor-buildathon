import { Badge } from "@/components/ui/badge";
import {
  formatCallDate,
  formatDuration,
  getCallerDisplayName,
  getCategoryMeta,
  getDecisionLabel,
  getOutcomeMeta,
  getUrgencyMeta,
} from "@/lib/calls/presentation";
import type { CallDetail } from "@/types/call";

type CallDetailAgendaCardProps = {
  call: CallDetail;
};

export function CallDetailAgendaCard({ call }: CallDetailAgendaCardProps) {
  const outcome = getOutcomeMeta(call.outcome);
  const OutcomeIcon = outcome.icon;
  const duration = formatDuration(call.durationSeconds);
  const motivo = call.reason ?? outcome.description;
  const headline = getCallerDisplayName(call);

  const whenLine = [
    call.callerNumber,
    formatCallDate(call.startedAt, "full"),
    duration,
  ]
    .filter(Boolean)
    .join(" · ");

  const decisionLine = [
    getDecisionLabel(call.decision),
    call.matchedRule,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Detalle de llamada
            </p>
            <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
              {headline}
            </h1>
            {whenLine && (
              <p className="text-sm text-muted-foreground">{whenLine}</p>
            )}
            <p className="font-serif text-lg italic leading-snug text-muted-foreground">
              {motivo}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:max-w-xs sm:justify-end">
            <Badge variant={outcome.variant} className="gap-1">
              <OutcomeIcon
                className={
                  call.outcome === "pending_summary"
                    ? "size-3 animate-spin"
                    : "size-3"
                }
                aria-hidden
              />
              {outcome.label}
            </Badge>
            {call.category && (
              <Badge variant={getCategoryMeta(call.category).variant}>
                {getCategoryMeta(call.category).label}
              </Badge>
            )}
            {call.urgency && (
              <Badge variant={getUrgencyMeta(call.urgency).variant}>
                {getUrgencyMeta(call.urgency).label}
              </Badge>
            )}
            {call.isDegraded && <Badge variant="outline">Resumen parcial</Badge>}
          </div>
        </div>

        {(decisionLine || (call.reason && outcome.description)) && (
          <div className="space-y-2 border-t border-border pt-3 text-sm text-muted-foreground">
            {decisionLine && <p>{decisionLine}</p>}
            {call.reason && <p>{outcome.description}</p>}
          </div>
        )}
    </div>
  );
}
