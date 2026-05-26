import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'Rehearsal Planner',
  description: 'Ta reda på när hela bandet kan repa',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={geist.variable}>
      <body style={{ fontFamily: 'var(--font-geist), Arial, sans-serif' }}>{children}</body>
    </html>
  );
}
