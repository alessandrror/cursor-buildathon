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

async function getBrowserClerkSupabaseAccessToken(
  getToken: (options?: { template?: string }) => Promise<string | null>,
): Promise<string | null> {
  const template =
    process.env.NEXT_PUBLIC_CLERK_SUPABASE_JWT_TEMPLATE?.trim() || "supabase";

  try {
    const templateToken = await getToken({ template });
    if (templateToken) {
      return templateToken;
    }
  } catch {
    // Template no configurado — usar session token (integración nativa).
  }

  return (await getToken()) ?? null;
}

export function useSupabaseClient(): SupabaseClient<Database> | null {
  const { session, isLoaded } = useSession();

  return useMemo(() => {
    if (!isLoaded || !isSupabaseConfigured()) {
      return null;
    }

    return createBrowserSupabaseClient(async () => {
      if (!session) {
        return null;
      }

      return getBrowserClerkSupabaseAccessToken((options) =>
        session.getToken(options),
      );
    });
  }, [isLoaded, session]);
}
