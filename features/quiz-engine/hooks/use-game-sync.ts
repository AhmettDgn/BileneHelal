/**
 * Quiz Engine Kingdom — useGameSync Hook
 * Broadcast kanalı ile sunucudan gelen soru ve başlatma event'lerini dinler
 */

'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

type GameStatus = 'waiting' | 'in_progress' | 'completed';

interface GameSyncState {
  currentQuestionIndex: number;
  gameStatus: GameStatus;
  isLoading: boolean;
  error: Error | null;
}

interface GameEvent {
  type: 'question_changed' | 'game_started' | 'game_ended';
  payload: {
    currentQuestionIndex?: number;
    status?: GameStatus;
    timestamp: string;
  };
}

/**
 * Oyun senkronizasyonunu (broadcast yayını) dinler.
 * Sunucu soru geçişi veya oyun başlatma event'lerini gönderdiğinde state güncellenir.
 */
export function useGameSync(gameSessionId: string): GameSyncState {
  const [state, setState] = useState<GameSyncState>({
    currentQuestionIndex: 0,
    gameStatus: 'waiting',
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const supabase = createBrowserClient();

    // İlk oyun durumunu yükle
    const loadGameState = async () => {
      try {
        const { data, error } = await supabase
          .from('game_sessions')
          .select('current_question_index, status')
          .eq('id', gameSessionId)
          .single();

        if (error) throw error;

        setState((prev) => ({
          ...prev,
          currentQuestionIndex: data?.current_question_index ?? 0,
          gameStatus: (data?.status as GameStatus) ?? 'waiting',
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

    loadGameState();

    // Broadcast channel'ını aç
    const channel = supabase.channel(`game:${gameSessionId}`);

    channel
      .on('broadcast', { event: 'question_changed' }, (data: { payload: GameEvent['payload'] }) => {
        setState((prev) => ({
          ...prev,
          currentQuestionIndex: data.payload.currentQuestionIndex || 0,
        }));
      })
      .on('broadcast', { event: 'game_started' }, () => {
        setState((prev) => ({
          ...prev,
          gameStatus: 'in_progress',
        }));
      })
      .on('broadcast', { event: 'game_ended' }, () => {
        setState((prev) => ({
          ...prev,
          gameStatus: 'completed',
        }));
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [gameSessionId]);

  return state;
}
