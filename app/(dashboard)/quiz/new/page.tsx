/**
 * Yeni quiz olusturma sayfasi.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { createQuiz } from '@/features/quiz-builder/actions';
import { QuizBuilderForm } from '@/features/quiz-builder/components/QuizBuilderForm';

export default function NewQuizPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Yeni Quiz Olustur</h1>
        <p className="mt-1 text-slate-400">
          Soldaki listeden sorulari yonet, ortada icerigi duzenle, sagdaki panelden
          ayarlari belirle.
        </p>
      </div>

      <QuizBuilderForm
        isLoading={isLoading}
        error={error}
        onSubmit={async (data) => {
          setIsLoading(true);
          setError(null);
          try {
            await createQuiz({
              title: data.title,
              description: data.description,
              isPublished: data.isPublished,
              questions: data.questions.map((q) => ({
                text: q.text,
                options: q.options,
                correctOptionIndex: q.correctOptionIndex,
                timeLimitSeconds: q.timeLimitSeconds,
                points: q.points,
              })),
            });
            router.push('/dashboard');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
}
