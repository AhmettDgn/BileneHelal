/**
 * Game Lobby Kingdom - PlayerLobbyView
 * Oyuncu lobi ekranini animasyonlu bekleme durumu ve canli listeyle gosterir.
 */

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LobbyParticipants } from '@/features/game-lobby/components/LobbyParticipants';
import { updateParticipantName } from '@/features/game-lobby/actions';
import { useLobbySubscription } from '@/features/game-lobby/hooks/use-lobby-subscription';
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
      <div className="mx-auto max-w-2xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-48px_rgba(15,23,42,0.35)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
          <div className="h-7 w-7 rounded-full bg-sky-500 animate-pulse" />
        </div>
        <p className="text-sm text-slate-500">Lobi verisi hazirlaniyor...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-48px_rgba(15,23,42,0.35)]">
        <h2 className="text-xl font-semibold text-slate-950">Oturum bulunamadi</h2>
        <p className="text-sm leading-6 text-slate-600">
          Bu oyuna katilmak icin ana sayfadan PIN ve takma adinla giris yapmalisin.
        </p>
        <Button asChild className="rounded-2xl">
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            PIN Kodu
          </p>
          <p className="mt-2 font-mono text-4xl font-bold tracking-[0.22em] text-slate-950">
            {gamePin}
          </p>
        </div>

        <NameTag
          gamePin={gamePin}
          participantId={session.participantId}
          displayName={session.displayName}
          onRenamed={(nextName) =>
            onSessionChange({ ...session, displayName: nextName })
          }
        />
      </header>

      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_100%)] px-6 py-8 text-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.75)] sm:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute bottom-0 right-12 h-28 w-28 rounded-full bg-indigo-400/20 blur-3xl" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200">
              Bekleme ekrani
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Host oyunu baslatana kadar lobi canli olarak guncelleniyor.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Yeni oyuncular ekranda animasyonla belirir. Sen de burada kalip
              adini guncelleyebilir, katilimi gercek zamanli izleyebilirsin.
            </p>

            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-100 backdrop-blur">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
              </span>
              {isLoading ? 'Lobi yukleniyor...' : `${onlineCount} oyuncu su an bagli`}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-[28px] border border-white/10 bg-white/10 px-6 py-5 backdrop-blur-xl">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <span className="absolute inset-0 rounded-full border border-sky-300/30 animate-[lobby-pulse_2.8s_ease-out_infinite]" />
              <span className="absolute inset-3 rounded-full border border-sky-200/35 animate-[lobby-pulse_2.8s_ease-out_0.3s_infinite]" />
              <span className="relative rounded-full bg-white/15 px-4 py-3 text-sm font-semibold">
                LIVE
              </span>
            </div>
            <p className="text-center text-sm text-slate-200">
              Soru ekrani oyun basladiginda otomatik acilacak.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.35)]">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">Katilimcilar</h3>
            <p className="text-sm text-slate-500">
              Lobiye giren herkes animasyonlu sekilde bu listede belirir.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {isLoading ? 'Yukleniyor' : `${onlineCount} oyuncu hazir`}
          </div>
        </div>

        {subscriptionError && (
          <p className="mb-4 text-sm text-red-600">
            Liste yuklenemedi: {subscriptionError.message}
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
  onRenamed: (next: string) => void;
}

function NameTag({
  gamePin,
  participantId,
  displayName,
  onRenamed,
}: NameTagProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDraft(displayName);
  }, [displayName]);

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
      <div className="flex max-w-xs flex-col items-start gap-1 sm:items-end">
        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
          Takma Adin
        </span>
        <div className="flex items-center gap-2">
          <span className="max-w-[180px] truncate text-base font-semibold text-slate-950">
            {displayName}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
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
      className="flex max-w-xs flex-col items-start gap-1 sm:items-end"
    >
      <label className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
        Yeni takma ad
      </label>
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={30}
          autoFocus
          disabled={isPending}
          className="h-10 w-44 rounded-xl"
        />
        <Button type="submit" size="sm" className="rounded-xl" disabled={isPending}>
          {isPending ? '...' : 'Kaydet'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rounded-xl"
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
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
