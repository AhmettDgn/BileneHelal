/**
 * Soru bazli geri sayim hook'u.
 */

'use client';

import { useEffect, useState } from 'react';

export function useQuestionTimer(
  phaseEndsAt: string | null,
  isActive: boolean,
) {
  const computeRemaining = (deadline: string | null, active: boolean) => {
    if (!deadline || !active) {
      return 0;
    }

    const remainingMs = new Date(deadline).getTime() - Date.now();
    return Math.max(0, Math.ceil(remainingMs / 1000));
  };

  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(
    computeRemaining(phaseEndsAt, isActive),
  );

  useEffect(() => {
    setTimeRemainingSeconds(computeRemaining(phaseEndsAt, isActive));

    if (!isActive || !phaseEndsAt) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimeRemainingSeconds(computeRemaining(phaseEndsAt, isActive));
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [phaseEndsAt, isActive]);

  return {
    timeRemainingSeconds,
    isExpired: timeRemainingSeconds <= 0,
  };
}
