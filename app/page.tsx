/**
 * Ana sayfa - server-first landing page.
 * Interaktif join akisina yalnizca gerekli client JS yuklenir.
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

const HERO_METRICS = [
  { value: '6 hane', label: 'hizli katilim PINi' },
  { value: 'Anlik', label: 'leaderboard akisi' },
  { value: 'Host', label: 'tek panel kontrolu' },
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
    eyebrow: 'Oyuncu deneyimi',
    title: 'Cevap verirken kaybolmayan net ve odakli arayuz',
    description:
      'Buyuk tipografi, temiz hiyerarsi ve hizli karar vermeyi destekleyen alanlar kullanir.',
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
      'Oyuncular sadece 6 haneli PIN ve gorunen adlariyla saniyeler icinde lobiye girer.',
  },
  {
    step: '03',
    title: 'Canli rekabeti yonet',
    description:
      'Sure, soru gecisi ve skor akisi tek bir ritimle ilerler; dikkat dagilmaz.',
  },
];

export default function HomePage() {
  return (
    <div className="pb-16 pt-8 sm:pt-12">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eff6ff_45%,#fff7ed_100%)] px-6 py-8 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.35)] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-orange-200/35 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-emerald-200/20 blur-3xl" />
        </div>

        <div className="relative grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="max-w-3xl">
            <Badge className="mb-4 border-slate-300 bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-700 shadow-sm">
              Realtime multiplayer quiz
            </Badge>

            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Kalabaligi ayni anda oyuna alan hizli ve net quiz deneyimi.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              BileneHalal, host ekranini sade tutarken oyunculari da bekletmeden
              oyuna alir. Daha az tik, daha temiz akis, daha guclu canli rekabet.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-6 text-sm">
                <Link href="/dashboard">Quiz olusturmaya basla</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-sm">
                <Link href="/login">Host olarak giris yap</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {HERO_METRICS.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4 shadow-sm backdrop-blur"
                >
                  <p className="text-xl font-bold text-slate-950">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-8 -top-6 h-20 rounded-full bg-slate-900/10 blur-3xl" />
            <div className="relative rounded-[28px] border border-slate-200/80 bg-white/90 p-3 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] backdrop-blur">
              <div className="mb-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
                    Hizli katilim
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    Oyunculari saniyeler icinde lobiye al
                  </p>
                </div>
                <div className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-200">
                  Live
                </div>
              </div>

              <HomeJoinPanel />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        {FEATURE_CARDS.map((feature) => (
          <Card
            key={feature.title}
            className="border border-slate-200/80 bg-white/85 shadow-[0_24px_60px_-46px_rgba(15,23,42,0.35)]"
          >
            <CardHeader>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                {feature.eyebrow}
              </p>
              <CardTitle className="text-xl text-slate-950">{feature.title}</CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-600">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="mt-10 grid gap-6 rounded-[28px] border border-slate-200 bg-white px-6 py-8 shadow-[0_26px_70px_-52px_rgba(15,23,42,0.28)] lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
            Oyun akisi
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            Host panelinden oyuncu ekranina kadar hiz kaybetmeyen bir duzen.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            Arayuzu gereksiz kalabaliga bogmadan, oyun aninda onemli olan seyleri
            one cikariyoruz: hizli katilim, net bilgi, anlik skor ve rahat yonetim.
          </p>
        </div>

        <div className="grid gap-4">
          {FLOW_STEPS.map((item) => (
            <Card
              key={item.step}
              className="border border-slate-200 bg-slate-50/80 shadow-none"
            >
              <CardContent className="flex gap-4 py-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <Card className="overflow-hidden border border-slate-200 bg-slate-950 text-slate-50 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.75)]">
          <CardContent className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300">
                Dashboard hazir
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Kendi quizini kur, canli oyunu tek panelden yonet.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Soru olusturma, yayinlama ve oyun baslatma akisini tek yerde topla.
                Hedef, oyun baslamadan once degil oyun sirasinda parlamak.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
                <Link href="/register">Hesap olustur</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
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
