/**
 * Quiz Builder Kingdom — QuizBuilderForm (Dumb UI)
 * Üç panelli quiz oluşturma deneyimi:
 *  - Üst: quiz meta bar (başlık, açıklama, yayınla)
 *  - Sol: soru listesi + sıralama + ekleme (QuestionListPanel)
 *  - Orta: aktif sorunun içeriği (QuestionContentEditor)
 *  - Sağ: aktif sorunun ayarları (QuestionSettingsPanel)
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

interface QuizBuilderSubmitData {
  title: string;
  description: string | null;
  questions: QuestionDraft[];
  isPublished: boolean;
}

interface QuizBuilderFormProps {
  onSubmit: (data: QuizBuilderSubmitData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function QuizBuilderForm({
  onSubmit,
  isLoading,
  error,
}: QuizBuilderFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    createEmptyQuestion(),
  ]);
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
      <section className="bg-white border rounded-lg p-5">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[2fr_3fr_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="quiz-title">Quiz Başlığı</Label>
            <Input
              id="quiz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Genel Kültür Yarışması"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiz-description">Açıklama (opsiyonel)</Label>
            <Input
              id="quiz-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quiz hakkında kısa bir açıklama"
              disabled={isLoading}
            />
          </div>

          <label className="flex items-center gap-2 lg:pb-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4"
            />
            <span className="text-sm">Yayınla</span>
          </label>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_300px] items-stretch">
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

      <div className="flex gap-3 sticky bottom-4 bg-white border rounded-lg p-4 shadow-lg">
        <Button
          type="submit"
          disabled={isLoading || questions.length === 0}
          className="flex-1"
        >
          {isLoading ? 'Kaydediliyor...' : 'Quizi Kaydet'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}
