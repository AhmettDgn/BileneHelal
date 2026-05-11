/**
 * Quiz builder server actions.
 */

'use server';

import { revalidatePath } from 'next/cache';

import type { TablesInsert } from '@/lib/supabase/database.types';
import { createServerClient } from '@/lib/supabase/server';

interface QuestionInput {
  text: string;
  options: string[];
  correctOptionIndex: number;
  timeLimitSeconds: number;
  points: number;
}

interface SaveQuizInput {
  title: string;
  description: string | null;
  questions: QuestionInput[];
  isPublished?: boolean;
}

const buildQuestionsPayload = (
  quizId: string,
  questions: QuestionInput[],
): TablesInsert<'questions'>[] =>
  questions.map((question, index) => ({
    quiz_id: quizId,
    order: index,
    text: question.text,
    options: question.options,
    correct_option_index: question.correctOptionIndex,
    time_limit_seconds: question.timeLimitSeconds,
    points: question.points,
  }));

export async function createQuiz(input: SaveQuizInput) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Quiz olusturmak icin giris yapmalisin');
  }

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({
      owner_id: user.id,
      title: input.title,
      description: input.description,
      is_published: input.isPublished ?? false,
    })
    .select()
    .single();

  if (quizError || !quiz) {
    throw new Error(
      `Quiz olusturulamadi: ${quizError?.message ?? 'bilinmeyen hata'}`,
    );
  }

  if (input.questions.length > 0) {
    const { error: questionsError } = await supabase
      .from('questions')
      .insert(buildQuestionsPayload(quiz.id, input.questions));

    if (questionsError) {
      await supabase.from('quizzes').delete().eq('id', quiz.id);
      throw new Error(`Sorular eklenemedi: ${questionsError.message}`);
    }
  }

  revalidatePath('/dashboard');
  return quiz;
}

export async function updateQuizDefinition(
  quizId: string,
  input: SaveQuizInput,
) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Quiz guncellemek icin giris yapmalisin');
  }

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id, owner_id')
    .eq('id', quizId)
    .single();

  if (quizError || !quiz || quiz.owner_id !== user.id) {
    throw new Error('Bu quizi guncelleme yetkin yok');
  }

  const { data: activeSession, error: activeSessionError } = await supabase
    .from('game_sessions')
    .select('id')
    .eq('quiz_id', quizId)
    .in('status', ['waiting', 'in_progress'])
    .limit(1)
    .maybeSingle();

  if (activeSessionError) {
    throw new Error(`Aktif oyun kontrolu basarisiz: ${activeSessionError.message}`);
  }

  if (activeSession) {
    throw new Error('Bekleyen veya aktif bir oyun varken quiz duzenlenemez');
  }

  const { error: updateError } = await supabase
    .from('quizzes')
    .update({
      title: input.title,
      description: input.description,
      is_published: input.isPublished ?? false,
    })
    .eq('id', quizId);

  if (updateError) {
    throw new Error(`Quiz guncellenemedi: ${updateError.message}`);
  }

  const { error: deleteError } = await supabase
    .from('questions')
    .delete()
    .eq('quiz_id', quizId);

  if (deleteError) {
    throw new Error(`Eski sorular temizlenemedi: ${deleteError.message}`);
  }

  if (input.questions.length > 0) {
    const { error: insertError } = await supabase
      .from('questions')
      .insert(buildQuestionsPayload(quizId, input.questions));

    if (insertError) {
      throw new Error(`Guncel sorular kaydedilemedi: ${insertError.message}`);
    }
  }

  revalidatePath('/dashboard');
  revalidatePath(`/quiz/${quizId}/edit`);
}

export async function deleteQuiz(quizId: string) {
  const supabase = await createServerClient();

  const { error } = await supabase.from('quizzes').delete().eq('id', quizId);

  if (error) {
    throw new Error(`Quiz silinemedi: ${error.message}`);
  }

  revalidatePath('/dashboard');
}

export async function listMyQuizzes() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Quizler listelenemedi: ${error.message}`);
  }

  return data;
}
