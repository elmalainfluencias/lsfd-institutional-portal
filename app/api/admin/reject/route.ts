import { NextResponse } from 'next/server';
import { requireRole, serviceHeaders } from '../../../../lib/supabase-server';
import { SUPABASE_URL } from '../../../../lib/supabase-config';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const auth = await requireRole(token, ['admin']);
    if (!auth) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    const { id } = await request.json();
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { ...serviceHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify({ estado: 'rechazado' }) });
    if (!response.ok) return NextResponse.json({ error: 'No se pudo rechazar la solicitud.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error inesperado.' }, { status: 500 }); }
}
