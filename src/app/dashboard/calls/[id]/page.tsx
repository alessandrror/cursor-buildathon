import { notFound } from "next/navigation";

import { CallDetailView } from "@/components/dashboard/call-detail-view";
import { getCallDetailForDashboard } from "@/lib/calls/data-source";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type CallDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CallDetailPage({ params }: CallDetailPageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
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

  return <CallDetailView call={call} />;
}
