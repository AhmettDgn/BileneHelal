/**
 * QuestionContentEditor - aktif sorunun icerigi ve secenekleri.
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
    <div className="theme-panel h-full space-y-5 rounded-[24px] border p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">Soru {index + 1}</h3>
        <span className="text-xs text-muted-foreground">
          Dogru cevabi yanindaki radio ile isaretle
        </span>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`question-${index}-text`} className="text-muted-foreground">
          Soru Metni
        </Label>
        <Input
          id={`question-${index}-text`}
          value={question.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Sorunun tamamini yaz..."
          required
          className="h-12 rounded-2xl text-base"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-muted-foreground">Secenekler</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {question.options.map((option, optionIdx) => {
            const isCorrect = question.correctOptionIndex === optionIdx;

            return (
              <label
                key={optionIdx}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                  isCorrect
                    ? 'border-accent/50 bg-accent/10'
                    : 'border-border bg-background hover:bg-muted/40'
                }`}
              >
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={isCorrect}
                  onChange={() => onChange({ correctOptionIndex: optionIdx })}
                  className="h-4 w-4 text-accent"
                  aria-label={`Secenek ${optionIdx + 1} dogru cevap`}
                />
                <Input
                  value={option}
                  onChange={(e) => updateOption(optionIdx, e.target.value)}
                  placeholder={`Secenek ${optionIdx + 1}`}
                  required
                  className="h-9 border-0 bg-transparent px-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
