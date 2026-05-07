/**
 * Supabase browser istemcisi — Realtime ve Auth özellikleri için.
 * Singleton pattern kullanır — her çağrı aynı instance'ı döner.
 */

'use client';

import { createBrowserClient as createClient } from '@supabase/ssr';
import { Database } from './database.types';

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Supabase browser istemcisini oluşturur veya mevcut instance'ı döner.
 */
export function createBrowserClient() {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ortam değişkenleri gereklidir',
      );
    }

    supabaseClient = createClient<Database>(url, anonKey);
  }

  return supabaseClient;
}
