# SPEC: POST /webhook/twilio/incoming-call

- autor: @noe
- fecha: 2026-07-04
- estado: borrador

## Descripción
Webhook expuesto por n8n que Twilio invoca en cada llamada entrante a un número aprovisionado
(`VoiceUrl` del número). Evalúa las reglas del usuario dueño del número y responde con TwiML:
conectar al agente de IA o rechazar según la decisión. Es el punto de entrada crítico del
sistema: **debe responder en < 5 s** y nunca dejar a Twilio sin respuesta.

## Autenticación
- Validación obligatoria de la cabecera `X-Twilio-Signature` (HMAC-SHA1 con el Auth Token de la cuenta, sobre URL + parámetros).
- Firma inválida o ausente → `403` + evento `security_alert` en `system_events`. No se procesa nada.
- El endpoint no usa JWT: el emisor es Twilio, no un usuario.

## Request
POST `application/x-www-form-urlencoded` (formato estándar de Twilio). Campos relevantes:

```
CallSid:    string (único por llamada — clave de idempotencia)
From:       string E.164, o vacío/anonymous si número oculto
To:         string E.164 (número Twilio del usuario)
CallStatus: "ringing"
Direction:  "inbound"
```

## Respuesta exitosa — 200 OK (Content-Type: text/xml)

Caso `answer` (conectar al agente):
```xml
<Response>
  <Connect>
    <Stream url="wss://... (endpoint del agente ElevenLabs)"/>
  </Connect>
</Response>
```

Caso `reject` según acción configurada:
```xml
<Response><Reject reason="busy"/></Response>                       <!-- busy -->
<Response><Hangup/></Response>                                     <!-- hangup -->
<Response><Say language="es-MX">Este número no acepta llamadas.</Say><Hangup/></Response>  <!-- message -->
```

## Errores
- `403` — Firma Twilio inválida.
- `200` con TwiML de rechazo — número `To` no pertenece a ningún usuario activo (se responde 200 porque Twilio necesita TwiML válido; el "error" se registra internamente).
- Timeout interno (> 5 s en evaluación) — se responde el TwiML fail-closed (`message` + hangup) sin esperar a Supabase.

## Validaciones
- `CallSid` presente y no procesado antes (idempotencia: si ya existe fila en `calls` con ese SID, responder el mismo TwiML decidido originalmente).
- `To` normalizado E.164 y existente en `phone_numbers` con estado `active`.

## Efectos colaterales
- Inserta fila en `calls` con: usuario, números, decisión, `matched_rule`, timestamp (`outcome = 'in_progress'` si answer, `'rejected'` si reject).
- Si `answer`: la llamada se conecta al agente ElevenLabs.

## Rate limiting
- No se limita por IP (Twilio origina). Protección real = validación de firma. n8n en modo queue absorbe ráfagas.

## Versioning
- v1. Cambios en el TwiML de respuesta no son breaking para Twilio mientras sea XML válido.

## Confiabilidad (crítico)
- `VoiceFallbackUrl` del número apunta a un TwiML Bin estático en Twilio: si este webhook cae por completo, el llamante escucha locución de no disponibilidad. La caída de n8n **nunca** produce timbre infinito.
- El workflow tiene Error Workflow asociado que alerta al equipo.

## Criterios de aceptación
- [ ] Llamada de número en lista negra recibe el TwiML de rechazo configurado (test E2E con Twilio test credentials).
- [ ] Petición sin firma válida recibe 403 y no crea fila en `calls`.
- [ ] Reintento de Twilio con el mismo `CallSid` no duplica la fila en `calls`.
- [ ] Con Supabase caído (simulado), la respuesta es el TwiML fail-closed en < 5 s.
