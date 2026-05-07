/**
 * Quiz Engine Kingdom — Server Actions
 * Cevap gönderme, puan hesaplama
 */

'use server';

import { createServerClient } from '@/lib/supabase/server';
import type { TablesInsert } from '@/lib/supabase/database.types';

/**
 * Oyuncunun cevabını kaydeder (RLS korumalı).
 * Doğru/yanlış kontrolünü ve puanını hesaplar.
 */
export async function submitAnswer(
  gameSessionId: string,
  participantId: string,
  questionId: string,
  selectedOptionIndex: number,
  responseTimeMs: number,
) {
  const supabase = await createServerClient();

  // Soruyu al ve doğru cevabı kontrol et
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single();

  if (questionError || !question) {
    throw new Error('Soru bulunamadı');
  }

  const isCorrect = selectedOptionIndex === question.correct_option_index;
  const pointsEarned = isCorrect ? question.points : 0;

  // Cevabı kaydet
  const answerData: TablesInsert<'answers'> = {
    game_session_id: gameSessionId,
    participant_id: participantId,
    question_id: questionId,
    selected_option_index: selectedOptionIndex,
    is_correct: isCorrect,
    response_time_ms: responseTimeMs,
    points_earned: pointsEarned,
  };

  const { data: answer, error: answerError } = await supabase
    .from('answers')
    .insert(answerData)
    .select()
    .single();

  if (answerError) {
    throw new Error(`Cevap kaydedilemedi: ${answerError.message}`);
  }

  // Lider tahtasını güncelle
  const { data: score } = await supabase
    .from('scores')
    .select('*')
    .eq('game_session_id', gameSessionId)
    .eq('participant_id', participantId)
    .single();

  if (score) {
    // Güncelle
    await supabase
      .from('scores')
      .update({
        total_score: score.total_score + pointsEarned,
        correct_answers: score.correct_answers + (isCorrect ? 1 : 0),
        total_questions_answered: score.total_questions_answered + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', score.id);
  } else {
    // Yeni kayıt oluştur
    await supabase.from('scores').insert({
      game_session_id: gameSessionId,
      participant_id: participantId,
      total_score: pointsEarned,
      correct_answers: isCorrect ? 1 : 0,
      total_questions_answered: 1,
    });
  }

  return {
    answer,
    isCorrect,
    pointsEarned,
  };
}

/**
 * Mevcut oyun oturumunun sorusunu günceller (host için).
 * Broadcast yayını tetikler.
 */
export async function advanceQuestion(gameSessionId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Host yetkisini doğrula
  const { data: session, error: checkError } = await supabase
    .from('game_sessions')
    .select('host_id, current_question_index')
    .eq('id', gameSessionId)
    .single();

  if (checkError || session?.host_id !== user?.id) {
    throw new Error('Sadece host soru geçişini yapabilir');
  }

  // Soruyu ilerlet
  const { data, error } = await supabase
    .from('game_sessions')
    .update({
      current_question_index: (session?.current_question_index || 0) + 1,
    })
    .eq('id', gameSessionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Soru ilerletme başarısız: ${error.message}`);
  }

  return data;
}
