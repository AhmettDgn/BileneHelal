/**
 * Host Kontrol Paneli — Quiz Host'u için
 * - game_sessions kaydını yükler ve yetkilendirme yapar.
 * - status'a göre Lobby / In-progress / Completed görünümlerini değiştirir.
 */

import { notFound, redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { HostLobbyView } from '@/features/game-lobby/components/HostLobbyView';

export const metadata = {
  title: 'Oyun Host Paneli',
};

interface HostPageProps {
  params: {
    gameSessionId: string;
  };
}

export default async function HostPage({ params }: HostPageProps) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: session, error } = await supabase
    .from('game_sessions')
    .select('id, host_id, game_pin, status, total_questions, quizzes(title)')
    .eq('id', params.gameSessionId)
    .single();

  if (error || !session) {
    notFound();
  }

  if (session.host_id !== user.id) {
    redirect('/dashboard');
  }

  const quizTitle = (session.quizzes as { title: string } | null)?.title
    ?? 'Quiz';

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Quiz Host Paneli</h1>

      {session.status === 'waiting' && (
        <HostLobbyView
          gameSessionId={session.id}
          gamePin={session.game_pin}
          quizTitle={quizTitle}
          totalQuestions={session.total_questions}
        />
      )}

      {session.status === 'in_progress' && (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 text-center">
          <p className="text-sm text-muted-foreground">Quiz</p>
          <h2 className="text-xl font-semibold mb-4">{quizTitle}</h2>
          <p className="text-gray-600">
            Oyun başladı. Soru gösterimi yakında gelecek...
          </p>
        </div>
      )}

      {session.status === 'completed' && (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 text-center">
          <p className="text-sm text-muted-foreground">Quiz</p>
          <h2 className="text-xl font-semibold mb-4">{quizTitle}</h2>
          <p className="text-gray-600">
            Oyun tamamlandı. Sonuç ekranı yakında gelecek...
          </p>
        </div>
      )}
    </div>
  );
}
