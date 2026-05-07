/**
 * Giriş Sayfası — Form state'i client'ta yönetilir, Server Action'a iletilir
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { LoginForm } from '@/features/auth/components/LoginForm';
import { signInWithEmail } from '@/features/auth/actions';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
    </div>
  );
}
