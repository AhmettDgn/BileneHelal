/**
 * QuestionListPanel - soru listesi ve sira yonetimi.
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  isQuestionComplete,
  type QuestionDraft,
} from '@/features/quiz-builder/types';

interface QuestionListPanelProps {
  questions: QuestionDraft[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onMove: (from: number, to: number) => void;
}

export function QuestionListPanel({
  questions,
  activeIndex,
  onSelect,
  onAdd,
  onMove,
}: QuestionListPanelProps) {
  return (
    <aside className="theme-panel-soft flex h-full flex-col space-y-3 rounded-[24px] border p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          Sorular
        </h3>
        <span className="text-xs text-muted-foreground">{questions.length}</span>
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto">
        {questions.map((question, index) => {
          const isActive = index === activeIndex;
          const isComplete = isQuestionComplete(question);
          const preview = question.text.trim();

          return (
            <li key={index}>
              <div
                className={`group flex items-stretch gap-1 rounded-md border transition-colors ${
                  isActive
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-border bg-card hover:bg-muted/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  className="min-w-0 flex-1 px-3 py-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      Soru {index + 1}
                    </span>
                    {!isComplete && (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-amber-500"
                        aria-label="Eksik soru"
                        title="Bu soruda eksik alan var"
                      />
                    )}
                  </div>
                  <p
                    className={`mt-1 truncate text-sm ${
                      preview ? 'text-foreground' : 'italic text-muted-foreground'
                    }`}
                  >
                    {preview || 'Bos soru'}
                  </p>
                </button>

                <div className="flex flex-col border-l border-border">
                  <button
                    type="button"
                    onClick={() => onMove(index, index - 1)}
                    disabled={index === 0}
                    aria-label="Yukari tasi"
                    className="flex-1 px-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, index + 1)}
                    disabled={index === questions.length - 1}
                    aria-label="Asagi tasi"
                    className="flex-1 border-t border-border px-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAdd}
        className="w-full border-border text-foreground hover:bg-muted"
      >
        + Soru Ekle
      </Button>
    </aside>
  );
}
