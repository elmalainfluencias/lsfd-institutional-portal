-- USAR UNA SOLA VEZ PARA CONVERTIR TU CUENTA EN ADMINISTRADOR.
-- Reemplazá SOLO 'TU NOMBRE IC' por tu Nombre IC exacto.
-- Ejecutalo DESPUÉS de solicitar tu cuenta desde el portal.

update public.profiles
set estado = 'aprobado',
    rol = 'admin'
where lower(nombre_ic) = lower('TU NOMBRE IC');
