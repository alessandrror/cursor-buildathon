// Evaluación de horario de atención, con soporte de rango que cruza medianoche
// y conversión a la zona horaria del perfil (sin librería de fechas).
// spec: configuracion §Casos borde (22:00–06:00) y evaluacion §Condiciones #5.

/** Convierte "HH:MM" a minutos desde medianoche. */
export function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => Number.parseInt(n, 10));
  return h * 60 + m;
}

/** Minutos locales (0..1439) de una fecha UTC en una IANA timezone. */
export function localMinutesInTimeZone(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);

  const hour = Number.parseInt(
    parts.find((p) => p.type === "hour")?.value ?? "0",
    10,
  );
  const minute = Number.parseInt(
    parts.find((p) => p.type === "minute")?.value ?? "0",
    10,
  );

  // Intl puede devolver "24" a medianoche en algunos entornos; normalizamos.
  return ((hour % 24) * 60 + minute) % 1440;
}

/**
 * ¿La fecha (UTC) cae dentro del horario de atención en la TZ del perfil?
 * - start === end se interpreta como 24/7 (siempre dentro).
 * - start < end: rango diurno normal.
 * - start > end: rango que cruza medianoche (ej. 22:00–06:00).
 * spec: configuracion §Casos borde; evaluacion §Ejemplo 4.
 */
export function isWithinSchedule(
  date: Date,
  timeZone: string,
  start: string,
  end: string,
): boolean {
  const current = localMinutesInTimeZone(date, timeZone);
  const startMin = parseMinutes(start);
  const endMin = parseMinutes(end);

  if (startMin === endMin) return true; // 24/7
  if (startMin < endMin) return current >= startMin && current < endMin;
  // Cruza medianoche: dentro si es después del inicio o antes del fin.
  return current >= startMin || current < endMin;
}
