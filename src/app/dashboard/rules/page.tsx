import { RulesBoard } from "@/components/rules/rules-board";
import { getAnsweringRulesForDashboard } from "@/lib/calls/data-source";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AnsweringRulesConfig } from "@/lib/supabase/answering-rules";

const fallbackRules: AnsweringRulesConfig = {
  schedule: {
    start: "08:00",
    end: "20:00",
    active: true,
  },
  anonymousAction: "reject",
  whitelist: [],
  blacklist: [],
  prefixBlock: [],
};

export default async function DashboardRulesPage() {
  let rules = fallbackRules;

  if (isSupabaseConfigured()) {
    try {
      rules = await getAnsweringRulesForDashboard();
    } catch {
      rules = fallbackRules;
    }
  }

  return <RulesBoard initialRules={rules} />;
}
