import { NextResponse } from 'next/server';
import { SUPABASE_URL } from '../../../../lib/supabase-config';
import { getAuthenticatedUser, getProfile, serviceHeaders } from '../../../../lib/supabase-server';

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
    const user = await getAuthenticatedUser(token);
    if (!user?.id) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
    const profile = await getProfile(user.id);
    if (!profile || profile.estado !== 'aprobado') return NextResponse.json({ error: 'Tu cuenta todavía no está aprobada.' }, { status: 403 });

    const form = await request.formData();
    const complaintId = String(form.get('queja_id') || '').trim();
    const file = form.get('file');
    if (!complaintId || !(file instanceof File)) return NextResponse.json({ error: 'Faltan datos de la evidencia.' }, { status: 400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: 'Solo se permiten imágenes JPG, PNG o WEBP.' }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'Cada imagen puede pesar como máximo 8 MB.' }, { status: 400 });

    const check = await fetch(`${SUPABASE_URL}/rest/v1/quejas?select=id&id=eq.${encodeURIComponent(complaintId)}&usuario_id=eq.${encodeURIComponent(user.id)}&limit=1`, { headers: serviceHeaders(), cache: 'no-store' });
    const rows = await check.json();
    if (!check.ok || !rows.length) return NextResponse.json({ error: 'No puedes adjuntar evidencia a esta queja.' }, { status: 403 });

    const ext = file.name.split('.').pop()?.toLowerCase() || (file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg');
    const safeName = `${crypto.randomUUID()}.${ext}`;
    const path = `${user.id}/${complaintId}/${safeName}`;
    const upload = await fetch(`${SUPABASE_URL}/storage/v1/object/quejas-evidencia/${path}`, {
      method: 'POST', headers: { ...serviceHeaders(), 'Content-Type': file.type, 'x-upsert': 'false' }, body: await file.arrayBuffer(),
    });
    if (!upload.ok) return NextResponse.json({ error: 'No se pudo guardar la imagen.' }, { status: 500 });

    const evidence = await fetch(`${SUPABASE_URL}/rest/v1/queja_evidencias`, {
      method: 'POST', headers: { ...serviceHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify({ queja_id: complaintId, tipo: 'imagen', nombre_archivo: file.name.slice(0, 200), storage_path: path }),
    });
    if (!evidence.ok) {
      await fetch(`${SUPABASE_URL}/storage/v1/object/quejas-evidencia/${path}`, { method: 'DELETE', headers: serviceHeaders() });
      return NextResponse.json({ error: 'La imagen se subió, pero no pudo asociarse a la queja.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error inesperado.' }, { status: 500 });
  }
}
