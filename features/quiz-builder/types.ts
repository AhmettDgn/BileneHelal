/**
 * Quiz Builder Kingdom — Ortak tipler
 * Form taslakları ve panel bileşenleri tek bir tip kaynağından beslenir.
 */

export interface QuestionDraft {
  text: string;
  options: string[];
  correctOptionIndex: number;
  timeLimitSeconds: number;
  points: number;
}

/** Soru içeriği eksiksiz mi (metin + 4 seçenek dolu mu)? */
export function isQuestionComplete(question: QuestionDraft): boolean {
  if (!question.text.trim()) return false;
  if (question.options.length < 2) return false;
  return question.options.every((opt) => opt.trim().length > 0);
}
