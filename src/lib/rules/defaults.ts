// Set de reglas por defecto y perfil por defecto.
// spec: configuracion-reglas-contestacion.md ("Al crear la cuenta se genera un
// set de reglas por defecto" y defaults documentados).

import type { AnsweringRule, Profile } from "@/lib/rules/types";

/** Perfil por defecto. spec: data/modelo-datos-core.md §profiles (SV / El Salvador). */
export const DEFAULT_PROFILE: Profile = {
  timezone: "America/El_Salvador",
  countryCode: "SV",
};

/**
 * Reglas por defecto de una cuenta nueva:
 * - horario 24/7 (00:00–00:00 se interpreta como todo el día),
 * - anónimos = rechazar,
 * - acción de rechazo = busy ("rechazar").
 * Las listas (whitelist/blacklist/prefix_block) inician vacías.
 * spec: configuracion §Comportamiento esperado (defaults).
 */
export function buildDefaultRules(): AnsweringRule[] {
  return [
    {
      id: "default-schedule",
      ruleType: "schedule",
      value: { start: "00:00", end: "00:00" },
      isActive: true,
    },
    {
      id: "default-anonymous",
      ruleType: "anonymous",
      value: { action: "reject" },
      isActive: true,
    },
    {
      id: "default-reject-action",
      ruleType: "reject_action",
      value: { action: "busy" },
      isActive: true,
    },
  ];
}
