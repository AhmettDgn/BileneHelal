/**
 * Ana sayfa join deneyimi - yalnizca gerekli interaktif kisim client'ta calisir.
 */

'use client';

import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { JoinGameForm } from '@/features/game-lobby/components/JoinGameForm';
import { joinGameSession } from '@/features/game-lobby/actions';
import { createBrowserClient } from '@/lib/supabase/client';
import { writePlayerSession } from '@/lib/player-session';

interface HomeJoinPanelProps {
  initialDisplayName?: string | null;
  initialIsAuthenticated?: boolean;
}

const resolveDisplayName = (user: User | null): string | null => {
  if (!user) {
    return null;
  }

  if (typeof user.user_metadata?.display_name === 'string') {
    const trimmed = user.user_metadata.display_name.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return user.email ?? null;
};

export function HomeJoinPanel({
  initialDisplayName,
  initialIsAuthenticated,
}: HomeJoinPanelProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    initialIsAuthenticated ?? false,
  );
  const [registeredDisplayName, setRegisteredDisplayName] = useState<string | null>(
    initialDisplayName ?? null,
  );

  useEffect(() => {
    const supabase = createBrowserClient();

    const syncAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsAuthenticated(Boolean(user));
      setRegisteredDisplayName(resolveDisplayName(user));
    };

    syncAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
      setRegisteredDisplayName(resolveDisplayName(session?.user ?? null));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleJoin = async (gamePin: string, displayName?: string) => {
    setIsJoining(true);
    setJoinError(null);

    try {
      const { participant, gameSession } = await joinGameSession(
        gamePin,
        displayName,
      );
      writePlayerSession(gamePin, {
        participantId: participant.id,
        gameSessionId: gameSession.id,
        displayName: participant.display_name,
        isAuthenticated: participant.user_id !== null,
      });
      router.push(`/play/${gamePin}`);
    } catch (error) {
      setJoinError(error instanceof Error ? error.message : 'Bilinmeyen hata');
      setIsJoining(false);
    }
  };

  return (
    <JoinGameForm
      onSubmit={handleJoin}
      isLoading={isJoining}
      error={joinError}
      isAuthenticated={isAuthenticated}
      initialDisplayName={registeredDisplayName}
    />
  );
}
