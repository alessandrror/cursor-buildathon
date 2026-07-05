import type { AnsweringRulesConfig } from "@/lib/supabase/answering-rules";

type RulesApiResponse = {
  rules: AnsweringRulesConfig;
};

type RulesApiError = {
  error: string;
  code?: string;
  field?: string;
};

export async function saveAnsweringRules(
  rules: AnsweringRulesConfig,
): Promise<AnsweringRulesConfig> {
  const response = await fetch("/api/rules", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rules),
  });

  const data = (await response.json()) as RulesApiResponse | RulesApiError;

  if (!response.ok || !("rules" in data)) {
    const message =
      "error" in data ? data.error : "No se pudieron guardar las reglas.";
    throw new Error(message);
  }

  return data.rules;
}
