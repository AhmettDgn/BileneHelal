/**
 * Quiz Builder Kingdom — Server Actions
 * Quiz ve soru oluşturma, güncelleme, silme
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import type { TablesInsert } from '@/lib/supabase/database.types';

interface QuestionInput {
  text: string;
  options: string[];
  correctOptionIndex: number;
  timeLimitSeconds: number;
  points: number;
}

interface CreateQuizInput {
  title: string;
  description: string | null;
  questions: QuestionInput[];
  isPublished?: boolean;
}

/**
 * Yeni quiz ve soruları atomik olarak oluşturur.
 * Quiz ve sorular tek bir transactional flow'da insert edilir.
 */
export async function createQuiz(input: CreateQuizInput) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Quiz oluşturmak için giriş yapmalısın');
  }

  // 1. Quiz kaydı oluştur
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
    throw new Error(`Quiz oluşturulamadı: ${quizError?.message ?? 'bilinmeyen hata'}`);
  }

  // 2. Soruları batch olarak ekle
  if (input.questions.length > 0) {
    const questionsPayload: TablesInsert<'questions'>[] = input.questions.map(
      (q, idx) => ({
        quiz_id: quiz.id,
        order: idx,
        text: q.text,
        options: q.options,
        correct_option_index: q.correctOptionIndex,
        time_limit_seconds: q.timeLimitSeconds,
        points: q.points,
      }),
    );

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsPayload);

    if (questionsError) {
      // Quiz'i geri al — orphan kayıt kalmasın
      await supabase.from('quizzes').delete().eq('id', quiz.id);
      throw new Error(`Sorular eklenemedi: ${questionsError.message}`);
    }
  }

  revalidatePath('/dashboard');
  return quiz;
}

/**
 * Mevcut quizi günceller.
 * RLS sayesinde sadece sahip güncelleyebilir.
 */
export async function updateQuiz(
  quizId: string,
  patch: { title?: string; description?: string | null; is_published?: boolean },
) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('quizzes')
    .update(patch)
    .eq('id', quizId)
    .select()
    .single();

  if (error) {
    throw new Error(`Quiz güncellenemedi: ${error.message}`);
  }

  revalidatePath('/dashboard');
  return data;
}

/**
 * Quizi siler. Cascade ile bağlı sorular ve oturumlar da silinir.
 */
export async function deleteQuiz(quizId: string) {
  const supabase = await createServerClient();

  const { error } = await supabase.from('quizzes').delete().eq('id', quizId);

  if (error) {
    throw new Error(`Quiz silinemedi: ${error.message}`);
  }

  revalidatePath('/dashboard');
}

/**
 * Mevcut kullanıcının tüm quizlerini döner.
 */
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
