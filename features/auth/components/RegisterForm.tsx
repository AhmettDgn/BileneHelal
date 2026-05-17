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
import { GoogleSignInButton } from './GoogleSignInButton';

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
    <div className="theme-panel neon-pink mx-auto w-full max-w-md rounded-[24px] border p-4 text-foreground sm:rounded-[28px] sm:p-8">
      <h1 className="mb-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        Kayit Ol
      </h1>
      <p className="mb-6 text-sm leading-6 text-muted-foreground">
        BileneHalal&apos;a katil, quizlerini yayinla ve oyunculari hizla oyuna al.
      </p>

      {displayedError && (
        <div className="mb-4 rounded-2xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
          {displayedError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName" className="text-muted-foreground">Gorunen Ad</Label>
          <Input
            id="displayName"
            type="text"
            placeholder="Ahmet Yilmaz"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-2xl"
          />
        </div>

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
            placeholder="En az 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={isLoading}
            className="h-12 rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passwordConfirm" className="text-muted-foreground">Sifre Tekrar</Label>
          <Input
            id="passwordConfirm"
            type="password"
            placeholder="Sifreyi tekrar gir"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-2xl"
          />
        </div>

        <Button type="submit" disabled={isLoading} className="neon-pink h-12 w-full rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90">
          {isLoading ? 'Kayit olunuyor...' : 'Kayit Ol'}
        </Button>
      </form>

      <div className="relative my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">veya</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton label="Google ile kayit ol" disabled={isLoading} />

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Zaten hesabin var mi?{' '}
        <Link href="/login" className="accent-text-pink font-medium hover:underline">
          Giris yap
        </Link>
      </div>
    </div>
  );
}
