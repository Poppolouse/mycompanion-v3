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

14-