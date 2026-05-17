/**
 * Ana sayfa - server-first landing page.
 */

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HomeJoinPanel } from '@/features/game-lobby/components/HomeJoinPanel';
import { createServerClient } from '@/lib/supabase/server';

const HERO_METRICS = [
  { value: '60%', label: 'derin gece tabani' },
  { value: '30%', label: 'cam panel derinligi' },
  { value: '10%', label: 'neon odak vurgusu' },
];

const FEATURE_CARDS = [
  {
    eyebrow: 'Canli oyun',
    title: 'Ayni anda baslayan, ayni anda biten turlar',
    description:
      'Oyuncularin cevabi, sure ve liderlik degisimi ayni ekran ritmiyle akar.',
  },
  {
    eyebrow: 'Hizli kurulum',
    title: 'Bir quiz ac, PIN paylas, toplulugu oyuna al',
    description:
      'Karisik onboarding yerine host ve oyuncu icin cok kisa bir baslangic yolu sunar.',
  },
  {
    eyebrow: 'Odakli deneyim',
    title: 'Vurgular sadece karar aninda parliyor',
    description:
      'Arayuzun cogu sakin kaliyor, dikkat ise butonlar, canli durum ve sayilara toplaniyor.',
  },
];

const FLOW_STEPS = [
  {
    step: '01',
    title: 'Quizini ac',
    description:
      'Dashboard uzerinden quizi yayina al, oturumu baslat ve oyuna hazir hale getir.',
  },
  {
    step: '02',
    title: 'PIN ile oyuncu topla',
    description:
      'Oyuncular 6 haneli PIN ile, gerekiyorsa gorunen adlariyla saniyeler icinde lobiye girer.',
  },
  {
    step: '03',
    title: 'Hizla yonet',
    description:
      'Sure, soru gecisi ve skor akisi tek ritimde ilerler; host paneli hafif ve net kalir.',
  },
];

export default async function HomePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const registeredDisplayName =
    typeof user?.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name
      : user?.email ?? null;

  return (
    <div className="pb-14 pt-6 sm:pb-16 sm:pt-8 lg:pt-12">
      {/* ── Hero ── */}
      <section className="theme-panel neon-cyan relative overflow-hidden rounded-[28px] border px-4 py-6 sm:rounded-[34px] sm:px-8 sm:py-10 lg:px-14 lg:py-14">
        {/* Dekoratif arka plan */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-0 h-52 w-52 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute right-0 top-10 h-44 w-44 rounded-full bg-secondary/12 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-accent/10 blur-3xl" />
          <div className="theme-dot-grid absolute inset-0 opacity-25" />
        </div>

        <div className="relative grid items-start gap-8 lg:gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="max-w-3xl">
            <Badge className="theme-chip mb-4 px-3 py-1 text-[11px] uppercase tracking-[0.24em]">
              Realtime multiplayer quiz
            </Badge>

            <h1 className="max-w-2xl text-[2rem] font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Karanlık zeminde parlayan, hız odaklı modern quiz deneyimi.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              BileneHalal arayüzü 60/30/10 dengesiyle kuruldu: geniş koyu alanlar,
              orta katmanda camımsı paneller ve sadece odak anlarında devreye giren
              ışıklar.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="neon-cyan h-12 w-full bg-primary px-6 text-sm text-primary-foreground hover:bg-primary/90 sm:w-auto">
                <Link href="/dashboard">Quiz oluşturmaya başla</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 w-full border-primary/25 bg-primary/5 px-6 text-sm text-primary hover:bg-primary/10 sm:w-auto"
              >
                <Link href="/login">Host olarak giriş yap</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {HERO_METRICS.map((item, index) => (
                <div
                  key={item.label}
                  className={[
                    'theme-panel-soft rounded-2xl border px-4 py-4',
                    index === 2 ? 'neon-pink' : '',
                  ].join(' ')}
                >
                  <p className={index === 2 ? 'accent-text-pink text-xl font-bold' : 'accent-text-cyan text-xl font-bold'}>
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Katılım paneli */}
          <div className="relative">
            <div className="absolute inset-x-8 -top-6 h-20 rounded-full bg-primary/15 blur-3xl" />
            <div className="theme-panel-light neon-pink relative rounded-[24px] border p-2 sm:rounded-[28px] sm:p-3">
              <div className="mb-3 flex flex-col gap-3 rounded-2xl border border-secondary/20 bg-secondary/8 px-4 py-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                <div className="min-w-0">
                  <p className="accent-text-pink text-xs uppercase tracking-[0.24em]">
                    Hızlı katılım
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    Oyuncuları saniyeler içinde lobiye al
                  </p>
                </div>
                <div className="w-fit rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                  LIVE
                </div>
              </div>

              <HomeJoinPanel
                initialDisplayName={registeredDisplayName}
                initialIsAuthenticated={Boolean(user)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Özellik kartları ── */}
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {FEATURE_CARDS.map((feature, index) => (
          <Card
            key={feature.title}
            className={[
              'theme-panel-soft rounded-[26px] border',
              index === 1 ? 'neon-cyan' : '',
              index === 2 ? 'neon-pink' : '',
            ].join(' ')}
          >
            <CardHeader>
              <p className={index === 2 ? 'accent-text-pink text-[11px] font-semibold uppercase tracking-[0.22em]' : 'accent-text-cyan text-[11px] font-semibold uppercase tracking-[0.22em]'}>
                {feature.eyebrow}
              </p>
              <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
              <CardDescription className="text-sm leading-6 text-muted-foreground">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      {/* ── Akış adımları ── */}
      <section className="theme-panel-soft mt-8 grid gap-6 rounded-[28px] border px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Badge className="theme-chip">Oyun akışı</Badge>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Host panelinden oyuncu ekranına kadar hız kaybetmeyen bir düzen.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            Ana kitle, daha sakin ikinci katman ve sadece kritik UI anlarında
            görünen vurgu sayesinde hem görsel kalite hem okunabilirlik korunur.
          </p>
        </div>

        <div className="grid gap-4">
          {FLOW_STEPS.map((item, index) => (
            <Card
              key={item.step}
              className={[
                'rounded-[24px] border border-border bg-card shadow-none',
                index === 2 ? 'neon-cyan' : '',
              ].join(' ')}
            >
              <CardContent className="flex items-start gap-4 py-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-sm font-bold text-primary">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mt-8">
        <Card className="theme-panel neon-pink overflow-hidden rounded-[30px] border">
          <CardContent className="grid gap-6 px-4 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="accent-text-pink text-[11px] font-semibold uppercase tracking-[0.24em]">
                Dashboard hazır
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Kendi quizini kur, canlı oyunu tek panelden yönet.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Soru oluşturma, yayınlama ve oyun başlatma akışını tek yerde topla.
                Vurgu detaylar dikkat toplar, ana yüzey ise performanslı ve sakin kalır.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg" className="neon-cyan w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto lg:w-full">
                <Link href="/register">Hesap oluştur</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-secondary/25 bg-secondary/5 text-secondary hover:bg-secondary/10 sm:w-auto lg:w-full"
              >
                <Link href="/dashboard">Dashboard&apos;a git</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
