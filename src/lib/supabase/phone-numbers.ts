import { getClerkScopedSupabase } from "@/lib/supabase/clerk-scoped-server";

export async function getActivePhoneNumberForCurrentUser(): Promise<string | null> {
  const { userId, supabase, useUserFilter } = await getClerkScopedSupabase();

  if (!userId || !supabase) {
    return null;
  }

  let query = supabase
    .from("phone_numbers")
    .select("e164_number")
    .eq("status", "active")
    .limit(1);

  if (useUserFilter) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return data?.e164_number ?? null;
}
