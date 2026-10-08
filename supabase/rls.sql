-- La estructura principal ya fue creada en el SQL inicial.
-- Estas políticas adicionales aseguran que un miembro solo pueda
-- consultar su propio perfil y presentar quejas si está aprobado.

alter table public.profiles enable row level security;
alter table public.quejas enable row level security;

-- Si se ejecuta más de una vez, borrar las políticas existentes antes.
drop policy if exists "Usuarios pueden ver su propio perfil" on public.profiles;
drop policy if exists "Usuarios pueden ver sus propias quejas" on public.quejas;
drop policy if exists "Usuarios aprobados pueden presentar quejas" on public.quejas;

create policy "Usuarios pueden ver su propio perfil"
on public.profiles for select to authenticated
using (auth.uid() = id);

create policy "Usuarios pueden ver sus propias quejas"
on public.quejas for select to authenticated
using (auth.uid() = usuario_id);

create policy "Usuarios aprobados pueden presentar quejas"
on public.quejas for insert to authenticated
with check (
  auth.uid() = usuario_id
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.estado = 'aprobado'
  )
);
