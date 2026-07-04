# SPECS — Filtro de Spam Telefónico Inteligente

> Especificaciones generadas bajo el **Framework SDD + IA v1.0** del equipo.
> Convención: una spec por archivo, kebab-case, organizadas por módulo/dominio.
> Estado inicial de todas las specs: `borrador` (pasan a `activa` al primer commit de código — Fase F3).

---

## 1. Descripción del producto

Solución web que asigna a cada usuario un **número telefónico alternativo (Twilio)** que actúa
como filtro inteligente de llamadas. Las llamadas entrantes se evalúan contra **reglas
configuradas por el usuario**; las que pasan el filtro son atendidas por un **agente de IA
conversacional en español (ElevenLabs)**, que mantiene la conversación, obtiene la transcripción,
genera un **resumen** y lo asocia al usuario. El usuario consulta todo desde un **dashboard web**
y recibe **notificaciones** de cada llamada procesada.

## 2. Arquitectura y stack tecnológico

| Capa | Tecnología | Rol |
|---|---|---|
| Frontend | Vue 3 + TypeScript + PrimeVue (Unstyled) + Tailwind CSS | Dashboard, onboarding, configuración de reglas |
| Auth + BaaS | Supabase Auth (Google OAuth 2.0 + email) | Registro, sesión, JWT, RLS |
| Base de datos | Supabase PostgreSQL (con Row Level Security) | Usuarios, números, reglas, llamadas, resúmenes, notificaciones |
| Orquestación | n8n (self-hosted o cloud, en modo queue) | Webhooks de Twilio/ElevenLabs, evaluación de reglas, flujo post-llamada, notificaciones |
| Telefonía | Twilio (Programmable Voice + Incoming Phone Numbers API) | Aprovisionamiento de números, recepción de llamadas, TwiML |
| Voz IA | ElevenLabs Conversational AI (Agents Platform, integración nativa con Twilio) | Agente que contesta en español, transcripción, eventos post-llamada |
| Resúmenes | OpenAI API (gpt-4o-mini) invocado desde n8n | Generación del resumen estructurado de la transcripción |
| Notificaciones | Resend/SMTP (email) + Web Push (VAPID) | Aviso de llamada procesada / spam bloqueado |

### Diagrama de componentes (flujo de una llamada)

```
Llamante ──► Twilio (número del usuario)
                │  webhook Voice URL
                ▼
        n8n /webhook/twilio/incoming-call ──► Supabase (reglas del usuario)
                │
       ┌────────┴─────────┐
   NO pasa reglas      SÍ pasa reglas
       │                   │
   TwiML: <Reject/>     TwiML: <Connect><Stream> → Agente ElevenLabs (español)
   o <Hangup/>              │
       │                    ▼  (fin de conversación)
       ▼             n8n /webhook/elevenlabs/post-call
   registra llamada         │ transcripción + metadata
   como bloqueada           ▼
                     OpenAI API → resumen ──► Supabase (calls, call_summaries)
                                                  │
                                                  ▼
                                       n8n → notificación (email/push)
                                                  │
                                                  ▼
                                       Dashboard Vue (Supabase Realtime)
```

## 3. Estrategia de tolerancia a fallos y confiabilidad

Decisiones transversales que toda spec de este repositorio asume:

1. **Idempotencia por `CallSid`**: todo webhook de Twilio se procesa con upsert por `twilio_call_sid`.
   Twilio reintenta webhooks; un reintento nunca debe duplicar llamadas ni resúmenes.
2. **Fallback URL en Twilio**: cada número se configura con `VoiceFallbackUrl` apuntando a un
   TwiML Bin estático ("El número no está disponible, intente más tarde") para que una caída de
   n8n nunca deje al llamante en silencio ni cuelgue abruptamente.
3. **Fail-safe de reglas**: si la evaluación de reglas falla (timeout a Supabase, error de n8n),
   el comportamiento por defecto es **rechazar cortésmente** (fail-closed): un filtro de spam que
   falla abierto deja pasar spam.
4. **n8n en modo queue + error workflows**: workers con Redis, reintentos automáticos (3x con
   backoff) en nodos HTTP, y un *Error Workflow* global que registra en `system_events` y alerta
   al equipo.
5. **Verificación de firma**: todo webhook valida `X-Twilio-Signature` (Twilio) y HMAC
   (ElevenLabs). Peticiones sin firma válida → 403 y evento de seguridad.
6. **RLS en Supabase**: ninguna tabla de datos de usuario es accesible sin política RLS; el
   frontend solo ve filas del usuario autenticado. n8n usa `service_role` únicamente en backend.
7. **Outbox de notificaciones**: las notificaciones se insertan primero en la tabla
   `notifications` (estado `pending`) y un flujo de n8n las despacha con reintentos; un fallo del
   proveedor de email nunca pierde la notificación.
8. **Timeouts explícitos**: 5 s para evaluación de reglas (Twilio exige respuesta < 10 s),
   5 s de espera de voz del emisor antes de colgar (regla de negocio), 30 s para generación de resumen.

## 4. Índice de specs

| Módulo | Spec | Tipo |
|---|---|---|
| auth | `registro-y-autenticacion.md` | Feature |
| numbers | `aprovisionamiento-numero-twilio.md` | Feature |
| rules | `configuracion-reglas-contestacion.md` | Feature |
| rules | `evaluacion-reglas-llamada-entrante.md` | Regla de negocio |
| rules | `deteccion-silencio-inicial.md` | Regla de negocio |
| calls | `flujo-contestacion-agente-ia.md` | Feature |
| calls | `generacion-resumen-llamada.md` | Feature |
| api | `webhook-twilio-llamada-entrante.md` | API |
| api | `webhook-elevenlabs-post-llamada.md` | API |
| data | `modelo-datos-core.md` | Modelo de datos |
| dashboard | `dashboard-llamadas.md` | Feature |
| notifications | `notificaciones-llamada-procesada.md` | Feature |

## 5. Fuera de alcance global del MVP

- Llamadas salientes desde el número alternativo.
- SMS/MMS entrantes o salientes.
- App móvil nativa (el dashboard es web responsive).
- Portabilidad del número real del usuario.
- Facturación/planes de pago (todos los usuarios en un tier único de MVP).
- Idiomas distintos al español para el agente de IA.
