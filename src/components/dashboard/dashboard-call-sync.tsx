"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { GHOSTLINE_CALL_COMPLETED_EVENT } from "@/lib/calls/events";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 15;

type DashboardCallSyncProps = {
  initialCallCount: number;
};

export function DashboardCallSync({ initialCallCount }: DashboardCallSyncProps) {
  const router = useRouter();
  const baselineRef = useRef(initialCallCount);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    baselineRef.current = initialCallCount;
  }, [initialCallCount]);

  useEffect(() => {
    const stopPolling = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const pollForNewCall = async () => {
      try {
        const response = await fetch("/api/calls", { cache: "no-store" });
        if (!response.ok) return false;

        const { calls } = (await response.json()) as { calls: unknown[] };
        return calls.length > baselineRef.current;
      } catch {
        return false;
      }
    };

    const onCallCompleted = () => {
      stopPolling();

      let polls = 0;

      const tick = async () => {
        polls++;
        const hasNewCall = await pollForNewCall();
        router.refresh();

        if (hasNewCall || polls >= MAX_POLLS) {
          stopPolling();
        }
      };

      void tick();
      timerRef.current = setInterval(() => {
        void tick();
      }, POLL_INTERVAL_MS);
    };

    window.addEventListener(GHOSTLINE_CALL_COMPLETED_EVENT, onCallCompleted);

    return () => {
      window.removeEventListener(GHOSTLINE_CALL_COMPLETED_EVENT, onCallCompleted);
      stopPolling();
    };
  }, [router]);

  return null;
}
