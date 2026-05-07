/**
 * Supabase Edge Function: Timer
 * Merkezi sunucu taraflı geri sayım — hileye kapalı
 *
 * Deno runtime kullanır.
 * Her oyun oturumu için 1 saniyede bir broadcast mesajı gönderir.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

interface TimerRequest {
  gameSessionId: string;
  initialSeconds: number;
  serverTimestamp: number;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /timer?gameSessionId=xxx&initialSeconds=30
 *
 * Verilen oyun oturumu için geri sayımı başlatır.
 * 1 saniye aralıklarla broadcast mesajı gönderir.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const gameSessionId = url.searchParams.get('gameSessionId');
  const initialSeconds = parseInt(url.searchParams.get('initialSeconds') || '30', 10);

  if (!gameSessionId) {
    return new Response('gameSessionId parametresi gereklidir', { status: 400 });
  }

  const startTime = Date.now();
  let remainingSeconds = initialSeconds;

  try {
    // Her 1 saniyede broadcast yayını
    const intervalId = setInterval(async () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      remainingSeconds = Math.max(0, initialSeconds - elapsed);

      // Broadcast mesajı gönder
      const channel = supabase.channel(`game:${gameSessionId}`);

      await channel
        .send({
          type: 'broadcast',
          event: 'timer_tick',
          payload: {
            remaining: remainingSeconds,
            server_timestamp: Date.now(),
          },
        });

      // Süre bittiyse interval'ı durdur
      if (remainingSeconds <= 0) {
        clearInterval(intervalId);
        channel.unsubscribe();
      }
    }, 1000);

    // Hemen ilk mesajı gönder
    const channel = supabase.channel(`game:${gameSessionId}`);
    await channel.send({
      type: 'broadcast',
      event: 'timer_tick',
      payload: {
        remaining: remainingSeconds,
        server_timestamp: Date.now(),
      },
    });

    return new Response(JSON.stringify({ status: 'timer started', remaining: remainingSeconds }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Timer error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Bilinmeyen hata' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

/**
 * POST /timer (Webhook için)
 *
 * İleride Supabase'deki tetikleyiciler tarafından çağrılabilir.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as TimerRequest;

  if (!body.gameSessionId || !body.initialSeconds) {
    return new Response('gameSessionId ve initialSeconds gereklidir', { status: 400 });
  }

  // GET request'i yönlendir
  return GET(new Request(`${req.url}?gameSessionId=${body.gameSessionId}&initialSeconds=${body.initialSeconds}`));
}
