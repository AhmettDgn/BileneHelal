/**
 * Supabase sunucu istemcisi — Server Actions ve Row Level Security için.
 * Next.js cookies() ile integrate olur.
 */

import { createServerClient as createClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './database.types';

interface CookieToSet {
  name: string;
  value: string;
  options: CookieOptions;
}

/**
 * Sunucu ortamında Supabase istemcisini oluşturur.
 * RLS (Row Level Security) kuralları otomatik kullanıcı kimliğini kontrol eder.
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ortam değişkenleri gereklidir',
    );
  }

  return createClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Set-Cookie başlığı sunucu tarafından çok geç gönderildiyse
        }
      },
    },
  });
}
