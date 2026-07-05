-- Integrity constraints for answering_rules (per-user uniqueness + conflict guard)

-- One schedule and one anonymous rule per user
create unique index if not exists answering_rules_one_schedule_per_user_idx
  on public.answering_rules (user_id)
  where rule_type = 'schedule';

create unique index if not exists answering_rules_one_anonymous_per_user_idx
  on public.answering_rules (user_id)
  where rule_type = 'anonymous';

-- Unique numbers/prefixes per user within each list type
create unique index if not exists answering_rules_whitelist_number_unique_idx
  on public.answering_rules (user_id, (value->>'number'))
  where rule_type = 'whitelist';

create unique index if not exists answering_rules_blacklist_number_unique_idx
  on public.answering_rules (user_id, (value->>'number'))
  where rule_type = 'blacklist';

create unique index if not exists answering_rules_prefix_unique_idx
  on public.answering_rules (user_id, (value->>'prefix'))
  where rule_type = 'prefix_block';

-- Prevent the same number from being active in both whitelist and blacklist
create or replace function public.check_answering_rules_whitelist_blacklist_conflict()
returns trigger
language plpgsql
as $$
begin
  if new.rule_type = 'whitelist'
    and new.is_active
    and exists (
      select 1
      from public.answering_rules existing
      where existing.user_id = new.user_id
        and existing.rule_type = 'blacklist'
        and existing.is_active
        and existing.value->>'number' = new.value->>'number'
        and existing.id is distinct from new.id
    )
  then
    raise exception 'Number % is already active in blacklist', new.value->>'number';
  end if;

  if new.rule_type = 'blacklist'
    and new.is_active
    and exists (
      select 1
      from public.answering_rules existing
      where existing.user_id = new.user_id
        and existing.rule_type = 'whitelist'
        and existing.is_active
        and existing.value->>'number' = new.value->>'number'
        and existing.id is distinct from new.id
    )
  then
    raise exception 'Number % is already active in whitelist', new.value->>'number';
  end if;

  return new;
end;
$$;

drop trigger if exists answering_rules_whitelist_blacklist_conflict
  on public.answering_rules;

create trigger answering_rules_whitelist_blacklist_conflict
  before insert or update on public.answering_rules
  for each row
  execute function public.check_answering_rules_whitelist_blacklist_conflict();
