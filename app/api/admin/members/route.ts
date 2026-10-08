import { NextResponse } from 'next/server';
import { requireRole, serviceHeaders } from '../../../../lib/supabase-server';
import { SUPABASE_URL } from '../../../../lib/supabase-config';

const RANKS = ['Probationary Firefighter','Firefighter I','Firefighter II','Firefighter III','Paramedic In Charge','Fire Engineer','Apparatus Operator','Fire Captain I','Fire Captain II','Batallion Chief','Assistant Chief','Deputy Chief','Chief Deputy','Fire Chief'];

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const auth = await requireRole(token, ['admin']);
    if (!auth) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,nombre_ic,rango,estado,rol,created_at&order=nombre_ic.asc`, { headers: serviceHeaders(), cache: 'no-store' });
    const data = await response.json();
    return NextResponse.json({ members: data, ranks: RANKS }, { status: response.ok ? 200 : 500 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error inesperado.' }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const auth = await requireRole(token, ['admin']);
    if (!auth) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    const { id, rango } = await request.json();
    if (!id || !rango) return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 });
    if (!RANKS.includes(rango)) return NextResponse.json({ error: 'Rango no válido.' }, { status: 400 });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { ...serviceHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify({ rango }) });
    if (!response.ok) return NextResponse.json({ error: 'No se pudo actualizar el rango.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error inesperado.' }, { status: 500 }); }
}
