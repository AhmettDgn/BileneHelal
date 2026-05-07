/**
 * Oyuncu Ekranı — Quiz Oyuncusu için.
 * Phase 5: sessionStorage tabanlı PlayerLobbyView'ı render eder.
 * Soru ekranı + zamanlayıcı Phase 6'da eklenecek.
 */

import { PlayerLobbyView } from '@/features/game-lobby/components/PlayerLobbyView';

export const metadata = {
  title: 'Quiz Oyunu',
};

interface PlayPageProps {
  params: {
    gamePin: string;
  };
}

export default function PlayPage({ params }: PlayPageProps) {
  return (
    <div className="py-8">
      <PlayerLobbyView gamePin={params.gamePin} />
    </div>
  );
}
