// Acceso a datos de reglas de contestación (client-side, RLS por usuario).
// spec: configuracion §Notas técnicas ("Escrituras vía supabase-js directo con RLS").

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AnsweringRule, RuleType, RuleValue } from "@/lib/rules/types";
import type { Database, DbAnsweringRule } from "@/types/database";

type Client = SupabaseClient<Database>;

export function mapDbAnsweringRule(row: DbAnsweringRule): AnsweringRule {
  return {
    id: row.id,
    userId: row.user_id,
    ruleType: row.rule_type,
    value: row.value as unknown as RuleValue,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchAnsweringRules(
  supabase: Client,
): Promise<AnsweringRule[]> {
  const { data, error } = await supabase
    .from("answering_rules")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data.map(mapDbAnsweringRule);
}

export async function insertAnsweringRule(
  supabase: Client,
  userId: string,
  ruleType: RuleType,
  value: RuleValue,
): Promise<AnsweringRule> {
  const { data, error } = await supabase
    .from("answering_rules")
    .insert({
      user_id: userId,
      rule_type: ruleType,
      value: value as unknown as Record<string, string>,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapDbAnsweringRule(data);
}

export async function updateAnsweringRule(
  supabase: Client,
  id: string,
  patch: { value?: RuleValue; isActive?: boolean },
): Promise<AnsweringRule> {
  const { data, error } = await supabase
    .from("answering_rules")
    .update({
      ...(patch.value !== undefined
        ? { value: patch.value as unknown as Record<string, string> }
        : {}),
      ...(patch.isActive !== undefined ? { is_active: patch.isActive } : {}),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapDbAnsweringRule(data);
}

export async function deleteAnsweringRule(
  supabase: Client,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("answering_rules").delete().eq("id", id);
  if (error) throw error;
}
