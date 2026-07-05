-- Voice clone profiles and audit events (Clerk user_id = text)

-- ---------------------------------------------------------------------------
-- user_voice_profiles
-- ---------------------------------------------------------------------------

create table if not exists public.user_voice_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users (id) on delete cascade,
  elevenlabs_voice_id text,
  display_name text not null default 'Mi voz',
  status text not null default 'pending' check (
    status in ('pending', 'ready', 'verification_required', 'failed', 'revoked')
  ),
  requires_verification boolean not null default false,
  consented_at timestamptz,
  consent_version text,
  use_for_suspicious_calls boolean not null default true,
  interaction_mode text not null default 'equilibrado' check (
    interaction_mode in ('prudente', 'equilibrado', 'detective')
  ),
  sample_count integer not null default 0 check (sample_count >= 0),
  error_message text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_voice_profiles_one_active_per_user_idx
  on public.user_voice_profiles (user_id)
  where deleted_at is null;

create index if not exists user_voice_profiles_user_id_idx
  on public.user_voice_profiles (user_id);

-- ---------------------------------------------------------------------------
-- voice_clone_events (audit trail)
-- ---------------------------------------------------------------------------

create table if not exists public.voice_clone_events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users (id) on delete cascade,
  voice_profile_id uuid references public.user_voice_profiles (id) on delete set null,
  event_type text not null check (
    event_type in (
      'consent_given',
      'clone_requested',
      'clone_succeeded',
      'clone_failed',
      'profile_updated',
      'profile_revoked'
    )
  ),
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists voice_clone_events_user_id_idx
  on public.voice_clone_events (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.user_voice_profiles enable row level security;
alter table public.voice_clone_events enable row level security;

-- Reads only for authenticated users on their own rows.
-- Writes go through Next.js API with service_role.

do $$ begin
  create policy "Users can view their own voice profile"
    on public.user_voice_profiles for select to authenticated
    using ((select auth.jwt() ->> 'sub') = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can view their own voice clone events"
    on public.voice_clone_events for select to authenticated
    using ((select auth.jwt() ->> 'sub') = user_id);
exception when duplicate_object then null;
end $$;
