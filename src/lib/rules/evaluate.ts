// Regla de negocio: evaluación de una llamada entrante.
// spec: specs/rules/evaluacion-reglas-llamada-entrante.md

import {
  effectiveAnonymousAction,
  effectiveRejectAction,
  effectiveSchedule,
  rulesOfType,
} from "@/lib/rules/config";
import { matchesPrefix, sameNumber } from "@/lib/rules/phone";
import { isWithinSchedule } from "@/lib/rules/schedule";
import type {
  AnsweringRule,
  EvaluationResult,
  IncomingCall,
  Profile,
} from "@/lib/rules/types";

/**
 * Decide si una llamada entrante se atiende o se rechaza, con qué acción y por
 * qué regla. Evalúa las condiciones en orden de precedencia (la primera que
 * aplica gana).
 *
 * `rules === null` representa que la consulta de reglas falló o superó el
 * timeout → **fail-closed**: se rechaza con acción `message`. Un filtro de spam
 * nunca falla dejando pasar la llamada.
 * spec: evaluacion §Condiciones, §Prioridad, §Excepciones (fail-closed).
 */
export function evaluateIncomingCall(
  call: IncomingCall,
  rules: AnsweringRule[] | null,
  profile: Profile,
): EvaluationResult {
  // spec: §Excepciones — fail-closed ante fallo/timeout de la consulta de reglas.
  if (rules === null) {
    return {
      decision: "reject",
      rejectAction: "message",
      matchedRule: "fail_closed",
      reason:
        "No se pudieron cargar las reglas (fallo/timeout). Fail-closed: se rechaza por seguridad.",
    };
  }

  const rejectAction = effectiveRejectAction(rules);
  const isAnonymous = call.callerNumber === null;

  // #1 Lista negra (domina incluso sobre lista blanca). spec: §Condiciones #1, §Prioridad.
  for (const rule of rulesOfType(rules, "blacklist")) {
    if ("number" in rule.value && sameNumber(call.callerNumber, rule.value.number)) {
      return {
        decision: "reject",
        rejectAction,
        matchedRule: "blacklist",
        reason: `El número ${rule.value.number} está en la lista negra (regla #1).`,
      };
    }
  }

  // #2 Lista blanca. spec: §Condiciones #2.
  for (const rule of rulesOfType(rules, "whitelist")) {
    if ("number" in rule.value && sameNumber(call.callerNumber, rule.value.number)) {
      return {
        decision: "answer",
        matchedRule: "whitelist",
        reason: `El número ${rule.value.number} está en la lista blanca (regla #2).`,
      };
    }
  }

  // #3 Anónimo/oculto con switch = rechazar. spec: §Condiciones #3.
  if (isAnonymous && effectiveAnonymousAction(rules) === "reject") {
    return {
      decision: "reject",
      rejectAction,
      matchedRule: "anonymous",
      reason: "Llamada anónima/oculta y el ajuste de anónimos es rechazar (regla #3).",
    };
  }

  // #4 Prefijo bloqueado. spec: §Condiciones #4.
  for (const rule of rulesOfType(rules, "prefix_block")) {
    if ("prefix" in rule.value && matchesPrefix(call.callerNumber, rule.value.prefix)) {
      return {
        decision: "reject",
        rejectAction,
        matchedRule: "prefix_block",
        reason: `El número coincide con el prefijo bloqueado ${rule.value.prefix} (regla #4).`,
      };
    }
  }

  // #5 Fuera del horario de atención (TZ del perfil). spec: §Condiciones #5.
  const schedule = effectiveSchedule(rules);
  if (!isWithinSchedule(call.timestamp, profile.timezone, schedule.start, schedule.end)) {
    return {
      decision: "reject",
      rejectAction,
      matchedRule: "schedule",
      reason: `Fuera del horario de atención ${schedule.start}–${schedule.end} (${profile.timezone}) (regla #5).`,
    };
  }

  // #6 Ninguna condición aplica → atender. spec: §Condiciones #6.
  return {
    decision: "answer",
    matchedRule: "default",
    reason: "Ninguna regla de rechazo aplica; la llamada se atiende (regla #6).",
  };
}
