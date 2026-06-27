-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- Create Profiles Table in Public Schema
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  username text unique not null,
  email text unique not null,
  role text default 'user' check (role in ('user', 'admin')),
  is_admin boolean default false not null,
  balance decimal(10,2) default 0.00 not null,
  api_key text unique not null,
  referral_code text unique not null,
  referred_by text,
  status text default 'active' check (status in ('active', 'banned')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on profiles
alter table public.profiles enable row level security;

-- Create Security Policies for Profiles
-- 1. Profiles are readable by anyone (useful for public referral checking or general usage)
create policy "Allow public read access to profiles" 
  on public.profiles for select 
  using (true);

-- 2. Authenticated users can insert their own profiles
create policy "Allow users to insert their own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- 3. Users can edit/update their own profile information
create policy "Allow users to update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Create a helper function and trigger to automatically insert a profile when a new user signs up.
-- This ensures that even if client-side profile creation fails, a default profile is still provisioned.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, username, email, api_key, referral_code, balance, role, is_admin, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substring(md5(random()::text) from 1 for 6)),
    new.email,
    'smm_live_' || substring(md5(random()::text) from 1 for 16),
    'REF' || floor(1000 + random() * 9000)::text,
    0.00,
    'user',
    false,
    'active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution link
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
