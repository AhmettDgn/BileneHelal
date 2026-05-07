/**
 * Dashboard — Kullanıcının kendi quizleri ve yönetim arayüzü
 */

import Link from 'next/link';
import { listMyQuizzes } from '@/features/quiz-builder/actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StartGameButton } from '@/features/game-lobby/components/StartGameButton';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const quizzes = await listMyQuizzes();

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quizlerim</h1>
          <p className="text-muted-foreground mt-1">
            Oluşturduğun quizleri yönet ve oyunlar başlat.
          </p>
        </div>
        <Button asChild>
          <Link href="/quiz/new">+ Yeni Quiz</Link>
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Henüz hiç quiz oluşturmadın.
          </p>
          <Button asChild>
            <Link href="/quiz/new">İlk Quizini Oluştur</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white border rounded-lg p-5 flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-semibold flex-1">{quiz.title}</h3>
                <Badge variant={quiz.is_published ? 'default' : 'outline'}>
                  {quiz.is_published ? 'Yayında' : 'Taslak'}
                </Badge>
              </div>

              {quiz.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {quiz.description}
                </p>
              )}

              <div className="text-xs text-muted-foreground mb-4">
                {new Date(quiz.created_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>

              <div className="flex gap-2 mt-auto">
                <StartGameButton quizId={quiz.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
