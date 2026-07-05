-- Reglas de contestación configuradas por el usuario.
-- spec: specs/rules/configuracion-reglas-contestacion.md
-- spec: specs/data/modelo-datos-core.md §answering_rules
-- Nota (control de cambios): el modelo original asumía Supabase Auth (auth.uid, uuid).
-- Este proyecto usa Clerk, por lo que user_id es text y RLS usa auth.jwt()->>'sub',
-- consistente con 001_initial_schema.sql. Se añade el tipo singleton 'reject_action'
-- para la "Acción de rechazo" global de la spec de configuración.

create table if not exists public.answering_rules (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references public.users (id) on delete cascade,
  rule_type text not null check (
    rule_type in (
      'whitelist',
      'blacklist',
      'schedule',
      'anonymous',
      'prefix_block',
      'reject_action'
    )
  ),
  value jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Números de lista blanca/negra deben estar en E.164. spec: data §CHECK regex.
  constraint answering_rules_e164_chk check (
    rule_type not in ('whitelist', 'blacklist')
    or (value ->> 'number') ~ '^\+[1-9][0-9]{6,14}$'
  )
);

create index if not exists answering_rules_user_id_idx
  on public.answering_rules (user_id);

create index if not exists answering_rules_user_active_idx
  on public.answering_rules (user_id, rule_type)
  where is_active;

-- Un mismo número no puede estar en whitelist y blacklist activas del usuario.
-- spec: configuracion §Casos borde; data §Reglas de integridad.
create or replace function public.prevent_answering_rule_conflict()
returns trigger as $$
begin
  if new.rule_type in ('whitelist', 'blacklist') and new.is_active then
    if exists (
      select 1
      from public.answering_rules r
      where r.user_id = new.user_id
        and r.is_active
        and r.rule_type in ('whitelist', 'blacklist')
        and r.rule_type <> new.rule_type
        and (r.value ->> 'number') = (new.value ->> 'number')
        and r.id <> new.id
    ) then
      raise exception 'El número % ya está en la lista opuesta', new.value ->> 'number'
        using errcode = '23505';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger answering_rules_conflict_check
  before insert or update on public.answering_rules
  for each row execute function public.prevent_answering_rule_conflict();

-- Mantiene updated_at.
create or replace function public.touch_answering_rules_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger answering_rules_touch_updated_at
  before update on public.answering_rules
  for each row execute function public.touch_answering_rules_updated_at();

-- RLS: el usuario solo ve y modifica sus propias reglas. spec: data §RLS.
alter table public.answering_rules enable row level security;

create policy "Users can view their own answering rules"
  on public.answering_rules
  for select
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can insert their own answering rules"
  on public.answering_rules
  for insert
  to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can update their own answering rules"
  on public.answering_rules
  for update
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can delete their own answering rules"
  on public.answering_rules
  for delete
  to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);
