import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, authEmail, requireSupabaseConfig } from './supabase-config';

const SESSION_KEY = 'lsfd-auth-session';

export type LsfdProfile = {
  id: string;
  nombre_ic: string;
  rango: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  rol: 'miembro' | 'psd' | 'admin';
  created_at: string;
};

export const LSFD_RANKS = [
  'Probationary Firefighter',
  'Firefighter I',
  'Firefighter II',
  'Firefighter III',
  'Paramedic In Charge',
  'Fire Engineer',
  'Apparatus Operator',
  'Fire Captain I',
  'Fire Captain II',
  'Batallion Chief',
  'Assistant Chief',
  'Deputy Chief',
  'Chief Deputy',
  'Fire Chief',
] as const;

export type LsfdSession = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: { id: string };
  profile: LsfdProfile;
};

function headers(token?: string) {
  requireSupabaseConfig();
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${token || SUPABASE_PUBLISHABLE_KEY}`,
    'Content-Type': 'application/json',
  };
}

export function getSession(): LsfdSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: LsfdSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export async function login(nombreIc: string, password: string) {
  requireSupabaseConfig();
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email: authEmail(nombreIc), password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.msg || 'Nombre o contraseña incorrectos.');

  const profileResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=id,nombre_ic,rango,estado,rol,created_at&id=eq.${encodeURIComponent(data.user.id)}&limit=1`,
    { headers: headers(data.access_token) }
  );
  const profiles = await profileResponse.json();
  if (!profileResponse.ok || !profiles[0]) {
    throw new Error('La cuenta existe, pero todavía no tiene un perfil LSFD asociado.');
  }

  const profile = profiles[0] as LsfdProfile;
  if (profile.estado !== 'aprobado') {
    clearSession();
    const message = profile.estado === 'pendiente'
      ? 'Tu solicitud todavía está pendiente de aprobación.'
      : 'Tu solicitud de acceso fue rechazada.';
    throw new Error(message);
  }

  const session: LsfdSession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    user: { id: data.user.id },
    profile,
  };
  saveSession(session);
  return session;
}

export async function requestAccount(nombreIc: string, rango: string, password: string) {
  const response = await fetch('/api/request-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre_ic: nombreIc, rango, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo enviar la solicitud.');
  return data;
}

export async function createComplaint(payload: {
  persona_denunciada: string;
  motivo: string;
  descripcion: string;
  fecha_hecho?: string;
  links?: string[];
}) {
  const session = getSession();
  if (!session) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.');
  const response = await fetch('/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo presentar la queja.');
  return data;
}

export async function getMyComplaints() {
  const session = getSession();
  if (!session) return [];
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/quejas?select=id,persona_denunciada,motivo,descripcion,fecha_hecho,estado,respuesta_psd,created_at,updated_at&usuario_id=eq.${encodeURIComponent(session.profile.id)}&order=created_at.desc`,
    { headers: headers(session.access_token), cache: 'no-store' }
  );
  if (!response.ok) throw new Error('No se pudieron cargar tus quejas.');
  return response.json();
}

export async function adminRequest(path: string, method: 'GET' | 'POST', body?: unknown) {
  const session = getSession();
  if (!session || !['admin', 'psd'].includes(session.profile.rol)) throw new Error('No autorizado.');
  const response = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo completar la operación.');
  return data;
}
