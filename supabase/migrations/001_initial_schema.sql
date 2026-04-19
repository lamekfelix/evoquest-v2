-- ============================================================
-- EvoQuest v2 — Initial Schema
-- Execute no Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ─── Tabelas ─────────────────────────────────────────────────

create table public.users (
  id           uuid references auth.users(id) on delete cascade primary key,
  email        text unique not null,
  name         text,
  character_class text,
  avatar       text,
  created_at   timestamptz default now()
);

create table public.attributes (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  attribute_id text not null,
  xp           integer default 0 not null,
  updated_at   timestamptz default now(),
  unique(user_id, attribute_id)
);

create table public.areas (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  color      text,
  icon       text,
  created_at timestamptz default now()
);

create table public.habits (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  attr       text,
  xp_reward  integer default 10,
  streak     integer default 0,
  done_dates text[] default '{}',
  created_at timestamptz default now()
);

create table public.projects (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  description  text,
  status       text default 'active',
  start_date   date,
  end_date     date,
  area_id      uuid references public.areas(id) on delete set null,
  attr         text,
  resource_ids uuid[] default '{}',
  created_at   timestamptz default now()
);

create table public.project_todos (
  id         uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title      text not null,
  done       boolean default false,
  created_at timestamptz default now()
);

create table public.agenda (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  date       date not null,
  time_start time,
  time_end   time,
  area_id    uuid references public.areas(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  done       boolean default false,
  created_at timestamptz default now()
);

create table public.resources (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  description text,
  link        text,
  area_id     uuid references public.areas(id) on delete set null,
  created_at  timestamptz default now()
);

create table public.archives (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  name          text not null,
  original_type text,
  archived_at   timestamptz default now()
);

create table public.workouts (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  date       date,
  exercises  jsonb default '[]',
  created_at timestamptz default now()
);

create table public.meals (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  date       date,
  time       time,
  items      jsonb default '[]',
  created_at timestamptz default now()
);

create table public.transactions (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  type        text not null check (type in ('income', 'expense')),
  category    text,
  amount      numeric(12, 2) not null,
  description text,
  date        date not null,
  created_at  timestamptz default now()
);

create table public.achievements (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users(id) on delete cascade not null,
  achievement_id text not null,
  unlocked_at    timestamptz default now(),
  unique(user_id, achievement_id)
);

-- ─── Trigger: criar perfil ao cadastrar usuário ───────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Row Level Security ───────────────────────────────────────

alter table public.users        enable row level security;
alter table public.attributes   enable row level security;
alter table public.areas        enable row level security;
alter table public.habits       enable row level security;
alter table public.projects     enable row level security;
alter table public.project_todos enable row level security;
alter table public.agenda       enable row level security;
alter table public.resources    enable row level security;
alter table public.archives     enable row level security;
alter table public.workouts     enable row level security;
alter table public.meals        enable row level security;
alter table public.transactions enable row level security;
alter table public.achievements enable row level security;

-- users
create policy "own_profile_select" on public.users for select using (auth.uid() = id);
create policy "own_profile_update" on public.users for update using (auth.uid() = id);

-- tabelas com user_id direto
create policy "own_attributes"   on public.attributes   for all using (auth.uid() = user_id);
create policy "own_areas"        on public.areas        for all using (auth.uid() = user_id);
create policy "own_habits"       on public.habits       for all using (auth.uid() = user_id);
create policy "own_projects"     on public.projects     for all using (auth.uid() = user_id);
create policy "own_agenda"       on public.agenda       for all using (auth.uid() = user_id);
create policy "own_resources"    on public.resources    for all using (auth.uid() = user_id);
create policy "own_archives"     on public.archives     for all using (auth.uid() = user_id);
create policy "own_workouts"     on public.workouts     for all using (auth.uid() = user_id);
create policy "own_meals"        on public.meals        for all using (auth.uid() = user_id);
create policy "own_transactions" on public.transactions for all using (auth.uid() = user_id);
create policy "own_achievements" on public.achievements for all using (auth.uid() = user_id);

-- project_todos: acesso via projeto do usuário
create policy "own_project_todos" on public.project_todos for all using (
  exists (
    select 1 from public.projects
    where id = project_todos.project_id
      and user_id = auth.uid()
  )
);
