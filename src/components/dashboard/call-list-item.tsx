import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import type { CallListItem } from "@/types/call";
import { cn } from "@/lib/utils";

type CallListItemCardProps = {
  call: CallListItem;
};

export function CallListItemCard({ call }: CallListItemCardProps) {
  const outcome = getOutcomeMeta(call.outcome);
  const OutcomeIcon = outcome.icon;
  const duration = formatDuration(call.durationSeconds);

  return (
    <li>
      <Link href={routes.summaryDetail(call.id)} className="group block">
        <Card className="gap-0 py-0 shadow-none transition-colors hover:bg-secondary/35">
          <CardContent className="flex items-start gap-4 px-4 py-4 sm:px-5">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary",
                call.outcome === "rejected" && "text-destructive",
                call.outcome === "silent_hangup" && "text-warning",
                call.outcome === "completed" && "text-success",
                call.outcome === "pending_summary" && "text-accent-foreground",
              )}
            >
              <OutcomeIcon
                className={cn(
                  "size-5",
                  call.outcome === "pending_summary" && "animate-spin",
                )}
                aria-hidden
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{getCallerShortName(call)}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatRelativeTime(call.startedAt)}
                    {duration ? ` · ${duration}` : null}
                  </p>
                </div>
                <Badge variant={outcome.variant} className="shrink-0">
                  {outcome.label}
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
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
                {call.isDegraded && (
                  <Badge variant="outline">Resumen parcial</Badge>
                )}
              </div>

              {call.summary ? (
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {call.summary}
                </p>
              ) : (
                <p className="mt-3 text-sm italic text-muted-foreground">
                  {outcome.description}
                </p>
              )}
            </div>

            <ChevronRight
              className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
              aria-hidden
            />
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}
