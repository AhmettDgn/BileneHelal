/**
 * Lider tablosunu RPC ile periyodik yeniler.
 */

'use client';

import { useEffect, useState } from 'react';

import { createBrowserClient } from '@/lib/supabase/client';

export interface LeaderboardEntry {
  participantId: string;
  displayName: string;
  totalScore: number;
  correctAnswers: number;
}

interface LeaderboardState {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: Error | null;
}

export function useLeaderboard(
  gameSessionId: string,
  participantId?: string | null,
): LeaderboardState {
  const [state, setState] = useState<LeaderboardState>({
    entries: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const supabase = createBrowserClient();
    let cancelled = false;

    const loadEntries = async () => {
      try {
        const { data, error } = await supabase.rpc('get_leaderboard_entries', {
          p_game_session_id: gameSessionId,
          p_participant_id: participantId ?? null,
          p_limit: 5,
        });

        if (error) {
          throw error;
        }

        if (cancelled) {
          return;
        }

        setState({
          entries: (data ?? []).map((entry) => ({
            participantId: entry.participant_id,
            displayName: entry.display_name,
            totalScore: entry.total_score,
            correctAnswers: entry.correct_answers,
          })),
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Bilinmeyen hata'),
        }));
      }
    };

    loadEntries();
    const interval = window.setInterval(loadEntries, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [gameSessionId, participantId]);

  return state;
}
