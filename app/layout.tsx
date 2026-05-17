/**
 * Root Layout - tum sayfalar icin ortak kabuk.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';

import './globals.css';
import { AuthNav } from '@/features/auth/components/AuthNav';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
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

  const meta = user?.user_metadata;
  const initialUser = user
    ? {
        email: user.email ?? null,
        displayName:
          (typeof meta?.display_name === 'string' && meta.display_name) ||
          (typeof meta?.full_name === 'string' && meta.full_name) ||
          (typeof meta?.name === 'string' && meta.name) ||
          user.email?.split('@')[0] ||
          'Kullanici',
      }
    : null;

  return (
    <html lang="tr" className={cn('font-sans', inter.variable)} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider>
          <div className="min-h-screen">
            <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 px-3 py-3 backdrop-blur-2xl sm:px-4 sm:py-4">
              <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 sm:gap-4">
                <Link href="/" className="min-w-0 flex-1 sm:flex-none">
                  <div className="flex items-center gap-3">
                    <div className="neon-cyan flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-sm font-bold text-primary sm:h-11 sm:w-11">
                      BH
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-foreground sm:text-lg">
                        BileneHalal
                      </p>
                    </div>
                  </div>
                </Link>

                <AuthNav initialUser={initialUser} />
              </div>
            </nav>

            <main className="mx-auto max-w-7xl px-3 py-4 sm:p-6">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
