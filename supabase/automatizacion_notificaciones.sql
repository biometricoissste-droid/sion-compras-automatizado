-- Ejecuta este archivo DESPUÉS de schema.sql en Supabase > SQL Editor.
alter table public.compras
  add column if not exists proveedor text,
  add column if not exists recurrente boolean not null default false,
  add column if not exists frecuencia text check (frecuencia in ('semanal','quincenal','mensual')),
  add column if not exists proximo_aviso date,
  add column if not exists creado_por uuid references auth.users(id);

create table if not exists public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  compra_id uuid references public.compras(id) on delete cascade,
  canal text not null check (canal in ('web','email','whatsapp')),
  destinatario text,
  titulo text not null,
  mensaje text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente','enviado','error')),
  creado_en timestamptz not null default now(),
  enviado_en timestamptz
);

alter table public.notificaciones enable row level security;
drop policy if exists "usuarios autenticados ven notificaciones" on public.notificaciones;
create policy "usuarios autenticados ven notificaciones" on public.notificaciones
for all to authenticated using (true) with check (true);
grant select, insert, update, delete on public.notificaciones to authenticated;

create or replace function public.crear_aviso_compra()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  insert into public.notificaciones(compra_id, canal, titulo, mensaje)
  values (new.id, 'web', 'Nueva compra registrada', new.articulo || ' · $' || coalesce(new.precio,0)::text);
  return new;
end;
$$;

drop trigger if exists aviso_nueva_compra on public.compras;
create trigger aviso_nueva_compra after insert on public.compras
for each row execute function public.crear_aviso_compra();
