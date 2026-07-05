import type { AnsweringRuleType, DbAnsweringRule } from "@/types/database";
import { getClerkScopedSupabase } from "@/lib/supabase/clerk-scoped-server";

export type RuleListItem = {
<<<<<<< HEAD
<<<<<<< HEAD
  id?: string;
=======
  id: string;
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
  id?: string;
>>>>>>> 555a6a5 (Add answering rules management and validation features)
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

<<<<<<< HEAD
<<<<<<< HEAD
export const defaultRulesConfig: AnsweringRulesConfig = {
=======
const defaultRulesConfig: AnsweringRulesConfig = {
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
export const defaultRulesConfig: AnsweringRulesConfig = {
>>>>>>> 555a6a5 (Add answering rules management and validation features)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 555a6a5 (Add answering rules management and validation features)

async function getUserCountryCode(
  userId: string,
  supabase: NonNullable<
    Awaited<ReturnType<typeof getClerkScopedSupabase>>["supabase"]
  >,
  useUserFilter: boolean,
): Promise<string> {
  let query = supabase.from("users").select("country_code").eq("id", userId);

  if (useUserFilter) {
    query = query.eq("id", userId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return data?.country_code ?? "SV";
}

type RuleInsertRow = {
  user_id: string;
  rule_type: AnsweringRuleType;
  value: Record<string, unknown>;
  is_active: boolean;
};

function configToInsertRows(
  userId: string,
  config: AnsweringRulesConfig,
): RuleInsertRow[] {
  const rows: RuleInsertRow[] = [
    {
      user_id: userId,
      rule_type: "schedule",
      value: { start: config.schedule.start, end: config.schedule.end },
      is_active: config.schedule.active,
    },
    {
      user_id: userId,
      rule_type: "anonymous",
      value: { action: config.anonymousAction },
      is_active: true,
    },
  ];

  for (const item of config.whitelist) {
    rows.push({
      user_id: userId,
      rule_type: "whitelist",
      value: { number: item.value },
      is_active: item.active,
    });
  }

  for (const item of config.blacklist) {
    rows.push({
      user_id: userId,
      rule_type: "blacklist",
      value: { number: item.value },
      is_active: item.active,
    });
  }

  for (const item of config.prefixBlock) {
    rows.push({
      user_id: userId,
      rule_type: "prefix_block",
      value: { prefix: item.value },
      is_active: item.active,
    });
  }

  return rows;
}

export async function saveAnsweringRulesForCurrentUser(
  config: AnsweringRulesConfig,
): Promise<AnsweringRulesConfig> {
  const { userId, supabase, useUserFilter } = await getClerkScopedSupabase();

  if (!userId || !supabase) {
    throw new Error("Unauthorized");
  }

  let deleteQuery = supabase.from("answering_rules").delete();

  if (useUserFilter) {
    deleteQuery = deleteQuery.eq("user_id", userId);
  }

  const { error: deleteError } = await deleteQuery;

  if (deleteError) {
    throw deleteError;
  }

  const rows = configToInsertRows(userId, config);

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from("answering_rules")
      .insert(rows);

    if (insertError) {
      throw insertError;
    }
  }

  return getAnsweringRulesForCurrentUser();
}

export async function getCountryCodeForCurrentUser(): Promise<string> {
  const { userId, supabase, useUserFilter } = await getClerkScopedSupabase();

  if (!userId || !supabase) {
    return "SV";
  }

  return getUserCountryCode(userId, supabase, useUserFilter);
}
<<<<<<< HEAD
=======
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
>>>>>>> 555a6a5 (Add answering rules management and validation features)
