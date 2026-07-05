export {
  getCallById as getCallDetailForDashboard,
  getCallsForCurrentUser as getCallsForDashboard,
} from "@/lib/supabase/calls";
export { getAnsweringRulesForCurrentUser as getAnsweringRulesForDashboard } from "@/lib/supabase/answering-rules";
export { getActivePhoneNumberForCurrentUser as getGhostLineNumberForDashboard } from "@/lib/supabase/phone-numbers";
