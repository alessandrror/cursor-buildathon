"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export function SyncClerkUser() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) {
      return;
    }

    if (syncedUserId.current === userId) {
      return;
    }

    syncedUserId.current = userId;

    void fetch("/api/users/sync", { method: "POST" }).catch((error) => {
      console.error("[clerk→supabase] client sync failed:", error);
      syncedUserId.current = null;
    });
  }, [isLoaded, isSignedIn, userId]);

  return null;
}
