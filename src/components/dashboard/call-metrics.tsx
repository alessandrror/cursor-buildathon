import { Ban, PhoneCall, ShieldCheck, VolumeX } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { CallMetrics } from "@/lib/calls/presentation";

type CallMetricsProps = {
  metrics: CallMetrics;
};

const metricCards = [
  {
    key: "total" as const,
    label: "Total del período",
    icon: ShieldCheck,
    accent: "text-primary",
  },
  {
    key: "blocked" as const,
    label: "Bloqueadas",
    icon: Ban,
    accent: "text-destructive",
  },
  {
    key: "silent" as const,
    label: "Por silencio",
    icon: VolumeX,
    accent: "text-warning",
  },
  {
    key: "answered" as const,
    label: "Atendidas",
    icon: PhoneCall,
    accent: "text-success",
  },
];

export function CallMetricsGrid({ metrics }: CallMetricsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metricCards.map(({ key, label, icon: Icon, accent }) => (
        <Card key={key} className="gap-0 py-0 shadow-none">
          <CardContent className="flex items-start justify-between gap-3 px-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {label}
              </span>
              <span className="font-display text-3xl font-black tracking-tight">
                {metrics[key]}
              </span>
            </div>
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary ${accent}`}
            >
              <Icon className="size-5" aria-hidden />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
