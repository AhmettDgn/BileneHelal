/**
 * Oyuncu oturum bağlamını sessionStorage üzerinden yönetir.
 * - Anonim oyuncuların PIN bazlı kimliği bu yardımcı ile sürdürülür.
 * - Anahtar şeması: bilenehalal:player-session:<gamePin>
 * - Sayfa yenilendiğinde de aynı katılımcı kaydına bağlı kalmamızı sağlar.
 */

const STORAGE_PREFIX = 'bilenehalal:player-session:';

export interface PlayerSession {
  participantId: string;
  gameSessionId: string;
  displayName: string;
}

function buildKey(gamePin: string): string {
  return `${STORAGE_PREFIX}${gamePin}`;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** PIN için kayıtlı player session'ı döner; yoksa null. */
export function readPlayerSession(gamePin: string): PlayerSession | null {
  const storage = getStorage();
  if (!storage) return null;

  const raw = storage.getItem(buildKey(gamePin));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PlayerSession;
    if (
      typeof parsed?.participantId === 'string' &&
      typeof parsed?.gameSessionId === 'string' &&
      typeof parsed?.displayName === 'string'
    ) {
      return parsed;
    }
  } catch {
    // bozuksa görmezden gel
  }
  return null;
}

/** PIN için player session'ı yazar/üzerine yazar. */
export function writePlayerSession(
  gamePin: string,
  session: PlayerSession,
): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(buildKey(gamePin), JSON.stringify(session));
}

/** PIN için player session'ı temizler (oyuncu çıkış yapmak isterse). */
export function clearPlayerSession(gamePin: string): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(buildKey(gamePin));
}
