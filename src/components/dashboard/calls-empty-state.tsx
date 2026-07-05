import { AlertCircle, PhoneCall } from "lucide-react";

import { GhostLineMark } from "@/components/brand/ghostline-logo";
import { Card, CardContent } from "@/components/ui/card";

type CallsEmptyStateProps = {
  error?: string | null;
  hint?: string | null;
};

export function CallsEmptyState({ error, hint }: CallsEmptyStateProps) {
  const hasError = Boolean(error);

  return (
    <Card className="relative overflow-hidden border-dashed shadow-none">
      <div className="pointer-events-none absolute -right-10 -top-10 opacity-[0.07]">
        <GhostLineMark className="size-48" />
      </div>
      <CardContent className="relative flex flex-col items-center gap-4 px-6 py-12 text-center">
        <div
          className={`flex size-14 items-center justify-center rounded-full ${
            hasError ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary"
          }`}
        >
          {hasError ? (
            <AlertCircle className="size-6" aria-hidden />
          ) : (
            <PhoneCall className="size-6" aria-hidden />
          )}
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="font-display text-xl font-bold tracking-tight">
            {hasError
              ? "No pudimos cargar tu historial"
              : "Aún no hay llamadas registradas"}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {hasError
              ? "Revisa la conexión con Supabase y que Clerk esté integrado. Si el problema continúa, contacta soporte."
              : "Cuando GhostLine procese una llamada a tu número alternativo, verás aquí el resumen, la categoría y la transcripción completa."}
          </p>
          {hasError && (
            <>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Detalle:</span>{" "}
                {error}
              </p>
              {hint && (
                <p className="text-xs leading-5 text-muted-foreground">{hint}</p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
