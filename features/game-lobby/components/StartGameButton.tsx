/**
 * StartGameButton - dashboard'dan yeni oyun baslatir.
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
        setError(err instanceof Error ? err.message : 'Oyun baslatilamadi');
      }
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full border-cyan-300/20 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10 hover:text-cyan-50"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? 'Baslatiliyor...' : 'Oyun Baslat'}
      </Button>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  );
}
