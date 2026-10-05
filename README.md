# Set Defteri

Türkçe, mobil uyumlu kişisel antrenman günlüğü. iPhone ana ekranına eklenebilir; ilk çevrimiçi yüklemeden sonra çevrimdışı kayıt tutabilir.

Bu paket, 2 Ekim 2026'da yayınlanan **16. sürümün** kaynak kodudur. 5 Ekim 2026'da GitHub'a aktarım için hazırlanmıştır.
Kaynak commit: `feb30df0e1b42c197afd35e3b99a9cb519a50098`.

## Özellikler

- Kas bölgesine göre hareket kataloğu, alfabetik sıralama ve arama.
- Ağırlık + tekrar, vücut ağırlığı + tekrar, süre + saniye kaydı.
- Mat / vücut ağırlığı bölümü ve yürüyüş, koşu, bisiklet, yüzme kayıtları.
- Geçmiş antrenmanlara hareket ekleme, düzenleme ve silme; açılır-kapanır bölümler.
- Hareket görselleri; telefondan fotoğraf ekleme, değiştirme ve kaldırma.
- Hareket arşivi ve geçmiş setleri koruyan kalıcı listeden kaldırma.
- Hareket gelişimi, tahmini aktif kalori ve çalışılan kasları gösteren vücut haritası.
- Harf harf yazılan açılış cümlesi.
- Yerel kayıt, bağlantı gelince hesapla eşitleme, JSON yedek ve CSV rapor.

## GitHub'a yükleme

1. ZIP dosyasını bilgisayarında çıkar.
2. GitHub'da boş bir repository oluştur. Örnek ad: `set-defteri`.
3. Terminali bu README'nin bulunduğu klasörde aç. Aşağıdaki URL'deki `KULLANICI_ADIN` kısmını kendi GitHub adınla değiştir:

```sh
git init
git add .
git commit -m "Set Defteri kaynak kodu"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/set-defteri.git
git push -u origin main
```

GitHub girişini kendi hesabınla yap. GitHub'a ZIP dosyasının kendisini değil, içindeki proje dosyalarını yükle. `package.json`, `app/`, `components/`, `public/` ve `.openai/` repository kökünde yer almalı. Gizli dosyaları da dahil et; Git komutları bunu otomatik yapar.

## Bilgisayarda çalıştırma

Gerekenler: Node.js 22.13 veya üstü ve pnpm 11.25.0. Proje pnpm kilit dosyası kullanır; npm install ile ayrı bir kilit dosyası üretme.

```sh
npm install -g pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm dev
```

Tarayıcıda terminalin gösterdiği adresi aç; varsayılan geliştirme adresi `http://localhost:5173`.

```sh
pnpm exec tsc --noEmit
pnpm build
```

Temiz bir klonda çalışma profili otomatik olarak `portable` olur. Windows üzerinde geliştirme ve build için Bash gerekmez; `install:ci` betiği ise mevcut Linux/Sites akışına aittir. Yerelde yukarıdaki `pnpm install` komutunu kullan.

### Yerel hesap ve veritabanı

Arayüz kayıtları tarayıcıda saklar. Sunucu eşitlemesi için `DB` isimli Cloudflare D1 bağlantısı ve kullanıcı kimliği gerekir. Yerel geliştirmede yalnızca localhost için bir deneme giriş akışı vardır:

`http://localhost:5173/signin-with-chatgpt?return_to=/`

Bu giriş, gerçek ChatGPT hesabına veya canlı antrenman verilerine erişmez. Boş yerel veritabanına ilk kurulumu uygulamak için bir kez `pnpm build` çalıştır, ardından:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_spicy_toro.sql
```

Bu SQL dosyasını daha önce kurulmuş aynı yerel veritabanına tekrar uygulama. `records` tablosu zaten varsa bu adımı atla. Sonrasında `pnpm dev` ile devam et.

## Yayınlama hakkında

**GitHub'a yüklemek uygulamayı otomatik yayınlamaz.** Bu uygulama yalnızca statik HTML değildir; sunucu API'si ve veritabanı kullanır. GitHub Pages üzerinde mevcut haliyle tam çalışmaz.

Mevcut canlı uygulama Sites üzerinde çalışır. `.openai/hosting.json`, bu Site'ın proje kimliğini ve mantıksal `DB` bağlantısını içerir; parola içermez. GitHub'a kaynak kopyası yüklemek mevcut yayını değiştirmez veya otomatik güncellemez.

Başka bir platformda yayınlamak için Cloudflare Workers uyumlu çalışma ortamı, gerçek D1 veritabanı bağlantısı, migration ve güvenli kullanıcı doğrulaması yapılandırılmalıdır. `app/chatgpt-auth.ts` canlı ortamda Sites tarafından doğrulanarak eklenen kimlik başlıklarına dayanır. Başka bir sunucuda dışarıdan gelen bu başlıklara doğrudan güvenilmemeli; doğrulanmış bir oturum sistemiyle değiştirilmelidir. Yerel sahte giriş üretim giriş sistemi değildir.

## Kişisel kayıtlarını da taşımak

Bu ZIP kaynak kodu ve hazır görselleri içerir. Canlı veritabanının içeriği, özel antrenmanların ve telefonundan yüklediğin fotoğraflar bu ZIP'te yoktur.

Mevcut uygulamada **Ayarlar → Yedeği dosya olarak indir** ile JSON yedeğini ayrıca al. Gerekirse yeni kurulumda **Yedekten geri yükle** ile içe aktar. Kişisel yedeği GitHub repository'sine ekleme. iCloud Drive seçeneği elle dosya yedeğidir; uygulamanın hesap eşitlemesi iCloud değildir.

## Dosya yapısı

| Klasör / dosya | İçerik |
| --- | --- |
| `app/page.tsx` | Ana ekran, antrenmanlar, raporlar ve yerel kayıt akışı |
| `app/api/sync/route.ts` | Hesaba bağlı kayıt eşitleme API'si |
| `components/` | Hareket, geçmiş, kalori, görseller ve açılış ekranları |
| `lib/` | Hareket kataloğu, kayıt doğrulama, kas eşleme ve kalori hesabı |
| `public/` | Görseller, PWA simgeleri, manifest ve service worker |
| `db/`, `drizzle/` | Veritabanı modeli ve ilk kurulum SQL'i |
| `build/`, `scripts/` | Vinext/Cloudflare/Sites yapılandırmaları |
| `tests/` | Kalori hesabı kontrolleri |
| `pnpm-lock.yaml` | Sabitlenmiş bağımlılıklar |

## Kontroller

```sh
node scripts/test-export.mjs
```

Bu komut TypeScript hesap modüllerini geçici bir klasöre derler ve kalori testlerini çalıştırır. Bağımlılıklar önce kurulmuş olmalı.

Yayınlanan kaynak için TypeScript kontrolü ve üretim build'i başarılıdır. Bu dışa aktarımda Windows üzerinde temiz kurulum ayrıca denenmedi. Arşivde README, ek test çalıştırıcısı ve güncel dönüş alanlarına uyarlanmış test beklentileri dışında uygulamanın davranışı değiştirilmedi.

## Görsel kaynakları ve lisanslar

Görsellerin kaynak ve lisans bilgileri `public/exercise-images/sources.json` ile `lib/exercise-images.json` içinde yer alır. Everkinetic, wger, workout-guide ve free-exercise-db kaynaklarından alınan görseller farklı lisanslara tabidir. Kaynak, lisans ve atıf dosyalarını görsellerle birlikte koru. Uygulamanın tamamına rastgele bir üçüncü taraf lisansı uygulanmamıştır; kullanılan bağımlılıkların ve görsellerin kendi lisansları geçerlidir.

Kaloriler MET tabanlı tahminlerdir; sensörle ölçülen değerler değildir. Kas haritası genel hareket eşlemelerini gösterir, bireysel kas aktivasyonu ölçmez.
