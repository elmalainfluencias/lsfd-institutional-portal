-- Evidencia de quejas: imágenes privadas y enlaces externos.
create table if not exists public.queja_evidencias (
  id uuid primary key default gen_random_uuid(),
  queja_id uuid not null references public.quejas(id) on delete cascade,
  tipo text not null check (tipo in ('imagen','enlace')),
  nombre_archivo text,
  storage_path text,
  url text,
  created_at timestamptz not null default now()
);

alter table public.queja_evidencias enable row level security;

-- Las operaciones de la aplicación pasan por las rutas del servidor con la clave secreta.
-- Estas políticas permiten que un usuario autenticado vea únicamente evidencia de sus propias quejas.
drop policy if exists "Usuarios pueden ver evidencia de sus quejas" on public.queja_evidencias;
create policy "Usuarios pueden ver evidencia de sus quejas"
on public.queja_evidencias for select to authenticated
using (
  exists (
    select 1 from public.quejas q
    where q.id = queja_evidencias.queja_id
      and q.usuario_id = auth.uid()
  )
);

-- Bucket privado para imágenes de evidencia.
insert into storage.buckets (id, name, public)
values ('quejas-evidencia', 'quejas-evidencia', false)
on conflict (id) do update set public = false;

-- Las subidas se realizan desde el servidor con la clave secreta.
