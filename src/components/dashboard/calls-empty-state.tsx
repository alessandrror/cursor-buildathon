import { PhoneCall, Sparkles } from "lucide-react";

import { GhostLineMark } from "@/components/brand/ghostline-logo";
import { Card, CardContent } from "@/components/ui/card";

export function CallsEmptyState() {
  return (
    <Card className="relative overflow-hidden border-dashed shadow-none">
      <div className="pointer-events-none absolute -right-10 -top-10 opacity-[0.07]">
        <GhostLineMark className="size-48" />
      </div>
      <CardContent className="relative flex flex-col items-center gap-4 px-6 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
          <PhoneCall className="size-6" aria-hidden />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Aún no hay llamadas registradas
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Cuando GhostLine procese una llamada a tu número alternativo, verás
            aquí el resumen, la categoría y la transcripción completa.
          </p>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
            <Sparkles className="size-3.5" aria-hidden />
            En desarrollo:{" "}
            <code className="text-foreground">POST /api/dev/simulate-call</code>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
