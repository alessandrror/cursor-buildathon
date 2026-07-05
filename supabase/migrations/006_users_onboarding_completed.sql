-- Ensure onboarding_completed exists on users (idempotent for older DBs)

alter table public.users
  add column if not exists onboarding_completed boolean not null default false;

comment on column public.users.onboarding_completed is
  'True after the user completes voice onboarding.';
