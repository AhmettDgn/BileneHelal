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
    <div className="mx-auto w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_-56px_rgba(15,23,42,0.4)]">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-950">
        Giris Yap
      </h1>
      <p className="mb-6 text-sm leading-6 text-slate-600">
        Host paneline ve quiz yonetimine erismek icin hesabinla devam et.
      </p>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            placeholder="ornek@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-2xl border-slate-300 bg-slate-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Sifre</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-2xl border-slate-300 bg-slate-50"
          />
        </div>

        <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-2xl">
          {isLoading ? 'Giris yapiliyor...' : 'Giris Yap'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Hesabin yok mu?{' '}
        <Link href="/register" className="font-medium text-slate-950 hover:underline">
          Kayit ol
        </Link>
      </div>
    </div>
  );
}
