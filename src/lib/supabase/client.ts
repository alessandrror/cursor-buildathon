"use client";

import { useSession } from "@clerk/nextjs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useMemo } from "react";

import { getSupabasePublicConfig, isSupabaseConfigured } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export function createBrowserSupabaseClient(
  getAccessToken: () => Promise<string | null>,
) {
  const { url, publishableKey } = getSupabasePublicConfig();

  return createClient<Database>(url, publishableKey, {
    async accessToken() {
      return getAccessToken();
    },
  });
}

export function useSupabaseClient(): SupabaseClient<Database> | null {
  const { session, isLoaded } = useSession();

  return useMemo(() => {
    if (!isLoaded || !isSupabaseConfigured()) {
      return null;
    }

    return createBrowserSupabaseClient(async () => {
      return (await session?.getToken()) ?? null;
    });
  }, [isLoaded, session]);
}
