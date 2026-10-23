-- dwine1.xyz Files: paste all of this into Supabase > SQL Editor > New query, then press Run. Running it again is safe.
-- Files are encrypted in the browser before they are sent, so this table only ever holds scrambled pieces.
-- Each file is stored in pieces of about half a MB under a random 64 character id that only your synced file list knows.

create table if not exists public.dwine1_file_parts (
  id text not null check (char_length(id) = 64),
  n int not null check (n >= 0 and n < 100),
  data text not null check (char_length(data) <= 1500000),
  created_at timestamptz not null default now(),
  primary key (id, n)
);

-- Lock the table itself: with the public key nobody can list or read rows directly.
alter table public.dwine1_file_parts enable row level security;
revoke all on public.dwine1_file_parts from anon, authenticated;

-- The page can save, fetch or delete the pieces of one file, and only if it knows that file's id.
create or replace function public.dwine1_file_put(p_id text, p_n int, p_data text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if char_length(p_id) <> 64 then raise exception 'bad id'; end if;
  insert into public.dwine1_file_parts (id, n, data) values (p_id, p_n, p_data)
  on conflict (id, n) do update set data = excluded.data, created_at = now();
end $$;

create or replace function public.dwine1_file_get(p_id text, p_n int)
returns text
language sql security definer set search_path = public as $$
  select data from public.dwine1_file_parts where id = p_id and n = p_n;
$$;

create or replace function public.dwine1_file_delete(p_id text)
returns int
language sql security definer set search_path = public as $$
  with d as (delete from public.dwine1_file_parts where id = p_id returning 1) select count(*)::int from d;
$$;

-- How full the free database is (in bytes), shown on the page.
create or replace function public.dwine1_db_size()
returns bigint
language sql security definer set search_path = public as $$
  select pg_database_size(current_database());
$$;

grant execute on function public.dwine1_file_put(text, int, text) to anon;
grant execute on function public.dwine1_file_get(text, int) to anon;
grant execute on function public.dwine1_file_delete(text) to anon;
grant execute on function public.dwine1_db_size() to anon;
