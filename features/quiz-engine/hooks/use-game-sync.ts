/**
 * Oyun oturumu durumunu RPC uzerinden senkron tutar.
 */

'use client';

import { useEffect, useState } from 'react';

import { createBrowserClient } from '@/lib/supabase/client';

type GameStatus = 'waiting' | 'in_progress' | 'completed';
type GamePhase = 'question' | 'intermission';

interface GameSyncState {
  currentQuestionIndex: number;
  gameStatus: GameStatus;
  currentPhase: GamePhase;
  activeQuestionId: string | null;
  phaseStartedAt: string | null;
  phaseEndsAt: string | null;
  totalQuestions: number;
  hasNextQuestion: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useGameSync(
  gameSessionId: string,
  participantId?: string | null,
): GameSyncState {
  const [state, setState] = useState<GameSyncState>({
    currentQuestionIndex: 0,
    gameStatus: 'waiting',
    currentPhase: 'question',
    activeQuestionId: null,
    phaseStartedAt: null,
    phaseEndsAt: null,
    totalQuestions: 0,
    hasNextQuestion: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const supabase = createBrowserClient();
    let cancelled = false;

    const loadGameState = async () => {
      try {
        const { data, error } = await supabase.rpc('get_game_session_sync', {
          p_game_session_id: gameSessionId,
          p_participant_id: participantId ?? null,
        });

        if (error) {
          throw error;
        }

        const sync = data?.[0];
        if (!sync || cancelled) {
          return;
        }

        setState({
          currentQuestionIndex: sync.current_question_index ?? 0,
          gameStatus: sync.game_status ?? 'waiting',
          currentPhase: sync.current_phase ?? 'question',
          activeQuestionId: sync.active_question_id ?? null,
          phaseStartedAt: sync.phase_started_at ?? null,
          phaseEndsAt: sync.phase_ends_at ?? null,
          totalQuestions: sync.total_questions ?? 0,
          hasNextQuestion: sync.has_next_question ?? false,
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

    loadGameState();
    const interval = window.setInterval(loadGameState, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [gameSessionId, participantId]);

  return state;
}
