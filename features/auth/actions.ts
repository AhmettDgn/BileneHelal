/**
 * Auth Kingdom — Server Actions
 * Giriş, kayıt ve oturum yönetimi
 */

'use server';

import { createServerClient } from '@/lib/supabase/server';

/**
 * E-posta ve şifre ile giriş yapar.
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Giriş başarısız: ${error.message}`);
  }

  return data;
}

/**
 * E-posta ve şifre ile kayıt olur.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    throw new Error(`Kayıt başarısız: ${error.message}`);
  }

  return data;
}

/**
 * OAuth (Google/GitHub) ile giriş URL'sini oluşturur.
 */
export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(`OAuth giriş başarısız: ${error.message}`);
  }

  return data;
}

/**
 * Oturumu sonlandırır.
 */
export async function signOut() {
  const supabase = await createServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Oturum kapatma başarısız: ${error.message}`);
  }
}
