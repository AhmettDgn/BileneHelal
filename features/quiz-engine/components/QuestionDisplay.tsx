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
  onAnswerSelect,
  isAnswered,
  isLoading,
  correctOptionIndex,
  selectedOptionIndex,
}: QuestionDisplayProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Soru {questionNumber} / {totalQuestions}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">{text}</h2>

      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            disabled={isAnswered || isLoading}
            className={`w-full p-4 rounded border-2 text-left transition ${
              isAnswered
                ? index === correctOptionIndex
                  ? 'border-green-500 bg-green-50'
                  : index === selectedOptionIndex
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-gray-50'
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
