# NORDRAUM — Vercel sürümü

Almanya'daki nakliye firması için premium tanıtım sitesi, mobilya kataloğu ve Türkçe yönetim paneli. Firma iletişim bilgileri, satış bağlantıları ve hukuki sayfalar dahil edilmiştir.

Bu paket **standart Next.js + MySQL** kullanır. Vercel'e tek uygulama olarak deploy edilir. Ayrı bir MySQL API servisi, Cloudflare Worker veya ChatGPT oturumu gerektirmez. MySQL sunucusu dışarıda barındırılır; uygulama Vercel'in Node.js fonksiyonundan doğrudan bağlanır. Yüklenen görseller Private Vercel Blob'a kaydedilir ve sitenin `/media/...` adreslerinden sunulur.

## 1. Projeyi Vercel'e aktarın

1. ZIP'i açın. `package.json` ve `vercel.json` dosyalarının bulunduğu klasörü bir GitHub deposuna yükleyin.
2. Vercel'de **Add New → Project → Import Git Repository** yolunu izleyin.
3. Framework olarak **Next.js**, Node.js sürümü olarak **24.x** seçin.
4. Build komutu `npm run build`, install komutu `npm ci` olsun. Output Directory alanını elle değiştirmeyin; Next.js yapılandırması yönetir.
5. Aşağıdaki ortam değişkenlerini ekleyip deploy edin. Değişkenleri sonradan eklediyseniz yeniden deploy edin.

`vercel.json` fonksiyonları `fra1` (Frankfurt) bölgesine ayarlar. Bu ayar tek başına tüm verilerin yalnızca Almanya'da tutulduğu anlamına gelmez; veritabanı, Blob ve sözleşmesel veri işleme yerlerini ayrıca belirleyin.

### Önce yalnızca görünümü açmak için

MySQL ayarları henüz yoksa site varsayılan olarak örnek katalogla açılır. Örnek ürünler ve taslak hukuki metinler açıkça işaretlenmiştir. Bu görünüm admin kaydını veya yayınlamayı taklit etmez. Gerçek kullanıma geçerken `DEMO_MODE=false` ayarlayın. MySQL bağlantısı tanımlanmışken bağlantı hatası alınırsa örnek veriyle sessizce devam edilmez.

## 2. MySQL bağlantısını tanımlayın

Vercel → Project → Settings → Environment Variables:

| Değişken | Değer |
|---|---|
| `MYSQL_HOST` | Vercel'den erişilebilen MySQL sunucu adı |
| `MYSQL_PORT` | Genellikle `3306` |
| `MYSQL_DATABASE` | Örneğin `nordraum` |
| `MYSQL_USER` | Veritabanı kullanıcısı |
| `MYSQL_PASSWORD` | Veritabanı şifresi |
| `MYSQL_SSL` | Uzak sunucu için `true` |
| `MYSQL_SSL_CA` | Sağlayıcı gerektiriyorsa CA sertifikasının PEM içeriği |
| `MYSQL_CONNECTION_LIMIT` | Varsayılan `3` |
| `DEMO_MODE` | Gerçek kullanımda `false` |

MySQL 8 önerilir. Host olarak `localhost` veya `127.0.0.1` girmek Vercel'deki başka bir veritabanına bağlanmaz. Sağlayıcının ağ erişimi ve TLS gereklilikleri Vercel bağlantısına uygun olmalıdır. CA doğrulaması açık tutulur; `MYSQL_SSL=false` yalnızca güvenilen yerel geliştirme bağlantısı içindir. Veritabanı bilgilerini `NEXT_PUBLIC_` ile başlayan değişkenlere koymayın.

Bağlantı havuzu işlem başına yeniden kullanılır ve Vercel Fluid Compute yaşam döngüsüne bağlanır. Farklı fonksiyon örneklerinin ayrı havuzları olabileceğinden sağlayıcının toplam bağlantı limitini de dikkate alın.

### Tabloları bir defa oluşturun

Yerel bilgisayarınızda Node.js 24 kurulu olsun. ZIP klasöründe:

```sh
npm ci
```

`.env.example` dosyasını `.env.local` olarak kopyalayıp MySQL değerlerini doldurun. Sonra:

```sh
npm run db:migrate
npm run db:check
```

Migrasyon `site_content`, `content_history` ve `admin_login_limits` tablolarını oluşturur; mevcut içerikleri silmez. Kurulum kullanıcısının tablo oluşturabilmesi gerekir. İşletim kullanıcısı içerik ve giriş sınırı tablolarında SELECT/INSERT/UPDATE/DELETE işlemlerini yapabilmelidir. İsterseniz SQL dosyalarını veritabanı yönetim aracınızdan da uygulayabilirsiniz: `db/schema.sql`, ardından `db/migrations/0002_admin_login_limits.sql`.

Migrasyon build sırasında otomatik çalıştırılmaz. Böylece build'in veritabanını değiştirmesi veya ağ bağlantısı gerektirmesi önlenir. Daha önce bu projede oluşturulan MySQL içerik tabloları aynı isim/şemayla kullanılabilir; yeni giriş sınırı tablosu da eklenmelidir.

## 3. Yönetici hesabını ayarlayın

```sh
npm run admin:password
```

Terminalde kendi seçtiğiniz en az 12 karakterlik şifreyi girin. Giriş ekranda görünmez. Komutun ürettiği Scrypt özeti `ADMIN_PASSWORD_HASH` değeridir; şifrenin kendisini ortam değişkenine koymayın.

Bir oturum imzalama anahtarı oluşturun:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Vercel ortamına ekleyin:

| Değişken | Açıklama |
|---|---|
| `ADMIN_EMAIL` | Yönetici e-postası; örneğin `info@turkiyedenistegelsin.com` |
| `ADMIN_PASSWORD_HASH` | Yukarıdaki komutun ürettiği özet |
| `AUTH_SECRET` | Oluşturduğunuz rastgele imzalama anahtarı |

Panel adresi `/admin`. Kullanıma hazır gömülü bir şifre yoktur. Giriş için MySQL tabloları da hazır olmalıdır. Giriş denemeleri ortak MySQL tablosunda sınırlandırılır; oturum HttpOnly, Secure, SameSite=Strict çereziyle en fazla 8 saat sürer. Şifre özeti, yönetici e-postası veya imzalama anahtarı değişirse eski oturumlar geçersizleşir. Yerel `.env.local` dosyasındaki `$` karakterlerini Next.js ortam dosyası kurallarına göre `\$` biçiminde kaçırın; Vercel arayüzüne değerleri normal biçimde girin.

## 4. Görsel yükleme için Vercel Blob

1. Vercel projesinde **Storage → Create Database/Storage → Blob** bölümünü açın.
2. **Private** erişimli bir Blob deposu oluşturup projeye bağlayın.
3. Ortamda `BLOB_READ_WRITE_TOKEN` bulunduğunu doğrulayın. SDK, desteklenen proje bağlantısında Vercel'in otomatik OIDC ayarlarını da kullanabilir.
4. Yeniden deploy edin.

Panel JPEG, PNG ve WebP görselleri kabul eder. Sunucu yüklemeleri Vercel'in istek gövdesi sınırına uygun olarak **en fazla 3 MB** ile sınırlandırılmıştır. SVG ve tanınmayan dosyalar kabul edilmez. Görseller salt okunur uygulama diskine yazılmaz. Private depoya rağmen `/media/images/...` adresiyle sunulan katalog görselleri ziyaretçiler tarafından görüntülenebilir; bu alan gizli belge depolamak için değildir.

Varsayılan görseller `public/images` içindedir ve Blob hesabı olmadan çalışır. Blob yalnızca panelden yeni görsel yüklemek için gerekir.

## Panelin kullanımı

- Firma bilgileri, logo/renkler, tüm sayfa metinleri, ürünler, kategoriler, fiyatlar, görseller, dış satış linkleri ve hukuki metinler düzenlenir.
- **Taslağı kaydet** MySQL'e kaydeder; ziyaretçi içeriğini değiştirmez.
- **Önizle** taslağı yalnızca oturum açmış yöneticiye gösterir.
- **Siteye yayınla** içeriği MySQL'de yayınlar; yeniden Vercel deploy'u gerektirmez.
- **Yayın geçmişi** önceki yayını taslağa geri alır; canlıya yansıtmak için yeniden yayınlanır.
- Katalog sorgusu iletişim formunu ürün bilgisiyle doldurur. Form talep metni hazırlar ve ziyaretçinin e-posta programını açar; otomatik sunucu e-postası göndermez.

## Hukuki sayfalar

`/impressum`, `/datenschutz`, `/cookies` ve faaliyet özelinde etkinleştirilebilen `/agb`, `/widerruf`, `/barrierefreiheit` bulunur. Verilen iletişim bilgileri eklenmiştir. İşletme türü, sicil/kimlik bilgileri gerekiyorsa bunlar ve hosting/veri işleme ayrıntıları tamamlanmalıdır. Vercel ve Blob kullanımı, MySQL sağlayıcısı, saklama süreleri ve olası EWR dışı aktarım ayrıntıları gerçek kurulumla doğrulanmalıdır. Hazır kod tam hukuki uygunluk garantisi değildir. Bkz. `HUKUKI-SAYFALAR.md`.

## Yerel çalıştırma ve doğrulama

```sh
npm ci
npm test
npm run typecheck
npm run dev
```

Üretim doğrulaması:

```sh
npm run build
npm start -- --hostname 127.0.0.1 --port 4180
```

Başka terminalde `node tests/production-http.mjs` örnek veri modu ve henüz ayarlanmamış yönetici girişiyle yapılan yerel HTTP kontrolüdür. Gerçek içerik veya hesapları değiştirmez. Bu senaryo için sunucuyu ayrı, yapılandırılmamış bir test ortamında çalıştırın.

Üretim çıktısı `next.config.ts` ile `.next-build` klasörüne yazılır; Vercel bu yapılandırmayı kullanır. Kaynak metin şeması değiştirildiğinde `npm run sync:content` ile tarayıcı kopyalarını eşitleyin.

## Doğrulama kapsamı

Standart Next.js üretim derlemesi tamamlandı; içerik, hukuki yapı, parola/oturum güvenliği, giriş sınırı, işlem geri alma ve dosya kontrolleri için 40 test geçti. Yerel üretim HTTP kontrolleri de geçti. Gerçek MySQL sunucusu ve Vercel Blob hesabı bu ortamda bağlanmadığından bunlarla canlı kayıt/yükleme ve Vercel bulutunda gerçek deploy yapılmış değildir. Paket gerçek parolalar, anahtarlar veya veritabanı dökümü içermez.

Resmî belgeler: [Next.js'i Vercel'e dağıtma](https://vercel.com/docs/frameworks/full-stack/nextjs), [Vercel Blob](https://vercel.com/docs/vercel-blob/using-blob-sdk), [MySQL bağlantı havuzu](https://vercel.com/kb/guide/efficiently-manage-database-connection-pools-with-fluid-compute).

