import { NextResponse } from 'next/server';
import { SUPABASE_URL } from '../../../lib/supabase-config';
import { getAuthenticatedUser, getProfile, serviceHeaders } from '../../../lib/supabase-server';

function clean(value: unknown) { return typeof value === 'string' ? value.trim() : ''; }
function validUrl(value: string) {
  try { const u = new URL(value); return u.protocol === 'https:'; } catch { return false; }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
    const user = await getAuthenticatedUser(token);
    if (!user?.id) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
    const profile = await getProfile(user.id);
    if (!profile || profile.estado !== 'aprobado') return NextResponse.json({ error: 'Tu cuenta todavía no está aprobada.' }, { status: 403 });

    const body = await request.json();
    const persona = clean(body.persona_denunciada);
    const motivo = clean(body.motivo);
    const descripcion = clean(body.descripcion);
    const fecha = clean(body.fecha_hecho);
    const links = Array.isArray(body.links) ? body.links.map(clean).filter(Boolean) : [];

    if (!persona || !motivo || !descripcion) return NextResponse.json({ error: 'Completa todos los campos obligatorios.' }, { status: 400 });
    if (links.length > 10) return NextResponse.json({ error: 'Puedes agregar un máximo de 10 enlaces de evidencia.' }, { status: 400 });
    if (links.some((url: string) => !validUrl(url))) return NextResponse.json({ error: 'Los enlaces de evidencia deben ser URL válidas con HTTPS.' }, { status: 400 });

    const complaintResponse = await fetch(`${SUPABASE_URL}/rest/v1/quejas`, {
      method: 'POST', headers: { ...serviceHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify({ usuario_id: user.id, persona_denunciada: persona, motivo, descripcion, fecha_hecho: fecha || null }),
    });
    const complaintData = await complaintResponse.json();
    if (!complaintResponse.ok || !complaintData?.[0]?.id) return NextResponse.json({ error: 'No se pudo registrar la queja.' }, { status: 500 });
    const complaintId = complaintData[0].id;

    if (links.length) {
      const rows = links.map((url: string) => ({ queja_id: complaintId, tipo: 'enlace', url }));
      const evidenceResponse = await fetch(`${SUPABASE_URL}/rest/v1/queja_evidencias`, {
        method: 'POST', headers: { ...serviceHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify(rows),
      });
      if (!evidenceResponse.ok) return NextResponse.json({ error: 'La queja fue registrada, pero no se pudieron guardar todos los enlaces.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: complaintId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error inesperado.' }, { status: 500 });
  }
}
