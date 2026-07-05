# Integración n8n — GhostLine call pipeline

Orquestación de Twilio → ElevenLabs → OpenAI (ChatGPT) → Supabase. Los webhooks viven en **n8n**, no en Next.js.

## Arquitectura

```
Twilio Voice URL  →  n8n /webhook/twilio/incoming-call
ElevenLabs post-call  →  n8n /webhook/elevenlabs/post-call
Resumen (async)  →  n8n sub-workflow generate-summary
Reintentos  →  n8n cron retry-pending-summary (cada 10 min)
```

Artefactos versionados en el repo:

| Archivo | Uso |
|---------|-----|
| [`agents/filtro-spam-es.md`](../../agents/filtro-spam-es.md) | System prompt del agente ElevenLabs |
| [`prompts/resumen-llamada-v1.md`](../../prompts/resumen-llamada-v1.md) | Prompt OpenAI para resumen JSON |
| [`schemas/summary-output.schema.json`](schemas/summary-output.schema.json) | Validación del output en n8n |
| [`contracts/`](contracts/) | Payloads y mapeos Supabase |

## Credenciales (solo en n8n)

| Variable | Uso |
|----------|-----|
| `TWILIO_AUTH_TOKEN` | Validar `X-Twilio-Signature` |
| `ELEVENLABS_WEBHOOK_SECRET` | Validar HMAC post-call |
| `ELEVENLABS_API_KEY` | Dashboard ElevenLabs (agente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Escritura en `calls`, transcripts, summaries |
| `OPENAI_API_KEY` | Nodo OpenAI / HTTP Chat Completions (`gpt-4o`) |

Next.js usa solo Supabase anon + Clerk; **no** necesita estas claves para el pipeline.

Supabase URL: `https://<project>.supabase.co/rest/v1/` con header `apikey` + `Authorization: Bearer <service_role>`.

---

## Workflow 1: `twilio-incoming-call`

**Spec:** [`specs/api/webhook-twilio-llamada-entrante.md`](../../specs/api/webhook-twilio-llamada-entrante.md)

**Trigger:** Webhook POST, path `/webhook/twilio/incoming-call`, body form-urlencoded.

### Checklist

- [ ] Validar firma Twilio (403 + insert `system_events` event_type `security_alert` si falla)
- [ ] Normalizar `To` a E.164; lookup `phone_numbers` where `e164_number = To` and `status = active`
- [ ] Si no hay número: TwiML reject + log interno (200 OK a Twilio)
- [ ] Cargar `answering_rules` del `user_id`; evaluar reglas ([spec](../../specs/rules/evaluacion-reglas-llamada-entrante.md))
- [ ] Fail-closed si Supabase timeout (>5 s): TwiML Say + Hangup
- [ ] UPSERT `calls` on `twilio_call_sid` = `CallSid`
- [ ] Si `answer`: TwiML `<Connect><Stream url="wss://..."/></Connect>`
- [ ] Si `reject`: TwiML según acción (`busy` / `hangup` / `message`)

**Contrato:** [`contracts/twilio-incoming-request.json`](contracts/twilio-incoming-request.json)

---

## Workflow 2: `elevenlabs-post-call`

**Spec:** [`specs/api/webhook-elevenlabs-post-llamada.md`](../../specs/api/webhook-elevenlabs-post-llamada.md)

**Trigger:** Webhook POST JSON, path `/webhook/elevenlabs/post-call`.

### Checklist

- [ ] Validar HMAC ElevenLabs (401 si falla)
- [ ] Idempotencia: si `conversation_id` ya en `call_transcripts` → 200 `{ "received": true }`
- [ ] Resolver `calls` por `metadata.call_sid`; si no existe → cola retry 30 s o `orphan_webhook`
- [ ] UPDATE `calls`: outcome, duration, ended_at
- [ ] INSERT `call_transcripts` (transcript jsonb)
- [ ] Si `outcome = completed` y transcript no vacío → ejecutar `generate-summary` (async)
- [ ] Si `silent_hangup` / `caller_hangup` → notificación filtrada (sin resumen)

**Contrato:** [`contracts/elevenlabs-post-call-request.json`](contracts/elevenlabs-post-call-request.json)

---

## Workflow 3: `generate-summary`

**Spec:** [`specs/calls/generacion-resumen-llamada.md`](../../specs/calls/generacion-resumen-llamada.md)

**Trigger:** Sub-workflow invocado desde post-call (o cron retry).

### Checklist

- [ ] Flatten transcript a texto; truncar a 8.000 chars
- [ ] Si < 20 chars útiles → summary fijo "Llamada sin contenido relevante", skip OpenAI
- [ ] OpenAI Chat Completions: model `gpt-4o`, system + user de [`prompts/resumen-llamada-v1.md`](../../prompts/resumen-llamada-v1.md)
- [ ] Parse JSON; validar con [`summary-output.schema.json`](schemas/summary-output.schema.json)
- [ ] Retry 1x si JSON malformado; si falla → `is_degraded = true`, summary = primeros 500 chars
- [ ] UPSERT `call_summaries` on `call_id`
- [ ] INSERT `notifications` status `pending`
- [ ] OpenAI 5xx/rate limit: 3 retries backoff → `calls.outcome = pending_summary`

**Contrato UPSERT:** [`contracts/supabase-upsert-summary.json`](contracts/supabase-upsert-summary.json)

---

## Workflow 4: `retry-pending-summary`

**Trigger:** Cron cada 10 minutos.

### Checklist

- [ ] SELECT `calls` where `outcome = 'pending_summary'`
- [ ] JOIN `call_transcripts` para cada call
- [ ] Re-ejecutar lógica de `generate-summary`
- [ ] Al éxito: `outcome = 'completed'`

---

## Idempotencia

Ver [`contracts/idempotency-keys.md`](contracts/idempotency-keys.md).

## Configuración Twilio (por número)

- **Voice URL:** `https://<n8n-host>/webhook/twilio/incoming-call`
- **Voice Fallback URL:** TwiML Bin estático ("No disponible en este momento")
- Propagar `CallSid` a ElevenLabs en metadata de la conversación

## Configuración ElevenLabs

- Copiar prompt de [`agents/filtro-spam-es.md`](../../agents/filtro-spam-es.md) (reemplazar `{{user_display_name}}` en runtime o usar valor fijo en MVP)
- Post-call webhook URL: `https://<n8n-host>/webhook/elevenlabs/post-call`
- Timeout inactividad primer turno: ~5 s (silencio inicial)
- Grabación: desactivada

## Smoke test local

1. Aplicar migración: `npm run db:migrate`
2. Seed manual en Supabase: `users`, `phone_numbers`, opcional `answering_rules`
3. Simular post-call con curl al webhook n8n (payload de `elevenlabs-post-call-request.json`)
4. Verificar filas en `calls`, `call_transcripts`, `call_summaries`
5. Dashboard Next.js en `/dashboard` debe listar la llamada (RLS Clerk)
