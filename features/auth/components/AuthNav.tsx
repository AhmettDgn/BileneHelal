/**
 * Auth Kingdom - AuthNav
 * Navbar icin oturum farkindalikli auth kontrollerini gosterir.
 */

'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { createBrowserClient } from '@/lib/supabase/client';

export interface AuthNavUser {
  email: string | null;
  displayName: string;
}

interface AuthNavProps {
  initialUser: AuthNavUser | null;
}

const mapUser = (user: User | null): AuthNavUser | null => {
  if (!user) return null;

  const meta = user.user_metadata;
  // E-posta kayıt: display_name | Google kayıt: full_name / name | fallback: email prefix
  const displayName =
    (typeof meta?.display_name === 'string' && meta.display_name) ||
    (typeof meta?.full_name === 'string' && meta.full_name) ||
    (typeof meta?.name === 'string' && meta.name) ||
    user.email?.split('@')[0] ||
    'Kullanici';

  return {
    email: user.email ?? null,
    displayName,
  };
};

export function AuthNav({ initialUser }: AuthNavProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState<AuthNavUser | null>(initialUser);

  useEffect(() => {
    const supabase = createBrowserClient();

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(mapUser(data.session?.user ?? null));
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user ?? null));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = () => {
    startTransition(async () => {
      const supabase = createBrowserClient();
      // Browser client signOut: hem cookie'yi temizler hem onAuthStateChange(SIGNED_OUT) ateşler
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    });
  };

  if (!user) {
    return (
      <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-row">
        <ThemeToggle />
        <Button asChild variant="ghost" className="w-full text-foreground/80 hover:bg-primary/10 hover:text-primary sm:w-auto">
          <Link href="/login">Giris Yap</Link>
        </Button>
        <Button asChild className="neon-cyan w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
          <Link href="/register">Kayit Ol</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
      <div className="min-w-0 sm:text-right">
        <p className="truncate text-sm font-medium text-foreground">{user.displayName}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-row">
        <ThemeToggle />
        <Button asChild variant="outline" className="w-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 sm:w-auto">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full text-foreground/70 hover:bg-destructive/10 hover:text-destructive sm:w-auto"
          onClick={handleSignOut}
          disabled={isPending}
        >
          {isPending ? 'Cikis yapiliyor...' : 'Cikis Yap'}
        </Button>
      </div>
    </div>
  );
}
