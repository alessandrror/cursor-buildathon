-- Allow calls without a phone number (WebRTC / browser sessions have no phone_number_id)
alter table public.calls alter column phone_number_id drop not null;
