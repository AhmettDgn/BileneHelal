/**
 * Game Lobby Kingdom - useLobbySubscription Hook
 * Lobi katilimcilarini RPC ile tek kaynakli sekilde yukler ve degisikliklerde
 * snapshot'i yeniden ceker.
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

export function useLobbySubscription(
  gameSessionId: string,
): LobbySubscriptionState {
  const [state, setState] = useState<LobbySubscriptionState>({
    participants: [],
    onlineCount: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const supabase = createBrowserClient();
    let isMounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const loadParticipants = async () => {
      try {
        const { data, error } = await supabase.rpc('get_lobby_participants', {
          p_game_session_id: gameSessionId,
        });

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        const participants = (data || []) as Participant[];

        setState({
          participants,
          onlineCount: participants.filter((participant) => participant.is_online)
            .length,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Bilinmeyen hata'),
        }));
      }
    };

    const initialize = async () => {
      await supabase.auth.getSession();
      if (!isMounted) {
        return;
      }

      await loadParticipants();

      if (!isMounted) {
        return;
      }

      channel = supabase
        .channel(`lobby:${gameSessionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'participants',
            filter: `game_session_id=eq.${gameSessionId}`,
          },
          () => {
            void loadParticipants();
          },
        )
        .subscribe();

      authSubscription = supabase.auth.onAuthStateChange(() => {
        void loadParticipants();
      }).data.subscription;
    };

    void initialize();

    return () => {
      isMounted = false;
      authSubscription?.unsubscribe();
      channel?.unsubscribe();
    };
  }, [gameSessionId]);

  return state;
}
