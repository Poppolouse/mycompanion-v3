# 🎯 PROJE KURALLARI - GENEL STANDARTLAR

## 🗂️ DOSYA ORGANİZASYONU KURALLARI

### 📁 Klasör Yapısı Standardı

```
src/
├── components/                  ← SADECE paylaşılan componentler
│   ├── UI/                     ← Button, Input, Modal (temel UI)
│   ├── Layout/                 ← Header, Sidebar, Footer
│   └── Common/                 ← Loading, ErrorBoundary
├── pages/
│   └── [PageName]/
│       ├── [PageName].jsx      ← Ana sayfa component
│       ├── [PageName].css      ← Sayfa layout stilleri
│       ├── components/         ← Bu sayfaya ÖZEL componentler
│       │   └── [ComponentName]/
│       │       ├── [ComponentName].jsx
│       │       ├── [ComponentName].module.css
│       │       └── index.js
│       ├── hooks/              ← Sayfaya özel custom hooks
│       ├── utils/              ← Sayfaya özel utility'ler
│       └── index.js            ← Barrel export
```

### 🚫 YASAKLAR - Dosya Organizasyonu

❌ **Component'i yanlış yere koymak:**
```
❌ src/components/GameCard/  (sadece GameTracker'da kullanılıyor)
✅ src/pages/GameTracker/components/GameCard/
```

❌ **Rastgele CSS dosyaları:**
```
❌ src/SomeComponent.css
❌ src/styles/component-specific.css
✅ src/pages/PageName/components/ComponentName/ComponentName.module.css
```

❌ **Uzun import path'leri:**
```
❌ import GameCard from './components/GameTracker/components/GameCard/GameCard.jsx';
✅ import { GameCard } from './components/GameTracker';
```

## 🎨 CSS STANDARDIZASYON KURALLARI

### 📋 CSS Modules Zorunluluğu

**✅ ZORUNLU:** Tüm component CSS'leri `.module.css` olmalı

```css
/* ✅ DOĞRU: GameCard.module.css */
.gameCard {
  padding: var(--spacing-md);
}

.gameTitle {
  font-size: var(--font-lg);
}
```

```jsx
/* ✅ DOĞRU: GameCard.jsx */
import styles from './GameCard.module.css';

function GameCard() {
  return (
    <div className={styles.gameCard}>
      <h3 className={styles.gameTitle}>Game Title</h3>
    </div>
  );
}
```

### 🚫 CSS YASAKLARI

❌ **Global CSS'de component stilleri:**
```css
/* ❌ YANLIŞ: global.css içinde */
.game-card { ... }
.search-input { ... }
```

❌ **!important abuse:**
```css
/* ❌ YANLIŞ */
.component {
  color: red !important;
  background: blue !important;
}

/* ✅ DOĞRU */
.component {
  color: var(--color-error);
  background: var(--color-primary);
}
```

❌ **Hardcoded değerler:**
```css
/* ❌ YANLIŞ */
.component {
  padding: 16px;
  color: #667eea;
  font-size: 18px;
}

/* ✅ DOĞRU */
.component {
  padding: var(--spacing-md);
  color: var(--color-primary);
  font-size: var(--font-lg);
}
```

### 📐 CSS Naming Convention

**✅ ZORUNLU:** CSS Modules için camelCase

```css
/* ✅ DOĞRU: ComponentName.module.css */
.componentContainer { }
.primaryButton { }
.isActive { }
.hasError { }
```

**✅ ZORUNLU:** Global CSS için kebab-case + BEM

```css
/* ✅ DOĞRU: global.css */
.page-header { }
.page-header__title { }
.page-header__title--large { }
```

### 🎯 CSS Variable Zorunluluğu

**✅ ZORUNLU:** Tüm değerler design-system.css'den alınmalı

```css
/* ✅ DOĞRU */
.component {
  /* Renkler */
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  
  /* Spacing */
  padding: var(--spacing-md);
  margin: var(--spacing-lg);
  gap: var(--spacing-sm);
  
  /* Typography */
  font-size: var(--font-md);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  
  /* Border Radius */
  border-radius: var(--radius-md);
  
  /* Shadows */
  box-shadow: var(--shadow-md);
  
  /* Transitions */
  transition: all var(--transition-normal);
}
```

### 🔧 CSS Override Önleme Kuralları

**✅ ZORUNLU:** CSS specificity kontrolü

1. **Media query'lerde override yapmak yasak:**
```css
/* ❌ YANLIŞ */
@media (max-width: 768px) {
  .search-input-wrapper {
    padding: 0.5rem; /* Ana kuralı override ediyor */
  }
}

/* ✅ DOĞRU */
.searchInputWrapper {
  padding: var(--spacing-md);
}

@media (max-width: 768px) {
  .searchInputWrapper {
    padding: var(--spacing-sm); /* Aynı class, farklı değer */
  }
}
```

2. **Duplicate selector yasağı:**
```css
/* ❌ YANLIŞ: Aynı selector 2 farklı dosyada */
/* FileA.css */
.search-input { color: red; }

/* FileB.css */  
.search-input { color: blue; } /* Çakışma! */

/* ✅ DOĞRU: CSS Modules */
/* FileA.module.css */
.searchInput { color: var(--color-error); }

/* FileB.module.css */
.searchInput { color: var(--color-primary); } /* Çakışmıyor! */
```

## 📦 IMPORT/EXPORT KURALLARI

### 🎯 Barrel Export Zorunluluğu

**✅ ZORUNLU:** Her klasörde index.js

```javascript
// ✅ DOĞRU: components/GameTracker/index.js
export { default as GameTracker } from './GameTracker';
export { default as GameGrid } from './components/GameGrid';
export { default as FilterSidebar } from './components/FilterSidebar';
export { default as GameStats } from './components/GameStats';
```

```javascript
// ✅ DOĞRU: Kullanım
import { GameTracker, GameGrid } from './components/GameTracker';
```

### 🚫 Import Yasakları

❌ **Uzun relative path'ler:**
```javascript
❌ import GameCard from '../../../components/GameTracker/components/GameCard/GameCard.jsx';
✅ import { GameCard } from '../components/GameTracker';
```

❌ **CSS import'u component'in ortasında:**
```javascript
❌ 
import React from 'react';
import { useState } from 'react';
import './Component.css';  // Yanlış yer

✅
import React, { useState } from 'react';
import styles from './Component.module.css';  // En üstte
```

## 🔍 SORUN TESPİT KURALLARI

### 🚨 Değişiklik Öncesi Kontrol Listesi

**✅ ZORUNLU:** Her CSS değişikliği öncesi:

1. **DevTools Inspect:** Hangi CSS kuralları aktif?
2. **File Search:** Aynı selector başka yerde var mı?
3. **Media Query Check:** Responsive kurallar override ediyor mu?
4. **Specificity Calculate:** Hangi kural daha güçlü?

### 🧪 Değişiklik Sonrası Test Listesi

**✅ ZORUNLU:** Her değişiklik sonrası:

1. **Hard Refresh:** Ctrl+Shift+R
2. **DevTools Computed:** Styles doğru uygulandı mı?
3. **Responsive Test:** Farklı ekran boyutlarında çalışıyor mu?
4. **CSS Cascade Check:** Beklenmedik override var mı?

## 🎯 AI PROMPT KURALLARI

### 📝 CSS Değişikliği İçin Prompt Template

```
# CSS DEĞİŞİKLİĞİ TALEBİ

## HEDEF: [Açık hedef tanımı]

## MEVCUT DURUM:
- Hangi component/sayfa: [ComponentName]
- Hangi CSS dosyası: [FileName.module.css]
- Mevcut stil: [Mevcut CSS kuralı]

## İSTENEN DEĞİŞİKLİK:
- [Detaylı açıklama]

## KONTROL EDİLECEKLER:
- CSS Modules kullanılsın
- CSS variables kullanılsın
- Override kontrolü yapılsın
- Responsive test edilsin

## ÇIKTI BEKLENTİSİ:
- Değişiklik preview'ı göster
- Hangi dosyaların etkilendiğini belirt
- CSS specificity sorunlarını açıkla
```

# 📏 HEADER STANDARTLARI

## 📏 HEADER CSS STANDARTLARI

### 🎨 Standart Header Yapısı

Tüm sayfalarda header yapısı aşağıdaki gibi olmalıdır:

```jsx
<header className="tracker-header">
  <div className="header-content">
    <div className="header-left">
      <h1>Sayfa Başlığı</h1>
      <p>Sayfa açıklaması</p>
    </div>
    <div className="header-controls">
      {/* Butonlar ve kontroller */}
    </div>
  </div>
</header>
```

### 🎯 Zorunlu CSS Kuralları

#### 1. `.tracker-header` - Ana Header Container

```css
.tracker-header {
  /* ✅ ZORUNLU - Header Yüksekliği */
  padding: 2rem 0 1rem 0;
  
  /* ✅ ZORUNLU - Görsel Efektler */
  border-bottom: 1px solid var(--dark-border-2);
  background: var(--dark-glass-bg);
  backdrop-filter: blur(20px);
  
  /* ✅ ZORUNLU - HEADER KÖŞE KURALI */
  border-radius: 0 !important;  /* TÜM HEADER'LAR DÜZ KÖŞE OLMALI */
  overflow: visible;             /* Köşe etkilerini engellemek için */
  
  /* ✅ ZORUNLU - Full Width Layout */
  margin: 0 calc(-50vw + 50%);
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  
  /* ✅ ZORUNLU - Responsive Padding */
  padding-left: calc(50vw - 50%);
  padding-right: calc(50vw - 50%);
}
```

### 🚫 HEADER KÖŞE KURALLARI - GLOBAL OVERRIDE

**ÖNEMLI:** Tüm header'ların köşeleri düz dikdörtgen olmalıdır. Bu kural `design-system.css` dosyasında global olarak uygulanmıştır:

```css
/* 🔥 GLOBAL HEADER OVERRIDE - TÜM HEADER'LAR DÜZ KÖŞE */
.tracker-header,
.page-header,
.header,
.main-header,
.app-header,
[class*="header"],
[class*="Header"] {
  border-radius: 0 !important;
  overflow: visible !important;
}
```

**Yasaklar:**
- ❌ Header'larda `border-radius` kullanmak
- ❌ Header'larda `overflow: hidden` kullanmak  
- ❌ Header köşelerini yuvarlatmak

**İzin verilenler:**
- ✅ Header içindeki butonlar normal `border-radius` kullanabilir
- ✅ Header içindeki kartlar ve componentler normal köşe stillerine sahip olabilir

#### 2. `.header-content` - İçerik Container

```css
.header-content {
  /* ✅ ZORUNLU - Flexbox Layout */
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  
  /* ✅ ZORUNLU - Maksimum Genişlik */
  max-width: 1920px;
  margin: 0 auto;
}
```

#### 3. `.header-left` - Sol Taraf (Başlık Alanı)

```css
.header-left h1 {
  /* ✅ ZORUNLU - Başlık Stilleri */
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.header-left p {
  /* ✅ ZORUNLU - Açıklama Stilleri */
  color: var(--text-muted);
  margin: 0;
  font-size: 0.95rem;
}
```

#### 4. `.header-controls` - Sağ Taraf (Kontroller)

```css
.header-controls {
  /* ✅ ZORUNLU - Kontrol Alanı */
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
```

#### 5. Header Buton Grupları

##### A. `.view-switcher` - Görünüm Değiştirici

```css
.view-switcher {
  /* ✅ ZORUNLU - Container */
  display: flex;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 0.6rem;
  backdrop-filter: blur(15px) saturate(120%);
  -webkit-backdrop-filter: blur(15px) saturate(120%);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

##### B. `.view-btn` - Görünüm Butonları

```css
.view-btn {
  /* ✅ ZORUNLU - Buton Boyutu */
  padding: 1rem 2rem;
  
  /* ✅ ZORUNLU - Görsel Stil */
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.view-btn.active {
  /* ✅ ZORUNLU - Aktif Durum */
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.6) 0%, 
    rgba(118, 75, 162, 0.6) 100%);
  color: var(--color-white);
  border: 3px solid rgba(102, 126, 234, 0.8);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 
    0 15px 50px rgba(102, 126, 234, 0.5),
    0 0 40px rgba(102, 126, 234, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
```

##### C. `.navigation-buttons` - Navigasyon Butonları

```css
.navigation-buttons {
  /* ✅ ZORUNLU - Container */
  display: flex;
  gap: 0.5rem;
  margin-right: 1rem;
}
```

##### D. `.nav-btn` - Navigasyon Butonları

```css
.nav-btn {
  /* ✅ ZORUNLU - Buton Boyutu */
  padding: 0.8rem 1.5rem;
  
  /* ✅ ZORUNLU - Görsel Stil */
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--color-white);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(102, 126, 234, 0.1);
}
```

##### E. `.legend-toggle-btn` - Özel Butonlar (Renkler, Kısayollar)

```css
.legend-toggle-btn {
  /* ✅ ZORUNLU - Buton Boyutu */
  padding: 0.75rem 1.5rem;
  
  /* ✅ ZORUNLU - Warning Gradient */
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.25) 0%,
    rgba(251, 191, 36, 0.2) 100%);
  border: 2px solid rgba(245, 158, 11, 0.4);
  color: var(--color-white);
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(15px) saturate(180%);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(245, 158, 11, 0.1);
}

.legend-toggle-btn:hover {
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.4) 0%,
    rgba(251, 191, 36, 0.35) 100%);
  border-color: rgba(245, 158, 11, 0.6);
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 16px 50px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(245, 158, 11, 0.4);
}
```

### 🚫 YASAKLAR

#### ❌ Mock Data - KESINLIKLE YASAK:

**KURAL:** Mock data asla eklenmez! Kullanıcı açıkça istemediği sürece hiçbir yere mock/sahte veri eklenmez.

```javascript
// ❌ YANLIŞ - Mock data ekleme
const mockUsers = [
  { id: 1, name: 'Test User', email: 'test@example.com' },
  { id: 2, name: 'Demo User', email: 'demo@example.com' }
];

// ❌ YANLIŞ - Sahte API response
const mockApiResponse = {
  data: [{ id: 1, title: 'Sample Game' }]
};

// ✅ DOĞRU - Boş state veya gerçek API
const [users, setUsers] = useState([]);
const [games, setGames] = useState([]);
```

**Yasaklar:**
- ❌ Mock kullanıcı verileri
- ❌ Mock oyun verileri  
- ❌ Mock API response'ları
- ❌ Test/demo verileri
- ❌ Placeholder içerikler (kullanıcı istemediği sürece)

**İzin verilenler:**
- ✅ Boş state'ler
- ✅ Loading state'leri
- ✅ Error state'leri
- ✅ Gerçek API'den gelen veriler

#### ❌ Header Yapısı - Asla Yapılmaması Gerekenler:

1. **Header yüksekliğini değiştirme:**
   ```css
   /* ❌ YANLIŞ */
   .tracker-header {
     padding: 1rem 2rem; /* Farklı padding */
   }
   ```

2. **!important kullanma:**
   ```css
   /* ❌ YANLIŞ */
   .tracker-header {
     padding: 0 !important;
   }
   ```

3. **Max-width değiştirme:**
   ```css
   /* ❌ YANLIŞ */
   .header-content {
     max-width: 1400px; /* Farklı genişlik */
   }
   ```

4. **Gap değerini değiştirme:**
   ```css
   /* ❌ YANLIŞ */
   .header-content {
     gap: 1rem; /* Farklı gap */
   }
   ```

#### ❌ Buton Grupları - Yasaklar:

5. **Farklı buton boyutları kullanma:**
   ```css
   /* ❌ YANLIŞ */
   .view-btn {
     padding: 0.5rem 1rem; /* Standart dışı boyut */
   }
   ```

6. **Buton gruplarında farklı gap:**
   ```css
   /* ❌ YANLIŞ */
   .header-controls {
     gap: 1rem; /* 1.5rem olmalı */
   }
   ```

7. **Backdrop-filter kullanmama:**
   ```css
   /* ❌ YANLIŞ */
   .view-btn {
     /* backdrop-filter eksik */
   }
   ```

8. **Transition süresi değiştirme:**
   ```css
   /* ❌ YANLIŞ */
   .nav-btn {
     transition: all 0.1s ease; /* Çok hızlı */
   }
   ```

9. **Border-radius değiştirme:**
   ```css
   /* ❌ YANLIŞ */
   .view-btn {
     border-radius: 8px; /* 16px olmalı */
   }
   ```

### ✅ KONTROL LİSTESİ

Yeni sayfa oluştururken:

#### Header Yapısı
- [ ] `.tracker-header` class'ı var mı?
- [ ] `padding: 2rem 0 1rem 0` ayarlandı mı?
- [ ] Full-width layout uygulandı mı?
- [ ] Responsive padding (`calc(50vw - 50%)`) var mı?
- [ ] Header içeriği `.header-content` ile sarıldı mı?

#### Buton Grupları (Eğer varsa)
- [ ] `.header-controls` gap'i `1.5rem` mi?
- [ ] `.view-switcher` container doğru mu?
- [ ] `.view-btn` padding'i `1rem 2rem` mi?
- [ ] `.nav-btn` padding'i `0.8rem 1.5rem` mi?
- [ ] `.legend-toggle-btn` padding'i `0.75rem 1.5rem` mi?
- [ ] Tüm butonlarda `backdrop-filter` var mı?
- [ ] Border-radius değerleri doğru mu? (view: 16px, diğer: 12px)
- [ ] Transition süreleri standart mı? (0.3s-0.4s)
- [ ] Hover efektleri uygulandı mı?

### 🎯 REFERANS SAYFA

**GameTracker** sayfası referans alınmalıdır. Tüm header stilleri GameTracker'daki gibi olmalıdır.

### 📱 RESPONSIVE DAVRANIŞI

Header tüm ekran boyutlarında aynı yükseklikte kalmalı:
- **Desktop (1920px+):** Tam genişlik
- **Laptop (1024px-1920px):** Tam genişlik
- **Tablet (768px-1024px):** Tam genişlik
- **Mobile (320px-768px):** Tam genişlik

### 🔧 DEBUGGING

Header sorunları için:

1. **F12 → Elements** açın
2. `.tracker-header` elementini seçin
3. **Computed** sekmesinde `padding` değerini kontrol edin
4. `2rem 0 1rem 0` olmalı

### 📝 NOTLAR

- Bu kurallar **tüm sayfalarda** geçerlidir
- Yeni sayfa oluştururken bu template kullanılmalı
- Mevcut sayfalar bu standartlara uygun hale getirilmiştir
- Header yüksekliği değiştirilmemelidir

---

## 📁 DOSYA SİSTEMİ ORGANİZASYONU

### 🏗️ Alt Sayfa Organizasyon Kuralları

#### 📋 Temel Kural
**Alt sayfalar her zaman parent sayfanın klasörü içinde olmalıdır.**

#### 🎯 Organizasyon Yapısı

```
src/pages/
├── ParentPage/
│   ├── ParentPage.jsx          # Ana sayfa
│   ├── ParentPage.css          # Ana sayfa stilleri
│   ├── index.js                # Export point
│   ├── SubPage1/               # Alt sayfa 1
│   │   ├── SubPage1.jsx
│   │   ├── SubPage1.css
│   │   └── index.js
│   ├── SubPage2/               # Alt sayfa 2
│   │   ├── SubPage2.jsx
│   │   ├── SubPage2.css
│   │   └── index.js
│   └── components/             # Parent'a özel componentler
│       ├── SharedComponent.jsx
│       └── SharedComponent.css
```

#### ✅ Örnek: Game Tracking Hub

```
src/pages/GameTrackingHub/
├── GameTrackingHub.jsx         # Ana hub sayfası
├── GameTrackingHub.css
├── index.js
├── GameTracker/                # Alt sayfa
│   ├── GameTracker.jsx
│   ├── GameTracker.css
│   └── index.js
├── Statistics/                 # Alt sayfa
│   ├── Statistics.jsx
│   ├── Statistics.css
│   └── index.js
├── RoutePlanner/              # Alt sayfa
│   ├── RoutePlanner.jsx
│   ├── RoutePlanner.css
│   └── index.js
└── components/                # Hub'a özel componentler
    ├── GameCard.jsx
    └── StatCard.jsx
```

#### 🛣️ Routing Yapısı

**Parent ve alt sayfalar nested route olarak organize edilmelidir:**

```jsx
// App.jsx
<Route path="/game-tracking-hub" element={<GameTrackingHub />}>
  <Route path="game-tracker" element={<GameTracker />} />
  <Route path="statistics" element={<Statistics />} />
  <Route path="route-planner" element={<RoutePlanner />} />
</Route>
```

**URL Yapısı:**
- Ana sayfa: `/game-tracking-hub`
- Alt sayfa 1: `/game-tracking-hub/game-tracker`
- Alt sayfa 2: `/game-tracking-hub/statistics`
- Alt sayfa 3: `/game-tracking-hub/route-planner`

#### 🏠 Ana Sayfa Kuralları

**Ana sayfada sadece parent uygulamalar görünmelidir:**

✅ **DOĞRU - Ana sayfada görünür:**
- Game Tracking Hub
- Todo App
- Hava Durumu
- Hesap Makinesi

❌ **YANLIŞ - Ana sayfada görünmez:**
- Game Tracker (alt sayfa)
- Statistics (alt sayfa)
- Route Planner (alt sayfa)

#### 📦 Import Yapısı

**Alt sayfalar parent klasöründen import edilir:**

```jsx
// App.jsx
import GameTrackingHub from '@/pages/GameTrackingHub';
import GameTracker from '@/pages/GameTrackingHub/GameTracker';
import Statistics from '@/pages/GameTrackingHub/Statistics';
import RoutePlanner from '@/pages/GameTrackingHub/RoutePlanner';
```

#### 🔄 Navigasyon Kuralları

**Parent sayfadan alt sayfalara navigasyon:**

```jsx
// GameTrackingHub.jsx
import { useNavigate } from 'react-router-dom';

function GameTrackingHub() {
  const navigate = useNavigate();
  
  const handleSubPageNavigation = (subPage) => {
    navigate(`/game-tracking-hub/${subPage}`);
  };
  
  return (
    <div>
      <button onClick={() => handleSubPageNavigation('game-tracker')}>
        Game Tracker
      </button>
      <button onClick={() => handleSubPageNavigation('statistics')}>
        Statistics
      </button>
    </div>
  );
}
```

#### 🚫 Yasaklar

❌ **Alt sayfaları root level'da tutmak:**
```
src/pages/
├── GameTracker/     # ❌ YANLIŞ
├── Statistics/      # ❌ YANLIŞ
├── RoutePlanner/    # ❌ YANLIŞ
```

❌ **Alt sayfaları ana sayfada göstermek:**
```jsx
// AnaSayfa.jsx - ❌ YANLIŞ
<div onClick={() => navigate('/game-tracker')}>Game Tracker</div>
<div onClick={() => navigate('/statistics')}>Statistics</div>
```

❌ **Flat routing yapısı:**
```jsx
// ❌ YANLIŞ
<Route path="/game-tracker" element={<GameTracker />} />
<Route path="/statistics" element={<Statistics />} />
```

#### ✅ Zorunlu Kontroller

Yeni alt sayfa oluştururken:

- [ ] Alt sayfa parent klasörü içinde mi?
- [ ] Routing nested olarak yapılandırıldı mı?
- [ ] Ana sayfada sadece parent uygulama görünüyor mu?
- [ ] URL yapısı `/parent/sub-page` formatında mı?
- [ ] Import path'leri doğru mu?
- [ ] Parent sayfadan alt sayfalara navigasyon var mı?

#### 📝 Uygulama Notları

1. **Mevcut Yapı:** Game Tracking Hub bu kurallara göre organize edilmiştir
2. **Gelecek Uygulamalar:** Tüm yeni parent-child ilişkileri bu yapıya uymalıdır
3. **Refactoring:** Mevcut flat yapılar bu kurallara göre düzenlenmelidir

---

## 🔓 BAĞIMSIZLAŞTIRMA KURALLARI

### 🎯 "Bağımsızlaştır" Komutu İçin Standart Çözüm

Kullanıcı bir bölümü "bağımsızlaştır" dediğinde, aşağıdaki adımları uygula:

#### 1. 🏗️ HTML Yapısı Düzeltme

**❌ Sorunlu Yapı:**
```jsx
<div className="main-content">
  <section className="games-section">
    <div className="problem-section">
      {/* Bu bölüm container'a bağımlı */}
    </div>
  </section>
</div>
```

**✅ Bağımsız Yapı:**
```jsx
<div className="main-content">
  <section className="games-section">
    {/* Diğer bölümler */}
  </section>
</div>

{/* Tamamen bağımsız bölüm */}
<div className="independent-section-fullwidth">
  {/* Bağımsızlaştırılan içerik */}
</div>
```

#### 2. 🎨 CSS Güçlendirme

**Bağımsız bölüm için zorunlu CSS:**
```css
.independent-section-fullwidth {
  /* ✅ ZORUNLU - Tam genişlik */
  min-width: 100vw !important;
  max-width: 100vw !important;
  width: 100vw !important;
  
  /* ✅ ZORUNLU - Konumlandırma */
  position: relative !important;
  left: 50% !important;
  right: 50% !important;
  margin-left: -50vw !important;
  margin-right: -50vw !important;
  
  /* ✅ ZORUNLU - Z-index ve overflow */
  z-index: 10 !important;
  overflow-x: hidden !important;
  
  /* ✅ ZORUNLU - Padding */
  padding: 2rem !important;
  
  /* ✅ ZORUNLU - Background (opsiyonel) */
  background: var(--dark-bg-primary);
}
```

#### 3. 🔧 JSX Fragment Kullanımı

**Birden fazla bağımsız bölüm varsa:**
```jsx
{condition && (
  <>
    <div className="main-content">
      {/* Ana içerik */}
    </div>
    
    <div className="independent-section-fullwidth">
      {/* Bağımsız bölüm */}
    </div>
  </>
)}
```

#### 4. 📋 Kontrol Listesi

Bağımsızlaştırma işlemi için:

- [ ] Bölüm parent container'dan çıkarıldı mı?
- [ ] `-fullwidth` class'ı eklendi mi?
- [ ] CSS'te `!important` kuralları var mı?
- [ ] `100vw` genişlik ayarları yapıldı mı?
- [ ] `position: relative` eklendi mi?
- [ ] `margin-left/right: -50vw` ayarlandı mı?
- [ ] **ZORUNLU:** `.gameSection` padding'i kaldırıldı mı? (bağımsız bölümler kendi padding'ini yönetir)
- [ ] JSX syntax hataları kontrol edildi mi?
- [ ] Fragment (`<>`) gerekiyorsa eklendi mi?

#### 4.1. 🎯 GameSection Padding Kaldırma

**"Bağımsızlaştır" komutu kullanıldığında MUTLAKA yapılacak:**

```css
/* ❌ ÖNCE - Ortak padding */
.gameSection {
  padding: 2rem;  /* Bu kaldırılacak */
}

/* ✅ SONRA - Bağımsız padding */
.gameSection {
  /* padding kaldırıldı - her bölüm kendi padding'ini yönetir */
}

.recentGamesSection {
  padding: 2rem;  /* Kendi padding'i */
}

.recommendedGamesSection {
  padding: 2rem;  /* Kendi padding'i */
}

.librarySection {
  padding: 2rem;  /* Kendi padding'i */
}
```

**Neden gerekli:**
- Bağımsız bölümler kendi genişlik ve padding'ini kontrol etmeli
- Ortak `.gameSection` padding'i bağımsızlığı bozar
- Her bölüm farklı genişlik stratejisi kullanabilir

#### 5. 🚨 Yaygın Hatalar

**❌ Yapılmaması gerekenler:**
- Parent container içinde bırakmak
- CSS'te `!important` kullanmamak
- Sadece `width: 100%` kullanmak (yetersiz)
- JSX fragment kullanmayı unutmak
- Z-index ayarlamamak

**✅ Doğru yaklaşım:**
- Tamamen parent'tan ayırmak
- Güçlü CSS kuralları (`!important`)
- Viewport genişliği (`100vw`) kullanmak
- Proper JSX structure
- Z-index ile katman yönetimi

#### 5.1. 🔧 Overflow ve Container Sınırı Çözümleri

**Bağımsızlaştırma sırasında overflow sorunları çıkarsa:**

**1. Global Overflow Kontrolleri:**
```css
/* ✅ ZORUNLU - Global CSS düzeltmeleri */
/* index.css */
body {
  overflow-x: visible !important;  /* hidden yerine visible */
}

/* App.css */
html, body {
  overflow-x: visible;  /* hidden yerine visible */
}
```

**2. Component Overflow Düzeltmeleri:**
```css
/* ✅ ZORUNLU - Component CSS düzeltmeleri */
.gameSelectionScreen {
  overflow-x: visible;  /* hidden yerine visible */
}
```

**3. Parent Container Sınırları:**
```css
/* ❌ SORUNLU - Container sınırları */
.session-main {
  max-width: 1400px;  /* Bu kaldırılacak */
  margin: 0 auto;     /* Bu kaldırılacak */
}

/* ✅ ÇÖZÜM - Sınırsız container */
.session-main {
  width: 100%;
  margin: 0;  /* auto kaldırıldı */
  /* max-width kaldırıldı */
}
```

**4. Overflow Sorun Tespiti Checklist:**
- [ ] Global CSS'lerde `overflow-x: hidden` var mı?
- [ ] Parent container'larda `max-width` sınırı var mı?
- [ ] Parent container'larda `margin: 0 auto` var mı?
- [ ] Component CSS'inde `overflow-x: hidden` var mı?
- [ ] Z-index çakışması var mı?

**5. Hızlı Overflow Fix Komutu:**
```bash
# Tüm overflow-x: hidden'ları bul
grep -r "overflow-x: hidden" src/
# Tüm max-width sınırlarını bul  
grep -r "max-width:" src/
```

#### 6. 📝 Örnek Uygulama

**Referans:** GameSelectionScreen kütüphane bölümü bağımsızlaştırması
- **Dosya:** `GameSelectionScreen.jsx`
- **CSS:** `GameSelectionScreen.css` - `.library-section-fullwidth`
- **Tarih:** 2024 - Kütüphane tam genişlik sorunu çözümü

---

**Son Güncelleme:** 2024 - Bağımsızlaştırma kuralları eklendi
**Referans:** GameTracker.css, GameTrackingHub klasör yapısı, GameSelectionScreen bağımsızlaştırma çözümü
**Durum:** ✅ Aktif