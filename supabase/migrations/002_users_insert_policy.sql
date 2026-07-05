-- Allow authenticated Clerk users to create their own profile row (fallback sync path)

create policy "Users can insert their own profile"
  on public.users
  for insert
  to authenticated
  with check ((select auth.jwt() ->> 'sub') = id);
