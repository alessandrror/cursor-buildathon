# SPEC: Regla de negocio — Evaluación de reglas en llamada entrante

- nombre: Evaluación de reglas de contestación
- autor: @noe
- fecha: 2026-07-04
- estado: borrador
- fuente: Flujo de producto definido por @noe (diagrama de flujo del proyecto) — nodo E del flowchart

## Descripción
Decide, para cada llamada entrante al número Twilio del usuario, si la llamada debe ser
**atendida por el agente de IA** o **rechazada**, y con qué acción de rechazo. Se ejecuta dentro
del flujo n8n del webhook de llamada entrante y debe resolver en **menos de 5 segundos** (Twilio
espera la respuesta TwiML).

## Inputs
- `caller_number`: número del emisor en E.164, o `null`/`anonymous` si viene oculto.
- `called_number`: número Twilio del usuario (identifica al usuario dueño).
- `timestamp`: fecha/hora de la llamada (UTC).
- Configuración vigente del usuario: `answering_rules` activas + zona horaria del perfil.

## Output
- `decision`: `answer` | `reject`
- `reject_action`: `busy` | `hangup` | `message` (solo si `decision = reject`)
- `matched_rule`: identificador de la regla que determinó la decisión (para trazabilidad en el registro de la llamada).

## Condiciones (orden de precedencia — la primera que aplica gana)

| # | Condición | Decisión |
|---|-----------|----------|
| 1 | `caller_number` está en **lista negra** activa | `reject` (acción configurada) |
| 2 | `caller_number` está en **lista blanca** activa | `answer` |
| 3 | `caller_number` es anónimo/oculto y el switch "anónimos" = rechazar | `reject` |
| 4 | `caller_number` coincide con un **prefijo bloqueado** activo | `reject` |
| 5 | `timestamp` (convertido a TZ del usuario) está **fuera del horario** de atención | `reject` |
| 6 | Ninguna condición anterior aplica | `answer` |

## Prioridad
Lista negra > lista blanca > anónimos > prefijos > horario > default. La lista negra domina
incluso sobre la lista blanca (constraint de datos impide el conflicto, pero si existiera, gana
el bloqueo).

## Excepciones
- **Fail-closed**: si la consulta de reglas falla o supera el timeout (5 s), la decisión es
  `reject` con acción `message` ("El número no está disponible en este momento"). Un filtro de
  spam nunca falla dejando pasar la llamada.
- Usuario sin reglas en DB (estado anómalo): aplicar defaults del sistema (anónimos = rechazar,
  horario = 24/7, decisión default = `answer`).
- Número llamado no corresponde a ningún usuario activo → `reject` con `busy` y evento en `system_events`.

## Ejemplos
1. `caller = +50377778888` (en lista negra), martes 10:00 → `reject` / `busy` / regla #1.
2. `caller = anonymous`, switch anónimos = rechazar → `reject` / acción configurada / regla #3.
3. `caller = +50376543210` (sin coincidencias), horario 08:00–20:00, llamada 21:30 hora local → `reject` / `message` / regla #5.
4. `caller = +50376543210`, horario 22:00–06:00 (nocturno), llamada 23:15 → `answer` / regla #6 (dentro del rango que cruza medianoche).
5. Supabase no responde en 5 s → `reject` / `message` / excepción fail-closed.

## Criterios de aceptación
- [ ] Cada decisión queda registrada en la fila de `calls` con `matched_rule` y `decision`.
- [ ] El P95 de tiempo de evaluación es < 2 s (medible en logs de n8n).
- [ ] El caso de horario nocturno que cruza medianoche tiene test explícito.
- [ ] El fail-closed tiene test simulando caída de Supabase.
