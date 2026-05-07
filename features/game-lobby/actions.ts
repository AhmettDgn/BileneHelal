/**
 * Game Lobby Kingdom — Server Actions
 * Oyun oluşturma, oyuncu katılımı, oyun başlatma
 */

'use server';

import { createServerClient } from '@/lib/supabase/server';
import { generatePin } from '@/lib/utils';
import type { Tables } from '@/lib/supabase/database.types';

interface JoinGameRpcResult {
  participant: Tables<'participants'>;
  game_session: Tables<'game_sessions'>;
}

/**
 * Yeni oyun oturumu oluşturur (host için).
 * - Quiz sahipliğini doğrular.
 * - Soru sayısını DB'den hesaplar; boş quiz başlatılamaz.
 * - 6 haneli PIN üretir, status 'waiting' olarak başlar.
 */
export async function createGameSession(quizId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Giriş yapmanız gerekir');
  }

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id, owner_id')
    .eq('id', quizId)
    .single();

  if (quizError || !quiz) {
    throw new Error('Quiz bulunamadı');
  }

  if (quiz.owner_id !== user.id) {
    throw new Error('Bu quiz için oyun başlatma yetkiniz yok');
  }

  const { count, error: countError } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('quiz_id', quizId);

  if (countError) {
    throw new Error(`Soru sayısı hesaplanamadı: ${countError.message}`);
  }

  const totalQuestions = count ?? 0;

  if (totalQuestions === 0) {
    throw new Error('Soru içermeyen quiz başlatılamaz');
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
      total_questions: totalQuestions,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Oyun oturumu oluşturulamadı: ${error.message}`);
  }

  return data;
}

/**
 * Oyuncunun PIN ile oyuna katılmasını sağlar.
 * SECURITY DEFINER `join_game_session` RPC'si üzerinden çalışır:
 * RLS bypass + sunucu tarafı PIN/durum/isim doğrulaması tek noktada yapılır.
 */
export async function joinGameSession(gamePin: string, displayName: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('join_game_session', {
    p_game_pin: gamePin,
    p_display_name: displayName,
  });

  if (error) {
    throw new Error(`Oyuna katılma başarısız: ${error.message}`);
  }

  const result = data as unknown as JoinGameRpcResult | null;

  if (!result || !result.participant || !result.game_session) {
    throw new Error('Oyuna katılma başarısız: beklenmeyen yanıt');
  }

  return {
    participant: result.participant,
    gameSession: result.game_session,
  };
}

/**
 * Katılımcının görünen adını günceller.
 * SECURITY DEFINER `update_participant_name` RPC'si üzerinden çalışır:
 * sahiplik kontrolü ve aynı oyunda eşsizlik DB tarafında zorlanır.
 */
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
    throw new Error('Katılımcı bilgisi alınamadı');
  }

  return result;
}

/**
 * Oyun başlatır (sadece host).
 */
export async function startGameSession(gameSessionId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Host yetkisini doğrula
  const { data: session, error: checkError } = await supabase
    .from('game_sessions')
    .select('host_id')
    .eq('id', gameSessionId)
    .single();

  if (checkError || session?.host_id !== user?.id) {
    throw new Error('Sadece host oyunu başlatabilir');
  }

  // Oyun durumunu güncelle
  const { data, error } = await supabase
    .from('game_sessions')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString(),
      current_question_index: 0,
    })
    .eq('id', gameSessionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Oyun başlatma başarısız: ${error.message}`);
  }

  return data;
}
