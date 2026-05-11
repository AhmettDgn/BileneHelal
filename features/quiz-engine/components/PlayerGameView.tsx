'use client';

import { useEffect, useRef, useState } from 'react';

import { submitAnswer } from '@/features/quiz-engine/actions';
import { QuestionDisplay } from '@/features/quiz-engine/components/QuestionDisplay';
import { useGameSync } from '@/features/quiz-engine/hooks/use-game-sync';
import { useQuestionTimer } from '@/features/quiz-engine/hooks/use-question-timer';
import { Leaderboard } from '@/features/stats/components/Leaderboard';
import { useLeaderboard } from '@/features/stats/hooks/use-leaderboard';
import { createBrowserClient } from '@/lib/supabase/client';
import type { PlayerSession } from '@/lib/player-session';

interface PlayerGameQuestion {
  id: string;
  text: string;
  options: string[];
  points: number;
  time_limit_seconds: number;
}

interface ParticipantAnswerSummary {
  question_id: string;
  selected_option_index: number;
  points_earned: number;
}

interface PlayerGameStateResponse {
  quiz_title: string;
  active_question_id: string | null;
  questions: PlayerGameQuestion[];
  participant_answers: ParticipantAnswerSummary[];
}

interface LockedAnswerState {
  selectedOptionIndex: number;
  pointsEarned: number;
}

interface PlayerGameViewProps {
  gamePin: string;
  session: PlayerSession;
}

export function PlayerGameView({ gamePin, session }: PlayerGameViewProps) {
  const gameSync = useGameSync(session.gameSessionId, session.participantId);
  const { entries, isLoading: isLeaderboardLoading } = useLeaderboard(
    session.gameSessionId,
    session.participantId,
  );
  const [quizTitle, setQuizTitle] = useState('Quiz');
  const [questions, setQuestions] = useState<PlayerGameQuestion[]>([]);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<
    Record<string, LockedAnswerState>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingQuestionId, setIsSubmittingQuestionId] = useState<
    string | null
  >(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const activeQuestionIdRef = useRef<string | null>(null);
  const isQuestionActiveRef = useRef(false);

  useEffect(() => {
    const loadPlayableState = async () => {
      const supabase = createBrowserClient();

      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase.rpc('get_playable_game_state', {
          p_game_session_id: session.gameSessionId,
          p_participant_id: session.participantId,
        });

        if (error) {
          throw error;
        }

        const result = data as unknown as PlayerGameStateResponse | null;

        if (!result) {
          throw new Error('Quiz bilgisi alinamadi');
        }

        setQuizTitle(result.quiz_title ?? 'Quiz');
        setQuestions(result.questions ?? []);
        setAnswersByQuestionId(
          Object.fromEntries(
            (result.participant_answers ?? []).map((answer) => [
              answer.question_id,
              {
                selectedOptionIndex: answer.selected_option_index,
                pointsEarned: answer.points_earned,
              },
            ]),
          ),
        );
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Sorular yuklenemedi',
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayableState();
  }, [session.gameSessionId, session.participantId]);

  const currentQuestion =
    questions.find((question) => question.id === gameSync.activeQuestionId) ??
    questions[gameSync.currentQuestionIndex] ??
    null;
  const currentLockedAnswer = currentQuestion
    ? answersByQuestionId[currentQuestion.id]
    : undefined;
  const { timeRemainingSeconds, isExpired } = useQuestionTimer(
    gameSync.phaseEndsAt,
    gameSync.currentPhase === 'question' && gameSync.gameStatus === 'in_progress',
  );
  const isQuestionActive =
    gameSync.gameStatus === 'in_progress' &&
    gameSync.currentPhase === 'question' &&
    !isExpired;
  const isAnswered = Boolean(currentLockedAnswer);

  activeQuestionIdRef.current = currentQuestion?.id ?? null;
  isQuestionActiveRef.current = isQuestionActive;

  useEffect(() => {
    setIsSubmittingQuestionId(null);
    if (retryTimeoutRef.current) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, [
    gameSync.currentQuestionIndex,
    gameSync.currentPhase,
    gameSync.activeQuestionId,
  ]);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const attemptSubmit = async (
    questionId: string,
    optionIndex: number,
    responseTimeMs: number,
    attempt = 0,
  ) => {
    try {
      const result = await submitAnswer(
        session.gameSessionId,
        session.participantId,
        questionId,
        optionIndex,
        responseTimeMs,
      );

      setAnswersByQuestionId((prev) => ({
        ...prev,
        [questionId]: {
          selectedOptionIndex: result.lockedOptionIndex,
          pointsEarned: result.pointsEarned,
        },
      }));
      setIsSubmittingQuestionId(null);
      setError(
        result.alreadyAnswered && !result.accepted
          ? 'Bu soru icin ilk cevabin kilitlendi.'
          : null,
      );
    } catch (error) {
      if (
        attempt < 2 &&
        activeQuestionIdRef.current === questionId &&
        isQuestionActiveRef.current
      ) {
        retryTimeoutRef.current = window.setTimeout(() => {
          void attemptSubmit(questionId, optionIndex, responseTimeMs, attempt + 1);
        }, 700);
        return;
      }

      setIsSubmittingQuestionId(null);
      setError(
        error instanceof Error ? error.message : 'Cevabin dogrulanamadi',
      );
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (!currentQuestion || isAnswered || !isQuestionActive) {
      return;
    }

    setError(null);
    setIsSubmittingQuestionId(currentQuestion.id);
    setAnswersByQuestionId((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOptionIndex: optionIndex,
        pointsEarned: prev[currentQuestion.id]?.pointsEarned ?? 0,
      },
    }));

    const responseTimeMs = gameSync.phaseEndsAt
      ? Math.max(
          0,
          currentQuestion.time_limit_seconds * 1000 -
            Math.max(0, new Date(gameSync.phaseEndsAt).getTime() - Date.now()),
        )
      : 0;

    void attemptSubmit(currentQuestion.id, optionIndex, responseTimeMs);
  };

  if (gameSync.gameStatus === 'completed') {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="theme-panel-soft rounded-[28px] border p-6 text-center text-white sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Oyun tamamlandi
          </p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{quizTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
            Son siralama hazir. Ilk 5 oyuncu asagida listeleniyor.
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
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="theme-panel-soft rounded-[24px] border p-4 text-white sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              Canli soru
            </p>
            <h2 className="mt-2 truncate text-2xl font-bold sm:text-3xl">
              {quizTitle}
            </h2>
          </div>
          <div className="theme-chip w-fit rounded-full px-3 py-1 text-sm">
            PIN: <span className="font-mono text-slate-100">{gamePin}</span>
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-rose-300">{error}</p>}
      {gameSync.error && (
        <p className="text-sm text-rose-300">
          Oyun durumu okunamadi: {gameSync.error.message}
        </p>
      )}

      {!currentQuestion ? (
        <section className="theme-panel-soft rounded-[28px] border p-6 text-center text-slate-300">
          {isLoading ? 'Soru yukleniyor...' : 'Bu oturum icin soru bulunamadi.'}
        </section>
      ) : isQuestionActive ? (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_280px]">
          <article className="theme-panel rounded-[30px] border p-5 text-white sm:p-7">
            <QuestionDisplay
              questionNumber={gameSync.currentQuestionIndex + 1}
              totalQuestions={questions.length}
              text={currentQuestion.text}
              options={currentQuestion.options}
              timeRemainingSeconds={timeRemainingSeconds}
              onAnswerSelect={handleAnswerSelect}
              isAnswered={isAnswered}
              isLoading={isSubmittingQuestionId === currentQuestion.id}
              selectedOptionIndex={currentLockedAnswer?.selectedOptionIndex}
            />
          </article>

          <aside className="theme-panel-soft rounded-[30px] border p-5 text-white sm:p-6">
            <h3 className="text-lg font-semibold">Oyuncu durumu</h3>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <div className="theme-chip rounded-2xl px-4 py-3">
                Oyuncu:{' '}
                <span className="font-semibold text-slate-100">
                  {session.displayName}
                </span>
              </div>
              <div className="theme-chip rounded-2xl px-4 py-3">
                Sayac:{' '}
                <span className="font-semibold text-slate-100">
                  {timeRemainingSeconds} sn
                </span>
              </div>
              <div className="theme-chip rounded-2xl px-4 py-3">
                Bu soru:{' '}
                <span className="font-semibold text-slate-100">
                  {currentQuestion.points} puan
                </span>
              </div>
              <div className="theme-chip rounded-2xl px-4 py-3">
                Durum:{' '}
                <span className="font-semibold text-slate-100">
                  {isAnswered
                    ? 'Secimin kilitlendi'
                    : 'Cevabini secmen bekleniyor'}
                </span>
              </div>
            </div>
          </aside>
        </section>
      ) : (
        <div className="space-y-5">
          <section className="theme-panel rounded-[30px] border p-6 text-center text-white sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              Soru arasi ekran
            </p>
            <h3 className="mt-3 text-2xl font-bold">
              {gameSync.currentQuestionIndex + 1}. soru tamamlandi
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              {gameSync.currentPhase === 'intermission'
                ? 'Soru kapandi. Host sonraki soruya gectiginde yeni tur acilacak.'
                : 'Sure doldu. Faz senkronize edilirken kisa bir bekleme ekrani gosteriliyor.'}
            </p>
          </section>

          <Leaderboard entries={entries} isLoading={isLeaderboardLoading} />
        </div>
      )}
    </div>
  );
}
