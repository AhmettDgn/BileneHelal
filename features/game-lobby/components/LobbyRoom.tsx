/**
 * Game Lobby Kingdom - LobbyRoom
 * Host tarafindaki bekleme ekranini animasyonlu olarak gosterir.
 */

'use client';

import { Button } from '@/components/ui/button';
import { LobbyParticipants } from '@/features/game-lobby/components/LobbyParticipants';

interface LobbyParticipantItem {
  id: string;
  display_name: string;
  is_online: boolean | null;
}

interface LobbyRoomProps {
  gamePin: string;
  participantCount: number;
  participants?: LobbyParticipantItem[];
  isHost?: boolean;
  onStartGame?: () => Promise<void>;
  isStarting?: boolean;
}

export function LobbyRoom({
  gamePin,
  participantCount,
  participants = [],
  isHost,
  onStartGame,
  isStarting,
}: LobbyRoomProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#172554_50%,#0f172a_100%)] px-6 py-8 text-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.8)] sm:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-8 top-8 h-28 w-28 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-32 w-32 rounded-full bg-indigo-400/20 blur-3xl" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200">
              Bekleme odasi
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Oyuncular lobiye dusuyor, oyun baslamaya hazirlaniyor.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Katilan herkes ekranda anlik gorunur. Oyuncu sayisi yeterli oldugunda
              tek tusla oyunu baslatabilirsin.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
                  PIN
                </p>
                <p className="mt-1 font-mono text-3xl font-bold tracking-[0.24em]">
                  {gamePin}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
                  Hazir oyuncu
                </p>
                <p className="mt-1 text-3xl font-bold">{participantCount}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 text-sm text-slate-200">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
              </span>
              Katilan oyuncular anlik olarak ekrana ekleniyor.
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
                  Oyun durumu
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {participantCount > 0 ? 'Hazir bekleme' : 'Oyuncu bekleniyor'}
                </p>
              </div>
              <div className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inset-0 rounded-full border border-sky-300/30 animate-[lobby-pulse_2.6s_ease-out_infinite]" />
                <span className="absolute inset-2 rounded-full border border-sky-200/35 animate-[lobby-pulse_2.6s_ease-out_0.2s_infinite]" />
                <span className="relative rounded-full bg-white/15 px-3 py-2 text-sm font-semibold">
                  LIVE
                </span>
              </div>
            </div>

            {isHost ? (
              <Button
                type="button"
                onClick={onStartGame}
                disabled={isStarting || participantCount === 0}
                className="h-12 w-full rounded-2xl bg-white text-slate-950 hover:bg-slate-100"
              >
                {isStarting ? 'Oyun baslatiliyor...' : 'Oyunu Baslat'}
              </Button>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm text-slate-200">
                Host oyunu baslatinca soru ekranina otomatik gececeksin.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.35)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Lobidekiler</h2>
            <p className="mt-1 text-sm text-slate-500">
              Yeni katilan oyuncular yumusak bir giris animasyonuyla gorunur.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {participantCount} hazir oyuncu
          </div>
        </div>

        <LobbyParticipants participants={participants} emptyLabel="Henuz oyuncu yok." />
      </section>
    </div>
  );
}
