/**
 * Quiz Builder Kingdom — QuestionContentEditor (Dumb UI, orta panel)
 * Aktif sorunun metni ve 4 seçeneğini düzenler. Süre/puan/sil sağ panelde.
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { QuestionDraft } from '@/features/quiz-builder/types';

interface QuestionContentEditorProps {
  index: number;
  question: QuestionDraft;
  onChange: (patch: Partial<QuestionDraft>) => void;
}

export function QuestionContentEditor({
  index,
  question,
  onChange,
}: QuestionContentEditorProps) {
  const updateOption = (optionIdx: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[optionIdx] = value;
    onChange({ options: newOptions });
  };

  return (
    <div className="bg-white border rounded-lg p-6 space-y-5 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-950">
          Soru {index + 1}
        </h3>
        <span className="text-xs text-muted-foreground">
          Doğru cevabı yanındaki radio ile işaretle
        </span>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`question-${index}-text`}>Soru Metni</Label>
        <Input
          id={`question-${index}-text`}
          value={question.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Sorunun tamamını yaz..."
          required
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-3">
        <Label>Seçenekler</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((option, optionIdx) => {
            const isCorrect = question.correctOptionIndex === optionIdx;
            return (
              <label
                key={optionIdx}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                  isCorrect
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={isCorrect}
                  onChange={() => onChange({ correctOptionIndex: optionIdx })}
                  className="h-4 w-4 text-emerald-600"
                  aria-label={`Seçenek ${optionIdx + 1} doğru cevap`}
                />
                <Input
                  value={option}
                  onChange={(e) => updateOption(optionIdx, e.target.value)}
                  placeholder={`Seçenek ${optionIdx + 1}`}
                  required
                  className="border-0 bg-transparent focus-visible:ring-0 px-0 h-9"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
