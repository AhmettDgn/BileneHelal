/**
 * Auth route group layout - giris yapmis kullanicilari dashboard'a yonlendirir.
 */

import { redirect } from 'next/navigation';

import { createServerClient } from '@/lib/supabase/server';

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return children;
}
