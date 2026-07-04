# SPEC: POST /webhook/elevenlabs/post-call

- autor: @noe
- fecha: 2026-07-04
- estado: borrador

## Descripción
Webhook expuesto por n8n que ElevenLabs invoca al finalizar cada conversación del agente
(post-call webhook). Recibe la transcripción y metadata de la conversación, la vincula con la
llamada Twilio correspondiente, actualiza el estado de la llamada y dispara la generación del
resumen.

## Autenticación
- Validación del HMAC de ElevenLabs (cabecera de firma con secreto compartido configurado en la plataforma de agentes).
- Firma inválida → `401` + evento `security_alert`. No se procesa.

## Request
POST `application/json`. Campos relevantes del payload de ElevenLabs:

```json
{
  "conversation_id": "string (único por conversación — clave de idempotencia)",
  "agent_id": "string",
  "status": "done | failed",
  "metadata": {
    "call_sid": "string (CallSid de Twilio, propagado en la conexión)",
    "start_time": "ISO8601",
    "duration_seconds": "number"
  },
  "transcript": [
    { "role": "agent | user", "message": "string", "time_in_call_secs": "number" }
  ]
}
```

## Respuesta exitosa — 200 OK
```json
{ "received": true }
```
Se responde 200 rápido (< 3 s) y el procesamiento pesado (resumen) continúa asíncrono en n8n.

## Errores
- `401` — Firma HMAC inválida.
- `200` con procesamiento en cola — si el `call_sid` aún no existe en `calls` (carrera entre webhooks): se encola y reintenta en 30 s antes de descartarlo como huérfano (registrado en `system_events`).
- `200` idempotente — `conversation_id` ya procesado: no se reprocesa.

## Validaciones
- `conversation_id` requerido y único (idempotencia).
- `metadata.call_sid` debe corresponder a fila en `calls` con `outcome = in_progress`.
- `transcript` puede ser vacío (llamada silenciosa) — es válido.

## Efectos colaterales
- Actualiza `calls`: `outcome` (`completed` | `silent_hangup` | `caller_hangup` | `agent_error`), `duration_seconds`, `ended_at`.
- Persiste la transcripción en `call_transcripts`.
- Si `outcome = completed` y transcript no vacío → dispara flujo de resumen (`llamadas/generacion-resumen-llamada.md`).
- Si `outcome ∈ {silent_hangup, caller_hangup}` → dispara notificación de "llamada filtrada" sin resumen.

## Rate limiting
- No aplica (origen ElevenLabs, protegido por firma).

## Versioning
- v1. Si ElevenLabs cambia el esquema del payload, el nodo de parseo valida campos requeridos y ante esquema desconocido guarda el payload crudo en `system_events` para no perder datos.

## Criterios de aceptación
- [ ] Una conversación finalizada actualiza la llamada y persiste la transcripción completa.
- [ ] Un webhook duplicado (mismo `conversation_id`) no duplica transcripción ni resumen.
- [ ] Un payload sin firma válida recibe 401 y no toca la base de datos.
- [ ] Un webhook cuyo `call_sid` no existe queda registrado como huérfano y alertado, sin romper el flujo.
