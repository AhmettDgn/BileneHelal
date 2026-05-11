/**
 * Lider tablosu - ilk 5 oyuncu siralamasi.
 */

'use client';

import type { LeaderboardEntry } from '@/features/stats/hooks/use-leaderboard';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
  title?: string;
}

export function Leaderboard({
  entries,
  isLoading,
  title = 'Ilk 5',
}: LeaderboardProps) {
  return (
    <section className="theme-panel-soft rounded-[28px] border p-5 text-white sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Siralama
          </p>
          <h3 className="mt-1 text-xl font-semibold text-white">{title}</h3>
        </div>
        <div className="theme-chip rounded-full px-3 py-1 text-xs font-medium">
          Top 5
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/35 px-4 py-6 text-center text-sm text-slate-300">
          Lider tablosu yukleniyor...
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/35 px-4 py-6 text-center text-sm text-slate-300">
          Henuz puan olusmadi.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.slice(0, 5).map((entry, index) => (
            <div
              key={entry.participantId}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/35 px-4 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 text-sm font-semibold text-cyan-100">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {entry.displayName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {entry.correctAnswers} dogru cevap
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-cyan-200">
                  {entry.totalScore}
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  puan
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
