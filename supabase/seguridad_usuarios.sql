-- Ejecutar una sola vez en Supabase > SQL Editor.
create table if not exists public.perfiles(
 id uuid primary key references auth.users(id) on delete cascade,
 email text not null, rol text not null default 'Capturista',
 permisos text[] not null default array['ver','crear']::text[],
 es_admin boolean not null default false, creado_en timestamptz not null default now()
);
create table if not exists public.destinatarios_alerta(
 id uuid primary key default gen_random_uuid(), canal text not null check(canal in('email','whatsapp')),
 destinatario text not null, activo boolean not null default true, creado_en timestamptz not null default now(),
 unique(canal,destinatario)
);
alter table public.compras add column if not exists creado_por uuid references auth.users(id);
create or replace function public.es_administrador() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.perfiles where id=(select auth.uid()) and es_admin=true)
$$;
revoke all on function public.es_administrador() from public;
grant execute on function public.es_administrador() to authenticated;
create or replace function public.tiene_permiso(p text) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.perfiles where id=(select auth.uid()) and (es_admin=true or p=any(permisos)))
$$;
revoke all on function public.tiene_permiso(text) from public;
grant execute on function public.tiene_permiso(text) to authenticated;
alter table public.perfiles enable row level security;
alter table public.destinatarios_alerta enable row level security;
drop policy if exists perfiles_lectura on public.perfiles;
create policy perfiles_lectura on public.perfiles for select to authenticated using(id=(select auth.uid()) or (select public.es_administrador()));
drop policy if exists perfiles_admin_actualiza on public.perfiles;
create policy perfiles_admin_actualiza on public.perfiles for update to authenticated using((select public.es_administrador())) with check((select public.es_administrador()));
drop policy if exists alertas_admin on public.destinatarios_alerta;
create policy alertas_admin on public.destinatarios_alerta for all to authenticated using((select public.es_administrador())) with check((select public.es_administrador()));
grant select,update on public.perfiles to authenticated;
grant select,insert,update,delete on public.destinatarios_alerta to authenticated;
drop policy if exists "usuarios autenticados administran compras" on public.compras;
drop policy if exists compras_ver on public.compras;
drop policy if exists compras_crear on public.compras;
drop policy if exists compras_editar on public.compras;
drop policy if exists compras_eliminar on public.compras;
create policy compras_ver on public.compras for select to authenticated using((select public.tiene_permiso('ver')));
create policy compras_crear on public.compras for insert to authenticated with check((select public.tiene_permiso('crear')) and creado_por=(select auth.uid()));
create policy compras_editar on public.compras for update to authenticated using((select public.tiene_permiso('editar'))) with check((select public.tiene_permiso('editar')));
create policy compras_eliminar on public.compras for delete to authenticated using((select public.tiene_permiso('eliminar')));
insert into public.perfiles(id,email,rol,permisos,es_admin)
select id,email,'Administrador',array['ver','crear','editar','eliminar','importar','configurar'],true from auth.users
where id=(select id from auth.users order by created_at limit 1)
on conflict(id) do update set es_admin=true,rol='Administrador',permisos=excluded.permisos;
insert into public.destinatarios_alerta(canal,destinatario) values
('email','marino.martinez@outlook.com'),('whatsapp','529931608855') on conflict do nothing;
