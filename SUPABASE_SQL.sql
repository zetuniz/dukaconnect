-- Tengeneza table ya profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  jina text,
  simu text,
  role text check (role in ('rejareja', 'jumla')),
  jiji text default 'Mbeya',
  created_at timestamptz default now()
);

-- Tengeneza table ya orders
create table orders (
  id uuid default gen_random_uuid() primary key,
  rejareja_id uuid references profiles(id) on delete cascade,
  jumla_id uuid references profiles(id) on delete cascade,
  bidhaa text not null,
  kiasi text not null,
  maelezo text,
  hali text default 'pending' check (hali in ('pending', 'accepted', 'delivered', 'cancelled')),
  jiji text,
  created_at timestamptz default now()
);

-- Washa Row Level Security
alter table profiles enable row level security;
alter table orders enable row level security;

-- Profiles: kila mtu aone profiles zake + za jumla
create policy "Profiles zinaonekana kwa wote" on profiles for select using (true);
create policy "Mtu aweze kuingiza profile yake" on profiles for insert with check (auth.uid() = id);
create policy "Mtu aweze kubadilisha profile yake" on profiles for update using (auth.uid() = id);

-- Orders: rejareja aone orders zake, jumla aone orders zake
create policy "Rejareja aone orders zake" on orders for select using (
  auth.uid() = rejareja_id or auth.uid() = jumla_id
);
create policy "Rejareja aweze kutengeneza order" on orders for insert with check (
  auth.uid() = rejareja_id
);
create policy "Jumla aweze kubadilisha hali ya order" on orders for update using (
  auth.uid() = jumla_id
);

-- Washa realtime kwa orders
alter publication supabase_realtime add table orders;

-- Ongeza safu mpya kwa risiti (invoice)
-- Zitekeleze kwenye Supabase SQL Editor:
alter table orders add column if not exists bei_kwa_unit numeric(10,2) default 0;
alter table orders add column if not exists idadi numeric(10,2) default null;
alter table orders add column if not exists unit_order text default null;

-- Tengeneza table ya ratings (tathmini)
create table ratings (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade unique,
  rejareja_id uuid references profiles(id) on delete cascade,
  jumla_id uuid references profiles(id) on delete cascade,
  nyota integer not null check (nyota between 1 and 5),
  maoni text,
  created_at timestamptz default now()
);

alter table ratings enable row level security;
create policy "Ratings zinaonekana kwa wote" on ratings for select using (true);
create policy "Rejareja aweze kupiga rating" on ratings for insert with check (auth.uid() = rejareja_id);

-- Tengeneza table ya notifications (arifa za ndani ya app)
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  kichwa text not null,
  ujumbe text not null,
  aina text default 'info' check (aina in ('info', 'success', 'warning')),
  imesomwa boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;
create policy "Mtu aone notifications zake" on notifications for select using (auth.uid() = user_id);
create policy "Mtumiaji yeyote aweze kutuma notification" on notifications for insert with check (auth.uid() is not null);
create policy "Mtu aweze kubadilisha notifications zake" on notifications for update using (auth.uid() = user_id);

-- Tengeneza table ya bidhaa (catalog ya jumla)
create table bidhaa (
  id uuid default gen_random_uuid() primary key,
  jumla_id uuid references profiles(id) on delete cascade,
  jina text not null,
  bei numeric(10,2) not null,
  unit text default 'kipande',
  ipo boolean default true,
  created_at timestamptz default now()
);

alter table bidhaa enable row level security;

create policy "Bidhaa zinaonekana kwa wote" on bidhaa for select using (true);
create policy "Jumla aweze kuongeza bidhaa" on bidhaa for insert with check (auth.uid() = jumla_id);
create policy "Jumla aweze kubadilisha bidhaa" on bidhaa for update using (auth.uid() = jumla_id);
create policy "Jumla aweze kufuta bidhaa" on bidhaa for delete using (auth.uid() = jumla_id);
