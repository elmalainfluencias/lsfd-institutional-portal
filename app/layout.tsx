import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LSFD | Portal Institucional',
  description: 'Portal normativo y disciplinario del Los Santos Fire Department.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
