/**
 * Game Lobby Kingdom - oyun olusturma, katilim ve baslatma akislari.
 */

'use server';

import { createServerClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/database.types';
import { generatePin } from '@/lib/utils';

interface JoinGameRpcResult {
  participant: Tables<'participants'>;
  game_session: Tables<'game_sessions'>;
}

export async function createGameSession(quizId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Giris yapmaniz gerekir');
  }

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id, owner_id')
    .eq('id', quizId)
    .single();

  if (quizError || !quiz) {
    throw new Error('Quiz bulunamadi');
  }

  if (quiz.owner_id !== user.id) {
    throw new Error('Bu quiz icin oyun baslatma yetkiniz yok');
  }

  const { count, error: countError } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('quiz_id', quizId);

  if (countError) {
    throw new Error(`Soru sayisi hesaplanamadi: ${countError.message}`);
  }

  const totalQuestions = count ?? 0;

  if (totalQuestions === 0) {
    throw new Error('Soru icermeyen quiz baslatilamaz');
  }

  const gamePin = generatePin();

  const { data, error } = await supabase
    .from('game_sessions')
    .insert({
      quiz_id: quizId,
      host_id: user.id,
      game_pin: gamePin,
      status: 'waiting',
      current_question_index: 0,
      current_phase: 'question',
      total_questions: totalQuestions,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Oyun oturumu olusturulamadi: ${error.message}`);
  }

  return data;
}

export async function joinGameSession(gamePin: string, displayName?: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('join_game_session', {
    p_game_pin: gamePin,
    p_display_name: displayName ?? null,
  });

  if (error) {
    throw new Error(`Oyuna katilma basarisiz: ${error.message}`);
  }

  const result = data as unknown as JoinGameRpcResult | null;

  if (!result || !result.participant || !result.game_session) {
    throw new Error('Oyuna katilma basarisiz: beklenmeyen yanit');
  }

  return {
    participant: result.participant,
    gameSession: result.game_session,
  };
}

export async function updateParticipantName(
  participantId: string,
  displayName: string,
) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('update_participant_name', {
    p_participant_id: participantId,
    p_display_name: displayName,
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = data as unknown as Tables<'participants'> | null;

  if (!result) {
    throw new Error('Katilimci bilgisi alinamadi');
  }

  return result;
}

export async function startGameSession(gameSessionId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: session, error: checkError } = await supabase
    .from('game_sessions')
    .select('host_id, quiz_id')
    .eq('id', gameSessionId)
    .single();

  if (checkError || session?.host_id !== user?.id) {
    throw new Error('Sadece host oyunu baslatabilir');
  }

  const { data: orderedQuestions, error: questionError } = await supabase
    .from('questions')
    .select('id, time_limit_seconds')
    .eq('quiz_id', session.quiz_id)
    .order('order', { ascending: true })
    .order('created_at', { ascending: true });

  const firstQuestion = orderedQuestions?.[0] ?? null;

  if (questionError || !firstQuestion) {
    throw new Error('Ilk soru bilgisi bulunamadi');
  }

  const now = new Date().toISOString();
  const phaseEndsAt = new Date(
    Date.now() + firstQuestion.time_limit_seconds * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from('game_sessions')
    .update({
      status: 'in_progress',
      current_phase: 'question',
      active_question_id: firstQuestion.id,
      started_at: now,
      phase_started_at: now,
      phase_ends_at: phaseEndsAt,
      current_question_index: 0,
      ended_at: null,
    })
    .eq('id', gameSessionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Oyun baslatma basarisiz: ${error.message}`);
  }

  return data;
}
