-- Clerk auth + Supabase data layer
-- Run in Supabase Dashboard → SQL Editor

create table if not exists public.users (
  id text primary key,
  email text,
  first_name text,
  last_name text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.call_summaries (
  id text primary key,
  user_id text not null references public.users (id) on delete cascade,
  caller_number text not null,
  alternative_number text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer,
  status text not null check (
    status in (
      'completed',
      'closed_by_silence',
      'rejected_by_rules',
      'failed'
    )
  ),
  close_reason text,
  title text not null,
  summary text not null,
  transcript text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists call_summaries_user_id_idx
  on public.call_summaries (user_id);

create index if not exists call_summaries_started_at_idx
  on public.call_summaries (started_at desc);

alter table public.users enable row level security;
alter table public.call_summaries enable row level security;

do $$ begin
  create policy "Users can view their own profile"
    on public.users for select to authenticated
    using ((select auth.jwt() ->> 'sub') = id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update their own profile"
    on public.users for update to authenticated
    using ((select auth.jwt() ->> 'sub') = id)
    with check ((select auth.jwt() ->> 'sub') = id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can view their own call summaries"
    on public.call_summaries for select to authenticated
    using ((select auth.jwt() ->> 'sub') = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert their own call summaries"
    on public.call_summaries for insert to authenticated
    with check ((select auth.jwt() ->> 'sub') = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update their own call summaries"
    on public.call_summaries for update to authenticated
    using ((select auth.jwt() ->> 'sub') = user_id)
    with check ((select auth.jwt() ->> 'sub') = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can delete their own call summaries"
    on public.call_summaries for delete to authenticated
    using ((select auth.jwt() ->> 'sub') = user_id);
exception when duplicate_object then null;
end $$;
