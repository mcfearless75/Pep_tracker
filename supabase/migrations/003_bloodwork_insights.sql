-- Bloodwork results, weekly insights, wake goal.

create table public.bloodwork_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  taken_on date not null default current_date,
  marker text not null,
  value numeric(10,3) not null,
  unit text,
  source text not null default 'manual' check (source in ('manual','photo','pdf')),
  notes text,
  created_at timestamptz not null default now()
);
create index bloodwork_user_idx on public.bloodwork_results(user_id, taken_on desc);

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  body text not null,
  model text,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table public.profiles add column wake_goal time not null default '07:00';

alter table public.bloodwork_results enable row level security;
create policy "own rows" on public.bloodwork_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
alter table public.insights enable row level security;
create policy "own rows" on public.insights for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
