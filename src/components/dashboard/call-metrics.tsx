import { Ban, FileCheck2, PhoneCall, VolumeX } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { CallMetrics } from "@/lib/calls/presentation";
import { cn } from "@/lib/utils";

type CallMetricsProps = {
  metrics: CallMetrics;
};

const metricCards = [
  {
    key: "total" as const,
    label: "Total llamadas",
    icon: PhoneCall,
    accent: "text-primary",
  },
  {
    key: "blocked" as const,
    label: "Bloqueadas por reglas",
    icon: Ban,
    accent: "text-destructive",
  },
  {
    key: "silent" as const,
    label: "Filtradas por silencio",
    icon: VolumeX,
    accent: "text-warning",
  },
  {
    key: "answered" as const,
    label: "Atendidas con resumen",
    icon: FileCheck2,
    accent: "text-success",
  },
];

export function CallMetricsGrid({ metrics }: CallMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metricCards.map(({ key, label, icon: Icon, accent }) => (
        <Card key={key} className="gap-0 py-0 shadow-none">
          <CardContent className="flex flex-col gap-4 px-4 py-5">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-lg bg-secondary",
                accent,
              )}
            >
              <Icon className="size-4" aria-hidden />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </span>
              <span className="font-display text-3xl font-black leading-none tracking-tight">
                {metrics[key]}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
