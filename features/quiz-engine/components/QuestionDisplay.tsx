/**
 * Quiz Engine Kingdom — QuestionDisplay Bileşeni (Dumb UI)
 * Soruyu ve seçenekleri gösterir
 */

'use client';

interface QuestionDisplayProps {
  questionNumber: number;
  totalQuestions: number;
  text: string;
  options: string[];
  timeRemainingSeconds?: number;
  onAnswerSelect: (optionIndex: number) => void;
  isAnswered?: boolean;
  isLoading?: boolean;
  correctOptionIndex?: number;
  selectedOptionIndex?: number;
}

export function QuestionDisplay({
  questionNumber,
  totalQuestions,
  text,
  options,
  timeRemainingSeconds,
  onAnswerSelect,
  isAnswered,
  isLoading,
  correctOptionIndex,
  selectedOptionIndex,
}: QuestionDisplayProps) {
  const canRevealCorrectAnswer = typeof correctOptionIndex === 'number';

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-300">
            Soru {questionNumber} / {totalQuestions}
          </p>
          {typeof timeRemainingSeconds === 'number' && (
            <div className="theme-chip rounded-full px-3 py-1 text-sm text-cyan-100">
              Sayaç: <span className="font-semibold">{timeRemainingSeconds} sn</span>
            </div>
          )}
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-800/80">
          <div
            className="h-2 rounded-full bg-cyan-400"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="mb-6 text-2xl font-bold leading-tight text-white sm:text-3xl">
        {text}
      </h2>

      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            disabled={isAnswered || isLoading}
            className={`w-full rounded-2xl border px-4 py-4 text-left text-sm transition sm:text-base ${
              isAnswered
                ? canRevealCorrectAnswer && index === correctOptionIndex
                  ? 'border-emerald-400 bg-emerald-400/12 text-emerald-50'
                  : index === selectedOptionIndex
                    ? canRevealCorrectAnswer
                      ? 'border-rose-400 bg-rose-400/12 text-rose-50'
                      : 'border-cyan-400 bg-cyan-400/12 text-cyan-50'
                    : 'border-slate-700 bg-slate-900/50 text-slate-400'
                : 'border-slate-700 bg-slate-950/55 text-slate-100 hover:border-cyan-400/60 hover:bg-cyan-400/10'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
