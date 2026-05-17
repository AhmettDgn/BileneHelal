/**
 * Dashboard - kullanicinin kendi quizleri ve yonetim arayuzu.
 */

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HomeJoinPanel } from '@/features/game-lobby/components/HomeJoinPanel';
import { StartGameButton } from '@/features/game-lobby/components/StartGameButton';
import { listMyQuizzes } from '@/features/quiz-builder/actions';
import { createServerClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const quizzes = await listMyQuizzes();
  const hasQuizzes = quizzes.length > 0;
  const registeredDisplayName =
    typeof user?.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name
      : user?.email ?? null;

  return (
    <div className="py-6 sm:py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Quizlerim</h1>
          <p className="mt-1 text-muted-foreground">
            Olusturdugun quizleri yonet ve oyunlar baslat.
          </p>
        </div>
        <Button asChild className="neon-cyan w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
          <Link href="/quiz/new">+ Yeni Quiz</Link>
        </Button>
      </div>

      <section className="mb-8 grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="theme-panel-soft h-fit rounded-[28px] border p-4 sm:p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Quiz Uretimi
          </p>
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            {hasQuizzes
              ? 'Yeni bir quiz hazirla veya mevcut setlerinden birini hizla oyuna donustur.'
              : 'Henuz hic quizin yok. Ilk quizini simdi hazirla ve lobiyi ac.'}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            {hasQuizzes
              ? 'Soru setlerini tek panelden yonet, yeni quiz akislari kur ve hazir oldugunda oyunu bir tikla baslat.'
              : 'Ilk quizini olusturdugunda host panelinden PIN uretip oyunculari saniyeler icinde canli lobiye alabilirsin.'}
          </p>
          <div className="mt-4">
            <Button asChild className="neon-cyan w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
              <Link href="/quiz/new">
                {hasQuizzes ? 'Yeni Quiz Olustur' : 'Ilk Quizini Olustur'}
              </Link>
            </Button>
          </div>
        </div>

        <div className="theme-panel-soft h-fit rounded-[28px] border p-3 sm:p-4">
          <HomeJoinPanel
            initialDisplayName={registeredDisplayName}
            initialIsAuthenticated={Boolean(user)}
          />
        </div>
      </section>

      {hasQuizzes && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="theme-panel-soft flex flex-col rounded-[24px] border p-4 sm:p-5"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="flex-1 text-lg font-semibold text-foreground">{quiz.title}</h3>
                <Badge
                  variant={quiz.is_published ? 'default' : 'outline'}
                  className={
                    quiz.is_published
                      ? 'bg-primary/90 text-primary-foreground hover:bg-primary'
                      : 'border-border text-muted-foreground'
                  }
                >
                  {quiz.is_published ? 'Yayinda' : 'Taslak'}
                </Badge>
              </div>

              {quiz.description && (
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {quiz.description}
                </p>
              )}

              <div className="mb-4 text-xs text-muted-foreground">
                {new Date(quiz.created_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>

              <div className="mt-auto flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted"
                >
                  <Link href={`/quiz/${quiz.id}/edit`}>Duzenle</Link>
                </Button>
                <StartGameButton quizId={quiz.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
