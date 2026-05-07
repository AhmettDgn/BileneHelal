/**
 * Quiz Builder Kingdom — QuestionListPanel (Dumb UI, sol panel)
 * Soruların sırasını gösterir, aktif soruyu seçer ve sıralamayı yönetir.
 */

'use client';

import { Button } from '@/components/ui/button';
import { isQuestionComplete, type QuestionDraft } from '@/features/quiz-builder/types';

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
    <aside className="bg-white border rounded-lg p-4 space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
          Sorular
        </h3>
        <span className="text-xs text-muted-foreground">
          {questions.length}
        </span>
      </div>

      <ul className="space-y-2 flex-1 overflow-y-auto">
        {questions.map((question, index) => {
          const isActive = index === activeIndex;
          const isComplete = isQuestionComplete(question);
          const preview = question.text.trim();
          return (
            <li key={index}>
              <div
                className={`group flex items-stretch gap-1 rounded-md border transition-colors ${
                  isActive
                    ? 'border-sky-400 bg-sky-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  className="flex-1 text-left px-3 py-2 min-w-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        isActive ? 'text-sky-700' : 'text-slate-500'
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
                    className={`mt-1 text-sm truncate ${
                      preview ? 'text-slate-900' : 'italic text-slate-400'
                    }`}
                  >
                    {preview || 'Boş soru'}
                  </p>
                </button>

                <div className="flex flex-col border-l border-slate-200">
                  <button
                    type="button"
                    onClick={() => onMove(index, index - 1)}
                    disabled={index === 0}
                    aria-label="Yukarı taşı"
                    className="px-2 flex-1 text-slate-500 hover:text-slate-900 disabled:text-slate-300 disabled:hover:text-slate-300"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, index + 1)}
                    disabled={index === questions.length - 1}
                    aria-label="Aşağı taşı"
                    className="px-2 flex-1 text-slate-500 hover:text-slate-900 disabled:text-slate-300 disabled:hover:text-slate-300 border-t border-slate-200"
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
        className="w-full"
      >
        + Soru Ekle
      </Button>
    </aside>
  );
}
