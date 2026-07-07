-- ============================================================
-- trainplan-ki — Supabase Schema (normalisiert, 4 Tabellen)
-- Idempotent: kann beliebig oft ausgeführt werden, ohne Fehler.
-- Reihenfolge: plans → plan_days → plan_exercises → sets
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. TABELLE: plans
-- ────────────────────────────────────────────────────────────
create table if not exists public.plans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'Neuer Trainingsplan',
  description text not null default '',
  status      text not null default 'draft'
                check (status in ('active', 'draft', 'archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Falls Tabelle bereits ohne FK existierte: Constraint nachträglich ergänzen
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_name = 'plans' and constraint_name = 'plans_user_id_fkey'
  ) then
    alter table public.plans
      add constraint plans_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

create index if not exists plans_user_id_idx on public.plans (user_id);

-- ────────────────────────────────────────────────────────────
-- 2. TABELLE: plan_days
-- ────────────────────────────────────────────────────────────
create table if not exists public.plan_days (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references public.plans(id) on delete cascade,
  name        text not null default 'Tag',
  day_order   integer not null default 0,
  notes       text not null default '',
  created_at  timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_name = 'plan_days' and constraint_name = 'plan_days_plan_id_fkey'
  ) then
    alter table public.plan_days
      add constraint plan_days_plan_id_fkey
      foreign key (plan_id) references public.plans(id) on delete cascade;
  end if;
end $$;

create index if not exists plan_days_plan_id_idx on public.plan_days (plan_id);

-- ────────────────────────────────────────────────────────────
-- 3. TABELLE: plan_exercises
-- ────────────────────────────────────────────────────────────
create table if not exists public.plan_exercises (
  id                          uuid primary key default gen_random_uuid(),
  day_id                      uuid not null references public.plan_days(id) on delete cascade,
  exercise_id                 text not null,  -- Referenz auf lokale Übungsbibliothek (kein FK, da Bibliothek im Code lebt)
  exercise_order              integer not null default 0,
  notes                       text not null default '',
  progression_type            text not null default 'none'
                                 check (progression_type in ('linear', 'double_progression', 'none')),
  progression_increment_kg    numeric not null default 2.5,
  progression_min_reps        integer not null default 8,
  progression_max_reps        integer not null default 12,
  created_at                  timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_name = 'plan_exercises' and constraint_name = 'plan_exercises_day_id_fkey'
  ) then
    alter table public.plan_exercises
      add constraint plan_exercises_day_id_fkey
      foreign key (day_id) references public.plan_days(id) on delete cascade;
  end if;
end $$;

create index if not exists plan_exercises_day_id_idx on public.plan_exercises (day_id);

-- ────────────────────────────────────────────────────────────
-- 4. TABELLE: sets
-- ────────────────────────────────────────────────────────────
create table if not exists public.sets (
  id                  uuid primary key default gen_random_uuid(),
  plan_exercise_id    uuid not null references public.plan_exercises(id) on delete cascade,
  set_order           integer not null default 0,
  set_type            text not null default 'normal'
                        check (set_type in ('normal', 'warmup', 'dropset')),
  reps                integer,            -- null = AMRAP
  weight_kg           numeric,            -- null = offen / Körpergewicht
  rir                 integer,            -- Reps In Reserve
  pause_seconds       integer,            -- Pause in Sekunden
  created_at          timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_name = 'sets' and constraint_name = 'sets_plan_exercise_id_fkey'
  ) then
    alter table public.sets
      add constraint sets_plan_exercise_id_fkey
      foreign key (plan_exercise_id) references public.plan_exercises(id) on delete cascade;
  end if;
end $$;

create index if not exists sets_plan_exercise_id_idx on public.sets (plan_exercise_id);

-- ────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY: aktivieren für alle 4 Tabellen
-- ────────────────────────────────────────────────────────────
alter table public.plans          enable row level security;
alter table public.plan_days      enable row level security;
alter table public.plan_exercises enable row level security;
alter table public.sets           enable row level security;

-- ────────────────────────────────────────────────────────────
-- 6. RLS POLICIES: plans (direkter user_id-Bezug)
-- ────────────────────────────────────────────────────────────
drop policy if exists "plans_select_own" on public.plans;
create policy "plans_select_own"
  on public.plans for select
  using (auth.uid() = user_id);

drop policy if exists "plans_insert_own" on public.plans;
create policy "plans_insert_own"
  on public.plans for insert
  with check (auth.uid() = user_id);

drop policy if exists "plans_update_own" on public.plans;
create policy "plans_update_own"
  on public.plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "plans_delete_own" on public.plans;
create policy "plans_delete_own"
  on public.plans for delete
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 7. RLS POLICIES: plan_days (Bezug über plans.user_id)
-- ────────────────────────────────────────────────────────────
drop policy if exists "plan_days_select_own" on public.plan_days;
create policy "plan_days_select_own"
  on public.plan_days for select
  using (
    exists (
      select 1 from public.plans
      where plans.id = plan_days.plan_id and plans.user_id = auth.uid()
    )
  );

drop policy if exists "plan_days_insert_own" on public.plan_days;
create policy "plan_days_insert_own"
  on public.plan_days for insert
  with check (
    exists (
      select 1 from public.plans
      where plans.id = plan_days.plan_id and plans.user_id = auth.uid()
    )
  );

drop policy if exists "plan_days_update_own" on public.plan_days;
create policy "plan_days_update_own"
  on public.plan_days for update
  using (
    exists (
      select 1 from public.plans
      where plans.id = plan_days.plan_id and plans.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.plans
      where plans.id = plan_days.plan_id and plans.user_id = auth.uid()
    )
  );

drop policy if exists "plan_days_delete_own" on public.plan_days;
create policy "plan_days_delete_own"
  on public.plan_days for delete
  using (
    exists (
      select 1 from public.plans
      where plans.id = plan_days.plan_id and plans.user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- 8. RLS POLICIES: plan_exercises (Bezug über plan_days → plans)
-- ────────────────────────────────────────────────────────────
drop policy if exists "plan_exercises_select_own" on public.plan_exercises;
create policy "plan_exercises_select_own"
  on public.plan_exercises for select
  using (
    exists (
      select 1 from public.plan_days
      join public.plans on plans.id = plan_days.plan_id
      where plan_days.id = plan_exercises.day_id and plans.user_id = auth.uid()
    )
  );

drop policy if exists "plan_exercises_insert_own" on public.plan_exercises;
create policy "plan_exercises_insert_own"
  on public.plan_exercises for insert
  with check (
    exists (
      select 1 from public.plan_days
      join public.plans on plans.id = plan_days.plan_id
      where plan_days.id = plan_exercises.day_id and plans.user_id = auth.uid()
    )
  );

drop policy if exists "plan_exercises_update_own" on public.plan_exercises;
create policy "plan_exercises_update_own"
  on public.plan_exercises for update
  using (
    exists (
      select 1 from public.plan_days
      join public.plans on plans.id = plan_days.plan_id
      where plan_days.id = plan_exercises.day_id and plans.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.plan_days
      join public.plans on plans.id = plan_days.plan_id
      where plan_days.id = plan_exercises.day_id and plans.user_id = auth.uid()
    )
  );

drop policy if exists "plan_exercises_delete_own" on public.plan_exercises;
create policy "plan_exercises_delete_own"
  on public.plan_exercises for delete
  using (
    exists (
      select 1 from public.plan_days
      join public.plans on plans.id = plan_days.plan_id
      where plan_days.id = plan_exercises.day_id and plans.user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- 9. RLS POLICIES: sets (Bezug über plan_exercises → plan_days → plans)
-- ────────────────────────────────────────────────────────────
drop policy if exists "sets_select_own" on public.sets;
create policy "sets_select_own"
  on public.sets for select
  using (
    exists (
      select 1 from public.plan_exercises
      join public.plan_days on plan_days.id = plan_exercises.day_id
      join public.plans on plans.id = plan_days.plan_id
      where plan_exercises.id = sets.plan_exercise_id and plans.user_id = auth.uid()
    )
  );

drop policy if exists "sets_insert_own" on public.sets;
create policy "sets_insert_own"
  on public.sets for insert
  with check (
    exists (
      select 1 from public.plan_exercises
      join public.plan_days on plan_days.id = plan_exercises.day_id
      join public.plans on plans.id = plan_days.plan_id
      where plan_exercises.id = sets.plan_exercise_id and plans.user_id = auth.uid()
    )
  );

drop policy if exists "sets_update_own" on public.sets;
create policy "sets_update_own"
  on public.sets for update
  using (
    exists (
      select 1 from public.plan_exercises
      join public.plan_days on plan_days.id = plan_exercises.day_id
      join public.plans on plans.id = plan_days.plan_id
      where plan_exercises.id = sets.plan_exercise_id and plans.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.plan_exercises
      join public.plan_days on plan_days.id = plan_exercises.day_id
      join public.plans on plans.id = plan_days.plan_id
      where plan_exercises.id = sets.plan_exercise_id and plans.user_id = auth.uid()
    )
  );

drop policy if exists "sets_delete_own" on public.sets;
create policy "sets_delete_own"
  on public.sets for delete
  using (
    exists (
      select 1 from public.plan_exercises
      join public.plan_days on plan_days.id = plan_exercises.day_id
      join public.plans on plans.id = plan_days.plan_id
      where plan_exercises.id = sets.plan_exercise_id and plans.user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- 10. updated_at automatisch setzen (nur auf plans)
-- ────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists plans_set_updated_at on public.plans;
create trigger plans_set_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();
