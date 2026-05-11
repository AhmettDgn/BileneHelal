/**
 * Game Lobby Kingdom - LobbyRoom
 * Host tarafindaki bekleme ekranini neon temali olarak gosterir.
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
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="theme-panel neon-cyan relative overflow-hidden rounded-[24px] border px-4 py-4 text-white sm:rounded-[28px] sm:px-6 sm:py-5 lg:px-7">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-8 top-8 h-28 w-28 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-32 w-32 rounded-full bg-fuchsia-400/10 blur-3xl" />
          <div className="theme-dot-grid absolute inset-0 opacity-20" />
        </div>

        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_320px] lg:items-start">
          <div>
            <p className="accent-text-cyan text-[11px] font-semibold uppercase tracking-[0.28em]">
              Bekleme odasi
            </p>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
              Lobi hazir, oyuncular toplanıyor.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Oyuncular katildikca liste anlik guncellenir. Hazir oldugunda oyunu hemen baslatabilirsin.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="theme-chip neon-cyan rounded-2xl px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  PIN
                </p>
                <p className="mt-1 break-all font-mono text-2xl font-bold tracking-[0.16em] text-cyan-100 sm:text-3xl sm:tracking-[0.24em]">
                  {gamePin}
                </p>
              </div>
              <div className="theme-chip neon-pink rounded-2xl px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  Hazir oyuncu
                </p>
                <p className="mt-1 text-3xl font-bold text-fuchsia-100">{participantCount}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-start gap-3 text-sm text-slate-200">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-300" />
              </span>
              Katilan oyuncular anlik olarak ekrana ekleniyor.
            </div>
          </div>

          <div className="theme-panel-soft rounded-[24px] border p-4">
            <div className="mb-4 flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  Oyun durumu
                </p>
                <p className="mt-1 text-base font-semibold text-white">
                  {participantCount > 0 ? 'Hazir bekleme' : 'Oyuncu bekleniyor'}
                </p>
              </div>
              <div className="relative flex h-16 w-16 items-center justify-center self-start min-[420px]:self-auto">
                <span className="absolute inset-0 rounded-full border border-cyan-300/30 animate-[lobby-pulse_2.6s_ease-out_infinite]" />
                <span className="absolute inset-2 rounded-full border border-fuchsia-300/25 animate-[lobby-pulse_2.6s_ease-out_0.2s_infinite]" />
                <span className="relative rounded-full bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100">
                  LIVE
                </span>
              </div>
            </div>

            {isHost ? (
              <Button
                type="button"
                onClick={onStartGame}
                disabled={isStarting || participantCount === 0}
                className="neon-cyan h-12 w-full rounded-2xl"
              >
                {isStarting ? 'Oyun baslatiliyor...' : 'Oyunu Baslat'}
              </Button>
            ) : (
              <div className="theme-chip rounded-2xl px-4 py-4 text-sm text-slate-200">
                Host oyunu baslatinca soru ekranina otomatik gececeksin.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="theme-panel-soft rounded-[28px] border p-5 sm:p-6 lg:p-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Lobidekiler</h2>
            <p className="mt-1 text-sm text-slate-400">
              Yeni katilan oyuncular yumusak bir giris animasyonuyla gorunur.
            </p>
          </div>
          <div className="theme-chip w-fit rounded-full px-3 py-1 text-xs font-medium">
            {participantCount} hazir oyuncu
          </div>
        </div>

        <LobbyParticipants participants={participants} emptyLabel="Henuz oyuncu yok." />
      </section>
    </div>
  );
}
