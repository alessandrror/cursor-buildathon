import { createClient } from "@supabase/supabase-js";

import { getClerkSupabaseAccessToken } from "@/lib/supabase/clerk-token";
import { getSupabasePublicConfig } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export async function createServerSupabaseClient() {
  const { url, publishableKey } = getSupabasePublicConfig();

  return createClient<Database>(url, publishableKey, {
    async accessToken() {
      return getClerkSupabaseAccessToken();
    },
  });
}
