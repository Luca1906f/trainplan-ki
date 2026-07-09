-- TRYME: Checkin-Tabelle (nach dem fitgit-Schema ausführen)
create table nutrition_meal_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  meal_id uuid not null references nutrition_meals(id) on delete cascade,
  log_date date not null,
  checked_at timestamptz default now(),
  unique (user_id, meal_id, log_date)
);
alter table nutrition_meal_checkins enable row level security;
create policy "own checkins" on nutrition_meal_checkins
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
