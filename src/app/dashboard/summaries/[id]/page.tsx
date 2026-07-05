import { notFound } from "next/navigation";

import { CallSummaryView } from "@/components/dashboard/call-summary-view";
import {
  getCallDetailForDashboard,
  isMockCallsEnabled,
} from "@/lib/calls/data-source";
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

  return <CallSummaryView call={call} showMockBanner={useMock} />;
}
