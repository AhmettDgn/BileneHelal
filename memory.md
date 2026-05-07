# Proje Hafızası (Memory.md)

Bu dosya, projenin geliştirme süreci boyunca alınan kritik kararların, karşılaşılan hataların ve uygulanan çözümlerin kaydını tutar.
`CLAUDE.md` talimatları doğrultusunda yapay zeka asistanı tarafından otomatik olarak güncellenir.

---

## Geliştirme Günlüğü

### 2026-05-06 - Proje İskeletinin ve Eş Zamanlılık Temelinin Kurulması
- **Görev:** Proje mimarisine son şekli verildi, dosya yapısı ve yapay zeka anayasası (`CLAUDE.md`) oluşturuldu.
- **Karar:** Supabase'in sunduğu `Broadcast`, `Presence` ve `Postgres Changes` özelliklerinin kullanım sorumlulukları krallıklar arasında paylaştırıldı.
- **Sebep:** Gerçek zamanlı quiz mantığının temiz, ölçeklenebilir ve yapay zeka tarafından yönetilebilir olması için.

### 2026-05-06 - Tam Proje İskeleti Kurulması (Tamamlandı)
- **Görev:** Next.js 14 + Supabase + shadcn/ui projesi tamamen iskeleti inşa edildi.
- **Aşamalar Tamamlandı:**
  1. ✅ Next.js 14 projesi başlatıldı (TypeScript, Tailwind CSS, App Router)
  2. ✅ Konfigürasyon dosyaları (tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.js)
  3. ✅ .cursorrules dosyası oluşturuldu (Cursor AI için Feature Kingdom kuralları)
  4. ✅ lib/ katmanı:
     - `lib/supabase/database.types.ts` — TEK DOĞRULUK KAYNAĞI (tüm tablo şemaları)
     - `lib/supabase/client.ts` — Browser Supabase (Realtime + Auth)
     - `lib/supabase/server.ts` — Sunucu Supabase (Server Actions + RLS)
     - `lib/redis/client.ts` — Upstash Redis bağlantısı
     - `lib/utils.ts` — cn(), formatTime(), generatePin()
  5. ✅ Feature Kingdoms (4 İzole Krallık):
     - **auth/** — signIn/signUp/signOut Server Actions + LoginForm
     - **game-lobby/** — createGame/joinGame/startGame + useLobbySub scription + LobbyRoom
     - **quiz-engine/** — submitAnswer/advanceQuestion + useGameSync + QuestionDisplay
     - **stats/** — useTimerSync, useLeaderboard + Leaderboard bileşeni
  6. ✅ App Router sayfaları (Next.js 14):
     - Başlangıç sayfası, Auth sayfaları, Host/Play sayfaları
  7. ✅ Supabase database migration (001_initial_schema.sql):
     - 6 tablo: quizzes, questions, game_sessions, participants, answers, scores
     - Row Level Security (RLS) — Her tablo için
  8. ✅ Supabase Edge Function (timer):
     - Merkezi sunucu taraflı geri sayım (hileye kapalı)
     - Broadcast ile client senkronizasyonu

- **npm İstatistikleri:** 533 paket yüklendi, type-strict TypeScript

- **Dosya Yapısı Durumu:**
  ```
  ✅ lib/                    (Supabase clients, Redis, utilities)
  ✅ features/               (4 Kingdom: auth, game-lobby, quiz-engine, stats)
  ✅ app/                    (Next.js App Router pages)
  ✅ supabase/               (migrations, edge functions)
  ⏳ components/ui/          (Dumb UI, shadcn/ui integrasyon beklemede)
  ```

- **Önemli Notlar:**
  - Tüm server actions ve hooks CRUD operasyonlarına hazır
  - RLS politikaları strict security ile yapılandırılmış
  - Broadcasting ve Postgres Changes skeletleri kurulu
  - Sonraki adım: Form validasyonu ve UI tamamlama

- **Codex için Devam Talimatları:**
  - `npm run dev` ile projeyi test et
  - Supabase bağlantı URL'lerini .env.local'a ekle
  - shadcn/ui bileşenlerini entegre et
  - Form state management tamamla

### 2026-05-06 - Hata Çözümleri ve Doğrulama (Aşama 1 Bitiş)

#### Karşılaşılan Hatalar ve Çözümleri

**1. `npx create-next-app` reddetti — npm naming kuralı**
- **Hata:** "name can no longer contain capital letters" (BileneHelal klasör adı için)
- **Çözüm:** Manuel `package.json` oluşturuldu, `name: "bilene-halal"` (kebab-case) kullanıldı.

**2. TypeScript: `'is_online' does not exist on type 'never'` (15+ hata)**
- **Hata:** Supabase `.from()` çağrıları `never` tipi dönüyordu, Database tipi geçmiyordu.
- **Sebep:** `@supabase/ssr@0.1.0` versiyonu eski; yeni `@supabase/supabase-js@2.105.3` (postgrest-js@2.105.3) ile uyumsuz. Yeni `GenericTable` tipi `Relationships: GenericRelationship[]` alanı zorunlu kılıyor.
- **Çözüm:**
  - `npm install @supabase/ssr@latest` → 0.10.2'ye yükseltildi
  - `database.types.ts`'de her tabloya `Relationships: [...]` eklendi
  - `Views`, `Functions`, `Enums`, `CompositeTypes` için `Record<string, never>` kullanıldı

**3. Next.js 14: `next.config.ts` desteklenmiyor**
- **Hata:** "Configuring Next.js via 'next.config.ts' is not supported"
- **Çözüm:** `next.config.ts` silindi, `next.config.mjs` ile değiştirildi.

**4. ESLint: react/no-unescaped-entities**
- **Hata:** `'` apostrof karakteri JSX'de escape edilmemiş.
- **Çözüm:** `BileneHalal'a` → `BileneHalal&apos;a`

**5. Next.js: Server Component → Client Component'e function geçilemiyor**
- **Hata:** "Event handlers cannot be passed to Client Component props"
- **Sebep:** Server Component olan login page, Client Component olan LoginForm'a `onSubmit` fonksiyonu geçiyordu.
- **Çözüm:** Login page'in başına `'use client'` eklendi; state ve handler client'ta tutuluyor.

#### Doğrulama Sonuçları

✅ `npm run type-check` → Hatasız (0 error)
✅ `npm run build` → Başarılı (6 sayfa generate edildi)
   - / (static)
   - /login (static, 1.14 kB)
   - /register (static)
   - /host/[quizId] (dynamic)
   - /play/[gamePin] (dynamic)
   - /_not-found (static)
✅ `npm run dev` → 1979ms'de Ready (http://localhost:3000)

#### Son Yapılandırma

- **next.config.mjs** (TS yerine MJS — Next.js 14 sınırı)
- **tsconfig.json**: strict + noUnusedLocals/Parameters açık, supabase/functions/** exclude
- **@supabase/ssr v0.10.2** + **@supabase/supabase-js v2.105.3**
- **Database tipi:** Relationships dahil — Supabase v2.105 GenericTable şartlarını karşılıyor

#### Codex İçin Sonraki Adımlar

1. Supabase projesi oluştur, URL/anonKey'i `.env.local`'e ekle
2. Migration uygula: `supabase db push` (veya Studio'da SQL çalıştır)
3. Edge Function deploy: `supabase functions deploy timer`
4. shadcn/ui kurulumu: `npx shadcn@latest init` (Next.js 14 ile uyumlu sürüm)
5. RegisterForm bileşenini LoginForm'a benzer şekilde tamamla
6. Quiz oluşturucu UI (dashboard) yapılmalı
7. Realtime hook'larını `.env.local` ile gerçek bağlantı testleri yap

### 2026-05-06 - Phase 2 Progress (Build Stabilitesi ve Doğrulama)
- **Görev:** Ana sayfadaki katılım akışı korunarak build/doğrulama sorunları ele alındı ve proje hafızası güncellendi.
- **Karar:** `JoinGameForm` ana sayfada zaten entegre olduğu için yeniden uygulanmadı; `app/page.tsx` içindeki mevcut `joinGameSession(gamePin, displayName)` akışı korundu.
- **Düzeltme:** Production build sırasında görülen `PageNotFoundError: Cannot find module for page: /_document` hatasını gidermek için App Router yapısını bozmadan minimal `pages/_document.tsx` shim'i eklendi.
- **Build Sonucu:** `.next` temizliği sonrası `npm.cmd run build` başarıyla tamamlandı; `/_document` hatası tekrar etmedi.
- **Doğrulama:** `npm.cmd run dev` ile geliştirici sunucusunun `3000` portunda dinlediği doğrulandı.
- **Smoke Test:** `http://127.0.0.1:3000/` isteği `200 OK` döndürdü ve ana sayfa içeriğinde `BileneHalal` metni doğrulandı.
- **Ortam Notu:** Windows PowerShell ortamında `npm.ps1` execution policy'ye takıldığı için doğrulama komutlarında `npm.cmd` kullanılması gerektiği netleşti.

### 2026-05-06 - Phase 3 Progress (Auth ve Erişim Akışı)
- **Görev:** Navbar oturum farkındalıklı hale getirildi, auth sayfaları ile korumalı dashboard akışı tutarlı yönlendirmelerle bağlandı.
- **Navbar:** Root layout içindeki placeholder navbar kaldırıldı; `features/auth/components/AuthNav.tsx` ile giriş yapmamış kullanıcılar için `Giris Yap` / `Kayit Ol`, giriş yapmış kullanıcılar için kullanıcı bilgisi, `Dashboard` ve `Cikis Yap` kontrolleri eklendi.
- **Erişim Guard'ları:** `app/(auth)/layout.tsx` ile oturum sahibi kullanıcılar `/login` ve `/register` üzerinden otomatik `/dashboard` rotasına yönlendiriliyor. `app/(dashboard)/layout.tsx` ile `/dashboard` ve `/quiz/new` artık giriş yapılmadan açılamıyor; kullanıcı `/login` rotasına yönlendiriliyor.
- **Yönlendirme Kararı:** Login başarılıysa istemci `router.push('/dashboard')` yapıyor. Register başarılıysa aktif session varsa `/dashboard`, yoksa `/login` rotasına gidiyor; böylece e-posta doğrulama açık senaryosu da bozulmuyor.
- **OAuth Notu:** `NEXT_PUBLIC_BASE_URL` kullanan OAuth callback akışı bu fazda değiştirilmedi; çünkü UI üzerinde henüz OAuth butonları bağlı değil.
- **Doğrulama:** `npm.cmd run type-check` geçti, `npm.cmd run build` geçti, dev smoke testinde `3000` portu dinledi ve `http://127.0.0.1:3000/` isteği `200 OK` döndürdü.

### 2026-05-07 - Lobi Bekleme Ekrani Animasyonlari
- **Görev:** Host ve oyuncu tarafindaki lobi bekleme ekranlari daha canli hale getirildi; lobiye yeni giren kullanicilar ekranda animasyonla gorunur yapildi.
- **Yeni Bileşen:** `features/game-lobby/components/LobbyParticipants.tsx` eklendi. Katilimci kartlarini grid olarak render ediyor, yeni gelen kullanicilari `lobby-enter` animasyonuyla ve gecici highlight ile one cikariyor.
- **Host Ekrani:** `LobbyRoom.tsx` yeniden tasarlandi. Animasyonlu "LIVE" pulse, guclu bekleme hero alani, PIN ve oyuncu sayisi metrikleri ve altta animasyonlu katilimci listesi eklendi.
- **Oyuncu Ekrani:** `PlayerLobbyView.tsx` lobi bekleme durumunu daha zengin bir hero alanina tasiyor; oyuncular artik ayni animasyonlu katilimci listesini goruyor ve "host oyunu baslatana kadar" canli durum hissi korunuyor.
- **Stil Altyapisi:** `app/globals.css` icine `lobby-enter` ve `lobby-pulse` keyframe'leri eklendi. Bunlar sadece lobi kartlarinda kullaniliyor; agir kutuphane eklenmedi.
- **Doğrulama:** `npm.cmd run type-check` ve `npm.cmd run build` basariyla gecti.

### 2026-05-06 - Phase 4 Progress (Quiz Yaşam Döngüsü)
- **Görev:** Dashboard'daki "Oyun Başlat" akışı placeholder'lardan arındırılıp gerçek `game_sessions` oluşturma + host paneli zincirine bağlandı.
- **createGameSession Düzeltmesi:** `features/game-lobby/actions.ts` içinde `total_questions: 0` placeholder'ı kaldırıldı. Insert öncesinde quiz varlığı + sahiplik (`quizzes.owner_id === user.id`) doğrulanıyor; ardından `questions` tablosundan `count: 'exact', head: true` ile soru sayısı alınıyor. Sayı `0` ise `Soru içermeyen quiz başlatılamaz` hatası fırlatılıyor.
- **StartGameButton:** `features/game-lobby/components/StartGameButton.tsx` yeni client bileşen olarak eklendi. `useTransition` ile pending state, `useState` ile inline hata yönetiyor; `createGameSession(quizId)` server action'ını çağırıp başarıda `router.push('/host/{session.id}')` ile yönlendiriyor.
- **Dashboard:** `app/(dashboard)/dashboard/page.tsx` Server Component olarak korundu; eski `<Link href="/host/{quiz.id}">Oyun Başlat</Link>` bloğu kaldırılıp `<StartGameButton quizId={quiz.id} />` ile değiştirildi.
- **Host Rotası Taşındı:** `app/(game)/host/[quizId]/page.tsx` silindi (Next.js dinamik segment çakışmasını önlemek için yenisinden önce). Yerine `app/(game)/host/[gameSessionId]/page.tsx` Server Component'i geldi; auth + `host_id` kontrolü yapıyor, `game_sessions` ve `quizzes(title)` join'iyle veriyi çekiyor, status'a göre üç görünüm gösteriyor (waiting → `HostLobbyView`, in_progress / completed → kısa placeholder).
- **HostLobbyView:** `features/game-lobby/components/HostLobbyView.tsx` yeni client bileşen. `useLobbySubscription(gameSessionId)` ile katılımcı sayısını canlı takip ediyor, mevcut `LobbyRoom` dumb UI'sini sarıyor ve `onStartGame` içinde `startGameSession(gameSessionId)` çağırıp `router.refresh()` yapıyor; hata varsa LobbyRoom'un üstünde inline gösteriyor.
- **Doğrulama:**
  - `Remove-Item -Recurse -Force .next` sonrası `npm.cmd run type-check` temiz geçti.
  - `npm.cmd run build` başarıyla bitti; route listesinde `/host/[gameSessionId]` (1.89 kB / 153 kB First Load JS) göründü, eski `[quizId]` rotası listede yok.
  - `npm.cmd run dev` 3000 portunda başladı, `http://127.0.0.1:3000/` isteği `200` döndürdü.
- **Sonraki Faz Notu:** Phase 5'te `joinGameSession` sonucunun `sessionStorage["bilenehalal:player-session:<gamePin>"]`'de saklanması ve `/play/[gamePin]` sayfasının `useLobbySubscription` ile bekleme ekranına bağlanması bekleniyor.

### 2026-05-07 - Quiz Builder UI Redesign (3-Pane)
- **Görev:** `/quiz/new` ekranı tek kolonlu uzun formdan üç panelli (sol: liste, orta: içerik, sağ: ayarlar) düzene taşındı. Veri modeli ve `createQuiz` server action değişmedi.
- **Tip ortak dosyaya alındı:** `features/quiz-builder/types.ts` eklendi; `QuestionDraft` ve `isQuestionComplete` helper'ı buraya taşındı. Tüm builder bileşenleri buradan import ediyor.
- **Bileşen Bölünmesi:** Eski `features/quiz-builder/components/QuestionEditor.tsx` silindi. Yerine üç dumb UI bileşeni geldi:
  - `QuestionContentEditor.tsx` (orta panel: soru metni + 4 seçenek + radio doğru cevap; doğru seçenek emerald vurgulu)
  - `QuestionSettingsPanel.tsx` (sağ panel: süre + puan + sil; tek soru kalınca sil disabled)
  - `QuestionListPanel.tsx` (sol panel: sıralı liste, ↑↓ ile sıralama, eksik soru için amber vurgu noktası, tıklamayla aktif soru seçimi, "+ Soru Ekle")
- **QuizBuilderForm Revizyonu:** Üst meta bar yatay (başlık + açıklama + yayınla); alt grid `lg:grid-cols-[260px_minmax(0,1fr)_300px]`. State'e `activeIndex` eklendi. `addQuestion` yeniyi otomatik aktif yapıyor. `removeQuestion` aktif silindiğinde önceki/0 indeksine düşüyor. `moveQuestion(from, to)` swap yapıp `activeIndex`'i taşınanı izleyecek şekilde güncelliyor.
- **Sayfa Konteyneri:** `app/(dashboard)/quiz/new/page.tsx` `max-w-3xl` yerine `max-w-7xl` kullanıyor; başlık ve kısa açıklama 3 panele göre yeniden yazıldı.
- **Doğrulama:** `npm.cmd run type-check` temiz; `npm.cmd run build` başarıyla bitti, `/quiz/new` 4.05 kB / 99.3 kB First Load JS.
- **Codex Notu:** Quiz düzenleme sayfası (`/quiz/[id]/edit`) eklenirse aynı üç panel bileşeni doğrudan yeniden kullanılabilir; `QuizBuilderForm`'a sadece `initialData` prop'u eklenmesi yeter.
