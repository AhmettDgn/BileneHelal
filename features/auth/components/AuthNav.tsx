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

export function AuthNav() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();

    /**
     * Tarayicidaki mevcut auth oturumunu yukler.
     */
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-24 animate-pulse rounded-md bg-slate-200" />
        <div className="h-9 w-24 animate-pulse rounded-md bg-slate-200" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/login">Giris Yap</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Kayit Ol</Link>
        </Button>
      </div>
    );
  }

  const displayName =
    typeof user.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name
      : user.email ?? 'Kullanici';

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-slate-900">{displayName}</p>
        <p className="text-xs text-slate-500">{user.email}</p>
      </div>

      <Button asChild variant="outline">
        <Link href="/dashboard">Dashboard</Link>
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={handleSignOut}
        disabled={isPending}
      >
        {isPending ? 'Cikis yapiliyor...' : 'Cikis Yap'}
      </Button>
    </div>
  );
}
