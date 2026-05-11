/**
 * Edit quiz page client wrapper.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { QuizBuilderForm, type QuizBuilderInitialData } from '@/features/quiz-builder/components/QuizBuilderForm';
import { updateQuizDefinition } from '@/features/quiz-builder/actions';

interface EditQuizPageClientProps {
  quizId: string;
  initialData: QuizBuilderInitialData;
}

export function EditQuizPageClient({
  quizId,
  initialData,
}: EditQuizPageClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Quiz Duzenle</h1>
        <p className="mt-1 text-slate-400">
          Hazirladigin quizin sorularini, surelerini ve yayin durumunu burada guncelleyebilirsin.
        </p>
      </div>

      <QuizBuilderForm
        initialData={initialData}
        isLoading={isLoading}
        error={error}
        submitLabel="Degisiklikleri Kaydet"
        onSubmit={async (data) => {
          setIsLoading(true);
          setError(null);
          try {
            await updateQuizDefinition(quizId, {
              title: data.title,
              description: data.description,
              isPublished: data.isPublished,
              questions: data.questions.map((question) => ({
                text: question.text,
                options: question.options,
                correctOptionIndex: question.correctOptionIndex,
                timeLimitSeconds: question.timeLimitSeconds,
                points: question.points,
              })),
            });
            router.push('/dashboard');
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
}
