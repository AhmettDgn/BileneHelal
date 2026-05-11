'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  endCurrentQuestion,
  finishGame,
  startNextQuestion,
} from '@/features/quiz-engine/actions';
import { QuestionDisplay } from '@/features/quiz-engine/components/QuestionDisplay';
import { useGameSync } from '@/features/quiz-engine/hooks/use-game-sync';
import { useQuestionTimer } from '@/features/quiz-engine/hooks/use-question-timer';
import { Leaderboard } from '@/features/stats/components/Leaderboard';
import { useLeaderboard } from '@/features/stats/hooks/use-leaderboard';

interface HostGameQuestion {
  id: string;
  text: string;
  options: string[];
  points: number;
  time_limit_seconds: number;
}

interface HostGameViewProps {
  gameSessionId: string;
  gamePin: string;
  quizTitle: string;
  questions: HostGameQuestion[];
}

export function HostGameView({
  gameSessionId,
  gamePin,
  quizTitle,
  questions,
}: HostGameViewProps) {
  const {
    currentQuestionIndex,
    currentPhase,
    activeQuestionId,
    phaseEndsAt,
    gameStatus,
    hasNextQuestion,
    isLoading,
    error,
  } = useGameSync(gameSessionId);
  const { entries, isLoading: isLeaderboardLoading } =
    useLeaderboard(gameSessionId);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const currentQuestion =
    questions.find((question) => question.id === activeQuestionId) ??
    questions[currentQuestionIndex] ??
    null;
  const { timeRemainingSeconds, isExpired } = useQuestionTimer(
    phaseEndsAt,
    currentPhase === 'question' && gameStatus === 'in_progress',
  );
  const isQuestionScreen =
    gameStatus === 'in_progress' && currentPhase === 'question' && !isExpired;

  const handleAdvance = () => {
    setActionError(null);
    startTransition(async () => {
      try {
        if (currentPhase === 'question') {
          await endCurrentQuestion(gameSessionId);
          return;
        }

        if (hasNextQuestion) {
          await startNextQuestion(gameSessionId);
          return;
        }

        await finishGame(gameSessionId);
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : 'Soru ilerletilemedi',
        );
      }
    });
  };

  if (gameStatus === 'completed') {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="theme-panel-soft rounded-[28px] border p-6 text-center text-white sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Oyun tamamlandi
          </p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{quizTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
            Tum sorular tamamlandi. Final siralamasi asagida.
          </p>
        </section>
        <Leaderboard
          entries={entries}
          isLoading={isLeaderboardLoading}
          title="Final Siralamasi"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="theme-panel-soft rounded-[24px] border p-4 text-white sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              Canli soru akisi
            </p>
            <h2 className="mt-2 truncate text-2xl font-bold sm:text-3xl">
              {quizTitle}
            </h2>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="theme-chip rounded-full px-3 py-1">
                PIN: <span className="font-mono text-slate-100">{gamePin}</span>
              </span>
              <span className="theme-chip rounded-full px-3 py-1">
                Soru {Math.min(currentQuestionIndex + 1, questions.length)} /{' '}
                {questions.length}
              </span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleAdvance}
            disabled={
              isPending ||
              isLoading ||
              (currentPhase === 'question' && !currentQuestion)
            }
            className="neon-cyan h-11 w-full rounded-2xl px-6 sm:w-auto"
          >
            {isPending
              ? 'Isleniyor...'
              : currentPhase === 'question'
                ? 'Soruyu Bitir'
                : hasNextQuestion
                  ? 'Sonraki Soru'
                  : 'Oyunu Bitir'}
          </Button>
        </div>
      </section>

      {error && (
        <p className="text-sm text-rose-300">
          Oyun durumu izlenemedi: {error.message}
        </p>
      )}

      {actionError && <p className="text-sm text-rose-300">{actionError}</p>}

      {!currentQuestion ? (
        <section className="theme-panel-soft rounded-[28px] border p-6 text-center text-slate-300">
          {isLoading
            ? 'Soru verisi hazirlaniyor...'
            : 'Gosterilecek soru bulunamadi.'}
        </section>
      ) : isQuestionScreen ? (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_320px]">
          <article className="theme-panel rounded-[30px] border p-5 text-white sm:p-7">
            <QuestionDisplay
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              text={currentQuestion.text}
              options={currentQuestion.options}
              timeRemainingSeconds={timeRemainingSeconds}
              onAnswerSelect={() => {}}
              isAnswered
            />
          </article>

          <aside className="theme-panel-soft rounded-[30px] border p-5 text-white sm:p-6">
            <h3 className="text-lg font-semibold">Soru bilgisi</h3>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <div className="theme-chip rounded-2xl px-4 py-3">
                Sayac:{' '}
                <span className="font-semibold text-slate-100">
                  {timeRemainingSeconds} sn
                </span>
              </div>
              <div className="theme-chip rounded-2xl px-4 py-3">
                Puan:{' '}
                <span className="font-semibold text-slate-100">
                  {currentQuestion.points}
                </span>
              </div>
              <div className="theme-chip rounded-2xl px-4 py-3">
                Durum:{' '}
                <span className="font-semibold text-slate-100">
                  Oyuncular cevap veriyor
                </span>
              </div>
            </div>
          </aside>
        </section>
      ) : (
        <div className="space-y-5">
          <section className="theme-panel rounded-[30px] border p-6 text-center text-white sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              Bekleme ekrani
            </p>
            <h3 className="mt-3 text-2xl font-bold">
              {currentQuestionIndex + 1}. soru tamamlandi
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              {currentPhase === 'intermission'
                ? 'Skor tablosu paylasildi. Hazir oldugunda sonraki soruya gecebilirsin.'
                : 'Sure doldu. Oyun fazi senkronize edilirken gecici bekleme ekrani gosteriliyor.'}
            </p>
          </section>

          <Leaderboard entries={entries} isLoading={isLeaderboardLoading} />
        </div>
      )}
    </div>
  );
}
