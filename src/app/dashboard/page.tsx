import { currentUser } from "@clerk/nextjs/server";

import { AgentWidget } from "@/components/agent/agent-widget";

export default async function DashboardPage() {
  const user = await currentUser();
  const ownerName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "el propietario";

  return <AgentWidget ownerName={ownerName} />;
}
