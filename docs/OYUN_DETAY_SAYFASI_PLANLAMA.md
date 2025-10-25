# 🎮 OYUN DETAY SAYFASI - KAPSAMLI PLANLAMA

## 📊 RAWG API'DEN ÇEKİLECEK EK VERİLER

### 🎯 Öncelikli Veriler (Hemen Eklenecek)

#### 1. **Metacritic Puanları**
```javascript
// RAWG Response'dan:
{
  "metacritic": 96,
  "metacritic_platforms": [
    {
      "metascore": 96,
      "url": "https://www.metacritic.com/game/pc/the-witcher-3-wild-hunt"
    }
  ]
}
```

#### 2. **Oyun Süresi (HLTB - How Long To Beat)**
```javascript
// RAWG'de playtime bilgisi var:
{
  "playtime": 28, // Ortalama saat
  "playtime_forever": 0
}
```

#### 3. **ESRB Rating**
```javascript
{
  "esrb_rating": {
    "id": 4,
    "name": "Mature 17+",
    "slug": "mature"
  }
}
```

#### 4. **Detaylı Türler**
```javascript
{
  "genres": [
    {
      "id": 4,
      "name": "Action",
      "slug": "action",
      "games_count": 181902
    }
  ]
}
```

#### 5. **Topluluk Etiketleri**
```javascript
{
  "tags": [
    {
      "id": 31,
      "name": "Singleplayer",
      "slug": "singleplayer",
      "language": "eng",
      "games_count": 226836
    }
  ]
}
```

### 🔄 İkincil Veriler (Sonraki Aşama)

#### 6. **DLC Bilgileri**
```javascript
// /games/{id}/additions endpoint'i
{
  "additions": [
    {
      "id": 3070,
      "name": "The Witcher 3: Wild Hunt - Blood and Wine",
      "released": "2016-05-31"
    }
  ]
}
```

#### 7. **Dil Desteği**
```javascript
// RAWG'de mevcut değil, manuel eklememiz gerekebilir
```

#### 8. **Platform Fiyatları**
```javascript
// /games/{id}/stores endpoint'i
{
  "stores": [
    {
      "id": 1,
      "store": {
        "id": 1,
        "name": "Steam",
        "slug": "steam"
      }
    }
  ]
}
```

#### 9. **Mod Desteği**
```javascript
// Tags içinde "Moddable" etiketi kontrol edilebilir
```

#### 10. **Sosyal Medya Verileri**
```javascript
// /games/{id}/reddit endpoint'i
{
  "reddit_url": "https://www.reddit.com/r/witcher/",
  "reddit_name": "r/witcher",
  "reddit_description": "All things related to The Witcher",
  "reddit_logo": "...",
  "reddit_count": 123456
}
```

---

## 🏗️ SAYFA YAPISI - 7 ANA BÖLÜM

### 📱 **BÖLÜM 1: HERO SECTION (Üst Kısım)**
**Yükseklik:** ~400px (Desktop), ~300px (Mobile)

#### İçerik:
- **Sol Taraf (60%):**
  - Oyun kapak görseli (büyük)
  - Screenshot carousel (küçük thumbnails)
  - Platform ikonları
  
- **Sağ Taraf (40%):**
  - Oyun başlığı (büyük font)
  - Geliştirici/Yayıncı
  - Çıkış tarihi
  - **ANA BUTONLAR:**
    - 🎮 Oyna/Başlat (büyük)
    - 📊 Durum Değiştir (küçük)
    - ⭐ Favorilere Ekle
    - 📝 Not Ekle

#### Özel Özellikler:
- Arka plan blur efekti (oyun görseli)
- Gradient overlay
- Responsive tasarım

---

### 📊 **BÖLÜM 2: HIZLI BİLGİLER (Quick Stats)**
**Yükseklik:** ~120px

#### 4 Kart Layout:
1. **Metacritic Puanı**
   - Büyük sayı + renkli progress bar
   - Critic vs User score

2. **Oyun Süresi**
   - ⏱️ Main Story: 25h
   - 🎯 Completionist: 173h

3. **ESRB Rating**
   - 🔞 Mature 17+
   - İçerik uyarıları

4. **Topluluk Puanı**
   - ⭐ 4.8/5 (RAWG rating)
   - 👥 123K oyuncu

---

### 📝 **BÖLÜM 3: AÇIKLAMA VE MEDYA**
**Yükseklik:** Dinamik

#### Sol Panel (70%):
- **Oyun Açıklaması**
  - Kısa özet (2-3 paragraf)
  - "Devamını Oku" butonu
  - Spoiler-free garanti

#### Sağ Panel (30%):
- **Medya Galerisi**
  - Screenshot grid (2x2)
  - Video thumbnail (varsa)
  - "Tümünü Gör" butonu

---

### 🏷️ **BÖLÜM 4: TÜRLER VE ETİKETLER**
**Yükseklik:** ~100px

#### İçerik:
- **Ana Türler** (büyük chip'ler)
  - Action, RPG, Open World
  
- **Topluluk Etiketleri** (küçük badge'ler)
  - Singleplayer, Story Rich, Fantasy
  - En popüler 8-10 etiket

#### Tasarım:
- Renkli chip tasarımı
- Hover efektleri
- Filtreleme linki

---

### 🎮 **BÖLÜM 5: PLATFORM VE TEKNİK BİLGİLER**
**Yükseklik:** ~200px

#### 3 Kolon Layout:

##### Kolon 1: Platformlar
- 🖥️ PC (Steam, Epic, GOG)
- 🎮 PlayStation 5
- 🎮 Xbox Series X/S
- 📱 Mobile (varsa)

##### Kolon 2: Teknik Gereksinimler
- Minimum sistem gereksinimleri
- Önerilen gereksinimler
- "Detayları Gör" linki

##### Kolon 3: Özellikler
- 🎧 Dil desteği (ses/altyazı)
- 🔧 Mod desteği
- 🌐 Online özellikler
- ♿ Erişilebilirlik

---

### 📈 **BÖLÜM 6: İSTATİSTİKLER VE TOPLULUK**
**Yükseklik:** ~250px

#### 2 Panel Layout:

##### Sol Panel: Kişisel İstatistikler
- 📊 Oyun ilerleme grafiği
- ⏰ Toplam oynama süresi
- 🏆 Başarımlar (varsa)
- 📅 Son oynama tarihi

##### Sağ Panel: Topluluk Verileri
- 👥 Kaç kişi oynuyor
- 📊 Popülerlik trendi
- 💬 Reddit/Forum linkleri
- 📺 Twitch/YouTube

---

### 🎯 **BÖLÜM 7: İLGİLİ OYUNLAR VE ÖNERİLER**
**Yükseklik:** ~300px

#### İçerik:
- **Aynı Serideki Oyunlar**
  - Horizontal scroll
  - 4-5 oyun kartı

- **Benzer Oyunlar**
  - RAWG'den "suggested" endpoint
  - Aynı tür/etiketler

- **Geliştiricinin Diğer Oyunları**
  - Developer'ın portfolio'su

#### Tasarım:
- Kart carousel
- Lazy loading
- "Daha Fazla" butonu

---

## 🎨 TASARIM PRENSİPLERİ

### 📱 Responsive Yaklaşım
- **Desktop:** 3 kolon layout
- **Tablet:** 2 kolon layout  
- **Mobile:** Tek kolon, stack layout

### 🎨 Görsel Hiyerarşi
1. **Hero Section** - En dikkat çekici
2. **Hızlı Bilgiler** - Önemli metrikler
3. **Açıklama** - Ana içerik
4. **Detaylar** - Ek bilgiler

### ⚡ Performance
- **Lazy Loading:** Görünmeyen bölümler
- **Image Optimization:** WebP format
- **Progressive Loading:** Kritik bilgiler önce
- **Caching:** 7 günlük cache

### 🎭 Animasyonlar
- **Scroll Animations:** Fade in/up
- **Hover Effects:** Subtle transitions
- **Loading States:** Skeleton screens
- **Micro Interactions:** Button feedback

---

## 🔄 VERİ AKIŞI STRATEJİSİ

### 1. **İlk Yükleme (Critical Path)**
```javascript
// Öncelik 1: Temel bilgiler
- Oyun başlığı, görsel, açıklama
- Platform bilgileri
- Temel puanlar

// Öncelik 2: Detay bilgiler
- Metacritic puanları
- Topluluk etiketleri
- Screenshot'lar

// Öncelik 3: Ek veriler
- DLC bilgileri
- Sosyal medya verileri
- İlgili oyunlar
```

### 2. **Cache Stratejisi**
- **Temel Bilgiler:** 24 saat
- **Puanlar/İstatistikler:** 6 saat
- **Medya İçeriği:** 7 gün
- **Kullanıcı Verileri:** Real-time

### 3. **Error Handling**
- **Fallback Görseller:** Placeholder images
- **Eksik Veriler:** "Bilgi mevcut değil" mesajı
- **API Hataları:** Cached data göster
- **Retry Mechanism:** 3 deneme

---

## 🚀 GELİŞTİRME AŞAMALARI

### **Faz 1: Temel Yapı (1 hafta)**
- Hero section
- Hızlı bilgiler kartları
- Temel responsive layout

### **Faz 2: İçerik Zenginleştirme (1 hafta)**
- RAWG API entegrasyonu
- Metacritic puanları
- Türler ve etiketler

### **Faz 3: Gelişmiş Özellikler (1 hafta)**
- Medya galerisi
- İstatistikler paneli
- İlgili oyunlar

### **Faz 4: Optimizasyon (3 gün)**
- Performance tuning
- Animasyonlar
- Error handling

---

## 📋 TEKNİK GEREKLİLİKLER

### **Yeni API Endpoint'leri**
```javascript
// Eklenecek RAWG endpoint'leri:
- /games/{id}/screenshots
- /games/{id}/additions (DLC)
- /games/{id}/stores (Fiyat)
- /games/{id}/reddit (Sosyal)
- /games/{id}/suggested (Benzer oyunlar)
```

### **Yeni Component'ler**
```
GameDetail/
├── GameHeroSection.jsx
├── QuickStatsCards.jsx
├── GameDescription.jsx
├── MediaGallery.jsx
├── GenresAndTags.jsx
├── PlatformInfo.jsx
├── StatsPanel.jsx
├── RelatedGames.jsx
└── GameDetail.css
```

### **State Management**
```javascript
// GameDetailContext.jsx
{
  gameData: {},
  screenshots: [],
  dlcList: [],
  relatedGames: [],
  userStats: {},
  loading: {},
  errors: {}
}
```

---

## 🎯 BAŞARI KRİTERLERİ

### **Kullanıcı Deneyimi**
- ✅ 3 saniyede kritik bilgiler yüklensin
- ✅ Mobile'da sorunsuz çalışsın
- ✅ Tüm bilgiler tek sayfada erişilebilir olsun

### **Teknik Performance**
- ✅ Lighthouse Score: 90+
- ✅ First Contentful Paint: <2s
- ✅ Largest Contentful Paint: <3s

### **İçerik Zenginliği**
- ✅ RAWG'den 15+ farklı veri tipi
- ✅ Metacritic entegrasyonu
- ✅ Sosyal medya linkleri

---

## 📝 NOTLAR

- Bu dokümantasyon oyun detay sayfasının kapsamlı planlamasını içerir
- Her bölüm modüler olarak geliştirilebilir
- RAWG API'den maksimum veri çekimi hedeflenir
- Responsive ve performant tasarım önceliklidir
- Kullanıcı deneyimi odaklı yaklaşım benimsenmiştir

---

**Son Güncelleme:** 2024  
**Durum:** ✅ Wireframe Tamamlandı  
**Wireframe Dosyaları:** [`wireframes/`](./wireframes/README.md)  
**Sonraki Adım:** Faz 1 - Temel Yapı Geliştirme

---

## 📐 WIREFRAME TASARIMLARI

**✅ Tüm 7 bölüm için detaylı wireframe tasarımları tamamlandı!**

### 📂 Wireframe Dosyaları:
- [`wireframes/README.md`](./wireframes/README.md) - Ana index ve guide
- [`BOLUM_1_HERO_SECTION.md`](./wireframes/BOLUM_1_HERO_SECTION.md)
- [`BOLUM_2_QUICK_STATS.md`](./wireframes/BOLUM_2_QUICK_STATS.md)
- [`BOLUM_3_DESCRIPTION_MEDIA.md`](./wireframes/BOLUM_3_DESCRIPTION_MEDIA.md)
- [`BOLUM_4_GENRES_TAGS.md`](./wireframes/BOLUM_4_GENRES_TAGS.md)
- [`BOLUM_5_PLATFORM_TECH.md`](./wireframes/BOLUM_5_PLATFORM_TECH.md)
- [`BOLUM_6_STATS_COMMUNITY.md`](./wireframes/BOLUM_6_STATS_COMMUNITY.md)
- [`BOLUM_7_RELATED_GAMES.md`](./wireframes/BOLUM_7_RELATED_GAMES.md)

### 📊 Her wireframe içerir:
- ASCII layout tasarımları (Desktop/Tablet/Mobile)
- Detaylı CSS spesifikasyonları
- JavaScript functionality
- Animasyon detayları
- Responsive breakpoints
- Kullanıcı etkileşimleri

**Toplam:** 50+ sayfa detaylı dokümantasyon