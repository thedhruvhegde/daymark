create table public.markers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 40),
  color text not null check (color in ('#ef8f8b', '#f4b860', '#e7d769', '#b8d978', '#73cdb4', '#7eb9e7', '#a997e5', '#dc92bd')),
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

create table public.entry_markers (
  entry_id uuid not null references public.journal_entries on delete cascade,
  marker_id uuid not null references public.markers on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key (entry_id, marker_id)
);

create index entry_markers_user_id_idx on public.entry_markers(user_id);
create index entry_markers_entry_id_idx on public.entry_markers(entry_id);

alter table public.markers enable row level security;
alter table public.entry_markers enable row level security;

create policy "markers own access" on public.markers for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "entry markers own read" on public.entry_markers for select
  using ((select auth.uid()) = user_id);

create policy "entry markers editable insert" on public.entry_markers for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.journal_entries e
      join public.profiles p on p.id = e.user_id
      join public.markers m on m.id = marker_id
      where e.id = entry_id
        and e.user_id = auth.uid()
        and m.user_id = auth.uid()
        and public.entry_is_editable(e.entry_date, p.time_zone)
    )
  );

create policy "entry markers editable delete" on public.entry_markers for delete
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.journal_entries e
      join public.profiles p on p.id = e.user_id
      where e.id = entry_id
        and e.user_id = auth.uid()
        and public.entry_is_editable(e.entry_date, p.time_zone)
    )
  );

alter publication supabase_realtime add table public.entry_markers;
