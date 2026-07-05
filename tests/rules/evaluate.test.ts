// spec: evaluacion-reglas-llamada-entrante §Criterios de aceptación
import { describe, expect, test } from "bun:test";

import { evaluateIncomingCall } from "@/lib/rules/evaluate";
import { DEFAULT_PROFILE } from "@/lib/rules/defaults";
import { EVALUATE_SCENARIOS } from "@/lib/rules/scenarios";
import type { AnsweringRule } from "@/lib/rules/types";

describe("evaluateIncomingCall — escenarios de la spec", () => {
  for (const scenario of EVALUATE_SCENARIOS) {
    test(scenario.title, () => {
      const result = evaluateIncomingCall(
        {
          callerNumber: scenario.call.callerNumber,
          timestamp: new Date(scenario.call.timestampIso),
        },
        scenario.rules,
        scenario.profile,
      );

      expect(result.decision).toBe(scenario.expected.decision);
      expect(result.matchedRule).toBe(scenario.expected.matchedRule);
      if (scenario.expected.rejectAction) {
        expect(result.rejectAction).toBe(scenario.expected.rejectAction);
      }
    });
  }
});

describe("evaluateIncomingCall — precedencia y excepciones", () => {
  const profile = DEFAULT_PROFILE;

  test("lista negra domina sobre lista blanca", () => {
    const rules: AnsweringRule[] = [
      { id: "w", ruleType: "whitelist", value: { number: "+50370000000" }, isActive: true },
      { id: "b", ruleType: "blacklist", value: { number: "+50370000000" }, isActive: true },
    ];
    const result = evaluateIncomingCall(
      { callerNumber: "+50370000000", timestamp: new Date("2026-07-07T16:00:00Z") },
      rules,
      profile,
    );
    expect(result.decision).toBe("reject");
    expect(result.matchedRule).toBe("blacklist");
  });

  test("fail-closed cuando rules === null", () => {
    const result = evaluateIncomingCall(
      { callerNumber: "+50376543210", timestamp: new Date("2026-07-07T16:00:00Z") },
      null,
      profile,
    );
    expect(result.decision).toBe("reject");
    expect(result.rejectAction).toBe("message");
    expect(result.matchedRule).toBe("fail_closed");
  });

  test("una regla desactivada se excluye de la evaluación", () => {
    const rules: AnsweringRule[] = [
      { id: "b", ruleType: "blacklist", value: { number: "+50377778888" }, isActive: false },
    ];
    const result = evaluateIncomingCall(
      { callerNumber: "+50377778888", timestamp: new Date("2026-07-07T16:00:00Z") },
      rules,
      profile,
    );
    expect(result.decision).toBe("answer");
  });

  test("usuario sin reglas (lista vacía) atiende por defecto", () => {
    const result = evaluateIncomingCall(
      { callerNumber: "+50376543210", timestamp: new Date("2026-07-07T16:00:00Z") },
      [],
      profile,
    );
    expect(result.decision).toBe("answer");
    expect(result.matchedRule).toBe("default");
  });

  test("anónimo con lista vacía se rechaza (default anónimos = rechazar)", () => {
    const result = evaluateIncomingCall(
      { callerNumber: null, timestamp: new Date("2026-07-07T16:00:00Z") },
      [],
      profile,
    );
    expect(result.decision).toBe("reject");
    expect(result.matchedRule).toBe("anonymous");
  });
});
