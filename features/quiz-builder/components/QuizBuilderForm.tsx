/**
 * QuizBuilderForm - yeni ve duzenleme akisi icin ortak editor.
 */

'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuestionContentEditor } from '@/features/quiz-builder/components/QuestionContentEditor';
import { QuestionListPanel } from '@/features/quiz-builder/components/QuestionListPanel';
import { QuestionSettingsPanel } from '@/features/quiz-builder/components/QuestionSettingsPanel';
import type { QuestionDraft } from '@/features/quiz-builder/types';

const EMPTY_QUESTION: QuestionDraft = {
  text: '',
  options: ['', '', '', ''],
  correctOptionIndex: 0,
  timeLimitSeconds: 30,
  points: 100,
};

const createEmptyQuestion = (): QuestionDraft => ({
  ...EMPTY_QUESTION,
  options: ['', '', '', ''],
});

export interface QuizBuilderSubmitData {
  title: string;
  description: string | null;
  questions: QuestionDraft[];
  isPublished: boolean;
}

export interface QuizBuilderInitialData {
  title: string;
  description: string | null;
  questions: QuestionDraft[];
  isPublished: boolean;
}

interface QuizBuilderFormProps {
  onSubmit: (data: QuizBuilderSubmitData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  initialData?: QuizBuilderInitialData;
  submitLabel?: string;
}

export function QuizBuilderForm({
  onSubmit,
  isLoading,
  error,
  initialData,
  submitLabel,
}: QuizBuilderFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false);
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    initialData?.questions.length
      ? initialData.questions.map((question) => ({
          ...question,
          options: [...question.options],
        }))
      : [createEmptyQuestion()],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const safeActiveIndex = Math.min(activeIndex, questions.length - 1);
  const activeQuestion = questions[safeActiveIndex] ?? questions[0];

  const updateQuestion = (index: number, patch: Partial<QuestionDraft>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => {
      const next = [...prev, createEmptyQuestion()];
      setActiveIndex(next.length - 1);
      return next;
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== index);
      setActiveIndex((current) => {
        if (index < current) return current - 1;
        if (index === current) return Math.max(0, current - 1);
        return Math.min(current, next.length - 1);
      });
      return next;
    });
  };

  const moveQuestion = (from: number, to: number) => {
    if (from === to || to < 0 || to >= questions.length) return;
    setQuestions((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setActiveIndex((current) => {
      if (current === from) return to;
      if (from < current && to >= current) return current - 1;
      if (from > current && to <= current) return current + 1;
      return current;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      title,
      description: description.trim() ? description.trim() : null,
      questions,
      isPublished,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="theme-panel-soft rounded-[28px] border p-4 sm:p-5">
        {error && (
          <div className="mb-4 rounded-2xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[2fr_3fr_auto] xl:items-end">
          <div className="space-y-2">
            <Label htmlFor="quiz-title" className="text-muted-foreground">
              Quiz Basligi
            </Label>
            <Input
              id="quiz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Orn: Genel Kultur Yarismasi"
              required
              disabled={isLoading}
              className="h-12 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiz-description" className="text-muted-foreground">
              Aciklama (opsiyonel)
            </Label>
            <Input
              id="quiz-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quiz hakkinda kisa bir aciklama"
              disabled={isLoading}
              className="h-12 rounded-2xl"
            />
          </div>

          <label className="flex items-center gap-2 text-muted-foreground xl:pb-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4"
            />
            <span className="text-sm text-foreground">Yayinla</span>
          </label>
        </div>
      </section>

      <section className="grid items-stretch gap-4 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <div className="lg:min-h-[480px]">
          <QuestionListPanel
            questions={questions}
            activeIndex={safeActiveIndex}
            onSelect={setActiveIndex}
            onAdd={addQuestion}
            onMove={moveQuestion}
          />
        </div>

        <div className="lg:min-h-[480px]">
          <QuestionContentEditor
            key={safeActiveIndex}
            index={safeActiveIndex}
            question={activeQuestion}
            onChange={(patch) => updateQuestion(safeActiveIndex, patch)}
          />
        </div>

        <div className="lg:min-h-[480px]">
          <QuestionSettingsPanel
            question={activeQuestion}
            onChange={(patch) => updateQuestion(safeActiveIndex, patch)}
            onRemove={() => removeQuestion(safeActiveIndex)}
            canRemove={questions.length > 1}
          />
        </div>
      </section>

      <div className="theme-panel sticky bottom-3 z-20 flex flex-col gap-3 rounded-[24px] border p-3 backdrop-blur sm:bottom-4 sm:flex-row sm:p-4">
        <Button
          type="submit"
          disabled={isLoading || questions.length === 0}
          className="neon-cyan w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:flex-1"
        >
          {isLoading ? 'Kaydediliyor...' : submitLabel ?? 'Quizi Kaydet'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isLoading}
          className="w-full border-border text-foreground hover:bg-muted sm:w-auto"
        >
          Iptal
        </Button>
      </div>
    </form>
  );
}
