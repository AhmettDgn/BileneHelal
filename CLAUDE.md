\# CLAUDE.md - Gerçek Zamanlı (Eş Zamanlı) Quiz Platformu



\## Proje Kimliği

Bu proje, \*\*eş zamanlı (real-time)\*\* etkileşim üzerine kurulmuş bir quiz platformudur.

Sunucu ve istemci arasında anlık, çift yönlü veri akışı esastır.

Bir kullanıcının cevap vermesi, sürenin işlemesi veya lider tahtasının güncellenmesi, sayfa yenilemeye gerek kalmadan tüm katılımcılara milisaniyeler içinde yansıtılmalıdır.

\##Web Platformu:
-Ana Sayfa: Platform tanıtımı, popüler quizler.

-Kimlik Doğrulama: E-posta/şifre, Google, GitHub ile giriş (Supabase Auth).

-Quiz Oluşturucu: Sürükle-bırak ile çoktan seçmeli soru ekleme, süre ve puan ayarları.

-Oyun Lobisi: 6 haneli PIN ile oyuna katılım, canlı katılımcı listesi, oyun başlatma kontrolü.

-Canlı Oyun Motoru: Soruların tüm katılımcılara aynı anda iletilmesi, anlık cevap toplama, doğru cevap açıklaması.

-Senkronize Zamanlayıcı: Sunucu taraflı geri sayım (hileye kapalı), istemci tarafı kalibrasyon.

-Anlık Lider Tahtası: Her cevaptan sonra güncellenen sıralama, oyun sonu final podyumu.

-Oyun Sonu İstatistikleri: Katılımcı bazında doğru/yanlış dağılımı, puan grafikleri.

-Supabase altyapısı üzerine kurulu Next.js 14 (App Router) ile geliştirilmektedir.



\## Temel Teknoloji Yığını

\- \*\*Framework:\*\* Next.js 14 (App Router, Server Actions)

\- \*\*Eş Zamanlılık Motoru:\*\* Supabase Realtime (PostgreSQL LISTEN/NOTIFY + WebSocket)

\- \*\*Veritabanı \& Auth:\*\* Supabase (PostgreSQL, Row Level Security)

\- \*\*Stil:\*\* Tailwind CSS + shadcn/ui (Radix UI)

\- \*\*Dil:\*\* Kesinlikle TypeScript (`any` yasak)



\## Mimari Felsefe (Uyulması Zorunlu Kurallar)

\- \*\*Feature Kingdoms (Krallıklar):\*\* Her bir iş birimi (`auth`, `game-lobby`, `quiz-engine`, `stats`), kendi UI, hook ve eylemlerini içeren izole bir krallıktır.

\- \*\*Dumb UI:\*\* `components/ui/` altındaki bileşenler saf (pure) ve durumsuzdur (stateless). İş mantığı veya veri tabanı çağrısı içermezler.

\- \*\*Tek Doğruluk Kaynağı:\*\* Veritabanı şemasının TypeScript karşılığı `lib/supabase/database.types.ts` dosyasıdır. Yapay zeka, her tür çıkarımını bu dosyayı referans alarak yapar.

\- \*\*Server Actions:\*\* Tüm yazma (mutasyon) işlemleri (cevap gönderme, oyuna katılma) Server Actions üzerinden, Row Level Security kurallarına uygun şekilde yapılır.



\## Eş Zamanlılık (Real-Time) Prensipleri (EN KRİTİK BÖLÜM)

\- \*\*Broadcast (Yayın):\*\* Oyun durumu değişiklikleri (soru geçişi, süre başlangıcı) \*\*Broadcast\*\* kanalı üzerinden `channel.send()` metodu ile yapılır. Bu veriler veri tabanına yazılmaz, anlık ve geçicidir.

\- \*\*Presence (Varlık):\*\* Kullanıcıların lobide çevrimiçi olma durumu \*\*Presence\*\* kanalıyla takip edilir. `channel.track()` ile kullanıcı durumu anlık paylaşılır.

\- \*\*Postgres Changes (DB Değişiklikleri):\*\* Lider tahtası gibi kalıcı olması gereken veriler, veri tabanındaki değişikliklerin aboneliği (`channel.on('postgres\_changes')`) ile dinlenir.

\- \*\*Senkronizasyon Anahtarı:\*\* Tüm katılımcılar, sunucudan gelen `event\_id` veya `server\_timestamp` ile senkronize olur. İstemci saati asla esas alınmaz.



\## Krallıkların Eş Zamanlı Görevleri

\- \*\*`stats/`:\*\* `timer` ve `leaderboard` bu krallığın sorumluluğundadır. Supabase'den gelen anlık `scores` tablosu değişikliklerini dinler ve sunucunun gönderdiği kalan süreyi (broadcast) işler.

\- \*\*`quiz-engine/`:\*\* Soruların gösterimi ve cevapların toplanması bu krallıktadır. Sunucu tarafına cevabı iletir, sunucudan gelen "doğru cevap açıklandı" yayınını dinler.

\- \*\*`game-lobby/`:\*\* Katılımcı listesini Presence ile canlı olarak gösterir. Oyun başlatıldığında `quiz-engine` veya `stats` krallığına geçişi tetikleyen broadcast mesajını dinler.



\## Kodlama ve Hata Yönetimi Standartları

\- Yeni bir fonksiyon eklerken açıklayıcı JSDoc yorumu eklenir.

\- Herhangi bir hata alındığında, çözüm için atılan adımlar `memory.md` dosyasına hemen kaydedilir.

\- Bir görev başarıyla tamamlandığında, yapılan özet `memory.md` dosyasına yeni bir giriş olarak eklenir.



\## Kritik Dosya Görevleri

\- `lib/supabase/client.ts`: İstemci tarafı Supabase bağlantısı (Realtime özellikleri bu istemci üzerinden yürütülür).

\- `lib/supabase/server.ts`: Sunucu tarafı Supabase bağlantısı (Server Actions ve RLS için).

\- `lib/supabase/database.types.ts`: Yapay zekanın kutsal kitabı. Tüm tablo ve view'ların tiplerini içerir.

\## senden sonra codex kullanacağım bunun için codexin senin yaptığı şeyleri devam ettirebilmesi için memory.md yi iyi doldur


