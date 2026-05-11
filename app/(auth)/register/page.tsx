/**
 * Kayıt Sayfası — Form state'i client'ta yönetilir, Server Action'a iletilir
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { signUpWithEmail } from '@/features/auth/actions';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUpWithEmail(email, password, displayName);

      if (result.session) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center py-6 sm:py-8">
      <RegisterForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
