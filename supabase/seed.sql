-- E2E seed data for local development / testing.
-- Replace placeholder values before running against a real environment.

-- Test user (Clerk sub format)
insert into public.users (id, email, first_name, last_name)
values ('user_test_seed_001', 'dev@example.com', 'Dev', 'Test')
on conflict (id) do nothing;

-- Twilio number assigned to the test user.
-- Replace e164_number and twilio_sid with a real number before E2E testing.
insert into public.phone_numbers (user_id, e164_number, twilio_sid, status)
values (
  'user_test_seed_001',
  '+15005550006',         -- Twilio magic test number (won't receive real calls)
  'PN_SEED_PLACEHOLDER',  -- replace with real IncomingPhoneNumber SID
  'active'
)
on conflict do nothing;

-- Answering rules: one blacklist, one schedule (08:00-20:00 local)
insert into public.answering_rules (user_id, rule_type, value, is_active)
values
  (
    'user_test_seed_001',
    'blacklist',
    '{"number": "+50377778888"}',
    true
  ),
  (
    'user_test_seed_001',
    'schedule',
    '{"start": "08:00", "end": "20:00"}',
    true
  )
on conflict do nothing;
