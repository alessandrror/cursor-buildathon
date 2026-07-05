import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Tarjeta de sección con chip de icono teñido. Centraliza la jerarquía visual de
 * las pantallas de reglas (design system GhostLine, solo tokens).
 */
export function SectionCard({
  icon,
  tint,
  title,
  description,
  action,
  className,
  bodyClassName,
  children,
}: {
  icon: React.ReactNode;
  /** Clases de token para el chip, ej. "bg-success/15 text-success". */
  tint: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("flex flex-col overflow-hidden gap-0 py-0", className)}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              tint,
            )}
          >
            {icon}
          </span>
          <div className="flex flex-col">
            <h3 className="font-display text-base font-bold leading-tight">
              {title}
            </h3>
            {description ? (
              <p className="text-xs leading-snug text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <CardContent
        className={cn("flex flex-1 flex-col gap-3 px-5 pb-5 pt-4", bodyClassName)}
      >
        {children}
      </CardContent>
    </Card>
  );
}

/** Chip de resumen con métrica y color de estado. */
export function StatChip({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          tint,
        )}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="truncate text-sm font-semibold">{value}</span>
      </div>
    </div>
  );
}
