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
import { signOut } from '@/features/auth/actions';
import { createBrowserClient } from '@/lib/supabase/client';

export interface AuthNavUser {
  email: string | null;
  displayName: string;
}

interface AuthNavProps {
  initialUser: AuthNavUser | null;
}

const mapUser = (user: User | null): AuthNavUser | null => {
  if (!user) {
    return null;
  }

  return {
    email: user.email ?? null,
    displayName:
      typeof user.user_metadata?.display_name === 'string'
        ? user.user_metadata.display_name
        : user.email ?? 'Kullanici',
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
      await signOut();
      router.push('/');
      router.refresh();
    });
  };

  if (!user) {
    return (
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button asChild variant="ghost" className="w-full text-slate-200 hover:bg-cyan-400/10 hover:text-cyan-200 sm:w-auto">
          <Link href="/login">Giris Yap</Link>
        </Button>
        <Button asChild className="neon-cyan w-full sm:w-auto">
          <Link href="/register">Kayit Ol</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
      <div className="min-w-0 sm:text-right">
        <p className="truncate text-sm font-medium text-slate-100">{user.displayName}</p>
        <p className="truncate text-xs text-slate-400">{user.email}</p>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button asChild variant="outline" className="w-full border-cyan-300/20 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10 hover:text-cyan-50 sm:w-auto">
          <Link href="/dashboard">Dashboard</Link>
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full text-slate-200 hover:bg-fuchsia-400/10 hover:text-fuchsia-200 sm:w-auto"
          onClick={handleSignOut}
          disabled={isPending}
        >
          {isPending ? 'Cikis yapiliyor...' : 'Cikis Yap'}
        </Button>
      </div>
    </div>
  );
}
