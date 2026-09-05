create table if not exists public.compras (
  id uuid primary key default gen_random_uuid(), consecutivo integer, articulo text not null,
  cantidad numeric not null default 1 check (cantidad > 0), unidad text,
  precio numeric(14,2) not null default 0 check (precio >= 0), tienda text,
  fecha date not null default current_date, area text, empresa text, facturado_con text,
  facturado boolean not null default false, compro text, pago text,
  estatus text not null default 'Pendiente', creado_en timestamptz not null default now(), actualizado_en timestamptz not null default now()
);
create index if not exists compras_fecha_idx on public.compras(fecha desc);
create index if not exists compras_area_idx on public.compras(area);
alter table public.compras enable row level security;
drop policy if exists "usuarios autenticados administran compras" on public.compras;
create policy "usuarios autenticados administran compras" on public.compras for all to authenticated using (true) with check (true);
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.compras to authenticated;
