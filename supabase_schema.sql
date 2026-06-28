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
create policy "Allow public read access to profiles" 
  on public.profiles for select 
  using (true);

create policy "Allow users to insert their own profile"
  on public.profiles for insert 
  with check (auth.uid() = id);

create policy "Allow users to update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Categories Table
create table if not exists public.categories (
  id text primary key,
  name text not null,
  icon text not null,
  sort_order integer default 0 not null,
  status text default 'active' not null check (status in ('active', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;
create policy "Allow public read access to categories" on public.categories for select using (true);
create policy "Allow admins full access on categories" on public.categories for all using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Services Table
create table if not exists public.services (
  id text primary key,
  category_id text references public.categories(id) on delete cascade not null,
  name text not null,
  description text,
  rate decimal(10,2) not null,
  min_qty integer default 1 not null,
  max_qty bigint default 10000 not null,
  avg_time text,
  refill_available boolean default false not null,
  status text default 'active' not null check (status in ('active', 'inactive')),
  provider text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.services enable row level security;
create policy "Allow public read access to services" on public.services for select using (true);
create policy "Allow admins full access on services" on public.services for all using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Orders Table
create table if not exists public.orders (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  service_id text references public.services(id) on delete restrict not null,
  link text not null,
  quantity integer not null,
  start_count integer default 0 not null,
  remains integer not null,
  status text default 'pending' not null check (status in ('pending', 'in_progress', 'completed', 'cancelled', 'partial', 'refunded')),
  price decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;
create policy "Allow users to read their own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Allow users to insert their own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Allow admins full access on orders" on public.orders for all using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Transactions Table
create table if not exists public.transactions (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('credit', 'debit')),
  amount decimal(10,2) not null,
  balance_after decimal(10,2) not null,
  description text,
  reference_id text,
  status text default 'success' not null check (status in ('success', 'pending', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;
create policy "Allow users to read their own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Allow users to insert their own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Allow admins full access on transactions" on public.transactions for all using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Tickets Table
create table if not exists public.tickets (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject text not null,
  category text not null,
  status text default 'open' not null check (status in ('open', 'replied', 'closed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tickets enable row level security;
create policy "Allow users to read their own tickets" on public.tickets for select using (auth.uid() = user_id);
create policy "Allow users to insert their own tickets" on public.tickets for insert with check (auth.uid() = user_id);
create policy "Allow users to update their own tickets" on public.tickets for update using (auth.uid() = user_id);
create policy "Allow admins full access on tickets" on public.tickets for all using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Ticket Messages Table
create table if not exists public.ticket_messages (
  id uuid default uuid_generate_v4() primary key,
  ticket_id text references public.tickets(id) on delete cascade not null,
  sender_type text not null check (sender_type in ('user', 'admin')),
  sender_name text not null,
  message text not null,
  attachment_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ticket_messages enable row level security;
create policy "Allow users to read messages for their tickets" on public.ticket_messages for select using (
  exists (select 1 from public.tickets where tickets.id = ticket_messages.ticket_id and tickets.user_id = auth.uid())
);
create policy "Allow users to insert messages for their tickets" on public.ticket_messages for insert with check (
  exists (select 1 from public.tickets where tickets.id = ticket_messages.ticket_id and tickets.user_id = auth.uid())
);
create policy "Allow admins full access on ticket messages" on public.ticket_messages for all using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Site Settings Table
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  site_name text not null default 'Virtue',
  tagline text,
  contact_email text,
  whatsapp_link text,
  maintenance_mode boolean default false not null,
  min_order_amount decimal(10,2) default 100.00 not null,
  registration_open boolean default true not null,
  announcement_banner text,
  low_balance_threshold decimal(10,2) default 200.00 not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.site_settings enable row level security;
create policy "Allow public read access to settings" on public.site_settings for select using (true);
create policy "Allow admins full access on settings" on public.site_settings for all using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Helper triggers & functions
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
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create Contact Requests Table
create table if not exists public.contact_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  description text not null,
  instagram_username text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on contact_requests
alter table public.contact_requests enable row level security;

-- Policies for contact_requests
create policy "Allow users to read their own contact requests" 
  on public.contact_requests for select 
  using (auth.uid() = user_id);

create policy "Allow users to insert their own contact requests" 
  on public.contact_requests for insert 
  with check (auth.uid() = user_id);

create policy "Allow admins full access on contact requests" 
  on public.contact_requests for all 
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );
