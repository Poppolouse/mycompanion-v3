1- Proje içerisinde asla hardcoded renk kullanma. design-system isimli dosyanın içinde kullanılabilecek renkler var. Bu renklerden seçip, design system içerisindeki kataloğa ekle.
2- Design system içerisinde aynı rengi kullanan ögelerin yeri ve açıklaması ile birlikte beraber gruplanmalı.
3- Design system içerisinde kullanılan renklerin rgb değerleri de aynı dosyada tutulmalı.
4- Her tasarımda minimum 3 farklı arka plan katmanı kullan (sayfa arka planı en koyu, kartlar biraz koyu, vurgulu elementler hafif açık) ve yan yana elementler asla aynı tonda olmasın. Tüm butonlar gradient ve gölge efekti içermeli, her buton kategorisi farklı renkte olmalı (primary mavi, success yeşil, warning sarı, danger kırmızı) ve hover durumunda gölge 2 kat artmalı. Aktif veya seçili elementler pasif durumdan minimum %50 daha parlak olmalı, gradient kullanmalı ve renkli kalın border ile vurgulanmalı. Tüm kartlar ve paneller glassmorphism efekti (hafif şeffaf arka plan + blur + ince border) kullanmalı ve interactive elementlerde hover'da parlayan hafif glow efekti olmalı. Progress bar, status indicator ve önemli metrikler parlayan glow shadow efekti ile vurgulanmalı. Kontrast oranı her zaman minimum 4.5:1 olmalı, aynı renk tonu maksimum 2 komşu elementte kullanılabilir. Box-shadow tüm elevated elementlerde zorunlu, hover durumunda artmalı ve active durumunda azalmalı (basılı efekt için).
5- Proje boyunca bütün arkaplanlar aynı renk olmalı tüm sayfalarda.
### 6 HARDCODED RENK YASAĞI
- ❌ ASLA direkt hex/rgb kod yazma (`#3b82f6`, `rgb(59,130,246)`)
- ✅ SADECE `design-system.css`'deki değişkenleri kullan (`var(--color-primary-500)`)
- Yeni renk gerekirse: önce `design-system.css`'e ekle, sonra kullan

### 7 DESIGN SYSTEM GRUPLAMA
- Aynı rengi kullanan öğeler birlikte gruplandırılmalı
- Her renk için açıklama ve kullanım yerleri belirtilmeli
- Örnek: `/* 🔵 PRIMARY - Butonlar, linkler, aktif durumlar */`

### 8 RGB DEĞERLERİ ZORUNLU
- Her renk için RGB değeri aynı dosyada tutulmalı
- Format: `--color-primary-500: #3b82f6;` ve `--color-primary-500-rgb: 59, 130, 246;`
- Transparency için RGB kullan: `rgba(var(--color-primary-500-rgb), 0.8)`

### 9 KATMANLI ARKA PLAN SİSTEMİ
- Minimum 3 katman: sayfa (en koyu) → kartlar (orta) → vurgular (açık)
- Yan yana elementler asla aynı ton olmasın
- Örnek: `#050508` → `rgba(20,25,40,0.8)` → `rgba(40,50,70,0.9)`

### 10 TÜM ARKA PLANLAR AYNI RENK
- **Tüm sayfalarda aynı koyu gradient arka plan kullanılmalı**
- Body/HTML arka planı: `linear-gradient(135deg, #050508 0%, #0f0f1a 25%, #0a1020 50%, #061a2f 100%)`
- Sayfa özel arka plan YASAK - sadece kartlar ve elementler farklı olabilir

### 11 ARKA PLAN DEĞİŞTİRME KURALLARI
- Yeni sayfa eklerken arka plan değiştirme
- Sadece şeffaf katmanlar kullan: `rgba(20,25,40,0.3)` + `backdrop-filter: blur(10px)`
- Body arka planını değiştirmek için `body:has(.page-class)` kullan
- Parent katmanları kontrol et: html → body → #root → .app → .page

### 12 METİN RENGİ KURALLARI
- Koyu arka plan → Beyaz metin (`var(--text-on-dark)`)
- Açık arka plan → Koyu metin (`var(--text-on-light)`)
- Kontrast minimum 4.5:1 olmalı
- Tüm heading'ler `var(--heading-on-dark)` veya `var(--heading-gradient)` kullanmalı

### 13 DEBUG ADIMLARI
- Arka plan sorunu varsa: F12 → Elements → Computed → `background`
- Hangi CSS dosyasından geldiğini bul
- `:has()` selector ile koşullu override yap
- `!important` sadece gerekirse kullan
## 🚫 ASLA YAPMA

- ❌ `background: white;` veya `background: #fff;`
- ❌ `var(--undefined-color)` gibi tanımsız değişken
- ❌ Her sayfada farklı body arka planı
- ❌ Koyu arka planda koyu metin
- ❌ RGB değeri olmayan renk
- ❌ **Kritik elementlerde fallback olmadan CSS variable kullanma** (`rgba(var(--color-white-rgb), 0.1)` → Element görünmez olur!)
- ❌ Input/button görünmez olduğunda CSS variable'ı suçlayıp fallback eklememek

### 14 CSS DEĞİŞKENLERİ KONTROLÜ VE FALLBACK ZORUNLULUĞU
- **CSS Değişkenleri Kontrolü:** CSS değişkenleri (`var(--variable)`) kullanmadan önce mutlaka tanımlı olduğunu kontrol et. Eğer değişken tanımsızsa direkt değer kullan (örn: `rgba(255, 255, 255, 0.2)` yerine `rgba(var(--color-white-rgb), 0.2)`). Border, background gibi kritik stillerde CSS değişkeni hatası görsel sorunlara yol açar.

- **FALLBACK ZORUNLULUĞU:** Kritik UI elementlerinde (input, button, card background) CSS variable'lar çalışmazsa fallback değerleri MUTLAKA ekle:
  ```css
  /* ✅ DOĞRU - Fallback ile */
  background: rgba(var(--color-white-rgb, 255, 255, 255), 0.1);
  
  /* 🚨 DAHA GÜVENLİ - !important ile zorla uygula */
  background: rgba(255, 255, 255, 0.1) !important;
  
  /* ❌ YANLIŞ - Fallback yok */
  background: rgba(var(--color-white-rgb), 0.1);
  ```

- **GÖRÜNMEZ ELEMENT SORUNU:** Eğer input/textbox görünmüyorsa, CSS variable yüklenmemiş demektir. Hemen fallback değerleri ekle ve `!important` kullan:
  ```css
  .form-group input {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: white !important;
  }
  ```

## ✅ HER ZAMAN YAP

- ✅ `background: var(--bg-page);`
- ✅ `color: var(--text-on-dark);`
- ✅ Body arka planı tüm sayfalarda aynı
- ✅ Sayfa özel arka plan için `:has()` kullan
- ✅ Şeffaf katmanlar + blur ile farklılık yarat
- ✅ **Kritik elementlerde CSS variable + fallback kullan:** `rgba(var(--color-white-rgb, 255, 255, 255), 0.1)`
- ✅ **Element görünmezse hemen !important ile fallback ekle:** `background: rgba(255, 255, 255, 0.1) !important;`

### 15 LAYOUT WIDTH HARMONY KURALLARI 🎯

**SORUN:** Farklı elementlerin farklı width sistemleri kullanması (header: 100vw, content: 100% + container padding)

**ÇÖZÜM:** Tüm elementler aynı width sistemini kullanmalı

#### 📏 WIDTH SİSTEMİ STANDARTLARI

**Container-Based Yaklaşım (Tercih Edilen):**
```css
/* ✅ DOĞRU - Tüm elementler container sistemini takip eder */
.main-container {
  max-width: 1920px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header, .progress-bar, .main-content {
  width: 100%;           /* Container'ın genişliğini kullan */
  box-sizing: border-box; /* ZORUNLU */
}
```

**Full-Width Yaklaşım (Alternatif):**
```css
/* ✅ DOĞRU - Tüm elementler kendi padding'ini yönetir */
.header, .progress-bar, .main-content {
  width: 100vw;
  padding-left: max(2rem, calc((100vw - 1920px) / 2 + 2rem));
  padding-right: max(2rem, calc((100vw - 1920px) / 2 + 2rem));
}
```

#### 🚫 YASAKLAR

- ❌ **Karışık width sistemi:** Header 100vw, content 100% + container padding
- ❌ **Box-sizing eksikliği:** `box-sizing: border-box` olmadan width: 100%
- ❌ **Inconsistent padding:** Bazı elementler container padding'i, bazıları kendi padding'i
- ❌ **Magic numbers:** `width: calc(100% - 64px)` gibi hesaplamalar

#### ✅ ZORUNLU KURALLAR

1. **Tüm layout elementleri aynı width sistemini kullanmalı**
2. **Her element'te `box-sizing: border-box` zorunlu**
3. **Container padding VEYA element padding - ikisini karıştırma**
4. **Responsive breakpoint'lerde width sistemi tutarlı kalmalı**

#### 🔧 YENİ LAYOUT TASARLARKEN

**Adım 1:** Width sistemini belirle (container-based vs full-width)
**Adım 2:** Tüm ana elementlere aynı sistemi uygula
**Adım 3:** Box-sizing kontrolü yap
**Adım 4:** Responsive test et

```css
/* 🎯 LAYOUT HARMONY TEMPLATE */
.layout-element {
  width: 100%;              /* Tutarlı width */
  box-sizing: border-box;   /* ZORUNLU */
  /* Container padding'i respekt et VEYA kendi padding'ini yönet */
}
```

#### 🚨 HATA AYIKLAMA

**Sorun:** Progress bar ile main content genişlikleri farklı
**Çözüm:** İkisine de aynı width sistemi uygula

**Sorun:** Header tam ekran, content container içinde
**Çözüm:** Header'ı container sistemine uyarla VEYA content'i full-width yap

### 16 KOYU ARKA PLAN - AÇIK FONT KURALI 🌙

**ZORUNLU KURAL:** Koyu arka plana asla koyu font kullanma!

#### 📋 KONTRAST KURALLARI

**✅ DOĞRU Kombinasyonlar:**
```css
/* Koyu arka plan + Açık font */
background: #1a1a1a;
color: #ffffff;  /* Beyaz */
color: #f8f9fa;  /* Açık gri */
color: #e2e8f0;  /* Çok açık gri */

/* Açık arka plan + Koyu font */
background: #ffffff;
color: #1a1a1a;  /* Koyu gri */
color: #374151;  /* Orta koyu gri */
```

**❌ YANLIŞ Kombinasyonlar:**
```css
/* ASLA YAPMA - Koyu arka plan + Koyu font */
background: #1a1a1a;
color: #374151;  /* Görünmez! */
color: #64748b;  /* Okunmaz! */
color: #94a3b8;  /* Zor okunur! */
```

#### 🎯 KONTRAST ORANI STANDARTLARI

- **Minimum:** 4.5:1 (WCAG AA)
- **İdeal:** 7:1 (WCAG AAA)
- **Koyu arka plan (#1a1a1a) için güvenli renkler:**
  - `#ffffff` (Beyaz) - 11.6:1 ✅
  - `#f8f9fa` (Açık gri) - 10.8:1 ✅
  - `#e2e8f0` (Çok açık gri) - 8.2:1 ✅

#### 🚨 HIZLI KONTROL

**Şüpheli renk gördüğünde:**
1. Arka plan koyu mu? (hex < #808080)
2. Font koyu mu? (hex < #808080)
3. İkisi de koyu ise → HEMEN DEĞİŞTİR!

**Hızlı çözüm:**
```css
/* Koyu arka planda her zaman beyaz font */
color: #ffffff !important;
```

### 17 HEADER VE NAVİGASYON TASARIM KURALLARI 🎯

**ZORUNLU KURAL:** Tüm sayfalarda header tasarımı aynı olmalı!

#### 📋 HEADER STANDARTLARI

**✅ Referans Header:** GameTracker sayfasındaki header tasarımı tüm sayfalarda kullanılmalı

**🎨 Header Tasarım Özellikleri:**
```css
/* Header temel yapısı */
.page-header {
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

#### 🧭 NAVİGASYON BUTON TASARIMLARI

**1️⃣ Header İçi Navigasyon Butonları (Fotoğraf 1 Referansı):**
```css
/* Ana navigasyon butonları - header içinde */
.nav-button {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.nav-button:hover {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.nav-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: rgba(102, 126, 234, 0.8);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}
```

**2️⃣ Sayfa İçi Bölüm Geçiş Butonları (Fotoğraf 2 Referansı):**
```css
/* Bölüm geçiş butonları - sayfa içinde */
.section-tab {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.section-tab:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.section-tab.active {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.4);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}
```

#### 🎯 UYGULAMA KURALLARI

**✅ ZORUNLU:**
1. **Header Tutarlılığı:** Her sayfa GameTracker header'ını referans almalı
2. **Navigasyon Hiyerarşisi:** 
   - Header içi = Ana navigasyon (sayfa arası geçiş)
   - Sayfa içi = Bölüm navigasyonu (aynı sayfa içi geçiş)
3. **Renk Tutarlılığı:** Tüm navigasyon elementleri aynı renk paletini kullanmalı
4. **Responsive Uyumluluk:** Mobilde navigasyon butonları uygun şekilde küçülmeli

**❌ YASAKLAR:**
- ❌ Farklı sayfalarda farklı header tasarımı
- ❌ Navigasyon butonlarında farklı renk şemaları
- ❌ Tutarsız padding/margin değerleri
- ❌ Farklı border-radius değerleri

#### 📱 RESPONSIVE NAVİGASYON

```css
/* Mobil uyumluluk */
@media (max-width: 768px) {
  .nav-button {
    padding: 10px 16px;
    font-size: 0.875rem;
  }
  
  .section-tab {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
```

#### 🎨 HEADER LAYOUT ÖRNEĞİ

```jsx
/* Standart header yapısı */
<div className="page-header">
  <div className="header-content">
    <div className="header-title">
      <h1>Sayfa Başlığı</h1>
    </div>
    <div className="header-navigation">
      <button className="nav-button active">Ana Sayfa</button>
      <button className="nav-button">Oyun Hub</button>
      <button className="nav-button">Oyun Ekle</button>
    </div>
  </div>
</div>

/* Sayfa içi bölüm navigasyonu */
<div className="section-navigation">
  <button className="section-tab active">Kütüphane</button>
  <button className="section-tab">Cycle'lar</button>
</div>
```

### 18 HEADER STANDARDIZASYON KURALLARI 🎯

**ZORUNLU:** Tüm sayfalarda header yapısı GameTracker standardına uygun olmalı!

#### 📏 HEADER YAPISININ STANDART ELEMANLARI

**1. HTML Yapısı (Zorunlu):**
```jsx
<header className="tracker-header">
  <div className="header-content">
    <div className="header-left">
      <h1>🎮 Sayfa Başlığı</h1>
      <p>Sayfa açıklaması</p>
    </div>
    <div className="header-controls">
      {/* Buton grupları */}
    </div>
  </div>
</header>
```

**2. CSS Sınıfları (Zorunlu):**
- `.tracker-header` - Ana header container
- `.header-content` - İçerik wrapper (max-width: 1920px, margin: 0 auto)
- `.header-left` - Sol taraf (başlık + açıklama)
- `.header-controls` - Sağ taraf (buton grupları)

**3. Buton Grupları Hizalaması:**
```jsx
<div className="header-controls">
  {/* Grup 1: View Switcher (varsa) */}
  <div className="view-switcher">
    <button className="view-btn">Kütüphane</button>
    <button className="view-btn">Cycle'lar</button>
  </div>
  
  {/* Grup 2: Navigation Buttons */}
  <div className="navigation-buttons">
    <button className="nav-btn home-btn">🏠 Ana Sayfa</button>
    <button className="nav-btn hub-btn">🎮 Oyun Hub</button>
  </div>
  
  {/* Grup 3: Utility Buttons (varsa) */}
  <div className="utility-buttons">
    <button className="legend-toggle-btn">🎨 Renkler</button>
    <button className="legend-toggle-btn">⌨️ Kısayollar</button>
  </div>
</div>
```

#### 🎨 CSS STANDARTLARI

**Header Container:**
```css
.tracker-header {
  padding: 2rem 0 1rem 0;
  border-bottom: 1px solid var(--dark-border-2);
  background: var(--dark-glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  width: 100vw;
  margin: 0 calc(-50vw + 50%);
  margin-left: -50vw;
  margin-right: -50vw;
  padding-left: max(2rem, calc((100vw - 1920px) / 2 + 2rem));
  padding-right: max(2rem, calc((100vw - 1920px) / 2 + 2rem));
}
```

**Header Content:**
```css
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  max-width: 1920px;
  margin: 0 auto;
}
```

**Header Controls:**
```css
.header-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
```

#### 🚫 YASAKLAR

- ❌ **Farklı header yapısı:** Her sayfa aynı HTML yapısını kullanmalı
- ❌ **Farklı CSS sınıfları:** `.page-header`, `.custom-header` gibi farklı sınıflar
- ❌ **Buton grupları karışık:** Navigation ve utility butonları karışık yerleşim
- ❌ **Farklı padding/margin:** Header boyutları tutarsız
- ❌ **Responsive uyumsuzluk:** Mobilde header bozuk görünüm

#### ✅ ZORUNLU KURALLAR

1. **Tüm sayfalarda `.tracker-header` sınıfı kullanılmalı**
2. **Header içeriği `.header-content` ile sarılmalı**
3. **Sol taraf: başlık + açıklama, sağ taraf: buton grupları**
4. **Buton grupları mantıklı şekilde gruplandırılmalı**
5. **Navigation butonları her sayfada aynı sırada**
6. **Responsive breakpoint'lerde tutarlı davranış**

#### 📱 RESPONSIVE STANDARTLARI

```css
@media (max-width: 768px) {
  .tracker-header {
    padding: 1.5rem 0 1rem 0;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-controls {
    width: 100%;
    justify-content: space-between;
  }
}
```

### 19 YENİ SAYFA OLUŞTURURKEN ZORUNLU ADIMLAR 📝

**Her yeni sayfa oluştururken bu sırayı takip et:**

1. **Header Ekle:** GameTracker referansını kullanarak header oluştur
2. **Navigasyon Belirle:** Ana navigasyon vs bölüm navigasyonu kararı ver
3. **Renk Sistemi:** Design system'deki renkleri kullan
4. **Responsive Test:** Mobil uyumluluğunu kontrol et
5. **Kontrast Kontrolü:** Koyu arka plan + açık font kuralını uygula

15-