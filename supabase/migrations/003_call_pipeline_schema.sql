-- Call pipeline schema (Clerk users + n8n writes via service_role)
-- Replaces legacy flat call_summaries with normalized calls / transcripts / summaries

-- ---------------------------------------------------------------------------
-- Extend users (profiles equivalent)
-- ---------------------------------------------------------------------------

alter table public.users
  add column if not exists timezone text not null default 'America/El_Salvador',
  add column if not exists country_code text not null default 'SV',
  add column if not exists onboarding_completed boolean not null default false;

-- ---------------------------------------------------------------------------
-- Drop legacy call_summaries (MVP greenfield)
-- ---------------------------------------------------------------------------

drop policy if exists "Users can view their own call summaries" on public.call_summaries;
drop policy if exists "Users can insert their own call summaries" on public.call_summaries;
drop policy if exists "Users can update their own call summaries" on public.call_summaries;
drop policy if exists "Users can delete their own call summaries" on public.call_summaries;

drop table if exists public.call_summaries;

-- ---------------------------------------------------------------------------
-- phone_numbers
-- ---------------------------------------------------------------------------

create table if not exists public.phone_numbers (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users (id) on delete cascade,
  e164_number text not null,
  twilio_sid text not null,
  status text not null default 'active' check (status in ('active', 'suspended', 'released')),
  created_at timestamptz not null default now(),
  constraint phone_numbers_e164_format check (e164_number ~ '^\+[1-9][0-9]{6,14}$'),
  constraint phone_numbers_e164_unique unique (e164_number),
  constraint phone_numbers_twilio_sid_unique unique (twilio_sid)
);

create unique index if not exists phone_numbers_one_active_per_user_idx
  on public.phone_numbers (user_id)
  where status = 'active';

create index if not exists phone_numbers_e164_idx on public.phone_numbers (e164_number);

-- ---------------------------------------------------------------------------
-- answering_rules
-- ---------------------------------------------------------------------------

create table if not exists public.answering_rules (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users (id) on delete cascade,
  rule_type text not null check (
    rule_type in ('whitelist', 'blacklist', 'schedule', 'anonymous', 'prefix_block')
  ),
  value jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists answering_rules_user_id_idx on public.answering_rules (user_id);

-- ---------------------------------------------------------------------------
-- calls
-- ---------------------------------------------------------------------------

create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users (id) on delete cascade,
  phone_number_id uuid not null references public.phone_numbers (id) on delete restrict,
  twilio_call_sid text not null,
  caller_number text,
  decision text not null check (decision in ('answer', 'reject')),
  matched_rule text,
  outcome text not null default 'in_progress' check (
    outcome in (
      'in_progress',
      'rejected',
      'completed',
      'silent_hangup',
      'caller_hangup',
      'agent_error',
      'pending_summary',
      'language_mismatch'
    )
  ),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  constraint calls_twilio_call_sid_unique unique (twilio_call_sid)
);

create index if not exists calls_user_started_at_idx
  on public.calls (user_id, started_at desc);

-- ---------------------------------------------------------------------------
-- call_transcripts
-- ---------------------------------------------------------------------------

create table if not exists public.call_transcripts (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls (id) on delete cascade,
  conversation_id text not null,
  transcript jsonb not null default '[]',
  created_at timestamptz not null default now(),
  constraint call_transcripts_call_id_unique unique (call_id),
  constraint call_transcripts_conversation_id_unique unique (conversation_id)
);

-- ---------------------------------------------------------------------------
-- call_summaries (spec shape)
-- ---------------------------------------------------------------------------

create table if not exists public.call_summaries (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls (id) on delete cascade,
  user_id text not null references public.users (id) on delete cascade,
  caller_name text,
  caller_company text,
  reason text not null,
  summary text not null,
  category text not null check (
    category in (
      'spam_comercial',
      'encuesta',
      'cobranza',
      'posible_legitima',
      'desconocida'
    )
  ),
  urgency text not null check (urgency in ('baja', 'media', 'alta')),
  is_degraded boolean not null default false,
  created_at timestamptz not null default now(),
  constraint call_summaries_call_id_unique unique (call_id)
);

create index if not exists call_summaries_user_created_at_idx
  on public.call_summaries (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- notifications (outbox)
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users (id) on delete cascade,
  call_id uuid references public.calls (id) on delete set null,
  channel text not null check (channel in ('email', 'push')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  attempts integer not null default 0 check (attempts >= 0 and attempts <= 5),
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists notifications_pending_idx
  on public.notifications (status)
  where status = 'pending';

-- ---------------------------------------------------------------------------
-- system_events (service_role only)
-- ---------------------------------------------------------------------------

create table if not exists public.system_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists system_events_created_at_idx
  on public.system_events (created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.phone_numbers enable row level security;
alter table public.answering_rules enable row level security;
alter table public.calls enable row level security;
alter table public.call_transcripts enable row level security;
alter table public.call_summaries enable row level security;
alter table public.notifications enable row level security;
alter table public.system_events enable row level security;

-- phone_numbers: read own
do $$ begin
  create policy "Users can view their own phone numbers"
    on public.phone_numbers for select to authenticated
    using ((select auth.jwt() ->> 'sub') = user_id);
exception when duplicate_object then null;
end $$;

-- answering_rules: full CRUD own
do $$ begin
  create policy "Users can view their own answering rules"
    on public.answering_rules for select to authenticated
    using ((select auth.jwt() ->> 'sub') = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert their own answering rules"
    on public.answering_rules for insert to authenticated
    with check ((select auth.jwt() ->> 'sub') = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update their own answering rules"
    on public.answering_rules for update to authenticated
    using ((select auth.jwt() ->> 'sub') = user_id)
    with check ((select auth.jwt() ->> 'sub') = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can delete their own answering rules"
    on public.answering_rules for delete to authenticated
    using ((select auth.jwt() ->> 'sub') = user_id);
exception when duplicate_object then null;
end $$;

-- calls: read own (writes via service_role / n8n)
do $$ begin
  create policy "Users can view their own calls"
    on public.calls for select to authenticated
    using ((select auth.jwt() ->> 'sub') = user_id);
exception when duplicate_object then null;
end $$;

-- call_transcripts: read via call ownership
do $$ begin
  create policy "Users can view transcripts of their own calls"
    on public.call_transcripts for select to authenticated
    using (
      exists (
        select 1 from public.calls c
        where c.id = call_transcripts.call_id
          and c.user_id = (select auth.jwt() ->> 'sub')
      )
    );
exception when duplicate_object then null;
end $$;

-- call_summaries: read own
do $$ begin
  create policy "Users can view their own call summaries"
    on public.call_summaries for select to authenticated
    using ((select auth.jwt() ->> 'sub') = user_id);
exception when duplicate_object then null;
end $$;

-- notifications: read own
do $$ begin
  create policy "Users can view their own notifications"
    on public.notifications for select to authenticated
    using ((select auth.jwt() ->> 'sub') = user_id);
exception when duplicate_object then null;
end $$;

-- system_events: no authenticated policies (service_role only)

-- ---------------------------------------------------------------------------
-- Realtime (dashboard live updates)
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.calls;
    alter publication supabase_realtime add table public.call_summaries;
  end if;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
