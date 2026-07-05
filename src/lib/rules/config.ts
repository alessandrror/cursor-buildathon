// Helpers para leer ajustes efectivos desde una lista de reglas.
// spec: evaluacion §Excepciones ("Usuario sin reglas → aplicar defaults").

import type {
  AnonymousAction,
  AnsweringRule,
  RejectAction,
  RuleType,
} from "@/lib/rules/types";

export function activeRules(rules: AnsweringRule[]): AnsweringRule[] {
  return rules.filter((r) => r.isActive);
}

export function rulesOfType(
  rules: AnsweringRule[],
  type: RuleType,
): AnsweringRule[] {
  return activeRules(rules).filter((r) => r.ruleType === type);
}

/** Primera regla activa de un tipo singleton (schedule/anonymous/reject_action). */
export function singletonOfType(
  rules: AnsweringRule[],
  type: RuleType,
): AnsweringRule | undefined {
  return rulesOfType(rules, type)[0];
}

/** Acción de rechazo efectiva (default: busy). spec: configuracion (default rechazar). */
export function effectiveRejectAction(rules: AnsweringRule[]): RejectAction {
  const rule = singletonOfType(rules, "reject_action");
  if (rule && "action" in rule.value) return rule.value.action as RejectAction;
  return "busy";
}

/** Acción para anónimos efectiva (default: reject). spec: configuracion. */
export function effectiveAnonymousAction(
  rules: AnsweringRule[],
): AnonymousAction {
  const rule = singletonOfType(rules, "anonymous");
  if (rule && "action" in rule.value)
    return rule.value.action as AnonymousAction;
  return "reject";
}

/** Horario efectivo (default: 24/7). spec: configuracion (default 24/7). */
export function effectiveSchedule(rules: AnsweringRule[]): {
  start: string;
  end: string;
} {
  const rule = singletonOfType(rules, "schedule");
  if (rule && "start" in rule.value && "end" in rule.value) {
    return { start: rule.value.start, end: rule.value.end };
  }
  return { start: "00:00", end: "00:00" };
}
