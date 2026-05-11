import { notFound, redirect } from 'next/navigation';

import { EditQuizPageClient } from '@/features/quiz-builder/components/EditQuizPageClient';
import { createServerClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Quiz Duzenle',
};

interface EditQuizPageProps {
  params: {
    quizId: string;
  };
}

export default async function EditQuizPage({ params }: EditQuizPageProps) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id, owner_id, title, description, is_published')
    .eq('id', params.quizId)
    .single();

  if (quizError || !quiz || quiz.owner_id !== user.id) {
    notFound();
  }

  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('text, options, correct_option_index, time_limit_seconds, points')
    .eq('quiz_id', params.quizId)
    .order('order', { ascending: true });

  if (questionsError) {
    notFound();
  }

  return (
    <EditQuizPageClient
      quizId={params.quizId}
      initialData={{
        title: quiz.title,
        description: quiz.description,
        isPublished: quiz.is_published,
        questions:
          questions?.map((question) => ({
            text: question.text,
            options: question.options,
            correctOptionIndex: question.correct_option_index,
            timeLimitSeconds: question.time_limit_seconds,
            points: question.points,
          })) ?? [],
      }}
    />
  );
}
