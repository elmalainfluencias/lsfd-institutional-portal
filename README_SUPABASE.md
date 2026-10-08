# LSFD Portal + Supabase

## Variables de entorno en Vercel
- `NEXT_PUBLIC_SUPABASE_URL` = `https://wkgmsgfxvjthxmrkcudp.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = tu `sb_publishable_...`
- `SUPABASE_SECRET_KEY` = tu `sb_secret_...` (SOLO Vercel, nunca en el navegador ni GitHub)

## Primer administrador
1. Desplegar el portal.
2. Solicitar una cuenta desde el propio portal usando tu Nombre IC.
3. En Supabase > SQL Editor abrir `supabase/admin-bootstrap.sql`.
4. Reemplazar `TU NOMBRE IC` por tu Nombre IC exacto.
5. Ejecutar el SQL una sola vez.
6. Esa cuenta quedará aprobada y con rol `admin`.

Después, todas las demás cuentas se solicitan desde el portal y deben ser aprobadas desde el panel de administrador.
