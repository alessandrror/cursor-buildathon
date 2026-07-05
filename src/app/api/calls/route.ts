import { auth } from "@clerk/nextjs/server";

import { getCallsForDashboard } from "@/lib/calls/data-source";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const calls = await getCallsForDashboard();
    return Response.json({ calls });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load calls";
    return Response.json({ error: message }, { status: 500 });
  }
}
