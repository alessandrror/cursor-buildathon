import { currentUser } from "@clerk/nextjs/server";

import { AgentWidget } from "@/components/agent/agent-widget";
import { CopyGhostLineNumberButton } from "@/components/dashboard/copy-ghostline-number-button";
import { DashboardCallBoard } from "@/components/dashboard/dashboard-call-board";
import { DashboardCallSync } from "@/components/dashboard/dashboard-call-sync";
import { CallMetricsGrid } from "@/components/dashboard/call-metrics";
import { CallsEmptyState } from "@/components/dashboard/calls-empty-state";
<<<<<<< HEAD
import { MockDataBanner } from "@/components/dashboard/mock-data-banner";
import {
  getCallsForDashboard,
  getGhostLineNumberForDashboard,
  isMockCallsEnabled,
=======
import {
  getCallsForDashboard,
  getGhostLineNumberForDashboard,
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
} from "@/lib/calls/data-source";
import { computeCallMetrics } from "@/lib/calls/presentation";
import {
  formatSupabaseError,
  getSupabaseErrorHint,
} from "@/lib/supabase/errors";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function formatGhostLineNumber(number: string | null) {
  if (!number) {
    return "Número pendiente";
  }

  return number.replace(/^(\+\d{3})(\d{4})(\d{4})$/, "$1 $2 $3");
}

export default async function DashboardPage() {
  const user = await currentUser();
  const ownerName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "el propietario";
  const useMock = isMockCallsEnabled();

  let calls: Awaited<ReturnType<typeof getCallsForDashboard>> = [];
  let ghostLineNumber: string | null = null;
  let loadError: string | null = null;
  let loadHint: string | null = null;

  if (useMock) {
    calls = await getCallsForDashboard();
  } else if (!isSupabaseConfigured()) {
    loadError = "Faltan variables de entorno de Supabase.";
  } else {
    try {
      [calls, ghostLineNumber] = await Promise.all([
        getCallsForDashboard(),
        getGhostLineNumberForDashboard(),
      ]);
    } catch (error) {
      loadError = formatSupabaseError(error);
      loadHint = getSupabaseErrorHint(error);
    }
  }

  const metrics = computeCallMetrics(calls);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 sm:py-10">
      <DashboardCallSync initialCallCount={calls.length} />
      <header className="max-w-3xl">
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
          Panel
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Todo lo que GhostLine filtró por ti este mes.
        </p>
      </header>

<<<<<<< HEAD
      {useMock && <MockDataBanner />}

=======
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
      <section
        aria-label="Número GhostLine"
        className="rounded-xl bg-primary px-5 py-4 text-primary-foreground shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-6"
      >
        <div className="flex flex-col gap-1">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary-foreground/70">
            Tu GhostLine
          </p>
          <p className="font-display text-3xl font-black leading-none tracking-tight">
            {formatGhostLineNumber(ghostLineNumber)}
          </p>
          <p className="text-sm text-primary-foreground/70">
            Comparte este número; el tuyo real queda protegido.
          </p>
        </div>
        <CopyGhostLineNumberButton number={ghostLineNumber} />
      </section>

      <section aria-label="Resumen del período">
        <CallMetricsGrid metrics={metrics} />
      </section>

      <section aria-label="Historial de llamadas">
        {calls.length === 0 ? (
          <CallsEmptyState error={loadError} hint={loadHint} showDevHint={useMock} />
        ) : (
          <DashboardCallBoard calls={calls} />
        )}
      </section>

      {user?.id ? (
        <div id="simulador">
          <AgentWidget ownerName={ownerName} clerkUserId={user.id} />
        </div>
      ) : null}
    </div>
  );
}
