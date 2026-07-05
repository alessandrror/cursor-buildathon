// spec: configuracion §Casos borde (horario que cruza medianoche);
// evaluacion §Criterios ("caso nocturno que cruza medianoche tiene test explícito").
import { describe, expect, test } from "bun:test";

import { isWithinSchedule, localMinutesInTimeZone } from "@/lib/rules/schedule";

const TZ = "America/El_Salvador"; // UTC-6 todo el año

describe("isWithinSchedule", () => {
  test("24/7 (start === end) siempre está dentro", () => {
    expect(isWithinSchedule(new Date("2026-07-07T09:00:00Z"), TZ, "00:00", "00:00")).toBe(true);
  });

  test("rango diurno normal 08:00–20:00", () => {
    // 15:00 UTC = 09:00 local → dentro
    expect(isWithinSchedule(new Date("2026-07-07T15:00:00Z"), TZ, "08:00", "20:00")).toBe(true);
    // 03:30 UTC (mismo día) = 21:30 local del día anterior → fuera
    expect(isWithinSchedule(new Date("2026-07-08T03:30:00Z"), TZ, "08:00", "20:00")).toBe(false);
  });

  test("rango nocturno que cruza medianoche 22:00–06:00", () => {
    // 23:15 local (05:15 UTC) → dentro
    expect(isWithinSchedule(new Date("2026-07-08T05:15:00Z"), TZ, "22:00", "06:00")).toBe(true);
    // 12:00 local (18:00 UTC) → fuera
    expect(isWithinSchedule(new Date("2026-07-07T18:00:00Z"), TZ, "22:00", "06:00")).toBe(false);
    // 05:00 local (11:00 UTC) → dentro (antes del fin)
    expect(isWithinSchedule(new Date("2026-07-07T11:00:00Z"), TZ, "22:00", "06:00")).toBe(true);
  });

  test("localMinutesInTimeZone convierte UTC → minutos locales", () => {
    // 16:00 UTC = 10:00 local = 600 min
    expect(localMinutesInTimeZone(new Date("2026-07-07T16:00:00Z"), TZ)).toBe(600);
  });
});
