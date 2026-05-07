/**
 * Stats Kingdom — useLeaderboard Hook
 * Postgres Changes ile lider tahtasını (scores) gerçek zamanlı takip eder
 */

'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';

type Score = Tables<'scores'>;

interface LeaderboardState {
  scores: Score[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Oyun oturumunun lider tahtasını (sıralama) dinler.
 * Scores tablosundaki değişiklikleri otomatik takip eder ve render'ı günceller.
 */
export function useLeaderboard(gameSessionId: string): LeaderboardState {
  const [state, setState] = useState<LeaderboardState>({
    scores: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const supabase = createBrowserClient();

    // İlk puanları yükle (sıralanmış)
    const loadScores = async () => {
      try {
        const { data, error } = await supabase
          .from('scores')
          .select('*')
          .eq('game_session_id', gameSessionId)
          .order('total_score', { ascending: false });

        if (error) throw error;

        setState((prev) => ({
          ...prev,
          scores: data || [],
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Bilinmeyen hata'),
          isLoading: false,
        }));
      }
    };

    loadScores();

    // Postgres Changes ile scores güncellemeleri dinle
    const channel = supabase
      .channel(`leaderboard:${gameSessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scores',
          filter: `game_session_id=eq.${gameSessionId}`,
        },
        (payload) => {
          setState((prev) => {
            if (payload.eventType === 'INSERT') {
              const newScore = payload.new as Score;
              // Yeni puanı sıralanmış şekilde ekle
              const updated = [...prev.scores, newScore];
              updated.sort((a, b) => b.total_score - a.total_score);
              return { ...prev, scores: updated };
            }
            if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Score;
              const newScores = prev.scores.map((s) =>
                s.id === updated.id ? updated : s,
              );
              newScores.sort((a, b) => b.total_score - a.total_score);
              return { ...prev, scores: newScores };
            }
            if (payload.eventType === 'DELETE') {
              return {
                ...prev,
                scores: prev.scores.filter(
                  (s) => s.id !== (payload.old as Score).id,
                ),
              };
            }
            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [gameSessionId]);

  return state;
}
