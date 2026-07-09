-- fitgit: Kern-Ernährungsschema (zuerst ausführen)
create table nutrition_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  goal text not null check (goal in ('cut','maintain','bulk')),
  diet_form text not null check (diet_form in ('standard','keto','lowcarb','highprotein')),
  diet_style text not null default 'omnivore', -- omnivore | vegetarian | vegan
  is_active boolean default false,
  target_kcal int not null, protein_g int not null, carbs_g int not null, fat_g int not null,
  created_at timestamptz default now()
);
create unique index one_active_plan_per_user on nutrition_plans (user_id) where is_active;

create table nutrition_plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references nutrition_plans(id) on delete cascade,
  day_index int not null, day_label text not null, tips text[],
  total_kcal int, total_protein_g int, total_carbs_g int, total_fat_g int
);

create table nutrition_meals (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references nutrition_plan_days(id) on delete cascade,
  meal_index int not null, meal_type text not null, name text not null,
  kcal int, protein_g int, carbs_g int, fat_g int
);

create table nutrition_meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references nutrition_meals(id) on delete cascade,
  food_name text not null, amount_g int,
  kcal int, protein_g int, carbs_g int, fat_g int
);

alter table nutrition_plans enable row level security;
alter table nutrition_plan_days enable row level security;
alter table nutrition_meals enable row level security;
alter table nutrition_meal_items enable row level security;

create policy "own plans" on nutrition_plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own days" on nutrition_plan_days
  for all using (exists (select 1 from nutrition_plans p where p.id = plan_id and p.user_id = auth.uid()));
create policy "own meals" on nutrition_meals
  for all using (exists (
    select 1 from nutrition_plan_days d join nutrition_plans p on p.id = d.plan_id
    where d.id = day_id and p.user_id = auth.uid()));
create policy "own items" on nutrition_meal_items
  for all using (exists (
    select 1 from nutrition_meals m join nutrition_plan_days d on d.id = m.day_id
    join nutrition_plans p on p.id = d.plan_id
    where m.id = meal_id and p.user_id = auth.uid()));
