import { notFound } from "next/navigation";

import { CallDetailView } from "@/components/dashboard/call-detail-view";
import {
  getCallDetailForDashboard,
  isMockCallsEnabled,
} from "@/lib/calls/data-source";

type SummaryDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SummaryDetailPage({
  params,
}: SummaryDetailPageProps) {
  const { id } = await params;
  const useMock = isMockCallsEnabled();

  let call: Awaited<ReturnType<typeof getCallDetailForDashboard>> = null;

  try {
    call = await getCallDetailForDashboard(id);
  } catch {
    notFound();
  }

  if (!call) {
    notFound();
  }

  return <CallDetailView call={call} showMockBanner={useMock} />;
}
