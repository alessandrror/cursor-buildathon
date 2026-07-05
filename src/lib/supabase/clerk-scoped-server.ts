import { auth } from "@clerk/nextjs/server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Server-side Supabase access scoped to the signed-in Clerk user.
 * Uses service role + explicit user_id filter (avoids Clerk↔Supabase JWT setup).
 */
export async function getClerkScopedSupabase() {
  const { userId } = await auth();

  if (!userId) {
    return { userId: null as null, supabase: null, useUserFilter: false as const };
  }

  if (isSupabaseAdminConfigured()) {
    return {
      userId,
      supabase: createAdminSupabaseClient(),
      useUserFilter: true as const,
    };
  }

  return {
    userId,
    supabase: await createServerSupabaseClient(),
    useUserFilter: false as const,
  };
}
