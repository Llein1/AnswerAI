# Production Deployment Guide 🚀

Bu rehber, AnswerAI uygulamasını canlı ortama (production) almak isteyenler için detaylı talimatları içerir.

## Production Build

Uygulama production için optimize edilmiş şekilde derlenmiştir. Production build yapmak için:

```bash
# Build komutu
npm run build

# Build'i lokal olarak test edin
npm run preview
```

**Build Optimizasyonları:**
- ✅ Otomatik kod bölme (code splitting)
- ✅ Vendor chunk ayrımı (React, PDF.js, LangChain)
- ✅ CSS minification ve code splitting
- ✅ Asset optimizasyonu (4KB altı inline)
- ✅ Modern browser targeting (ES2015+)

**Beklenen Bundle Boyutları:**
- Ana JS: ~500-800 KB (gzipped)
- Vendor chunks: ~400-600 KB (gzipped)
- Toplam: < 2 MB (uncompressed)

## Platform Deployment

### Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Llein1/AnswerAI)

**Manuel Deployment:**

1. **Projeyi GitHub'a push edin** (henüz yapmadıysanız)
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Vercel'e import edin**
   - [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
   - "Import Project" tıklayın
   - GitHub repo'nuzu seçin

3. **Environment Variable ekleyin**
   - `VITE_GEMINI_API_KEY` = `your_api_key`
   - Settings → Environment Variables

4. **Deploy**
   - Vercel otomatik build yapacak ve deploy edecek
   - Her commit'te otomatik yeniden deploy

**Vercel Configuration:** Proje `vercel.json` dosyası içeriyor, ek ayar gerekmez.

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

3. **Environment Variable ekleyin**
   - Site settings → Environment variables
   - `VITE_GEMINI_API_KEY` = `your_api_key`

4. **Deploy**
   - "Deploy site" tıklayın
   - Her commit'te otomatik deploy

**Netlify Configuration:** Proje `netlify.toml` dosyası içeriyor.

## Environment Variables (Production)

Production ortamında şu environment variable'ı ayarlayın:

| Variable | Açıklama | Örnek |
|----------|----------|-------|
| `VITE_GEMINI_API_KEY` | Google Gemini API anahtarı | `AIzaSyC...` |

> [!WARNING]
> **Güvenlik Notu**: Bu uygulama client-side API key kullanıyor. Demo ve kişisel kullanım için uygundur, ancak production multi-user uygulamalar için API çağrılarını backend/serverless function'a taşımayı düşünün.

## Post-Deployment Checklist

Deploy sonrası kontrol listesi:

- [ ] Uygulama yükleniyor mu?
- [ ] PDF upload çalışıyor mu?
- [ ] RAG chatbot cevap veriyor mu?
- [ ] Kaynak referansları görünüyor mu?
- [ ] Konuşma kalıcılığı çalışıyor mu? (sayfa yenileme testi)
- [ ] Mobil cihazda test edildi mi?
- [ ] Console'da hata var mı?

### LangChain Dependency Hatası (Vercel/Netlify)

**Sorun**: `npm install` sırasında `@langchain/core` peer dependency conflict

```
ERESOLVE could not resolve
peer @langchain/core@">=0.3.17 <0.4.0" from @langchain/google-genai
```

**Çözüm**: 
- ✅ `vercel.json` zaten `--legacy-peer-deps` flag'i içeriyor
- Vercel otomatik olarak bu sorunu çözecek
- Eğer sorun devam ederse, Vercel dashboard'dan "Redeploy" yapın


- Environment variable'ların hosting platformunda ayarlandığından emin olun
- `VITE_` prefix'inin kullanıldığını kontrol edin
- Browser console'da hata mesajlarını inceleyin

## Performance Tips

**Lighthouse Audit Hedefleri:**
- Performance: > 85
- Best Practices: > 90
- SEO: > 90

**Optimizasyon İpuçları:**
- API anahtarını `.env` dosyasında güvenli tutun
- Büyük PDF'ler için chunk size'ı ayarlayın (varsayılan: 1000)
- localStorage limitine dikkat edin (~5-10MB)
- Çok sayıda dosya yüklerseniz, aktif olanları seçici kullanın
