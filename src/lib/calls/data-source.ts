import { getMockCallById, mockCalls } from "@/lib/mock-data";
import { getCallById, getCallsForCurrentUser } from "@/lib/supabase/calls";
import type { CallDetail, CallListItem } from "@/types/call";

/**
 * When true, dashboard reads from mock-data instead of Supabase.
 * Set USE_MOCK_CALLS=true in .env while n8n / pipeline is not wired yet.
 */
export function isMockCallsEnabled(): boolean {
  return process.env.USE_MOCK_CALLS === "true";
}

export async function getCallsForDashboard(): Promise<CallListItem[]> {
  if (isMockCallsEnabled()) {
    return mockCalls;
  }

  return getCallsForCurrentUser();
}

export async function getCallDetailForDashboard(
  id: string,
): Promise<CallDetail | null> {
  if (isMockCallsEnabled()) {
    return getMockCallById(id);
  }

  return getCallById(id);
}

export { getAnsweringRulesForCurrentUser as getAnsweringRulesForDashboard } from "@/lib/supabase/answering-rules";
export { getActivePhoneNumberForCurrentUser as getGhostLineNumberForDashboard } from "@/lib/supabase/phone-numbers";
