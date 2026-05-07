/**
 * Ana sayfa join deneyimi - yalnizca gerekli interaktif kisim client'ta calisir.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { JoinGameForm } from '@/features/game-lobby/components/JoinGameForm';
import { joinGameSession } from '@/features/game-lobby/actions';
import { writePlayerSession } from '@/lib/player-session';

export function HomeJoinPanel() {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleJoin = async (gamePin: string, displayName: string) => {
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
    />
  );
}
