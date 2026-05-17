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
    <div className="theme-panel-soft rounded-[22px] border p-3 sm:rounded-[24px] sm:p-4">
      <div className="mb-4">
        <p className="accent-text-cyan text-[11px] font-semibold uppercase tracking-[0.24em]">
          Oyuncu girişi
        </p>
        <h2 className="mt-2 text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Oyun PIN&apos;ini gir ve lobiye bağlan
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {isAuthenticated
            ? 'Giriş yaptığın hesapla otomatik eşleşirsin. Bu oyuna kayıtlı görünen adınla katılacaksın.'
            : '6 haneli PIN ve görünen adın yeterli. Zemin sakin kalır, odak ise PIN kutusunda ve katılım aksiyonunda toplanır.'}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
        <div className="theme-chip rounded-2xl px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Giriş
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">Hızlı PIN</p>
        </div>
        <div className="theme-chip rounded-2xl px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Akış
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">Canlı lobi</p>
        </div>
        <div className="theme-chip neon-pink rounded-2xl px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Durum
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">Anlık geçiş</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-2">
          <Label
            htmlFor="game-pin"
            className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground"
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
            className="neon-cyan h-13 rounded-2xl border-primary/20 bg-primary/5 px-2 text-center font-mono text-lg tracking-[0.18em] text-primary placeholder:text-primary/35 sm:h-14 sm:text-xl sm:tracking-[0.28em]"
            maxLength={6}
            autoComplete="off"
          />
        </div>

        {isAuthenticated ? (
          <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Kullanılacak Ad
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {initialDisplayName ?? 'Kayıtlı hesabınızdaki ad kullanılacak'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label
              htmlFor="display-name"
              className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground"
            >
              Görünen Adın
            </Label>
            <Input
              id="display-name"
              type="text"
              placeholder="Takma adın"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={isLoading}
              maxLength={30}
              className="h-11 rounded-2xl"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !canSubmit}
          className="neon-cyan h-11 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? 'Lobiye bağlanıyor...' : 'Oyuna Katıl'}
        </Button>
      </form>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        PIN yalnızca rakam kabul eder. Geçersiz oyunlarda hata sakin bir panelde,
        ana aksiyondan dikkat çalmadan gösterilir.
      </p>
    </div>
  );
}
