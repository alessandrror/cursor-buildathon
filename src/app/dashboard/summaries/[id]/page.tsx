import { notFound } from "next/navigation";

import { CallSummaryView } from "@/components/dashboard/call-summary-view";
<<<<<<< HEAD
import {
  getCallDetailForDashboard,
  isMockCallsEnabled,
} from "@/lib/calls/data-source";
=======
import { getCallDetailForDashboard } from "@/lib/calls/data-source";
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
import { isSupabaseConfigured } from "@/lib/supabase/env";

type SummaryDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SummaryDetailPage({
  params,
}: SummaryDetailPageProps) {
  const { id } = await params;
  const useMock = isMockCallsEnabled();

  if (!useMock && !isSupabaseConfigured()) {
    notFound();
  }

  let call: Awaited<ReturnType<typeof getCallDetailForDashboard>> = null;

  try {
    call = await getCallDetailForDashboard(id);
  } catch {
    notFound();
  }

  if (!call) {
    notFound();
  }

<<<<<<< HEAD
  return <CallSummaryView call={call} showMockBanner={useMock} />;
=======
  return <CallSummaryView call={call} />;
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
}
