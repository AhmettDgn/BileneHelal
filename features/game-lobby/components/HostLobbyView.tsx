/**
 * Game Lobby Kingdom - HostLobbyView
 * Host paneli icin canli ve animasyonlu lobi gorunumu.
 */

'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { LobbyRoom } from '@/features/game-lobby/components/LobbyRoom';
import { startGameSession } from '@/features/game-lobby/actions';
import { useLobbySubscription } from '@/features/game-lobby/hooks/use-lobby-subscription';

interface HostLobbyViewProps {
  gameSessionId: string;
  gamePin: string;
  quizTitle: string;
  totalQuestions: number;
}

export function HostLobbyView({
  gameSessionId,
  gamePin,
  quizTitle,
  totalQuestions,
}: HostLobbyViewProps) {
  const router = useRouter();
  const {
    participants,
    onlineCount,
    isLoading,
    error: subscriptionError,
  } = useLobbySubscription(gameSessionId);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      if (a.is_online !== b.is_online) {
        return a.is_online ? -1 : 1;
      }
      return a.display_name.localeCompare(b.display_name, 'tr');
    });
  }, [participants]);

  const handleStart = async () => {
    setActionError(null);

    return new Promise<void>((resolve) => {
      startTransition(async () => {
        try {
          await startGameSession(gameSessionId);
          router.refresh();
        } catch (error) {
          setActionError(
            error instanceof Error ? error.message : 'Oyun baslatilamadi',
          );
        } finally {
          resolve();
        }
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="px-1 text-center">
        <p className="text-sm text-slate-400">Quiz</p>
        <h2 className="text-xl font-semibold text-white sm:text-2xl">{quizTitle}</h2>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
          {totalQuestions} soru hazir
        </p>
      </div>

      {subscriptionError && (
        <p className="text-center text-sm text-rose-300">
          Katilimci bilgisi yuklenemedi: {subscriptionError.message}
        </p>
      )}

      {actionError && (
        <p className="text-center text-sm text-rose-300">{actionError}</p>
      )}

      <LobbyRoom
        gamePin={gamePin}
        participantCount={isLoading ? 0 : onlineCount}
        participants={sortedParticipants}
        isHost
        onStartGame={handleStart}
        isStarting={isPending}
      />
    </div>
  );
}
