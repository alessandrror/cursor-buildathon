// spec: configuracion §Casos borde (normalización E.164)
import { describe, expect, test } from "bun:test";

import { isE164, matchesPrefix, normalizeToE164 } from "@/lib/rules/phone";

describe("normalizeToE164", () => {
  test("número local SV se normaliza a E.164", () => {
    expect(normalizeToE164("7777-7777", "SV")).toBe("+50377777777");
  });

  test("número ya en E.164 se conserva", () => {
    expect(normalizeToE164("+50376543210", "SV")).toBe("+50376543210");
  });

  test("entrada inválida devuelve null", () => {
    expect(normalizeToE164("abc", "SV")).toBeNull();
    expect(normalizeToE164("", "SV")).toBeNull();
  });
});

describe("isE164 / matchesPrefix", () => {
  test("isE164 valida el formato estricto", () => {
    expect(isE164("+50376543210")).toBe(true);
    expect(isE164("50376543210")).toBe(false);
  });

  test("matchesPrefix detecta prefijo bloqueado", () => {
    expect(matchesPrefix("+18005551234", "+1800")).toBe(true);
    expect(matchesPrefix("+50376543210", "+1800")).toBe(false);
    expect(matchesPrefix(null, "+1800")).toBe(false);
  });
});
