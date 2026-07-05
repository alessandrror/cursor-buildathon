import { CallListItemCard } from "@/components/dashboard/call-list-item";
import { CallMetricsGrid } from "@/components/dashboard/call-metrics";
import { CallsEmptyState } from "@/components/dashboard/calls-empty-state";
import { MockDataBanner } from "@/components/dashboard/mock-data-banner";
import {
  getCallsForDashboard,
  isMockCallsEnabled,
} from "@/lib/calls/data-source";
import { computeCallMetrics } from "@/lib/calls/presentation";

export default async function DashboardPage() {
  const useMock = isMockCallsEnabled();
  let calls: Awaited<ReturnType<typeof getCallsForDashboard>> = [];

  try {
    calls = await getCallsForDashboard();
  } catch {
    calls = [];
  }

  const metrics = computeCallMetrics(calls);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Tu actividad
        </p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">
          Llamadas filtradas
        </h1>
        <p className="mt-2 font-serif text-lg italic text-muted-foreground">
          Revisa qué pasó mientras GhostLine protegía tu línea.
        </p>
      </header>

      {useMock && (
        <div className="mt-6">
          <MockDataBanner />
        </div>
      )}

      {calls.length > 0 && (
        <section aria-label="Resumen del período" className="mt-8">
          <CallMetricsGrid metrics={metrics} />
        </section>
      )}

      <section aria-label="Historial de llamadas" className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold">Historial</h2>
            <p className="text-sm text-muted-foreground">
              Ordenadas de la más reciente a la más antigua.
            </p>
          </div>
          {calls.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {calls.length}{" "}
              {calls.length === 1 ? "llamada" : "llamadas"}
            </p>
          )}
        </div>

        {calls.length === 0 ? (
          <CallsEmptyState />
        ) : (
          <ul className="flex flex-col gap-3">
            {calls.map((call) => (
              <CallListItemCard key={call.id} call={call} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
