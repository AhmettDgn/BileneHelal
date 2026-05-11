/**
 * Game Lobby Kingdom - PlayerLobbyView
 * Oyuncu lobi ekranini neon temali bekleme durumu ve canli listeyle gosterir.
 */

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LobbyParticipants } from '@/features/game-lobby/components/LobbyParticipants';
import { updateParticipantName } from '@/features/game-lobby/actions';
import { useLobbySubscription } from '@/features/game-lobby/hooks/use-lobby-subscription';
import { PlayerGameView } from '@/features/quiz-engine/components/PlayerGameView';
import { useGameSync } from '@/features/quiz-engine/hooks/use-game-sync';
import {
  readPlayerSession,
  writePlayerSession,
  type PlayerSession,
} from '@/lib/player-session';

interface PlayerLobbyViewProps {
  gamePin: string;
}

export function PlayerLobbyView({ gamePin }: PlayerLobbyViewProps) {
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<PlayerSession | null>(null);

  useEffect(() => {
    setSession(readPlayerSession(gamePin));
    setHydrated(true);
  }, [gamePin]);

  if (!hydrated) {
    return (
      <div className="theme-panel-soft mx-auto max-w-2xl rounded-[24px] border p-5 text-center shadow-[0_24px_60px_-48px_rgba(34,211,238,0.35)] sm:rounded-[28px] sm:p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-300/10 neon-cyan">
          <div className="h-7 w-7 rounded-full bg-cyan-300 animate-pulse" />
        </div>
        <p className="text-sm text-slate-300">Lobi verisi hazirlaniyor...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="theme-panel-soft mx-auto max-w-md space-y-4 rounded-[24px] border p-5 text-center sm:rounded-[28px] sm:p-8">
        <h2 className="text-xl font-semibold text-white">Oturum bulunamadi</h2>
        <p className="text-sm leading-6 text-slate-300">
          Bu oyuna katilmak icin ana sayfadan PIN ve gerekiyorsa gorunen adinla giris yapmalisin.
        </p>
        <Button asChild className="neon-cyan w-full rounded-2xl sm:w-auto">
          <Link href="/">Ana sayfaya don</Link>
        </Button>
      </div>
    );
  }

  return (
    <PlayerLobbyContent
      gamePin={gamePin}
      session={session}
      onSessionChange={setSession}
    />
  );
}

interface PlayerLobbyContentProps {
  gamePin: string;
  session: PlayerSession;
  onSessionChange: (next: PlayerSession) => void;
}

function PlayerLobbyContent({
  gamePin,
  session,
  onSessionChange,
}: PlayerLobbyContentProps) {
  const gameSync = useGameSync(session.gameSessionId, session.participantId);
  const {
    participants,
    onlineCount,
    isLoading,
    error: subscriptionError,
  } = useLobbySubscription(session.gameSessionId);

  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      if (a.id === session.participantId) return -1;
      if (b.id === session.participantId) return 1;
      if (a.is_online !== b.is_online) {
        return a.is_online ? -1 : 1;
      }
      return a.display_name.localeCompare(b.display_name, 'tr');
    });
  }, [participants, session.participantId]);

  if (gameSync.gameStatus === 'in_progress' || gameSync.gameStatus === 'completed') {
    return (
      <PlayerGameView
        gamePin={gamePin}
        session={session}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            PIN Kodu
          </p>
          <p className="accent-text-cyan mt-2 break-all font-mono text-3xl font-bold tracking-[0.16em] sm:text-4xl sm:tracking-[0.22em]">
            {gamePin}
          </p>
        </div>

        <NameTag
          gamePin={gamePin}
          participantId={session.participantId}
          displayName={session.displayName}
          isAuthenticated={session.isAuthenticated}
          onRenamed={(nextName) =>
            onSessionChange({ ...session, displayName: nextName })
          }
        />
      </header>

      <section className="theme-panel neon-pink relative overflow-hidden rounded-[26px] border px-4 py-6 text-white sm:rounded-[30px] sm:px-6 sm:py-8 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute bottom-0 right-12 h-28 w-28 rounded-full bg-fuchsia-400/12 blur-3xl" />
          <div className="theme-dot-grid absolute inset-0 opacity-20" />
        </div>

        <div className="relative grid gap-6 lg:gap-8 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <p className="accent-text-pink text-[11px] font-semibold uppercase tracking-[0.28em]">
              Bekleme ekrani
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Host oyunu baslatana kadar lobi canli olarak guncelleniyor.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              {session.isAuthenticated
                ? 'Yeni oyuncular ekranda neon yumusakligiyla belirir. Sen de burada kalip katilimi gercek zamanli izleyebilirsin.'
                : 'Yeni oyuncular ekranda neon yumusakligiyla belirir. Sen de burada kalip adini guncelleyebilir, katilimi gercek zamanli izleyebilirsin.'}
            </p>

            <div className="theme-chip mt-6 inline-flex max-w-full flex-wrap items-center gap-3 rounded-full px-4 py-2 text-sm">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-300" />
              </span>
              {isLoading ? 'Lobi yukleniyor...' : `${onlineCount} oyuncu su an bagli`}
            </div>
          </div>

          <div className="theme-panel-soft flex flex-col items-center gap-3 rounded-[24px] border px-5 py-5 sm:rounded-[28px] sm:px-6">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <span className="absolute inset-0 rounded-full border border-cyan-300/30 animate-[lobby-pulse_2.8s_ease-out_infinite]" />
              <span className="absolute inset-3 rounded-full border border-fuchsia-300/25 animate-[lobby-pulse_2.8s_ease-out_0.3s_infinite]" />
              <span className="relative rounded-full bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100">
                LIVE
              </span>
            </div>
            <p className="text-center text-sm text-slate-200">
              Soru ekrani oyun basladiginda otomatik acilacak.
            </p>
          </div>
        </div>
      </section>

      <section className="theme-panel-soft rounded-[28px] border p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Katilimcilar</h3>
            <p className="text-sm text-slate-400">
              Lobiye giren herkes animasyonlu sekilde bu listede belirir.
            </p>
          </div>
          <div className="theme-chip rounded-full px-3 py-1 text-xs font-medium">
            {isLoading ? 'Yukleniyor' : `${onlineCount} oyuncu hazir`}
          </div>
        </div>

        {subscriptionError && (
          <p className="mb-4 text-sm text-rose-300">
            Liste yuklenemedi: {subscriptionError.message}
          </p>
        )}

        {gameSync.error && (
          <p className="mb-4 text-sm text-rose-300">
            Oyun durumu okunamadi: {gameSync.error.message}
          </p>
        )}

        <LobbyParticipants
          participants={sortedParticipants}
          currentParticipantId={session.participantId}
          isLoading={isLoading}
          emptyLabel="Henuz baska katilimci yok."
        />
      </section>
    </div>
  );
}

interface NameTagProps {
  gamePin: string;
  participantId: string;
  displayName: string;
  isAuthenticated: boolean;
  onRenamed: (next: string) => void;
}

function NameTag({
  gamePin,
  participantId,
  displayName,
  isAuthenticated,
  onRenamed,
}: NameTagProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDraft(displayName);
  }, [displayName]);

  if (isAuthenticated) {
    return (
      <div className="flex w-full max-w-sm flex-col items-start gap-1 sm:max-w-xs sm:items-end">
        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          Kayitli Adin
        </span>
        <div className="theme-chip flex w-full items-center justify-between rounded-xl px-4 py-2 text-slate-100 sm:w-auto sm:min-w-[220px]">
          <span className="max-w-full truncate text-base font-semibold text-white">
            {displayName}
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-cyan-200">
            Sabit
          </span>
        </div>
      </div>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = draft.trim();

    if (!next) {
      setError('Gorunen ad bos olamaz');
      return;
    }

    if (next === displayName) {
      setEditing(false);
      setError(null);
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const updated = await updateParticipantName(participantId, next);
        const newName = updated.display_name;
        const existing = readPlayerSession(gamePin);

        if (existing) {
          writePlayerSession(gamePin, { ...existing, displayName: newName });
        }

        onRenamed(newName);
        setEditing(false);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Guncelleme basarisiz',
        );
      }
    });
  };

  if (!editing) {
    return (
      <div className="flex w-full max-w-sm flex-col items-start gap-1 sm:max-w-xs sm:items-end">
        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          Takma Adin
        </span>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <span className="max-w-full truncate text-base font-semibold text-white sm:max-w-[180px]">
            {displayName}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full rounded-xl border-cyan-300/20 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/10 hover:text-cyan-50 sm:w-auto"
            onClick={() => setEditing(true)}
          >
            Duzenle
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col items-start gap-1 sm:max-w-xs sm:items-end"
    >
      <label className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
        Yeni takma ad
      </label>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={30}
          autoFocus
          disabled={isPending}
          className="h-10 w-full rounded-xl border-slate-700 bg-slate-950/70 text-slate-100 sm:w-44"
        />
        <Button type="submit" size="sm" className="neon-cyan w-full rounded-xl sm:w-auto" disabled={isPending}>
          {isPending ? '...' : 'Kaydet'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="w-full rounded-xl text-slate-300 hover:bg-fuchsia-400/10 hover:text-fuchsia-200 sm:w-auto"
          disabled={isPending}
          onClick={() => {
            setEditing(false);
            setDraft(displayName);
            setError(null);
          }}
        >
          Iptal
        </Button>
      </div>
      {error && <p className="text-left text-xs text-rose-300 sm:text-right">{error}</p>}
    </form>
  );
}
