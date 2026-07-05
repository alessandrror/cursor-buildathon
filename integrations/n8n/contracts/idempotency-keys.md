# Idempotencia — claves por entidad

Todas las operaciones de n8n deben ser idempotentes ante reintentos de Twilio/ElevenLabs.

| Entidad | Clave única | Tabla | Comportamiento en duplicado |
|---------|-------------|-------|----------------------------|
| Llamada Twilio | `CallSid` | `calls.twilio_call_sid` | UPSERT; responder mismo TwiML ya decidido |
| Conversación ElevenLabs | `conversation_id` | `call_transcripts.conversation_id` | No reprocesar; responder 200 |
| Resumen | `call_id` | `call_summaries.call_id` | UPSERT; no duplicar resumen |

## Orden de dependencias

1. `calls` debe existir (creada en webhook Twilio) antes de post-call ElevenLabs.
2. Si post-call llega antes que `calls` (carrera): encolar retry 30 s; si persiste → `system_events` tipo `orphan_webhook`.
3. `call_summaries` requiere `calls.id` y `calls.outcome = completed` (o `pending_summary` en retry).

## pending_summary

Cuando OpenAI falla tras 3 reintentos:

1. `UPDATE calls SET outcome = 'pending_summary' WHERE id = ?`
2. Workflow cron `retry-pending-summary` cada 10 min reintenta generación.
3. Al éxito: `outcome = 'completed'` + UPSERT summary.
