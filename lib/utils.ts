/**
 * Genel yardımcı fonksiyonlar
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS sınıflarını birleştirir — çakışan stilleri doğru şekilde yönetir.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Saniye cinsinden zamanı "MM:SS" formatına dönüştürür.
 * @example formatTime(125) → "2:05"
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 6 haneli rastgele PIN oluşturur (000000-999999).
 */
export function generatePin(): string {
  return Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
}
