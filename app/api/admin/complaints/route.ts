import { NextResponse } from 'next/server';
import { requireRole, serviceHeaders } from '../../../../lib/supabase-server';
import { SUPABASE_URL } from '../../../../lib/supabase-config';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const auth = await requireRole(token, ['admin', 'psd']);
    if (!auth) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/quejas?select=*,profiles(nombre_ic,rango)&order=created_at.desc`, { headers: serviceHeaders(), cache: 'no-store' });
    const data = await response.json();
    return NextResponse.json(data, { status: response.ok ? 200 : 500 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error inesperado.' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const auth = await requireRole(token, ['admin', 'psd']);
    if (!auth) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    const { id, estado, respuesta_psd } = await request.json();
    if (!id) return NextResponse.json({ error: 'Falta la queja.' }, { status: 400 });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/quejas?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { ...serviceHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify({ estado, respuesta_psd: respuesta_psd ?? null, updated_at: new Date().toISOString() }) });
    if (!response.ok) return NextResponse.json({ error: 'No se pudo actualizar la queja.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error inesperado.' }, { status: 500 }); }
}
