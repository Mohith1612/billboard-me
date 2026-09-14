\set ON_ERROR_STOP on

begin;

do $$
declare
  table_name text;
  client_role text;
  operation text;
begin
  foreach table_name in array array['brand_waitlist', 'seller_waitlist']
  loop
    if not (
      select c.relrowsecurity
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = table_name
    ) then
      raise exception 'RLS is not enabled on public.%', table_name;
    end if;

    if exists (
      select 1
      from pg_catalog.pg_policies
      where schemaname = 'public' and tablename = table_name
    ) then
      raise exception 'public.% must not have a client access policy', table_name;
    end if;

    foreach client_role in array array['anon', 'authenticated']
    loop
      foreach operation in array array['SELECT', 'INSERT', 'UPDATE', 'DELETE']
      loop
        if has_table_privilege(client_role, format('public.%I', table_name), operation) then
          raise exception '% unexpectedly has % on public.%', client_role, operation, table_name;
        end if;
      end loop;
    end loop;
  end loop;

  if not exists (
    select 1 from pg_catalog.pg_roles
    where rolname = 'waitlist_server' and rolbypassrls
  ) then
    raise exception 'waitlist_server must be the disposable BYPASSRLS server role';
  end if;
end
$$;

set local role anon;
do $$
begin
  perform * from public.seller_waitlist;
  raise exception 'anon SELECT unexpectedly succeeded';
exception
  when insufficient_privilege then null;
end
$$;
reset role;

set local role authenticated;
do $$
begin
  insert into public.brand_waitlist (company_name, contact_email)
  values ('blocked brand', 'blocked-brand@example.test');
  raise exception 'authenticated INSERT unexpectedly succeeded';
exception
  when insufficient_privilege then null;
end
$$;
reset role;

set local role waitlist_server;
insert into public.seller_waitlist (name, email)
values ('Foundation seller', 'foundation-seller@example.test');
insert into public.brand_waitlist (company_name, contact_email)
values ('Foundation brand', 'foundation-brand@example.test');
reset role;

do $$
begin
  if not exists (
    select 1 from public.seller_waitlist
    where email = 'foundation-seller@example.test'
  ) then
    raise exception 'server seller insert was not persisted';
  end if;

  if not exists (
    select 1 from public.brand_waitlist
    where contact_email = 'foundation-brand@example.test'
  ) then
    raise exception 'server brand insert was not persisted';
  end if;
end
$$;

rollback;

\echo 'waitlist role access assertions passed'
