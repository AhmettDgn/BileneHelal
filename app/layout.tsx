/**
 * Root Layout - tum sayfalar icin ortak kabuk.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';

import './globals.css';
import { AuthNav } from '@/features/auth/components/AuthNav';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'BileneHalal - Es Zamanli Quiz Platformu',
  description: 'Gercek zamanli, cok oyunculu quiz oyunu',
  keywords: ['quiz', 'realtime', 'game', 'multiplayer'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={cn('font-sans', inter.variable)}>
      <body className="bg-slate-50 text-slate-950 antialiased">
        <div className="min-h-screen">
          <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 p-4 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <Link href="/" className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-lg shadow-slate-900/20">
                    BH
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">BileneHalal</p>
                    <p className="hidden text-xs text-slate-500 sm:block">
                      Gercek zamanli quiz platformu
                    </p>
                  </div>
                </div>
              </Link>

              <AuthNav />
            </div>
          </nav>

          <main className="mx-auto max-w-7xl p-4 sm:p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
