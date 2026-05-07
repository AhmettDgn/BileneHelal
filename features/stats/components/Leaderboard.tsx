/**
 * Stats Kingdom — Leaderboard Bileşeni (Dumb UI)
 * Oyuncuların puanlarını ve sırasını gösterir
 */

'use client';

interface LeaderboardEntry {
  id: string;
  displayName: string;
  totalScore: number;
  correctAnswers: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
}

export function Leaderboard({ entries, isLoading }: LeaderboardProps) {
  if (isLoading) {
    return <div className="text-center text-gray-600">Lider tahtası yükleniyor...</div>;
  }

  if (entries.length === 0) {
    return <div className="text-center text-gray-600">Henüz katılımcı yok</div>;
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Lider Tahtası</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="border-b last:border-b-0 p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-gray-400 w-8 text-center">
                #{index + 1}
              </span>
              <div>
                <p className="font-semibold">{entry.displayName}</p>
                <p className="text-sm text-gray-600">
                  {entry.correctAnswers} doğru
                </p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">{entry.totalScore}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
