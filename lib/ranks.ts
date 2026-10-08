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

export type LsfdRank = (typeof LSFD_RANKS)[number];

export function isLsfdRank(value: unknown): value is LsfdRank {
  return typeof value === 'string' && (LSFD_RANKS as readonly string[]).includes(value);
}
