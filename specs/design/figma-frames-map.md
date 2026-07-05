# Mapa de frames Figma → código

fileKey: `jPSxrx2T9RGogjNQRUEOAe` · abrir un nodo:
`https://www.figma.com/design/jPSxrx2T9RGogjNQRUEOAe?node-id=<NODE-ID con guion>`
(p. ej. node-id `31-29` para la Landing).

Estado: ✅ implementado en `dev` · 🌿 existe en otra rama · 🆕 nuevo · 🎨 solo tematizar.

## Flujo: Público y acceso

| Frame | node-id | Ruta / componente | Estado | Notas de adaptación |
|---|---|---|---|---|
| 01 · Landing | `31:29` | `src/app/page.tsx` | ✅ | El código ya es la fuente; el frame lo refleja 1:1. Ajustes visuales menores solamente. |
| 02 · Registro | `27:20` | `src/app/sign-up/[[...sign-up]]/page.tsx` + `src/lib/clerk-appearance.ts` | 🎨 | Card de Clerk; tematizar con tokens (`var(--primary)`, radios, fuentes). |
| 04 · Iniciar sesión | `41:29` | `src/app/sign-in/[[...sign-in]]/page.tsx` | 🎨 | Igual que registro; Clerk tematizado. |
| 03 · Onboarding — Activa tu número | `41:63` | `src/app/onboarding/page.tsx` | 🆕 | Nueva ruta post-registro: conectar número + nota de cifrado → dashboard. Requiere spec. |

## Flujo: Llamadas

| Frame | node-id | Ruta / componente | Estado | Notas de adaptación |
|---|---|---|---|---|
| 05 · Panel | `17:8` | `src/app/dashboard/page.tsx` · `dashboard-shell.tsx` · `call-metrics.tsx` · `call-list-item.tsx` · `calls-empty-state.tsx` | ✅ | Adaptar UI: tarjeta del número GhostLine, métricas con íconos, **grid de tarjetas** para la lista y **paginación**. |
| 06 · Detalle de llamada | `78:56` | `src/components/dashboard/call-detail-view.tsx` | ✅ | Una sola columna: cabecera, tiles de datos, motivo + "Ver resumen completo", acciones (Confiar/Bloquear/Reportar). |
| 07 · Resumen de llamada | `24:11` | `src/app/dashboard/summaries/[id]/page.tsx` · `call-transcript.tsx` · `call-detail-agenda-card.tsx` | ✅ | Una sola columna: **Conclusión** destacada, Resumen, tiles, **transcripción tipo chat** (burbujas), acciones. |

## Flujo: Reglas y simulador

| Frame | node-id | Ruta / componente | Estado | Notas de adaptación |
|---|---|---|---|---|
| 08 · Reglas | `20:5` | `src/app/dashboard/rules/page.tsx` + `src/components/rules/*` | 🌿 en `feat/reglas-contestacion` | Sin "Acción de rechazo"; Comportamiento en 2 columnas; listas Blanca/Negra/Prefijos compactas; banner del simulador. |
| 09 · Ensaya una llamada | `22:8` | `src/app/dashboard/rules/simulator/page.tsx` | 🌿 en `feat/reglas-contestacion` | Lenguaje **no técnico**; selector de escenarios + "Probar llamada" (una sola columna). |
| 10 · Resultado: Rechazada | `71:53` | estado del simulador | 🆕 | Resultado con "Qué pasó" paso a paso. |
| 11 · Resultado: Atendida con tu voz | `71:105` | estado del simulador | 🆕 | Resultado + "Lo que descubrió" (conecta con clonación de voz). |

## Flujo: Ajustes

| Frame | node-id | Ruta / componente | Estado | Notas de adaptación |
|---|---|---|---|---|
| 12 · Ajustes | `25:17` | `src/app/settings/page.tsx` (hoy `return null`) | 🆕 | Preferencias de notificaciones (email/push por evento) + cuenta + tema. Ver `specs/notifications`. Requiere spec. |

## Flujo: Clonación de voz (feature nueva)

Permite que el agente conteste con la voz clonada del usuario para sonsacar al estafador.
Ruta sugerida: `src/app/onboarding/voz/` o `src/app/settings/voz/`. **Requiere spec** (`sdd-pm`)
+ threat model (`sdd-secaudit`): la voz es dato biométrico sensible (consentimiento, cifrado, borrado).

| Frame | node-id | Estado |
|---|---|---|
| Voz · 1 · Permiso (consentimiento) | `42:35` | 🆕 |
| Voz · 2 · Grabar | `43:38` | 🆕 |
| Voz · 3 · Generar | `44:41` | 🆕 |
| Voz · 4 · Escuchar | `45:44` | 🆕 |
| Voz · 5 · Listo / Activar | `46:47` | 🆕 |

## Componentes base (página *Components* del archivo)

| Componente Figma | node-id | Código |
|---|---|---|
| Button | `6:14` | `src/components/ui/button.tsx` |
| Badge | `8:10` | `src/components/ui/badge.tsx` |
| Card | `9:2` | `src/components/ui/card.tsx` |
| Input | `9:5` | `src/components/ui/input.tsx` |
| Label | `9:7` | `src/components/ui/label.tsx` |
| Switch / Toggle | `9:9` | `src/components/ui/switch.tsx` |
| Ghost / Mark (marca) | `10:6` | `src/components/brand/ghostline-logo.tsx` |
