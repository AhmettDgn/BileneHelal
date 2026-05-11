/**
 * Root Layout - tum sayfalar icin ortak kabuk.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';

import './globals.css';
import { AuthNav } from '@/features/auth/components/AuthNav';
import { createServerClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'BileneHalal - Es Zamanli Quiz Platformu',
  description: 'Gercek zamanli, cok oyunculu quiz oyunu',
  keywords: ['quiz', 'realtime', 'game', 'multiplayer'],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialUser = user
    ? {
        email: user.email ?? null,
        displayName:
          typeof user.user_metadata?.display_name === 'string'
            ? user.user_metadata.display_name
            : user.email ?? 'Kullanici',
      }
    : null;

  return (
    <html lang="tr" className={cn('font-sans dark', inter.variable)}>
      <body className="bg-background text-foreground antialiased">
        <div className="min-h-screen">
          <nav className="sticky top-0 z-40 border-b border-cyan-300/10 bg-slate-950/70 px-3 py-3 backdrop-blur-2xl sm:px-4 sm:py-4">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 sm:gap-4">
              <Link href="/" className="min-w-0 flex-1 sm:flex-none">
                <div className="flex items-center gap-3">
                  <div className="neon-cyan flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-sm font-bold text-cyan-200 sm:h-11 sm:w-11">
                    BH
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-white sm:text-lg">
                      BileneHalal
                    </p>
                    <p className="hidden text-xs text-slate-400 md:block">
                      60% deep base, 30% glass depth, 10% neon focus
                    </p>
                  </div>
                </div>
              </Link>

              <AuthNav initialUser={initialUser} />
            </div>
          </nav>

          <main className="mx-auto max-w-7xl px-3 py-4 sm:p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
