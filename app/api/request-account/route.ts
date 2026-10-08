import { NextResponse } from 'next/server';
import { SUPABASE_URL, authEmail } from '../../../lib/supabase-config';
import { serviceHeaders } from '../../../lib/supabase-server';

function clean(value: unknown) { return typeof value === 'string' ? value.trim() : ''; }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nombreIc = clean(body.nombre_ic);
    const rango = clean(body.rango);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!nombreIc || nombreIc.split(/\s+/).length < 2) return NextResponse.json({ error: 'Ingresa nombre y apellido.' }, { status: 400 });
    if (!rango) return NextResponse.json({ error: 'Ingresa tu rango.' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 });

    const existing = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&nombre_ic=ilike.${encodeURIComponent(nombreIc)}&limit=1`, {
      headers: serviceHeaders(), cache: 'no-store',
    });
    if (existing.ok && (await existing.json()).length) {
      return NextResponse.json({ error: 'Ya existe una solicitud o cuenta con ese nombre.' }, { status: 409 });
    }

    const createAuth = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: serviceHeaders(),
      body: JSON.stringify({ email: authEmail(nombreIc), password, email_confirm: true, user_metadata: { nombre_ic: nombreIc } }),
    });
    const authData = await createAuth.json();
    if (!createAuth.ok) {
      const message = authData.msg || authData.message || 'No se pudo crear la cuenta.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: { ...serviceHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify({ id: authData.id, nombre_ic: nombreIc, rango, estado: 'pendiente', rol: 'miembro' }),
    });

    if (!profileResponse.ok) {
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${authData.id}`, { method: 'DELETE', headers: serviceHeaders() });
      return NextResponse.json({ error: 'La cuenta se creó pero no pudo registrarse la solicitud. No se guardó la cuenta.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Solicitud enviada. Queda pendiente de aprobación por la administración de LSFD.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error inesperado.' }, { status: 500 });
  }
}
