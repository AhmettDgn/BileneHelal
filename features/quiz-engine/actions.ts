/**
 * Quiz engine server actions - tek cevap, aktif soru ve net host gecisleri.
 */

'use server';

import { createServerClient } from '@/lib/supabase/server';

interface SubmitAnswerResult {
  accepted: boolean;
  alreadyAnswered: boolean;
  lockedOptionIndex: number;
  pointsEarned: number;
}

async function loadSessionState(
  gameSessionId: string,
  participantId?: string | null,
) {
  const supabase = await createServerClient();

  await supabase.rpc('sync_game_phase', {
    p_game_session_id: gameSessionId,
    p_participant_id: participantId ?? null,
  });

  const { data: session, error } = await supabase
    .from('game_sessions')
    .select(
      'id, host_id, quiz_id, status, current_phase, current_question_index, active_question_id, phase_started_at, phase_ends_at',
    )
    .eq('id', gameSessionId)
    .single();

  if (error || !session) {
    throw new Error('Oyun oturumu bulunamadi');
  }

  return { supabase, session };
}

async function assertHost(gameSessionId: string) {
  const { supabase, session } = await loadSessionState(gameSessionId);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (session.host_id !== user?.id) {
    throw new Error('Sadece host bu islemi yapabilir');
  }

  return { supabase, session };
}

async function getOrderedQuestions(supabase: Awaited<ReturnType<typeof createServerClient>>, quizId: string) {
  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, time_limit_seconds')
    .eq('quiz_id', quizId)
    .order('order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Soru listesi okunamadi: ${error.message}`);
  }

  return questions ?? [];
}

export async function submitAnswer(
  gameSessionId: string,
  participantId: string,
  questionId: string,
  selectedOptionIndex: number,
  responseTimeMs: number,
): Promise<SubmitAnswerResult> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc('submit_player_answer', {
    p_game_session_id: gameSessionId,
    p_participant_id: participantId,
    p_question_id: questionId,
    p_selected_option_index: selectedOptionIndex,
    p_response_time_ms: Math.max(0, responseTimeMs),
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = data?.[0];

  if (!result) {
    throw new Error('Cevap sonucu alinamadi');
  }

  return {
    accepted: result.accepted,
    alreadyAnswered: result.already_answered,
    lockedOptionIndex: result.locked_option_index,
    pointsEarned: result.points_earned,
  };
}

export async function endCurrentQuestion(gameSessionId: string) {
  const { supabase, session } = await assertHost(gameSessionId);

  if (session.status !== 'in_progress') {
    throw new Error('Aktif olmayan oyun icin soru kapatilamaz');
  }

  if (session.current_phase !== 'question') {
    return session;
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('game_sessions')
    .update({
      current_phase: 'intermission',
      phase_started_at: nowIso,
      phase_ends_at: null,
    })
    .eq('id', gameSessionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Soru kapatilamadi: ${error.message}`);
  }

  return data;
}

export async function finishGame(gameSessionId: string) {
  const { supabase, session } = await assertHost(gameSessionId);
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('game_sessions')
    .update({
      status: 'completed',
      current_phase: 'intermission',
      phase_started_at: nowIso,
      phase_ends_at: null,
      ended_at: nowIso,
    })
    .eq('id', gameSessionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Oyun tamamlanamadi: ${error.message}`);
  }

  return data ?? session;
}

export async function startNextQuestion(gameSessionId: string) {
  const { supabase, session } = await assertHost(gameSessionId);

  if (session.status === 'waiting') {
    throw new Error('Oyun henuz baslatilmadi');
  }

  if (session.current_phase === 'question') {
    throw new Error('Aktif soru kapanmadan yeni soru baslatilamaz');
  }

  const orderedQuestions = await getOrderedQuestions(supabase, session.quiz_id);
  const nextQuestionIndex = session.current_question_index + 1;
  const nextQuestion = orderedQuestions[nextQuestionIndex] ?? null;

  if (!nextQuestion) {
    return finishGame(gameSessionId);
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const phaseEndsAt = new Date(
    now.getTime() + nextQuestion.time_limit_seconds * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from('game_sessions')
    .update({
      current_question_index: nextQuestionIndex,
      current_phase: 'question',
      active_question_id: nextQuestion.id,
      status: 'in_progress',
      phase_started_at: nowIso,
      phase_ends_at: phaseEndsAt,
      ended_at: null,
    })
    .eq('id', gameSessionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Siradaki soru baslatilamadi: ${error.message}`);
  }

  return data;
}
