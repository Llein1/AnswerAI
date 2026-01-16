# AnswerAI - Gelişmiş RAG Chatbot 🤖

React, Gemini AI ve modern web teknolojileri ile geliştirilmiş; konuşma hafızası, dosya kalıcılığı ve çoklu belge karşılaştırma yeteneklerine sahip modern bir RAG (Retrieval-Augmented Generation) chatbot.

![AnswerAI Demo](assets/demo.png)

![Durum](https://img.shields.io/badge/durum-production%20ready-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-orange)

## ✨ Özellikler

### 📄 Belge Yönetimi
- **PDF Yükleme**: Sürükle-bırak veya tıklayarak PDF yükleme (maks 10MB)
- **Çoklu Dosya Desteği**: Aynı anda birden fazla PDF yükleyin ve yönetin
- **Dosya Kalıcılığı**: Yüklenen dosyalar sayfa yenilense bile kaybolmaz (localStorage)
- **Aktif/Pasif Kontrolü**: Hangi belgelerin sohbete dahil edileceğini seçin
- **Dosya Detayları**: Sayfa sayısı, dosya boyutu ve yükleme tarihi bilgileri

### 💬 Konuşma Özellikleri
- **Konuşma Hafızası**: Tüm sohbetler otomatik olarak localStorage'a kaydedilir
- **Kalıcı Geçmiş**: Sayfa yenilendiğinde sohbetleriniz silinmez
- **Otomatik Başlıklandırma**: İlk mesaja göre konuşma başlığı otomatik oluşturulur
- **Hızlı Geçiş**: Kayıtlı konuşmalar arasında anında geçiş yapın
- **Silme Koruması**: Yanlışlıkla silmeyi önlemek için özel onay kutuları

### 🔍 Gelişmiş RAG Yetenekleri
- **Semantik Arama**: Gemini embedding'leri ile vektör benzerlik araması
- **Çoklu Belge Soru-Cevap**: Birden fazla PDF üzerinden soru sorun
- **Belge Karşılaştırma**: Karşılaştırma sorularını akıllıca tespit eder
  - "Bu iki belge arasındaki farklar neler?"
  - "Hangi belgede X konusu daha detaylı anlatılıyor?"
  - "Her iki belgede de Y'den bahsediliyor mu?"
- **Kaynak Gösterimi**: Cevabın hangi belgenin kaçıncı sayfasından geldiğini görün
- **Alaka Puanlaması**: Benzerlik eşiğine göre dinamik kaynak seçimi

### 🎨 Modern Kullanıcı Deneyimi (UX)
- **Sabit Başlık**: Navigasyon her zaman üstte erişilebilir
- **Sabit Giriş**: Sohbet kutusu her zaman altta görünür
- **Bağımsız Kaydırma**: Konuşmalar ve dosyalar için ayrı kaydırma alanları
- **Markdown Desteği**: AI cevaplarında zengin metin biçimlendirmesi
- **Tek Tıkla Kopyalama**: AI cevaplarını kolayca panoya kopyalayın
- **Karanlık Tema**: Glassmorphism efektleriyle modern ve şık arayüz
- **Mobil Uyumlu**: Masaüstü ve mobil cihazlarda sorunsuz çalışır

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+ yüklü olmalı
- Google Gemini API anahtarı ([Buradan alabilirsiniz](https://aistudio.google.com/apikey))

### Kurulum

1. **Projeyi klonlayın**
   ```bash
   git clone https://github.com/Llein1/AnswerAI.git
   cd AnswerAI
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Çevresel değişkenleri ayarlayın**
   - `.env.example` dosyasını `.env` olarak kopyalayın
   - Gemini API anahtarınızı ekleyin:
   ```env
   VITE_GEMINI_API_KEY=api_anahtariniz_buraya
   ```

4. **Geliştirme sunucusunu başlatın**
   ```bash
   npm run dev
   ```

5. **Tarayıcınızı açın**
   - `http://localhost:5173` adresine gidin

## 📖 Kullanım

### Temel Sohbet
1. **PDF Yükleyin**: Yükleme alanına tıklayın veya PDF dosyalarını sürükleyin
2. **Dosyaları Aktifleştirin**: Göz ikonunun açık olduğundan emin olun
3. **Soru Sorun**: Sorunuzu yazın ve Enter'a basın
4. **Kaynakları İnceleyin**: Cevabın altındaki kaynaklara tıklayarak detayları görün

### Çoklu Belge Karşılaştırma
1. **2 veya daha fazla PDF yükleyin** ve aktifleştirin
2. **Karşılaştırma soruları sorun**:
   - "Bu belgeleri karşılaştır"
   - "Temel farklar neler?"
   - "X hakkında hangi belgede daha fazla bilgi var?"
3. **Karşılaştırmalı analizi** ve belge referanslarını inceleyin

### Konuşma Yönetimi
- **Yeni Sohbet**: Temiz bir sayfa açmak için "New Chat" butonuna tıklayın
- **Sohbet Değiştir**: Yan menüden eski konuşmalarınıza tıklayın
- **Sohbet Sil**: Çöp kutusu ikonuna tıklayın ve onaylayın

## 🛠️ Teknoloji Yığını

| Kategori | Teknoloji |
|----------|-----------|
| **Frontend** | React 18 + Vite |
| **Stil** | Tailwind CSS |
| **PDF İşleme** | PDF.js (Mozilla) |
| **AI/LLM** | Google Gemini 2.5 Flash |
| **Embeddings** | Gemini text-embedding-004 |
| **RAG Pipeline** | Özel vektör benzerlik araması |
| **State Yönetimi** | React Hooks + localStorage |
| **İkonlar** | Lucide React |
| **Markdown** | React Markdown + remark-gfm |

## 📁 Proje Yapısı

```
AnswerAI/
├── src/
│   ├── components/
│   │   ├── Layout.jsx              # Ana düzen
│   │   ├── Header.jsx              # Sabit başlık
│   │   ├── FileUpload.jsx          # PDF yükleme alanı
│   │   ├── FileList.jsx            # Dosya listesi
│   │   ├── ChatInterface.jsx       # Mesaj alanı
│   │   ├── ChatInput.jsx           # Mesaj giriş kutusu
│   │   ├── ConversationList.jsx    # Sohbet geçmişi listesi
│   │   ├── ConfirmDialog.jsx       # Onay modalı
│   │   ├── CopyButton.jsx          # Kopyalama butonu
│   │   └── SourceReferences.jsx    # Kaynak gösterimi
│   ├── services/
│   │   ├── pdfService.js           # PDF metin çıkarma
│   │   ├── geminiService.js        # Gemini API entegrasyonu
│   │   ├── ragService.js           # RAG ve vektör arama
│   │   ├── conversationStorage.js  # Konuşma kaydetme
│   │   └── fileStorage.js          # Dosya kaydetme
│   ├── App.jsx                     # Ana uygulama
│   ├── main.jsx                    # Giriş noktası
│   └── index.css                   # Global stiller
├── .env.example                    # Örnek env dosyası
├── package.json                    # Bağımlılıklar
└── README.md                       # Bu dosya
```

## 🔧 Yapılandırma

### RAG Parametreleri

**Chunk Boyutu** (varsayılan: 1000 karakter, 200 örtüşme)
```javascript
// src/services/ragService.js
splitTextIntoChunks(text, chunkSize = 1000, overlap = 200)
```

**Benzerlik Eşiği** (varsayılan: 0.4)
```javascript
// src/services/ragService.js
retrieveContext(query, activeFileIds, minSimilarity = 0.4)
```

**Dosya Boyut Limiti** (varsayılan: 10MB)
```javascript
// src/services/pdfService.js
const maxSize = 10 * 1024 * 1024
```

## 🚀 Production Deployment

Canlı ortam kurulumu, build işlemleri ve Vercel/Netlify deployment talimatları için [Deployment Rehberi](DEPLOYMENT.md)'ne göz atın.

## 🆘 Sorun Giderme


### "API key not configured" hatası
- `.env` dosyasının oluşturulduğundan emin olun
- `VITE_` ön ekinin kullanıldığını kontrol edin
- Sunucuyu yeniden başlatın

### PDF yükleme hatası
- Dosyanın geçerli bir PDF olduğunu kontrol edin (taranmış resim olmamalı)
- Dosya boyutunun 10MB altında olduğunu doğrulayın

### Yavaş cevap süreleri
- İnternet bağlantınızı kontrol edin
- Aktif dosya sayısını azaltmayı deneyin

### Build hatası alıyorum
- `node_modules` klasörünü silin ve `npm install` yapın
- Node.js versiyonunun 18+ olduğunu kontrol edin
- `.env` dosyasının doğru formatta olduğunu kontrol edin


## 🌐 Live Demo

> Yakında eklenecek...