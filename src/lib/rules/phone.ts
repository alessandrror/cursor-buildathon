// Normalización y comparación de números telefónicos.
// spec: configuracion §Casos borde (normalizar a E.164 con el país del perfil).

import {
  type CountryCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

/**
 * Normaliza una entrada de usuario a E.164 usando el país del perfil como
 * fallback para números en formato local (ej. "7777-7777" → "+50377777777").
 * Devuelve null si no es un número válido/normalizable.
 * spec: configuracion §Casos borde.
 */
export function normalizeToE164(
  input: string,
  defaultCountry: string,
): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parsed = parsePhoneNumberFromString(
    trimmed,
    defaultCountry as CountryCode,
  );

  if (!parsed || !parsed.isValid()) return null;
  return parsed.number; // formato E.164
}

/** Valida que un string ya esté en E.164 estricto. spec: data §CHECK regex. */
const E164_REGEX = /^\+[1-9][0-9]{6,14}$/;
export function isE164(value: string): boolean {
  return E164_REGEX.test(value);
}

/** Igualdad de números en E.164 (comparación exacta). */
export function sameNumber(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  return a === b;
}

/**
 * Un prefijo bloqueado coincide si el número (E.164) empieza con él.
 * Ej.: prefix "+1800" bloquea "+18005551234".
 * spec: evaluacion §Condiciones #4.
 */
export function matchesPrefix(number: string | null, prefix: string): boolean {
  if (!number) return false;
  return number.startsWith(prefix.trim());
}
