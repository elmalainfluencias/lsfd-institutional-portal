import { NextResponse } from 'next/server';
import { SUPABASE_URL } from '../../../../../lib/supabase-config';
import { getAuthenticatedUser, getProfile, serviceHeaders } from '../../../../../lib/supabase-server';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
    const user = await getAuthenticatedUser(token);
    if (!user?.id) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
    const profile = await getProfile(user.id);
    if (!profile || profile.estado !== 'aprobado') return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    const { id } = await context.params;
    const complaint = await fetch(`${SUPABASE_URL}/rest/v1/quejas?select=id,usuario_id&id=eq.${encodeURIComponent(id)}&limit=1`, { headers: serviceHeaders(), cache: 'no-store' });
    const rows = await complaint.json();
    if (!complaint.ok || !rows.length) return NextResponse.json({ error: 'Queja no encontrada.' }, { status: 404 });
    const isStaff = profile.rol === 'admin' || profile.rol === 'psd';
    if (!isStaff && rows[0].usuario_id !== user.id) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });

    const evidenceResponse = await fetch(`${SUPABASE_URL}/rest/v1/queja_evidencias?select=id,tipo,nombre_archivo,url,storage_path,created_at&queja_id=eq.${encodeURIComponent(id)}&order=created_at.asc`, { headers: serviceHeaders(), cache: 'no-store' });
    const evidence = await evidenceResponse.json();
    if (!evidenceResponse.ok) return NextResponse.json({ error: 'No se pudo cargar la evidencia.' }, { status: 500 });
    const output = await Promise.all(evidence.map(async (item: any) => {
      if (item.tipo !== 'imagen' || !item.storage_path) return item;
      const signed = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/quejas-evidencia/${item.storage_path}`, { method: 'POST', headers: { ...serviceHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresIn: 3600 }) });
      const data = await signed.json();
      return { ...item, signed_url: signed.ok && data?.signedURL ? `${SUPABASE_URL}/storage/v1${data.signedURL}` : null };
    }));
    return NextResponse.json({ evidence: output });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error inesperado.' }, { status: 500 });
  }
}
