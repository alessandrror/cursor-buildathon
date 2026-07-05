# SPEC: Modelo de datos core (Supabase PostgreSQL)

- autor: @noe
- fecha: 2026-07-04
- estado: borrador

## Descripción
Esquema relacional del MVP en Supabase. Todas las tablas de datos de usuario tienen **RLS
habilitado**: el usuario autenticado solo accede a sus propias filas (`auth.uid() = user_id`);
n8n opera con `service_role` exclusivamente desde el backend.

---

## Entidad: profiles
Perfil del usuario, extiende `auth.users` (creado por trigger al registrarse).

| Campo | Tipo | Restricciones |
|---|---|---|
| id | uuid PK | = `auth.users.id` |
| full_name | text | not null |
| country_code | text | ISO 3166-1 alpha-2, default 'SV' |
| timezone | text | IANA TZ, default 'America/El_Salvador' |
| onboarding_completed | boolean | default false |
| created_at | timestamptz | default now() |

## Entidad: phone_numbers
Número Twilio asignado al usuario.

| Campo | Tipo | Restricciones |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| user_id | uuid FK → profiles | not null |
| e164_number | text | not null, unique, formato E.164 (CHECK regex) |
| twilio_sid | text | not null, unique |
| status | enum | `active` \| `suspended` \| `released` |
| created_at | timestamptz | default now() |

Regla de integridad: **un solo número `active` por usuario** → índice único parcial
`UNIQUE (user_id) WHERE status = 'active'`.

## Entidad: answering_rules
Reglas de contestación configuradas por el usuario.

| Campo | Tipo | Restricciones |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → profiles | not null |
| rule_type | enum | `whitelist` \| `blacklist` \| `schedule` \| `anonymous` \| `prefix_block` |
| value | jsonb | payload según tipo (ver abajo) |
| is_active | boolean | default true |
| created_at / updated_at | timestamptz | |

Payloads `value` por tipo:
- `whitelist` / `blacklist`: `{ "number": "+503..." }` (E.164)
- `schedule`: `{ "start": "08:00", "end": "20:00" }` (hora local del perfil; soporta rango que cruza medianoche)
- `anonymous`: `{ "action": "answer" | "reject" }`
- `prefix_block`: `{ "prefix": "+1800" }`

Regla de integridad: un mismo número no puede estar simultáneamente en whitelist y blacklist
activas del mismo usuario (constraint por exclusión o validación en trigger).

## Entidad: calls
Registro de cada llamada entrante (atendida o rechazada).

| Campo | Tipo | Restricciones |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → profiles | not null |
| phone_number_id | uuid FK → phone_numbers | not null |
| twilio_call_sid | text | not null, **unique** (idempotencia) |
| caller_number | text | nullable (anónimo) |
| decision | enum | `answer` \| `reject` |
| matched_rule | text | id/etiqueta de la regla que decidió |
| outcome | enum | `in_progress` \| `rejected` \| `completed` \| `silent_hangup` \| `caller_hangup` \| `agent_error` \| `pending_summary` |
| duration_seconds | int | nullable, >= 0 |
| started_at / ended_at | timestamptz | started_at not null |

## Entidad: call_transcripts

| Campo | Tipo | Restricciones |
|---|---|---|
| id | uuid PK | |
| call_id | uuid FK → calls | not null, **unique** |
| conversation_id | text | not null, unique (id de ElevenLabs) |
| transcript | jsonb | array de turnos {role, message, time_in_call_secs} |
| created_at | timestamptz | |

## Entidad: call_summaries

| Campo | Tipo | Restricciones |
|---|---|---|
| id | uuid PK | |
| call_id | uuid FK → calls | not null, **unique** (upsert por call_id) |
| user_id | uuid FK → profiles | not null (denormalizado para RLS y queries del dashboard) |
| caller_name | text | nullable |
| caller_company | text | nullable |
| reason | text | not null |
| summary | text | not null |
| category | enum | `spam_comercial` \| `encuesta` \| `cobranza` \| `posible_legitima` \| `desconocida` |
| urgency | enum | `baja` \| `media` \| `alta` |
| is_degraded | boolean | default false |
| created_at | timestamptz | |

## Entidad: notifications

| Campo | Tipo | Restricciones |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → profiles | not null |
| call_id | uuid FK → calls | nullable |
| channel | enum | `email` \| `push` |
| status | enum | `pending` \| `sent` \| `failed` |
| attempts | int | default 0, <= 5 |
| payload | jsonb | contenido renderizable |
| created_at / sent_at | timestamptz | |

## Entidad: system_events
Bitácora técnica (sin RLS de usuario; solo service_role y equipo).

| Campo | Tipo |
|---|---|
| id | uuid PK |
| event_type | text (`security_alert`, `provisioning_error`, `orphan_webhook`, `fail_closed`, ...) |
| payload | jsonb |
| created_at | timestamptz |

## Relaciones
- profiles 1—1 phone_numbers (activo) · 1—N answering_rules · 1—N calls · 1—N notifications
- calls 1—1 call_transcripts · 1—1 call_summaries · 1—N notifications

## Índices
- `calls (user_id, started_at DESC)` — listado del dashboard.
- `calls (twilio_call_sid)` unique — idempotencia.
- `call_summaries (user_id, created_at DESC)`.
- `notifications (status) WHERE status = 'pending'` — despachador outbox.

## Migraciones
- Todas vía Supabase CLI (`supabase/migrations/*.sql`) versionadas en el repo (principio P4).

## Reglas de integridad
- RLS: `SELECT/INSERT/UPDATE` con `auth.uid() = user_id` en profiles, answering_rules, calls, call_summaries, call_transcripts (join vía calls), notifications. Escritura de calls/transcripts/summaries: solo service_role.
- `duration_seconds >= 0`; enums con CHECK/tipo enum nativo; E.164 con CHECK regex `^\+[1-9][0-9]{6,14}$`.

## Estado de implementación (2026-07-04)
- ✅ `answering_rules` implementada en `supabase/migrations/003_answering_rules.sql`.
  Control de cambios respecto a este modelo: el proyecto usa **Clerk** (no Supabase Auth), por lo
  que `user_id` es `text` (FK → `public.users`) y RLS usa `auth.jwt()->>'sub'`. Se añadió el
  `rule_type` singleton **`reject_action`** para la "Acción de rechazo" global. Incluye CHECK E.164,
  trigger anti-conflicto whitelist/blacklist y `updated_at`.
- Las tablas `profiles`, `phone_numbers`, `calls`, `call_transcripts`, `notifications`,
  `system_events` siguen pendientes (el schema actual usa `users` + `call_summaries`).
