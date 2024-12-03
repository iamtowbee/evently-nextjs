-- Create tables
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  description text
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  avatar_url text,
  email text,
  bio text,
  role text default 'member'::text,
  website text,
  twitter text,
  github text,
  linkedin text
);

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  creator_id uuid references public.user_profiles(id) on delete set null,
  is_private boolean default false,
  member_count integer default 0,
  event_count integer default 0
);

create table if not exists public.community_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  community_id uuid references public.communities(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  role text default 'member'::text,
  unique(community_id, user_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  description text,
  location text,
  venue text,
  date date not null,
  start_time time not null,
  end_time time not null,
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  is_featured boolean default false,
  is_free boolean default false,
  price decimal(10,2),
  max_attendees integer,
  attendee_count integer default 0,
  organizer_id uuid references public.user_profiles(id) on delete set null,
  community_id uuid references public.communities(id) on delete set null
);

create table if not exists public.virtual_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  event_id uuid references public.events(id) on delete cascade not null unique,
  platform text not null,
  url text not null,
  meeting_id text,
  passcode text
);

create table if not exists public.event_attendees (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  status text default 'registered'::text,
  unique(event_id, user_id)
);

-- Enable Row Level Security
alter table public.categories enable row level security;
alter table public.user_profiles enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.events enable row level security;
alter table public.virtual_events enable row level security;
alter table public.event_attendees enable row level security;

-- Create policies
create policy "Anyone can read categories"
  on public.categories for select
  using (true);

create policy "Anyone can read user profiles"
  on public.user_profiles for select
  using (true);

create policy "Anyone can read communities"
  on public.communities for select
  using (true);

create policy "Anyone can read community members"
  on public.community_members for select
  using (true);

create policy "Anyone can read events"
  on public.events for select
  using (true);

create policy "Anyone can read virtual events"
  on public.virtual_events for select
  using (true);

create policy "Anyone can read event attendees"
  on public.event_attendees for select
  using (true);

-- Create functions and triggers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.handle_updated_user()
returns trigger as $$
begin
  update public.user_profiles
  set
    email = new.email,
    full_name = new.raw_user_meta_data->>'full_name',
    avatar_url = new.raw_user_meta_data->>'avatar_url',
    updated_at = now()
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.update_community_member_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.communities
    set member_count = member_count + 1
    where id = new.community_id;
  elsif (TG_OP = 'DELETE') then
    update public.communities
    set member_count = member_count - 1
    where id = old.community_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create or replace function public.update_community_event_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT' and NEW.community_id is not null) then
    update public.communities
    set event_count = event_count + 1
    where id = NEW.community_id;
  elsif (TG_OP = 'DELETE' and OLD.community_id is not null) then
    update public.communities
    set event_count = event_count - 1
    where id = OLD.community_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create or replace function public.update_event_attendee_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.events
    set attendee_count = attendee_count + 1
    where id = new.event_id;
  elsif (TG_OP = 'DELETE') then
    update public.events
    set attendee_count = attendee_count - 1
    where id = old.event_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Create triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_updated_user();

create trigger on_community_member_added
  after insert or delete on public.community_members
  for each row execute procedure public.update_community_member_count();

create trigger on_community_event_added
  after insert or delete on public.events
  for each row execute procedure public.update_community_event_count();

create trigger on_event_attendee_added
  after insert or delete on public.event_attendees
  for each row execute procedure public.update_event_attendee_count();

-- Insert initial categories
insert into public.categories (name, slug, description) values
  ('Technology', 'technology', 'Tech conferences, workshops, and meetups'),
  ('Business', 'business', 'Business networking and professional development'),
  ('Design', 'design', 'Design workshops and creative sessions'),
  ('Marketing', 'marketing', 'Marketing and growth events'),
  ('Health', 'health', 'Health and wellness events'),
  ('Education', 'education', 'Educational workshops and seminars'),
  ('Entertainment', 'entertainment', 'Entertainment and social events'),
  ('Other', 'other', 'Other types of events')
on conflict (slug) do nothing;
  