-- Core call model: phone_numbers, answering_rules, calls,
-- call_transcripts, notifications, system_events.
-- Also extends call_summaries (adds spec fields without breaking existing columns).
-- Adapted to Clerk auth: user_id is text (Clerk sub), RLS via auth.jwt() ->> 'sub'.
-- n8n uses service_role and bypasses RLS entirely.

-- ─── Enums ─────────────────────────────────────────────────────────────────

create type public.phone_number_status as enum ('active', 'suspended', 'released');

create type public.rule_type as enum (
  'whitelist', 'blacklist', 'schedule', 'anonymous', 'prefix_block'
);

create type public.call_decision as enum ('answer', 'reject');

create type public.call_outcome as enum (
  'in_progress',
  'rejected',
  'completed',
  'no_answer',
  'caller_hangup',
  'agent_error',
  'pending_summary'
);

create type public.notification_channel as enum ('email', 'push');
create type public.notification_status as enum ('pending', 'sent', 'failed');

create type public.call_category as enum (
  'spam_comercial', 'encuesta', 'cobranza', 'posible_legitima', 'desconocida'
);

create type public.call_urgency as enum ('baja', 'media', 'alta');

-- ─── phone_numbers ─────────────────────────────────────────────────────────

create table if not exists public.phone_numbers (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references public.users (id) on delete cascade,
  e164_number text not null unique
    check (e164_number ~ '^\+[1-9][0-9]{6,14}$'),
  twilio_sid  text not null unique,
  status      public.phone_number_status not null default 'active',
  created_at  timestamptz not null default now()
);

-- One active number per user
create unique index if not exists phone_numbers_one_active_per_user
  on public.phone_numbers (user_id)
  where status = 'active';

alter table public.phone_numbers enable row level security;

create policy "Users can view their own phone numbers"
  on public.phone_numbers
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

-- ─── answering_rules ───────────────────────────────────────────────────────

create table if not exists public.answering_rules (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null references public.users (id) on delete cascade,
  rule_type  public.rule_type not null,
  value      jsonb not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists answering_rules_user_id_idx
  on public.answering_rules (user_id);

alter table public.answering_rules enable row level security;

-- Dashboard writes rules directly (per spec rules/configuracion-reglas-contestacion.md)
create policy "Users can view their own rules"
  on public.answering_rules
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can insert their own rules"
  on public.answering_rules
  for insert
  to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can update their own rules"
  on public.answering_rules
  for update
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can delete their own rules"
  on public.answering_rules
  for delete
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

-- ─── calls ─────────────────────────────────────────────────────────────────

create table if not exists public.calls (
  id               uuid primary key default gen_random_uuid(),
  user_id          text not null references public.users (id) on delete cascade,
  phone_number_id  uuid not null references public.phone_numbers (id),
  twilio_call_sid  text not null unique,  -- idempotency key
  caller_number    text,                  -- null if anonymous
  decision         public.call_decision not null,
  matched_rule     text,
  outcome          public.call_outcome not null default 'in_progress',
  duration_seconds integer check (duration_seconds >= 0),
  started_at       timestamptz not null,
  ended_at         timestamptz
);

create index if not exists calls_user_started_at_idx
  on public.calls (user_id, started_at desc);

-- twilio_call_sid unique index already created by the unique constraint above

alter table public.calls enable row level security;

create policy "Users can view their own calls"
  on public.calls
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

-- INSERT/UPDATE/DELETE on calls: service_role only (n8n backend)

-- ─── call_transcripts ──────────────────────────────────────────────────────

create table if not exists public.call_transcripts (
  id              uuid primary key default gen_random_uuid(),
  call_id         uuid not null unique references public.calls (id) on delete cascade,
  conversation_id text not null unique,  -- ElevenLabs conversation id
  transcript      jsonb not null,        -- array of {role, message, time_in_call_secs}
  created_at      timestamptz not null default now()
);

alter table public.call_transcripts enable row level security;

create policy "Users can view their own transcripts"
  on public.call_transcripts
  for select
  to authenticated
  using (
    exists (
      select 1 from public.calls c
      where c.id = call_id
        and (select auth.jwt() ->> 'sub') = c.user_id
    )
  );

-- ─── call_summaries — extend existing table (non-breaking) ─────────────────
-- Original columns (001): id text pk, user_id text, caller_number, alternative_number,
-- started_at, ended_at, duration_seconds, status (text check), close_reason, title,
-- summary, transcript, created_at, updated_at.
-- New spec columns added as nullable to avoid breaking existing rows/code.

alter table public.call_summaries
  add column if not exists call_id         uuid unique references public.calls (id),
  add column if not exists caller_name     text,
  add column if not exists caller_company  text,
  add column if not exists reason          text,
  add column if not exists category        public.call_category,
  add column if not exists urgency         public.call_urgency,
  add column if not exists is_degraded     boolean not null default false;

create index if not exists call_summaries_call_id_idx
  on public.call_summaries (call_id);

-- ─── notifications ─────────────────────────────────────────────────────────

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null references public.users (id) on delete cascade,
  call_id    uuid references public.calls (id),
  channel    public.notification_channel not null,
  status     public.notification_status not null default 'pending',
  attempts   integer not null default 0 check (attempts <= 5),
  payload    jsonb not null,
  created_at timestamptz not null default now(),
  sent_at    timestamptz
);

-- Outbox dispatcher: only pending rows
create index if not exists notifications_pending_idx
  on public.notifications (status)
  where status = 'pending';

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

-- INSERT/UPDATE: service_role only (n8n outbox dispatcher)

-- ─── system_events ─────────────────────────────────────────────────────────
-- No user-level RLS: service_role + team only.

create table if not exists public.system_events (
  id         uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload    jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- No RLS policies needed (service_role access only; authenticated users never read this)
