/**
 * Game Lobby Kingdom - JoinGameForm (Dumb UI)
 * 6 haneli PIN ile oyuna katilma formu.
 */

'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface JoinGameFormProps {
  onSubmit: (gamePin: string, displayName?: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  isAuthenticated?: boolean;
  initialDisplayName?: string | null;
}

export function JoinGameForm({
  onSubmit,
  isLoading,
  error,
  isAuthenticated = false,
  initialDisplayName,
}: JoinGameFormProps) {
  const [gamePin, setGamePin] = useState('');
  const [displayName, setDisplayName] = useState('');
  const trimmedDisplayName = displayName.trim();
  const canSubmit =
    gamePin.length === 6 &&
    (isAuthenticated || Boolean(trimmedDisplayName));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(
      gamePin.trim(),
      isAuthenticated ? initialDisplayName ?? undefined : trimmedDisplayName,
    );
  };

  const handlePinChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setGamePin(digitsOnly);
  };

  return (
    <div className="theme-panel-soft rounded-[22px] border p-3 text-slate-100 sm:rounded-[24px] sm:p-4">
      <div className="mb-4">
        <p className="accent-text-cyan text-[11px] font-semibold uppercase tracking-[0.24em]">
          Oyuncu girisi
        </p>
        <h2 className="mt-2 text-lg font-bold tracking-tight text-white sm:text-xl">
          Oyun PIN&apos;ini gir ve lobiye baglan
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {isAuthenticated
            ? 'Giris yaptigin hesapla otomatik eslesirsin. Bu oyuna kayitli gorunen adinla katilacaksin.'
            : '6 haneli PIN ve gorunen adin yeterli. Zemin sakin kalir, odak ise PIN kutusunda ve katilim aksiyonunda toplanir.'}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
        <div className="theme-chip rounded-2xl px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Giris
          </p>
          <p className="mt-1 text-sm font-medium text-slate-100">Hizli PIN</p>
        </div>
        <div className="theme-chip rounded-2xl px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Akis
          </p>
          <p className="mt-1 text-sm font-medium text-slate-100">Canli lobi</p>
        </div>
        <div className="theme-chip rounded-2xl px-3 py-2.5 neon-pink">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Durum
          </p>
          <p className="mt-1 text-sm font-medium text-slate-100">Anlik gecis</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-2">
          <Label
            htmlFor="game-pin"
            className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400"
          >
            PIN Kodu
          </Label>
          <Input
            id="game-pin"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            placeholder="123456"
            value={gamePin}
            onChange={(e) => handlePinChange(e.target.value)}
            required
            disabled={isLoading}
            className="neon-cyan h-13 rounded-2xl border-cyan-300/15 bg-slate-950/80 px-2 text-center font-mono text-lg tracking-[0.18em] text-cyan-100 placeholder:text-cyan-200/35 sm:h-14 sm:text-xl sm:tracking-[0.28em]"
            maxLength={6}
            autoComplete="off"
          />
        </div>

        {isAuthenticated ? (
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 px-4 py-3 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Kullanilacak Ad
            </p>
            <p className="mt-1 text-sm font-medium text-slate-100">
              {initialDisplayName ?? 'Kayitli hesabinizdaki ad kullanilacak'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label
              htmlFor="display-name"
              className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400"
            >
              Gorunen Adin
            </Label>
            <Input
              id="display-name"
              type="text"
              placeholder="Takma adin"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={isLoading}
              maxLength={30}
              className="h-11 rounded-2xl border-slate-700 bg-slate-950/65 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !canSubmit}
          className="neon-cyan h-11 w-full rounded-2xl text-sm font-semibold"
        >
          {isLoading ? 'Lobiye baglaniyor...' : 'Oyuna Katil'}
        </Button>
      </form>

      <p className="mt-3 text-xs leading-5 text-slate-400">
        PIN yalnizca rakam kabul eder. Gecersiz oyunlarda hata sakin bir panelde,
        ana aksiyondan dikkat calmadan gosterilir.
      </p>
    </div>
  );
}
