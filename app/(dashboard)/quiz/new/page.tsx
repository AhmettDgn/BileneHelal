/**
 * Yeni Quiz Oluşturma Sayfası
 * Form state'i client'ta yönetilir, başarıyla kaydedilince /dashboard'a döner.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { QuizBuilderForm } from '@/features/quiz-builder/components/QuizBuilderForm';
import { createQuiz } from '@/features/quiz-builder/actions';

export default function NewQuizPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="py-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Yeni Quiz Oluştur</h1>
        <p className="text-muted-foreground mt-1">
          Soldaki listeden soruları yönet, ortada içeriği düzenle, sağdaki
          panelden ayarları belirle.
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
