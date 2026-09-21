create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null default '',
  time_zone text not null default 'UTC',
  reminder_time time,
  created_at timestamptz not null default now()
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  entry_date date not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, entry_date)
);

create table public.journal_images (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entries on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  storage_path text not null unique,
  position smallint not null check (position >= 0),
  created_at timestamptz not null default now()
);

create table public.pairing_sessions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entries on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create function public.create_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, time_zone)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''), coalesce(new.raw_user_meta_data ->> 'time_zone', 'UTC'));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.create_profile();

create function public.entry_is_editable(p_date date, p_zone text) returns boolean
language sql stable set search_path = ''
as $$ select now() < ((p_date + 2)::timestamp at time zone p_zone) $$;

alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_images enable row level security;
alter table public.pairing_sessions enable row level security;

create policy "profiles own access" on public.profiles for all using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "entries own read" on public.journal_entries for select using ((select auth.uid()) = user_id);
create policy "entries editable insert" on public.journal_entries for insert with check (
  (select auth.uid()) = user_id
  and public.entry_is_editable(entry_date, coalesce((select time_zone from public.profiles where id = auth.uid()), 'UTC'))
);
create policy "entries editable update" on public.journal_entries for update using (
  (select auth.uid()) = user_id
  and public.entry_is_editable(entry_date, coalesce((select time_zone from public.profiles where id = auth.uid()), 'UTC'))
) with check ((select auth.uid()) = user_id);
create policy "images own read" on public.journal_images for select using ((select auth.uid()) = user_id);
create policy "images editable insert" on public.journal_images for insert with check (
  (select auth.uid()) = user_id
  and exists (select 1 from public.journal_entries e join public.profiles p on p.id = e.user_id where e.id = entry_id and public.entry_is_editable(e.entry_date, p.time_zone))
);
create policy "images editable delete" on public.journal_images for delete using (
  (select auth.uid()) = user_id
  and exists (select 1 from public.journal_entries e join public.profiles p on p.id = e.user_id where e.id = entry_id and public.entry_is_editable(e.entry_date, p.time_zone))
);
create policy "pairings own access" on public.pairing_sessions for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public) values ('journal-images', 'journal-images', false);
create policy "private uploads are own" on storage.objects for insert to authenticated with check (bucket_id = 'journal-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "private reads are own" on storage.objects for select to authenticated using (bucket_id = 'journal-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "private deletes are own" on storage.objects for delete to authenticated using (bucket_id = 'journal-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

create function public.touch_entry() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger journal_entries_touch before update on public.journal_entries for each row execute procedure public.touch_entry();

alter publication supabase_realtime add table public.journal_images;
