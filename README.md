# AnswerAI - Gelişmiş RAG Chatbot 🤖

React, Gemini AI ve modern web teknolojileri ile geliştirilmiş; konuşma hafızası, dosya kalıcılığı ve çoklu belge karşılaştırma yeteneklerine sahip modern bir RAG (Retrieval-Augmented Generation) chatbot.

## � Live Demo

**🚀 [AnswerAI - Canlı Demo](https://answer-ai-eta.vercel.app/)**

> Uygulamayı hemen deneyin! Kendi PDF dosyalarınızı yükleyip yapay zeka ile konuşabilirsiniz.

---

## 🎥 Uygulama Tanıtımı

Uygulamanın özelliklerini gösteren arayüz görünümü:

![AnswerAI Demo](assets/demo.png)

*Demo videoda: PDF yükleme, RAG chatbot ile soru-cevap, kaynak gösterimi ve arama özellikleri*

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

## 📖 Kullanım Rehberi

### 🎯 Adım 1: Belge Yükleme

**PDF Dosyası Ekleme:**
1. Sol yan panelde bulunan **"Dosya seçin veya sürükleyip bırakın"** alanını bulun
2. İki yöntem ile dosya ekleyebilirsiniz:
   - **Tıklama**: Alana tıklayarak bilgisayarınızdan PDF seçin
   - **Sürükle-Bırak**: PDF dosyasını doğrudan bu alana sürükleyin
3. Desteklenen formatlar: **PDF** ve **DOCX** (maks 10MB)
4. Yükleme tamamlandığında dosya sol paneldeki listede görünecektir

> 💡 **İpucu**: Aynı anda birden fazla belge yükleyebilir ve aralarında geçiş yapabilirsiniz.

---

### 💬 Adım 2: Soru Sorma

**RAG Chatbot ile Konuşma:**
1. Yüklenen belgenin yanındaki **göz ikonu** açık olduğundan emin olun (aktif dosya)
2. Sayfanın alt kısmındaki **sohbet kutusuna** sorunuzu yazın
3. **Enter** tuşuna basın veya **gönder** butonuna tıklayın
4. AI, yüklediğiniz belgelerden ilgili bilgileri çekerek cevap verecektir

**Örnek Sorular:**
```
- "Bu belge ne hakkında?"
- "X konusunda neler söyleniyor?"
- "Y ve Z arasındaki ilişki nedir?"
```

---

### 📚 Adım 3: Kaynak Referanslarını İnceleme

**Cevabın Kaynağını Görme:**
1. AI cevabının altında **"X kaynak kullanıldı"** yazısını göreceksiniz
2. Bu yazıya **tıklayarak** kaynakları genişletin
3. Her kaynak için şunlar gösterilir:
   - 📄 Dosya adı
   - 📃 Sayfa numarası
   - 📊 Benzerlik skoru
   - 📝 İlgili metin pasajı

> 🎯 **Önemli**: Bu özellik sayesinde AI'nın hangi belgeden bilgi aldığını tam olarak görebilirsiniz.

---

### 🔍 Adım 4: Konuşma Arama

**Geçmiş Sohbetlerde Arama:**
1. Üst kısımdaki **arama kutusunu** kullanın
2. Aramak istediğiniz kelimeyi yazın
3. İlgili konuşmalar otomatik filtrelenecektir
4. Sonuçlara tıklayarak doğrudan o sohbete gidebilirsiniz

---

### 🔄 Adım 5: Çoklu Belge Karşılaştırma

**Birden Fazla Belge ile Çalışma:**
1. **2 veya daha fazla PDF** yükleyin
2. Her belgede **göz ikonunu** aktif edin
3. Karşılaştırma soruları sorun:
   ```
   - "Bu iki belge arasındaki farklar neler?"
   - "Hangi belgede X konusu daha detaylı?"
   - "Her iki belgede de Y'den bahsediliyor mu?"
   ```
4. AI, tüm aktif belgelerden bilgi toplayarak karşılaştırmalı analiz yapacaktır

---

### 🗂️ Adım 6: Konuşma Yönetimi

**Sohbetler Arasında Gezinme:**
- **Yeni Sohbet**: Header'daki **"+ New Chat"** butonuna tıklayın
- **Sohbet Geçmişi**: Sol paneldeki konuşma listesinden istediğinize tıklayın
- **Sohbet Silme**: Konuşmanın yanındaki **çöp kutusu** ikonuna tıklayın
- **Sohbet Yeniden Adlandırma**: Konuşma başlığına çift tıklayarak düzenleyin

> 📌 **Not**: Tüm konuşmalar browser'ınızda (localStorage) saklanır ve sayfa yenilense bile kaybolmaz.

---

### ⚙️ Ek Özellikler

**Dosya Yönetimi:**
- 👁️ **Göz İkonu**: Belgeyi sohbete dahil et/çıkar
- 🗑️ **Çöp İkonu**: Belgeyi sil
- 📄 **Dosya Adı**: Tıklayarak önizleme açın (varsa)

**Mesaj İşlemleri:**
- 📋 **Kopyala**: AI cevaplarını panoya kopyalayın
- 🔽 **Scroll**: Uzun sohbetlerde aşağı kaydırın (otomatik scroll)

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
- Browser console'da hata mesajlarını inceleyin

---

