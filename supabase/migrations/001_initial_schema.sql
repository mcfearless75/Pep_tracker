-- Tracked: initial schema. Every table is per-user with RLS on auth.uid().

create extension if not exists "pgcrypto";

-- Profiles ------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  units text not null default 'metric' check (units in ('metric','imperial')),
  over_18 boolean not null default false,
  accepted_disclaimer_at timestamptz,
  goal text not null default 'weight_loss' check (goal in ('weight_loss','maintenance','muscle')),
  height_cm numeric(5,1),
  start_weight_kg numeric(5,1),
  protein_g_per_kg numeric(3,2) not null default 1.4,
  protein_target_g integer,
  water_target_ml integer not null default 2000,
  night_mode_start time not null default '21:00',
  night_mode_end time not null default '06:00',
  onboarded_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Medications and titration --------------------------------------------------
create table public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,                       -- e.g. Mounjaro
  generic text,                             -- e.g. tirzepatide
  form text not null default 'pen' check (form in ('pen','vial')),
  dose_mg numeric(7,3) not null,
  frequency text not null default 'weekly' check (frequency in ('daily','weekly','custom')),
  interval_days integer not null default 7,
  shot_weekday smallint check (shot_weekday between 0 and 6),
  start_date date not null default current_date,
  half_life_hours numeric(6,1),
  licensed boolean not null default true,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);
create index medications_user_idx on public.medications(user_id);

create table public.titration_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  medication_id uuid not null references public.medications(id) on delete cascade,
  dose_mg numeric(7,3) not null,
  start_date date not null,
  created_at timestamptz not null default now()
);
create index titration_steps_med_idx on public.titration_steps(medication_id, start_date);

create table public.doses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  medication_id uuid not null references public.medications(id) on delete cascade,
  taken_at timestamptz not null default now(),
  dose_mg numeric(7,3) not null,
  site text check (site in ('abdomen_left','abdomen_right','thigh_left','thigh_right','arm_left','arm_right')),
  notes text,
  created_at timestamptz not null default now()
);
create index doses_user_taken_idx on public.doses(user_id, taken_at desc);

-- Body ----------------------------------------------------------------------
create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  logged_at timestamptz not null default now(),
  weight_kg numeric(5,2) not null,
  waist_cm numeric(5,1),
  created_at timestamptz not null default now()
);
create index weight_logs_user_idx on public.weight_logs(user_id, logged_at desc);

create table public.side_effect_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  logged_at timestamptz not null default now(),
  kind text not null check (kind in ('nausea','vomiting','constipation','diarrhoea','fatigue','sulphur_burps','dizziness','headache','cycle_change','chills','injection_site','other')),
  severity smallint not null default 1 check (severity between 1 and 3),
  notes text,
  created_at timestamptz not null default now()
);
create index side_effect_logs_user_idx on public.side_effect_logs(user_id, logged_at desc);

create table public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  logged_at timestamptz not null default now(),
  mood smallint check (mood between 1 and 5),
  energy smallint check (energy between 1 and 5),
  notes text
);
create index mood_logs_user_idx on public.mood_logs(user_id, logged_at desc);

create table public.training_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  logged_at timestamptz not null default now(),
  kind text not null check (kind in ('resistance','cardio','walk','other')),
  minutes integer,
  felt smallint check (felt between 1 and 5)
);
create index training_logs_user_idx on public.training_logs(user_id, logged_at desc);

-- Nutrition -----------------------------------------------------------------
create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  logged_date date not null default current_date,
  logged_at timestamptz not null default now(),
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  food_name text not null,
  calories integer not null default 0,
  protein_g numeric(6,1) not null default 0,
  carbs_g numeric(6,1) not null default 0,
  fat_g numeric(6,1) not null default 0,
  fibre_g numeric(6,1),
  source text not null default 'manual' check (source in ('photo','barcode','search','manual','repeat')),
  confidence text check (confidence in ('low','medium','high'))
);
create index meals_user_date_idx on public.meals(user_id, logged_date desc);

create table public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  logged_at timestamptz not null default now(),
  ml integer not null
);
create index water_logs_user_idx on public.water_logs(user_id, logged_at desc);

-- Sleep ---------------------------------------------------------------------
create table public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  night_of date not null,
  bedtime timestamptz,
  wake_time timestamptz,
  duration_min integer,
  hrv_ms numeric(5,1),
  resting_hr smallint,
  quality smallint check (quality between 1 and 5),
  source text not null default 'manual' check (source in ('manual','healthkit','health_connect','oura','whoop')),
  created_at timestamptz not null default now(),
  unique (user_id, night_of)
);

-- Education -----------------------------------------------------------------
create table public.moment_reads (
  user_id uuid not null references public.profiles(id) on delete cascade,
  moment_id text not null,
  read_at timestamptz not null default now(),
  correct boolean,
  primary key (user_id, moment_id)
);

-- RLS -----------------------------------------------------------------------
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

do $$
declare t text;
begin
  foreach t in array array['medications','titration_steps','doses','weight_logs','side_effect_logs','mood_logs','training_logs','meals','water_logs','sleep_logs','moment_reads']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "own rows" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;
