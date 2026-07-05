import Link from "next/link";
import { Ban, UserRoundCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
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

  return (
    <li>
      <Card className="h-full gap-0 py-0 shadow-none transition-colors hover:bg-secondary/25">
        <CardContent className="flex h-full flex-col px-4 py-4">
          <Link
            href={routes.callDetail(call.id)}
            className="group flex flex-1 flex-col"
          >
            <div className="flex items-start justify-between gap-4">
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
              <Badge variant={outcome.variant} className="shrink-0">
                {outcome.label}
              </Badge>
            </div>

            <div className="mt-5 min-w-0">
              <p className="truncate font-display text-lg font-black tracking-tight">
                {getCallerShortName(call)}
              </p>
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                {call.summary ?? outcome.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
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
            </div>
          </Link>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
            <p className="text-sm text-muted-foreground">
              {formatRelativeTime(call.startedAt)}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 bg-card"
                aria-label="Marcar como contacto permitido"
              >
                <UserRoundCheck aria-hidden />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 bg-card text-destructive"
                aria-label="Bloquear este número"
              >
                <Ban aria-hidden />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}
