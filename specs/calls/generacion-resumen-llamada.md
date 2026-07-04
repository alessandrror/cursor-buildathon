# SPEC: Generación de resumen de llamada

- user_story: US-005
- autor: @noe
- fecha: 2026-07-04
- estado: borrador

## Descripción
Al finalizar una conversación atendida por el agente, n8n toma la transcripción recibida en el
webhook post-llamada de ElevenLabs, genera un resumen estructurado en español usando la API de
Claude, y lo persiste en Supabase asociado al usuario y a la llamada. El resumen alimenta el
dashboard y las notificaciones.

## Comportamiento esperado
- Trigger: webhook post-llamada procesado con `outcome = completed` y transcripción no vacía.
- n8n invoca Claude (claude-sonnet) con un prompt versionado que produce **solo JSON** con:
  - `caller_name`: nombre del emisor si se identificó, o `null`.
  - `caller_company`: empresa/organización, o `null`.
  - `reason`: motivo de la llamada en 1 oración.
  - `summary`: resumen de 2-4 oraciones en español.
  - `category`: `spam_comercial` | `encuesta` | `cobranza` | `posible_legitima` | `desconocida`.
  - `urgency`: `baja` | `media` | `alta`.
- El JSON se valida contra el esquema; si es válido, se inserta en `call_summaries` (upsert por `call_id`).
- La inserción del resumen dispara la notificación al usuario (ver `notificaciones/notificaciones-llamada-procesada.md`).
- Tiempo objetivo: resumen disponible < 60 s después de finalizada la llamada.

## Casos borde
- Claude devuelve JSON malformado o con fences de Markdown → limpiar fences y reintentar parse; si falla, reintentar la generación 1 vez; si vuelve a fallar, guardar resumen degradado: `summary = primeros 500 caracteres de la transcripción`, `category = desconocida`, y marcar `is_degraded = true`.
- Transcripción muy corta (< 20 caracteres útiles) → no invocar a Claude; `summary = "Llamada sin contenido relevante"`, `category = desconocida`.
- API de Claude no disponible (5xx / rate limit) → reintentos con backoff (3x); si agota, encolar la fila en estado `pending_summary` y reprocesar con un flujo n8n programado cada 10 min (el resumen puede llegar tarde, nunca perderse).
- Webhook duplicado de ElevenLabs → el upsert por `call_id` garantiza un solo resumen.
- Transcripción contiene datos sensibles dictados por el emisor (números de tarjeta, etc.) → se persiste tal cual en MVP (es el registro fiel); acceso protegido por RLS. Redacción automática queda fuera de alcance y documentada como riesgo.

## Criterios de aceptación
- [ ] Una llamada completada produce exactamente un resumen con los 6 campos del esquema.
- [ ] El resumen está en español independientemente del idioma del emisor.
- [ ] Con la API de Claude caída (simulada), la llamada queda en `pending_summary` y se resuelve al reprocesar.
- [ ] Un webhook duplicado no genera resumen duplicado.
- [ ] El campo `category` solo admite los 5 valores del enum (constraint en DB).

## Dependencias
- `api/webhook-elevenlabs-post-llamada.md` (proveedor de la transcripción).
- Claude API (credencial en n8n).
- Tablas `calls`, `call_summaries` (ver `datos/modelo-datos-core.md`).

## Fuera de alcance
- Resumen de llamadas rechazadas o silenciosas (no hay conversación que resumir).
- Análisis agregado de tendencias de spam entre usuarios.
- Redacción/anonimización automática de datos sensibles en transcripciones (riesgo documentado, v2).

## Notas_tecnicas
- Prompt de resumen versionado en `/prompts/resumen-llamada-v1.md` (principio P4).
- `max_tokens` acotado (~500); la transcripción se trunca a los últimos 8.000 caracteres si excede.
