import { NextResponse } from 'next/server';
import { requireRole, serviceHeaders } from '../../../../lib/supabase-server';
import { SUPABASE_URL } from '../../../../lib/supabase-config';
import { LSFD_RANKS, isLsfdRank } from '../../../../lib/ranks';

// Única cuenta propietaria autorizada para delegar o retirar permisos.
const PORTAL_OWNER_ID = 'e3da3ae4-08b9-4427-b30d-07d11e5106a0';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const auth = await requireRole(token, ['admin']);
    if (!auth) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,nombre_ic,rango,estado,rol,created_at&order=nombre_ic.asc`, { headers: serviceHeaders(), cache: 'no-store' });
    const data = await response.json();
    return NextResponse.json({ members: data, ranks: LSFD_RANKS }, { status: response.ok ? 200 : 500 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error inesperado.' }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const auth = await requireRole(token, ['admin']);
    if (!auth) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    const body = await request.json();
    const { id, rango, rol } = body;
    if (!id) return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 });

    // La modificación de rangos sigue disponible para administradores.
    if (rol !== undefined) {
      // Solo la cuenta propietaria puede administrar roles, incluso mediante llamadas directas a la API.
      if (auth.user.id !== PORTAL_OWNER_ID) {
        return NextResponse.json({ error: 'Solo el administrador principal puede modificar permisos.' }, { status: 403 });
      }
      if (id === PORTAL_OWNER_ID) {
        return NextResponse.json({ error: 'No puedes modificar los permisos de la cuenta propietaria.' }, { status: 400 });
      }
      if (!['miembro', 'psd', 'admin'].includes(rol)) {
        return NextResponse.json({ error: 'Permiso no válido.' }, { status: 400 });
      }
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH', headers: { ...serviceHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify({ rol }), cache: 'no-store'
      });
      if (!response.ok) return NextResponse.json({ error: 'No se pudieron actualizar los permisos.' }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (!rango) return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 });
    if (!isLsfdRank(rango)) return NextResponse.json({ error: 'Rango no válido.' }, { status: 400 });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { ...serviceHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify({ rango }), cache: 'no-store' });
    if (!response.ok) return NextResponse.json({ error: 'No se pudo actualizar el rango.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error inesperado.' }, { status: 500 }); }
}
