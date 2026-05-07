/**
 * Game Lobby Kingdom — useLobbySubscription Hook
 * Supabase Presence ile canlı oyuncu listesi ve DB Changes ile katılımcı güncellemeleri
 */

'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';

type Participant = Tables<'participants'>;

interface LobbySubscriptionState {
  participants: Participant[];
  onlineCount: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Oyun lobisinde canlı katılımcı listesini takip eder.
 * - Presence: oyuncuların çevrimiçi durumu
 * - Postgres Changes: yeni katılımcılar/ayrılmalar
 */
export function useLobbySubscription(gameSessionId: string): LobbySubscriptionState {
  const [state, setState] = useState<LobbySubscriptionState>({
    participants: [],
    onlineCount: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const supabase = createBrowserClient();

    // Mevcut katılımcıları ilk olarak yükle
    const loadParticipants = async () => {
      try {
        const { data, error } = await supabase
          .from('participants')
          .select('*')
          .eq('game_session_id', gameSessionId);

        if (error) throw error;

        setState((prev) => ({
          ...prev,
          participants: data || [],
          onlineCount: (data || []).filter((p) => p.is_online).length,
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

    loadParticipants();

    // Postgres Changes ile katılımcı güncellemeleri dinle
    const channel = supabase
      .channel(`lobby:${gameSessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `game_session_id=eq.${gameSessionId}`,
        },
        (payload) => {
          setState((prev) => {
            if (payload.eventType === 'INSERT') {
              return {
                ...prev,
                participants: [...prev.participants, payload.new as Participant],
                onlineCount: prev.onlineCount + 1,
              };
            }
            if (payload.eventType === 'DELETE') {
              return {
                ...prev,
                participants: prev.participants.filter(
                  (p) => p.id !== (payload.old as Participant).id,
                ),
                onlineCount: prev.onlineCount - 1,
              };
            }
            if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Participant;
              const wasOnline = prev.participants.find(
                (p) => p.id === updated.id,
              )?.is_online;

              return {
                ...prev,
                participants: prev.participants.map((p) =>
                  p.id === updated.id ? updated : p,
                ),
                onlineCount: wasOnline !== updated.is_online
                  ? prev.onlineCount + (updated.is_online ? 1 : -1)
                  : prev.onlineCount,
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
