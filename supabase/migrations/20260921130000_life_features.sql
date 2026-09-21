alter table public.markers drop constraint markers_color_check;
alter table public.markers add constraint markers_color_check check (color ~ '^#[0-9A-Fa-f]{6}$');

alter table public.profiles
  add column first_name text not null default '',
  add column last_name text not null default '';

create table public.daily_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  entry_date date not null,
  mood smallint check (mood between 1 and 5),
  energy smallint check (energy between 1 and 5),
  prompt_answer text not null default '',
  updated_at timestamptz not null default now(),
  unique(user_id, entry_date)
);

create table public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  entry_date date not null,
  title text not null check (char_length(trim(title)) between 1 and 160),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index daily_tasks_user_date_idx on public.daily_tasks(user_id, entry_date);
alter table public.daily_reflections enable row level security;
alter table public.daily_tasks enable row level security;

create policy "reflections own read" on public.daily_reflections for select using ((select auth.uid()) = user_id);
create policy "reflections editable write" on public.daily_reflections for all
  using (
    (select auth.uid()) = user_id
    and public.entry_is_editable(entry_date, coalesce((select time_zone from public.profiles where id = auth.uid()), 'UTC'))
  )
  with check (
    (select auth.uid()) = user_id
    and public.entry_is_editable(entry_date, coalesce((select time_zone from public.profiles where id = auth.uid()), 'UTC'))
  );

create policy "tasks own read" on public.daily_tasks for select using ((select auth.uid()) = user_id);
create policy "tasks editable write" on public.daily_tasks for all
  using (
    (select auth.uid()) = user_id
    and public.entry_is_editable(entry_date, coalesce((select time_zone from public.profiles where id = auth.uid()), 'UTC'))
  )
  with check (
    (select auth.uid()) = user_id
    and public.entry_is_editable(entry_date, coalesce((select time_zone from public.profiles where id = auth.uid()), 'UTC'))
  );

create function public.touch_life_record() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger daily_reflections_touch before update on public.daily_reflections for each row execute procedure public.touch_life_record();
create trigger daily_tasks_touch before update on public.daily_tasks for each row execute procedure public.touch_life_record();
