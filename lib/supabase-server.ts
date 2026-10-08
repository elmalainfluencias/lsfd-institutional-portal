import { SUPABASE_URL } from './supabase-config';

export function serviceHeaders() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!SUPABASE_URL || !secret) throw new Error('Falta la configuración privada de Supabase en Vercel.');
  return {
    apikey: secret,
    Authorization: `Bearer ${secret}`,
    'Content-Type': 'application/json',
  };
}

export async function getAuthenticatedUser(accessToken: string) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return response.json();
}

export async function getProfile(userId: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(userId)}&limit=1`, {
    headers: serviceHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data[0] || null;
}

export async function requireRole(accessToken: string, roles: string[]) {
  const user = await getAuthenticatedUser(accessToken);
  if (!user?.id) return null;
  const profile = await getProfile(user.id);
  if (!profile || !roles.includes(profile.rol) || profile.estado !== 'aprobado') return null;
  return { user, profile };
}
