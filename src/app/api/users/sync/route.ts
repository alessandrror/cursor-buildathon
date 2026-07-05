import { auth, currentUser } from "@clerk/nextjs/server";

import { syncClerkUserToSupabase } from "@/lib/supabase/sync-clerk-user";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();

  if (!user) {
    return Response.json({ error: "Clerk user not found" }, { status: 404 });
  }

  const result = await syncClerkUserToSupabase();

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 500 });
  }

  return Response.json({ ok: true, userId: user.id });
}
