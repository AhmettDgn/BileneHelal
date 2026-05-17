/**
 * Game Lobby Kingdom - LobbyParticipants
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
        for (const id of nextJoined) updated[id] = true;
        return updated;
      });

      const timeoutId = window.setTimeout(() => {
        setRecentlyJoined((prev) => {
          const updated = { ...prev };
          for (const id of nextJoined) delete updated[id];
          return updated;
        });
      }, 1600);

      return () => window.clearTimeout(timeoutId);
    }

    previousIdsRef.current = new Set(participants.map((p) => p.id));
    return;
  }, [participants]);

  useEffect(() => {
    previousIdsRef.current = new Set(participants.map((p) => p.id));
  }, [participants]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="theme-panel-soft h-20 animate-pulse rounded-2xl border" />
        ))}
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <p className="theme-panel-soft rounded-2xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {participants.map((participant) => {
        const isMe = participant.id === currentParticipantId;
        const isNew = recentlyJoined[participant.id];

        return (
          <li
            key={participant.id}
            className={[
              'rounded-2xl border px-4 py-4 transition-all',
              'animate-[lobby-enter_560ms_ease-out]',
              isMe ? 'theme-panel neon-cyan' : 'theme-panel-soft',
              isNew ? 'neon-pink ring-1 ring-secondary/20' : '',
            ].join(' ')}
          >
            <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-start min-[420px]:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {participant.display_name}
                  </span>
                  {isMe && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      Sen
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isNew ? 'Lobiye katildi' : 'Lobiye bagli'}
                </p>
              </div>

              <span
                className={[
                  'inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap',
                  participant.is_online
                    ? 'bg-accent/12 text-accent'
                    : 'bg-muted text-muted-foreground',
                ].join(' ')}
              >
                <span
                  className={[
                    'h-2 w-2 rounded-full',
                    participant.is_online ? 'bg-accent animate-pulse' : 'bg-muted-foreground/40',
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
