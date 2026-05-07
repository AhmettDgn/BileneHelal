/**
 * Game Lobby Kingdom - LobbyParticipants
 * Lobiye yeni giren kullanicilari animasyonlu sekilde listeler.
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface LobbyParticipantItem {
  id: string;
  display_name: string;
  is_online: boolean | null;
}

interface LobbyParticipantsProps {
  participants: LobbyParticipantItem[];
  currentParticipantId?: string;
  isLoading?: boolean;
  emptyLabel?: string;
}

export function LobbyParticipants({
  participants,
  currentParticipantId,
  isLoading,
  emptyLabel = 'Henuz katilimci yok.',
}: LobbyParticipantsProps) {
  const previousIdsRef = useRef<Set<string>>(new Set());
  const [recentlyJoined, setRecentlyJoined] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const previousIds = previousIdsRef.current;
    const nextJoined: string[] = [];

    for (const participant of participants) {
      if (!previousIds.has(participant.id)) {
        nextJoined.push(participant.id);
      }
    }

    if (nextJoined.length > 0) {
      setRecentlyJoined((prev) => {
        const updated = { ...prev };
        for (const id of nextJoined) {
          updated[id] = true;
        }
        return updated;
      });

      const timeoutId = window.setTimeout(() => {
        setRecentlyJoined((prev) => {
          const updated = { ...prev };
          for (const id of nextJoined) {
            delete updated[id];
          }
          return updated;
        });
      }, 1600);

      return () => window.clearTimeout(timeoutId);
    }

    previousIdsRef.current = new Set(participants.map((participant) => participant.id));
    return;
  }, [participants]);

  useEffect(() => {
    previousIdsRef.current = new Set(participants.map((participant) => participant.id));
  }, [participants]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {participants.map((participant) => {
        const isMe = participant.id === currentParticipantId;
        const isNew = recentlyJoined[participant.id];

        return (
          <li
            key={participant.id}
            className={[
              'rounded-2xl border px-4 py-4 transition-all',
              'animate-[lobby-enter_560ms_ease-out]',
              isMe
                ? 'border-sky-300 bg-sky-50 shadow-[0_20px_40px_-30px_rgba(14,165,233,0.8)]'
                : 'border-slate-200 bg-white',
              isNew ? 'ring-2 ring-emerald-200 shadow-[0_20px_45px_-28px_rgba(16,185,129,0.45)]' : '',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-slate-950">
                    {participant.display_name}
                  </span>
                  {isMe && (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                      Sen
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {isNew ? 'Az once lobiye katildi' : 'Lobiye bagli'}
                </p>
              </div>

              <span
                className={[
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium',
                  participant.is_online
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500',
                ].join(' ')}
              >
                <span
                  className={[
                    'h-2 w-2 rounded-full',
                    participant.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400',
                  ].join(' ')}
                />
                {participant.is_online ? 'Cevrimici' : 'Cevrimdisi'}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
