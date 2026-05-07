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
  onSubmit: (gamePin: string, displayName: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function JoinGameForm({ onSubmit, isLoading, error }: JoinGameFormProps) {
  const [gamePin, setGamePin] = useState('');
  const [displayName, setDisplayName] = useState('');
  const trimmedDisplayName = displayName.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(gamePin.trim(), trimmedDisplayName);
  };

  /**
   * Sadece rakam alir ve degeri 6 haneye kadar sinirlar.
   */
  const handlePinChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setGamePin(digitsOnly);
  };

  return (
    <div className="w-full rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_24px_64px_-52px_rgba(15,23,42,0.45)]">
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">
          Oyuncu girisi
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          Oyun PIN&apos;ini gir ve lobiye baglan
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          6 haneli PIN ve gorunen adin yeterli. Gecerli bir oturum bulunduysa seni
          dogrudan oyuncu ekranina tasiriz.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Giris
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">Hizli PIN</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Akis
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">Canli lobi</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Durum
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">Anlik gecis</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="game-pin"
            className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500"
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
            className="h-14 rounded-2xl border-slate-300 bg-slate-50 text-center font-mono text-2xl tracking-[0.35em] text-slate-950"
            maxLength={6}
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="display-name"
            className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500"
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
            className="h-12 rounded-2xl border-slate-300 bg-slate-50"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || gamePin.length !== 6 || !trimmedDisplayName}
          className="h-12 w-full rounded-2xl text-sm font-semibold"
        >
          {isLoading ? 'Lobiye baglaniyor...' : 'Oyuna Katil'}
        </Button>
      </form>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        PIN yalnizca rakam kabul eder. Oyun mevcut degilse veya basladiysa sana
        acik bir hata mesaji gosterilir.
      </p>
    </div>
  );
}
