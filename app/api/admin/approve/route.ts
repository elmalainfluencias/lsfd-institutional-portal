import { NextResponse } from 'next/server';
import { requireRole, serviceHeaders } from '../../../../lib/supabase-server';
import { SUPABASE_URL } from '../../../../lib/supabase-config';
import { isLsfdRank } from '../../../../lib/ranks';

async function change(request: Request, estado: 'aprobado' | 'rechazado') {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const auth = await requireRole(token, ['admin']);
  if (!auth) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  const { id, rango } = await request.json();
  if (!id) return NextResponse.json({ error: 'Falta el usuario.' }, { status: 400 });
  if (!rango) return NextResponse.json({ error: 'Falta el rango.' }, { status: 400 });
  if (!isLsfdRank(rango)) return NextResponse.json({ error: 'Rango no válido.' }, { status: 400 });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH', headers: { ...serviceHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify({ estado, rango }),
  });
  if (!response.ok) return NextResponse.json({ error: 'No se pudo actualizar la solicitud.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
export async function POST(request: Request) { return change(request, 'aprobado'); }
