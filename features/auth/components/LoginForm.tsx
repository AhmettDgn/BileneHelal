/**
 * Auth Kingdom - LoginForm.
 * Saf gorunum katmani, veri akisini ust seviyeye birakir.
 */

'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleSignInButton } from './GoogleSignInButton';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <div className="theme-panel neon-cyan mx-auto w-full max-w-md rounded-[24px] border p-4 text-foreground sm:rounded-[28px] sm:p-8">
      <h1 className="mb-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        Giris Yap
      </h1>
      <p className="mb-6 text-sm leading-6 text-muted-foreground">
        Host paneline ve quiz yonetimine erismek icin hesabinla devam et.
      </p>

      {error && (
        <div className="mb-4 rounded-2xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-muted-foreground">E-posta</Label>
          <Input
            id="email"
            type="email"
            placeholder="ornek@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-muted-foreground">Sifre</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-2xl"
          />
        </div>

        <Button type="submit" disabled={isLoading} className="neon-cyan h-12 w-full rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90">
          {isLoading ? 'Giris yapiliyor...' : 'Giris Yap'}
        </Button>
      </form>

      <div className="relative my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">veya</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton disabled={isLoading} />

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Hesabin yok mu?{' '}
        <Link href="/register" className="accent-text-cyan font-medium hover:underline">
          Kayit ol
        </Link>
      </div>
    </div>
  );
}
