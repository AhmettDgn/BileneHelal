/**
 * Game Lobby Kingdom — StartGameButton
 * Dashboard'dan tek tıklamayla yeni game_session yaratıp host paneline yönlendirir.
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createGameSession } from '@/features/game-lobby/actions';

interface StartGameButtonProps {
  quizId: string;
}

export function StartGameButton({ quizId }: StartGameButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      try {
        const session = await createGameSession(quizId);
        router.push(`/host/${session.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Oyun başlatılamadı');
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? 'Başlatılıyor...' : 'Oyun Başlat'}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
