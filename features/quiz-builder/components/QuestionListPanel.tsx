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
    <aside className="theme-panel-soft flex h-full flex-col space-y-3 rounded-[24px] border border-slate-800 p-3 text-slate-100 sm:p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">
          Sorular
        </h3>
        <span className="text-xs text-slate-400">{questions.length}</span>
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
                    ? 'border-cyan-400/60 bg-cyan-400/12 shadow-[0_10px_30px_rgba(34,211,238,0.15)]'
                    : 'border-slate-700 bg-slate-950/35 hover:bg-slate-900/60'
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
                        isActive ? 'text-cyan-200' : 'text-slate-400'
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
                      preview ? 'text-slate-100' : 'italic text-slate-500'
                    }`}
                  >
                    {preview || 'Bos soru'}
                  </p>
                </button>

                <div className="flex flex-col border-l border-slate-700">
                  <button
                    type="button"
                    onClick={() => onMove(index, index - 1)}
                    disabled={index === 0}
                    aria-label="Yukari tasi"
                    className="flex-1 px-2 text-slate-400 hover:text-white disabled:text-slate-600 disabled:hover:text-slate-600"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, index + 1)}
                    disabled={index === questions.length - 1}
                    aria-label="Asagi tasi"
                    className="flex-1 border-t border-slate-700 px-2 text-slate-400 hover:text-white disabled:text-slate-600 disabled:hover:text-slate-600"
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
        className="w-full border-slate-700 bg-slate-950/50 text-slate-100 hover:bg-slate-900 hover:text-white"
      >
        + Soru Ekle
      </Button>
    </aside>
  );
}
