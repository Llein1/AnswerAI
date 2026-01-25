# Production Deployment Rehberi 🚀

## 🔒 Güvenlik Notu (ÖNEMLİ)

Bu uygulama **Statik Web Sitesi (SPA)** olarak çalışır ve backend sunucusu yoktur.

### BYOK (Bring Your Own Key) Modeli
- ✅ **Sıfır Environment Variable**: Artık `.env` dosyası veya build-time secret'lara gerek yok
- ✅ **UI Üzerinden API Key**: Kullanıcılar kendi Gemini API anahtarlarını arayüzden girerler
- ✅ **Güvenli Deployment**: API anahtarınız asla kod tabanında veya build artifact'lerinde yer almaz
- ✅ **Vercel/Netlify Güvenli**: API anahtarları ziyaretçilerin tarayıcısında saklanır, sizin anahtarınız ifşa olmaz

### Veri Depolama
- **IndexedDB**: Tüm dosyalar ve chunk'lar tarayıcıda saklanır
- **localStorage**: Konuşmalar ve ayarlar yerel olarak tutulur
- **Client-Side Only**: Hiçbir veri sunucuya gönderilmez

---

## 📦 Production Build

### Build Komutu

```bash
# Production build
npm run build

# Build'i lokal olarak test edin
npm run preview
```

### Build Optimizasyonları

Vite yapılandırması aşağıdaki optimizasyonları içerir:

- ✅ **Otomatik kod bölme** (code splitting)
- ✅ **Vendor chunk ayrımı**:
  - `react-vendor`: React + React DOM
  - `pdf-vendor`: PDF.js
  - `ai-vendor`: Gemini AI + LangChain
  - `markdown-vendor`: Markdown rendering
  - `docx-vendor`: DOCX processing
  - `icons-vendor`: Lucide icons
- ✅ **CSS minification** ve code splitting
- ✅ **Asset optimizasyonu** (4KB altı inline)
- ✅ **Modern browser targeting** (ES2015+)
- ✅ **Lazy loading** (PDF/DOCX viewers)

### Beklenen Bundle Boyutları

```
dist/
├── assets/
│   ├── js/
│   │   ├── react-vendor-[hash].js      (~150-200 KB gzipped)
│   │   ├── pdf-vendor-[hash].js        (~250-300 KB gzipped)
│   │   ├── ai-vendor-[hash].js         (~200-250 KB gzipped)
│   │   ├── markdown-vendor-[hash].js   (~50-80 KB gzipped)
│   │   ├── docx-vendor-[hash].js       (~40-60 KB gzipped)
│   │   ├── icons-vendor-[hash].js      (~30-50 KB gzipped)
│   │   └── index-[hash].js             (~50-100 KB gzipped)
│   └── css/
│       └── index-[hash].css            (~20-30 KB gzipped)
└── index.html

Toplam: ~800KB - 1.2MB (gzipped)
```

---

## 🚀 Platform Deployment

### Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Llein1/AnswerAI)

**Otomatik Deployment:**

1. **GitHub'a push edin** (henüz yapmadıysanız)
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Vercel'e import edin**
   - [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
   - "Add New Project" tıklayın
   - GitHub repo'nuzu seçin
   - "Import" tıklayın

3. **Build Settings** (otomatik algılanır)
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment Variables**
   - ❌ **GEREK YOK!** Artık hiçbir environment variable eklemenize gerek yok
   - API anahtarları kullanıcılar tarafından UI'dan girilir

5. **Deploy**
   - "Deploy" butonuna basın
   - 1-2 dakika içinde deploy tamamlanır
   - Her `main` branch commit'inde otomatik yeniden deploy

**Vercel Configuration:** Proje `vercel.json` içeriyor (opsiyonel).

---

### Netlify Deployment

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Llein1/AnswerAI)

**Manuel Deployment:**

1. **Netlify'a bağlanın**
   - [Netlify Dashboard](https://app.netlify.com)'a gidin
   - "New site from Git" tıklayın
   - GitHub repo'nuzu seçin

2. **Build Settings** (otomatik algılanır)
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18 veya üzeri

3. **Environment Variables**
   - ❌ **GEREK YOK!** Artık hiçbir environment variable eklemenize gerek yok
   - API anahtarları kullanıcılar tarafından UI'dan girilir

4. **Deploy**
   - "Deploy site" tıklayın
   - Her commit'te otomatik deploy

**Netlify Configuration:** Proje `netlify.toml` içeriyor:
- SPA routing
- CSP headers
- Asset caching
- Security headers

---

### Diğer Platformlar

#### GitHub Pages

```bash
# GitHub Pages için build
npm run build

# dist/ klasörünü gh-pages branch'ine push edin
# Veya GitHub Actions kullanarak otomatik deploy ayarlayın
```

#### Cloudflare Pages

1. Cloudflare Dashboard → Pages → Create a project
2. GitHub repo'nuzu bağlayın
3. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
4. Deploy

---

## ✅ Post-Deployment Checklist

Deploy sonrası mutlaka kontrol edin:

- [ ] ✅ Uygulama açılıyor mu?
- [ ] ✅ Settings paneli açılıyor mu?
- [ ] ✅ API key girebiliyor musunuz?
- [ ] ✅ PDF/DOCX upload çalışıyor mu?
- [ ] ✅ Dosyalar IndexedDB'ye kaydediliyor mu?
- [ ] ✅ RAG chatbot cevap veriyor mu?
- [ ] ✅ Kaynak referansları görünüyor mu?
- [ ] ✅ Konuşma kaydetme çalışıyor mu?
- [ ] ✅ Sayfa yenilendiğinde veriler kalıyor mu?
- [ ] ✅ Arama özelliği çalışıyor mu?
- [ ] ✅ Mobil cihazda test edildi mi?
- [ ] ✅ Console'da hata yok mu?

---

## 🐛 Bilinen Sorunlar ve Çözümler

### 1. LangChain Dependency Conflict (Vercel/Netlify)

**Sorun**: Build sırasında peer dependency uyarıları:
```
ERESOLVE could not resolve
peer @langchain/core@">=0.3.17 <0.4.0" from @langchain/google-genai
```

**Çözüm**: 
- Proje `package.json`'da doğru sürümler belirtilmiş
- Build platformunda `npm install --legacy-peer-deps` otomatik kullanılır
- Genelde warning olarak geçilir, build başarılı olur

### 2. IndexedDB Quota Exceeded

**Sorun**: Kullanıcı çok fazla dosya yüklediğinde "QuotaExceededError"

**Çözüm**: 
- Uygulama bu hatayı yakalar ve kullanıcıya bildirir
- Kullanıcı eski dosyaları silmeli
- Browser settings'den daha fazla storage izni verilebilir

### 3. PDF.js Worker 404

**Sorun**: Production'da PDF viewer için worker.js bulunamıyor

**Çözüm**:
- `vite.config.js` zaten optimal worker konfigürasyonuna sahip
- PDF.js worker'lar otomatik olarak `dist/` içine kopyalanır
- Asset path'ler doğru şekilde ayarlanmış

### 4. CSP (Content Security Policy) Hataları

**Sorun**: Browser console'da CSP violation hataları

**Çözüm**:
- `netlify.toml` ve `vite.config.js`'de CSP headers ayarlanmış
- Gemini API için `generativelanguage.googleapis.com` whitelisted
- `unsafe-eval` development için gerekli (Vite HMR)
- Production build'de `unsafe-eval` kullanılmaz

---

## ⚡ Performance Optimization

### Lighthouse Hedefleri

- **Performance**: > 85
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 90

### Optimizasyon İpuçları

**Client-Side:**
- Chunk boyutunu ayarlayın (Settings panelinden)
- Çok sayıda dosya yüklerken, sadece aktif olanları seçin
- Büyük PDF'leri küçük parçalara bölün
- Browser'ın IndexedDB kotasına dikkat edin

**Deployment:**
- CDN kullanın (Vercel/Netlify otomatik yapar)
- Asset caching header'ları ayarlanmış
- Gzip/Brotli compression (otomatik)
- HTTP/2 server push (Vercel/Netlify destekler)

---

## 🔐 Security Best Practices

### Production Deployment

1. ✅ **API Keys**: UI üzerinden girilir, kod tabanında yok
2. ✅ **CSP Headers**: XSS saldırılarına karşı korumalı
3. ✅ **HTTPS**: Always enforce (Vercel/Netlify otomatik)
4. ✅ **CORS**: Sadece Gemini API'ye izin var
5. ✅ **No Backend**: Attack surface minimum

### Kullanıcı Güvenliği

- Kullanıcılara halka açık bilgisayarlarda **localStorage temizleme** uyarısı yapın
- Privacy policy sayfası ekleyin (opsiyonel)
- API key'in güvenli saklandığını vurgulayın

---

## 📊 Monitoring ve Analytics

### Analytics Ekleme (Opsiyonel)

**Google Analytics:**
```html
<!-- index.html içine ekleyin -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

**Plausible (Privacy-focused):**
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

### Error Tracking

**Sentry Integration:**
```bash
npm install @sentry/react
```

---

## 🎯 Next Steps

Deploy sonrası öneriler:

1. **Custom Domain**: Netlify/Vercel'de custom domain ekleyin
2. **Analytics**: Kullanım istatistikleri için analytics ekleyin
3. **Monitoring**: Uptime monitoring (UptimeRobot, Pingdom)
4. **SEO**: Meta tags, Open Graph, Twitter Cards
5. **PWA**: Service worker ve manifest ekleyerek PWA yapın

---

## 📞 Destek

Deployment sırasında sorunla karşılaşırsanız:

1. Önce bu dokümandaki "Bilinen Sorunlar" bölümünü kontrol edin
2. Browser console'da hata mesajlarını inceleyin
3. Build log'larını kontrol edin (Vercel/Netlify dashboard)
4. GitHub Issues'da sorun açın

---

**Happy Deploying! 🚀**
