/**
 * Host Kontrol Paneli - Quiz Host'u icin.
 * Lobby ve aktif oyun ekranlarini durum bazli olarak gosterir.
 */

import { notFound, redirect } from 'next/navigation';

import { HostLobbyView } from '@/features/game-lobby/components/HostLobbyView';
import { HostGameView } from '@/features/quiz-engine/components/HostGameView';
import { createServerClient } from '@/lib/supabase/server';

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
    .select('id, host_id, game_pin, quiz_id, status, total_questions, quizzes(title)')
    .eq('id', params.gameSessionId)
    .single();

  if (error || !session) {
    notFound();
  }

  if (session.host_id !== user.id) {
    redirect('/dashboard');
  }

  const quizTitle = (session.quizzes as { title: string } | null)?.title ?? 'Quiz';
  const { data: questions } = await supabase
    .from('questions')
    .select('id, text, options, points, time_limit_seconds')
    .eq('quiz_id', session.quiz_id)
    .order('order', { ascending: true })
    .order('created_at', { ascending: true });

  return (
    <div className="py-6 sm:py-8">
      <h1 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
        Quiz Host Paneli
      </h1>

      {session.status === 'waiting' && (
        <HostLobbyView
          gameSessionId={session.id}
          gamePin={session.game_pin}
          quizTitle={quizTitle}
          totalQuestions={session.total_questions}
        />
      )}

      {(session.status === 'in_progress' || session.status === 'completed') && (
        <HostGameView
          gameSessionId={session.id}
          gamePin={session.game_pin}
          quizTitle={quizTitle}
          questions={questions ?? []}
        />
      )}
    </div>
  );
}
