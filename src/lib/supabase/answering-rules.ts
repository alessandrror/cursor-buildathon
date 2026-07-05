import type { AnsweringRuleType, DbAnsweringRule } from "@/types/database";
import { getClerkScopedSupabase } from "@/lib/supabase/clerk-scoped-server";

export type RuleListItem = {
  id: string;
  value: string;
  active: boolean;
};

export type AnsweringRulesConfig = {
  schedule: {
    start: string;
    end: string;
    active: boolean;
  };
  anonymousAction: "answer" | "reject";
  whitelist: RuleListItem[];
  blacklist: RuleListItem[];
  prefixBlock: RuleListItem[];
};

const defaultRulesConfig: AnsweringRulesConfig = {
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

function getStringValue(value: Record<string, unknown>, key: string) {
  const raw = value[key];
  return typeof raw === "string" ? raw : null;
}

function getAnonymousAction(value: Record<string, unknown>) {
  const action = value.action;
  return action === "answer" || action === "reject" ? action : null;
}

function isRuleType(ruleType: string, target: AnsweringRuleType) {
  return ruleType === target;
}

function normalizeRules(rows: DbAnsweringRule[]): AnsweringRulesConfig {
  const config: AnsweringRulesConfig = {
    schedule: { ...defaultRulesConfig.schedule },
    anonymousAction: defaultRulesConfig.anonymousAction,
    whitelist: [],
    blacklist: [],
    prefixBlock: [],
  };

  for (const row of rows) {
    const value = row.value ?? {};

    if (isRuleType(row.rule_type, "schedule")) {
      config.schedule = {
        start: getStringValue(value, "start") ?? config.schedule.start,
        end: getStringValue(value, "end") ?? config.schedule.end,
        active: row.is_active,
      };
    }

    if (isRuleType(row.rule_type, "anonymous")) {
      config.anonymousAction =
        getAnonymousAction(value) ?? config.anonymousAction;
    }

    if (isRuleType(row.rule_type, "whitelist")) {
      const number = getStringValue(value, "number");
      if (number) {
        config.whitelist.push({ id: row.id, value: number, active: row.is_active });
      }
    }

    if (isRuleType(row.rule_type, "blacklist")) {
      const number = getStringValue(value, "number");
      if (number) {
        config.blacklist.push({ id: row.id, value: number, active: row.is_active });
      }
    }

    if (isRuleType(row.rule_type, "prefix_block")) {
      const prefix = getStringValue(value, "prefix");
      if (prefix) {
        config.prefixBlock.push({ id: row.id, value: prefix, active: row.is_active });
      }
    }
  }

  return config;
}

export async function getAnsweringRulesForCurrentUser(): Promise<AnsweringRulesConfig> {
  const { userId, supabase, useUserFilter } = await getClerkScopedSupabase();

  if (!userId || !supabase) {
    return defaultRulesConfig;
  }

  let query = supabase
    .from("answering_rules")
    .select("*")
    .order("created_at", { ascending: true });

  if (useUserFilter) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return normalizeRules((data ?? []) as DbAnsweringRule[]);
}
