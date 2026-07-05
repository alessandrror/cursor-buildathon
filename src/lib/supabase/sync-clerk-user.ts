import { currentUser } from "@clerk/nextjs/server";

import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase/env";
import { upsertUserFromClerk } from "@/lib/supabase/users";

export async function syncClerkUserToSupabase() {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase is not configured" };
  }

  const user = await currentUser();

  if (!user) {
    return { ok: false as const, error: "No signed-in Clerk user" };
  }

  const result = await upsertUserFromClerk(user);

  if (!result.ok) {
    console.error("[clerk→supabase] user sync failed:", result.error);
  }

  return result;
}

export function getSupabaseSyncStatusMessage() {
  if (!isSupabaseConfigured()) {
    return "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env";
  }

  if (!isSupabaseAdminConfigured()) {
    return "Add SUPABASE_SERVICE_ROLE_KEY to .env for server-side user sync";
  }

  return null;
}
