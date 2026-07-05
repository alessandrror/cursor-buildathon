import { currentUser } from "@clerk/nextjs/server";
import { AgentWidget } from "@/components/agent/agent-widget";
import { CallListItemCard } from "@/components/dashboard/call-list-item";
import { CallMetricsGrid } from "@/components/dashboard/call-metrics";
import { CallsEmptyState } from "@/components/dashboard/calls-empty-state";
import { getCallsForDashboard } from "@/lib/calls/data-source";
import { computeCallMetrics } from "@/lib/calls/presentation";
import {
  formatSupabaseError,
  getSupabaseErrorHint,
} from "@/lib/supabase/errors";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function DashboardPage() {
  const user = await currentUser();
  const ownerName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "el propietario";

  let calls: Awaited<ReturnType<typeof getCallsForDashboard>> = [];
  let loadError: string | null = null;
  let loadHint: string | null = null;

  if (!isSupabaseConfigured()) {
    loadError = "Faltan variables de entorno de Supabase.";
  } else {
    try {
      calls = await getCallsForDashboard();
    } catch (error) {
      loadError = formatSupabaseError(error);
      loadHint = getSupabaseErrorHint(error);
    }
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
          <CallsEmptyState error={loadError} hint={loadHint} />
        ) : (
          <ul className="flex flex-col gap-3">
            {calls.map((call) => (
              <CallListItemCard key={call.id} call={call} />
            ))}
          </ul>
        )}
      </section>

      <AgentWidget ownerName={ownerName} />
    </div>
  );
}
