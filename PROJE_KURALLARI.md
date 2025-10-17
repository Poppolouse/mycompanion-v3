# 🎯 PROJE KURALLARI - HEADER STANDARTLARI

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

**Son Güncelleme:** 2024 - Header standardizasyonu ve alt sayfa organizasyonu tamamlandı
**Referans:** GameTracker.css, GameTrackingHub klasör yapısı
**Durum:** ✅ Aktif