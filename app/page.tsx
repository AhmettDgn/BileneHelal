/**
 * Ana sayfa - server-first landing page.
 * 60/30/10 renk dagilimi: koyu zemin, camimsi katmanlar, neon vurgu.
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
    title: 'Neon vurgular sadece karar aninda parliyor',
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
    title: 'Neon hizla yonet',
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
      <section className="theme-panel neon-cyan relative overflow-hidden rounded-[28px] border px-4 py-6 sm:rounded-[34px] sm:px-8 sm:py-10 lg:px-14 lg:py-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-0 h-52 w-52 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute right-0 top-10 h-44 w-44 rounded-full bg-fuchsia-400/12 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-sky-300/10 blur-3xl" />
          <div className="theme-dot-grid absolute inset-0 opacity-25" />
        </div>

        <div className="relative grid items-start gap-8 lg:gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="max-w-3xl">
            <Badge className="theme-chip mb-4 px-3 py-1 text-[11px] uppercase tracking-[0.24em]">
              Realtime multiplayer quiz
            </Badge>

            <h1 className="max-w-2xl text-[2rem] font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Karanlik zeminde parlayan, hiz odakli modern quiz deneyimi.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              BileneHalal arayuzu 60/30/10 dengesiyle kuruldu: genis koyu alanlar,
              orta katmanda camimsi paneller ve sadece odak anlarinda devreye giren
              neon isiklar.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="neon-cyan h-12 w-full px-6 text-sm sm:w-auto">
                <Link href="/dashboard">Quiz olusturmaya basla</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 w-full border-cyan-300/20 bg-cyan-300/5 px-6 text-sm text-cyan-100 hover:bg-cyan-300/10 hover:text-cyan-50 sm:w-auto"
              >
                <Link href="/login">Host olarak giris yap</Link>
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
                  <p className="mt-1 text-sm text-slate-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-8 -top-6 h-20 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="theme-panel-light neon-pink relative rounded-[24px] border p-2 sm:rounded-[28px] sm:p-3">
              <div className="mb-3 flex flex-col gap-3 rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/8 px-4 py-3 text-white min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                <div className="min-w-0">
                  <p className="accent-text-pink text-xs uppercase tracking-[0.24em]">
                    Hizli katilim
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-100">
                    Oyunculari saniyeler icinde neon lobiye al
                  </p>
                </div>
                <div className="w-fit rounded-full border border-fuchsia-300/20 bg-fuchsia-300/8 px-3 py-1 text-xs text-fuchsia-100">
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

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {FEATURE_CARDS.map((feature, index) => (
          <Card
            key={feature.title}
            className={[
              'theme-panel-soft rounded-[26px] border text-white',
              index === 1 ? 'neon-cyan' : '',
              index === 2 ? 'neon-pink' : '',
            ].join(' ')}
          >
            <CardHeader>
              <p className={index === 2 ? 'accent-text-pink text-[11px] font-semibold uppercase tracking-[0.22em]' : 'accent-text-cyan text-[11px] font-semibold uppercase tracking-[0.22em]'}>
                {feature.eyebrow}
              </p>
              <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-300">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="theme-panel-soft mt-8 grid gap-6 rounded-[28px] border px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Badge className="theme-chip text-slate-100">Oyun akisi</Badge>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Host panelinden oyuncu ekranina kadar hiz kaybetmeyen bir duzen.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Koyu ana kitle, daha sakin ikinci katman ve sadece kritik UI anlarinda
            gorunen neon vurgu sayesinde hem gorsel kalite hem okunabilirlik korunur.
          </p>
        </div>

        <div className="grid gap-4">
          {FLOW_STEPS.map((item, index) => (
            <Card
              key={item.step}
              className={[
                'rounded-[24px] border border-cyan-300/10 bg-slate-950/35 shadow-none',
                index === 2 ? 'neon-cyan' : '',
              ].join(' ')}
            >
              <CardContent className="flex items-start gap-4 py-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-sm font-bold text-cyan-200">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <Card className="theme-panel neon-pink overflow-hidden rounded-[30px] border text-slate-50">
          <CardContent className="grid gap-6 px-4 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="accent-text-pink text-[11px] font-semibold uppercase tracking-[0.24em]">
                Dashboard hazir
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Kendi quizini kur, canli oyunu tek panelden yonet.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Soru olusturma, yayinlama ve oyun baslatma akisini tek yerde topla.
                Neon detaylar dikkat toplar, ana yuzey ise performansli ve sakin kalir.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg" className="neon-cyan w-full sm:w-auto lg:w-full">
                <Link href="/register">Hesap olustur</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-fuchsia-300/20 bg-fuchsia-300/5 text-fuchsia-100 hover:bg-fuchsia-300/10 hover:text-fuchsia-50 sm:w-auto lg:w-full"
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
