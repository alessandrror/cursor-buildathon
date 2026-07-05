// spec: deteccion-silencio-inicial §Criterios de aceptación
import { describe, expect, test } from "bun:test";

import { evaluateInitialSilence } from "@/lib/rules/silence";
import { SILENCE_SCENARIOS } from "@/lib/rules/scenarios";

describe("evaluateInitialSilence — escenarios de la spec", () => {
  for (const scenario of SILENCE_SCENARIOS) {
    test(scenario.title, () => {
      const result = evaluateInitialSilence(scenario.input);
      expect(result.outcome).toBe(scenario.expectedOutcome);
    });
  }
});

describe("evaluateInitialSilence — reglas", () => {
  test("silencio no genera resumen ni consume tokens", () => {
    const result = evaluateInitialSilence({ spokeWithinWindow: false });
    expect(result.earlyHangup).toBe(true);
    expect(result.generatesSummary).toBe(false);
  });

  test("habla dentro de ventana continúa y sí generaría resumen", () => {
    const result = evaluateInitialSilence({ spokeWithinWindow: true });
    expect(result.earlyHangup).toBe(false);
    expect(result.generatesSummary).toBe(true);
  });

  test("solo DTMF cuenta como silencio", () => {
    const result = evaluateInitialSilence({ spokeWithinWindow: true, onlyDtmf: true });
    expect(result.outcome).toBe("silent_hangup");
  });
});
