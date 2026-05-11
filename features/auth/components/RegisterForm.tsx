/**
 * Auth Kingdom - RegisterForm.
 * Saf gorunum katmani, kayit formu verisini ust seviyeye tasir.
 */

'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegisterFormProps {
  onSubmit: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function RegisterForm({ onSubmit, isLoading, error }: RegisterFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    if (password !== passwordConfirm) {
      setValidationError('Sifreler eslesmiyor');
      return;
    }

    if (password.length < 6) {
      setValidationError('Sifre en az 6 karakter olmali');
      return;
    }

    await onSubmit(email, password, displayName);
  };

  const displayedError = validationError ?? error;

  return (
    <div className="theme-panel neon-pink mx-auto w-full max-w-md rounded-[24px] border p-4 text-slate-100 sm:rounded-[28px] sm:p-8">
      <h1 className="mb-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
        Kayit Ol
      </h1>
      <p className="mb-6 text-sm leading-6 text-slate-300">
        BileneHalal&apos;a katil, quizlerini yayinla ve oyunculari hizla oyuna al.
      </p>

      {displayedError && (
        <div className="mb-4 rounded-2xl border border-rose-400/25 bg-rose-400/10 p-3 text-sm text-rose-100">
          {displayedError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName" className="text-slate-300">Gorunen Ad</Label>
          <Input
            id="displayName"
            type="text"
            placeholder="Ahmet Yilmaz"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-2xl border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-500"
          />
        </div>

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
            placeholder="En az 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={isLoading}
            className="h-12 rounded-2xl border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passwordConfirm" className="text-slate-300">Sifre Tekrar</Label>
          <Input
            id="passwordConfirm"
            type="password"
            placeholder="Sifreyi tekrar gir"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-2xl border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-500"
          />
        </div>

        <Button type="submit" disabled={isLoading} className="neon-pink h-12 w-full rounded-2xl">
          {isLoading ? 'Kayit olunuyor...' : 'Kayit Ol'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        Zaten hesabin var mi?{' '}
        <Link href="/login" className="accent-text-pink font-medium hover:underline">
          Giris yap
        </Link>
      </div>
    </div>
  );
}
