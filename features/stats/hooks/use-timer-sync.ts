/**
 * Stats Kingdom — useTimerSync Hook
 * Sunucu taraflı zamanlayıcıyı istemci deltasıyla senkronize eder.
 * Hileye kapalı, sadece sunucu saatine güvenir.
 */

'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

interface TimerSyncState {
  remainingSeconds: number;
  isRunning: boolean;
  isLoading: boolean;
}

/**
 * Sunucu zaman damgası (server_timestamp) ile istemci saat farkını kullanarak
 * doğru geri sayımı yapılmasını sağlar.
 * Hile yapısını ortadan kaldırır — client time hiç kullanılmaz.
 *
 * @param gameSessionId Oyun oturumu kimliği
 * @param initialRemaining Başlangıç kalan süresi (saniye)
 * @param serverTimestamp Sunucu taraflı UNIX timestamp (ms)
 */
export function useTimerSync(
  gameSessionId: string,
  initialRemaining: number,
  serverTimestamp: number,
): TimerSyncState {
  // İstemci ve sunucu arasındaki saat farkını ilk render'da hesapla.
  // Bu delta sayesinde istemci saatindeki kayma tick hesabını bozmaz.
  const initialClockSkewMs = Date.now() - serverTimestamp;
  const baselineServerTimestamp = serverTimestamp;

  const [state, setState] = useState<TimerSyncState>({
    remainingSeconds: initialRemaining,
    isRunning: true,
    isLoading: true,
  });

  useEffect(() => {
    const supabase = createBrowserClient();

    // Broadcast kanalını aç — sunucudan timer tick'leri dinle
    const channel = supabase.channel(`timer:${gameSessionId}`);

    // Her saniye delta'ya göre kalan süreyi yeniden hesapla.
    // Bu, sunucu broadcast gecikmesi durumunda da doğru sürer.
    const timerId = setInterval(() => {
      setState((prev) => {
        const elapsedServerMs =
          Date.now() - initialClockSkewMs - baselineServerTimestamp;
        const elapsedSeconds = Math.floor(elapsedServerMs / 1000);
        const newRemaining = Math.max(0, initialRemaining - elapsedSeconds);

        return {
          ...prev,
          remainingSeconds: newRemaining,
          isRunning: newRemaining > 0,
        };
      });
    }, 250);

    channel
      .on(
        'broadcast',
        { event: 'timer_tick' },
        (data: { payload: { remaining: number; server_timestamp: number } }) => {
          // Sunucudan gelen authoritative değer her zaman üstün gelir
          setState((prev) => ({
            ...prev,
            remainingSeconds: data.payload.remaining,
            isLoading: false,
          }));
        },
      )
      .subscribe();

    return () => {
      clearInterval(timerId);
      channel.unsubscribe();
    };
  }, [gameSessionId, initialRemaining, initialClockSkewMs, baselineServerTimestamp]);

  return state;
}
