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
    <div className="theme-panel neon-cyan mx-auto w-full max-w-md rounded-[24px] border p-4 text-slate-100 sm:rounded-[28px] sm:p-8">
      <h1 className="mb-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
        Giris Yap
      </h1>
      <p className="mb-6 text-sm leading-6 text-slate-300">
        Host paneline ve quiz yonetimine erismek icin hesabinla devam et.
      </p>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-400/25 bg-rose-400/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">E-posta</Label>
          <Input
            id="email"
            type="email"
            placeholder="ornek@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-2xl border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-300">Sifre</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-2xl border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-500"
          />
        </div>

        <Button type="submit" disabled={isLoading} className="neon-cyan h-12 w-full rounded-2xl">
          {isLoading ? 'Giris yapiliyor...' : 'Giris Yap'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        Hesabin yok mu?{' '}
        <Link href="/register" className="accent-text-cyan font-medium hover:underline">
          Kayit ol
        </Link>
      </div>
    </div>
  );
}
