import { NextResponse } from 'next/server';
import { requireRole } from '../../../../lib/supabase-server';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const auth = await requireRole(token, ['admin', 'psd']);
  if (!auth) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  return NextResponse.json(auth.profile);
}
