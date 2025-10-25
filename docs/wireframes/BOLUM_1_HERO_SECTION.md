# 🎮 BÖLÜM 1: HERO SECTION WIREFRAME

## 📐 DESKTOP LAYOUT (1920x400px)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                         │
│  ┌────────────────────────────┐  ┌──────────────────────────────────────────────────┐ │
│  │                            │  │  [← Back to List]                                 │ │
│  │                            │  │                                                   │ │
│  │        COVER IMAGE         │  │  THE WITCHER 3: WILD HUNT                        │ │
│  │        (300x400px)         │  │  ═══════════════════════════════                 │ │
│  │                            │  │                                                   │ │
│  │      [Zoom on hover]       │  │  🏢 CD Projekt Red  •  📅 May 19, 2015          │ │
│  │                            │  │  🎮 Steam • GOG • Epic  •  🏆 96 Metacritic      │ │
│  │                            │  │                                                   │ │
│  └────────────────────────────┘  │  ┌─────────────────────────────────────────────┐ │ │
│                                   │  │                                             │ │ │
│  ┌──┬──┬──┬──┬──┬──┬──┬──┐      │  │     🎮 PLAY NOW / ADD TO LIBRARY           │ │ │
│  │🖼│🖼│🖼│🖼│🖼│🖼│🖼│🖼│      │  │         [Primary Action Button]             │ │ │
│  └──┴──┴──┴──┴──┴──┴──┴──┘      │  │                                             │ │ │
│  [Screenshot Thumbnails]          │  └─────────────────────────────────────────────┘ │ │
│  [Horizontal scroll]              │                                                   │ │
│                                   │  ┌────────┬────────┬────────┬────────┬────────┐  │ │
│  Platform Icons:                  │  │  📊    │  ⭐    │  📝    │  🔗    │  ...   │  │ │
│  🖥️ 🎮 🎮 📱 🕹️                  │  │ Status │ Fave   │ Notes  │ Share  │ More   │  │ │
│                                   │  └────────┴────────┴────────┴────────┴────────┘  │ │
│                                   │                                                   │ │
│                                   │  💬 "An epic tale of monster hunting..."         │ │
│                                   │     [Tagline - 1 satır özet]                     │ │
│                                   │                                                   │ │
│                                   └──────────────────────────────────────────────────┘ │
│                                                                                         │
│ [Blurred background image of game with gradient overlay]                              │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 MOBILE LAYOUT (375x500px)

```
┌─────────────────────────────────────┐
│ [← Back]              [⋮ Menu]      │
├─────────────────────────────────────┤
│                                     │
│      ┌───────────────────┐         │
│      │                   │         │
│      │   COVER IMAGE     │         │
│      │   (200x300px)     │         │
│      │                   │         │
│      └───────────────────┘         │
│                                     │
│  THE WITCHER 3: WILD HUNT          │
│  ═══════════════════════════       │
│                                     │
│  🏢 CD Projekt Red                 │
│  📅 May 19, 2015                   │
│  🏆 96 Metacritic                  │
│                                     │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │   🎮 PLAY NOW / ADD           │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌──────┬──────┬──────┬──────┐    │
│  │  📊  │  ⭐  │  📝  │  🔗  │    │
│  │Status│ Fave │Notes │Share │    │
│  └──────┴──────┴──────┴──────┘    │
│                                     │
│  🖥️ 🎮 🎮 📱 🕹️                  │
│  [Platform Icons]                  │
│                                     │
│  ┌─┬─┬─┬─┬─┬─┬─┬─┐                │
│  │🖼│🖼│🖼│🖼│🖼│🖼│🖼│🖼│              │
│  └─┴─┴─┴─┴─┴─┴─┴─┘                │
│  [Screenshot Carousel]             │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎨 TASARIM SPESİFİKASYONLARI

### 1. COVER IMAGE SECTION
```css
.cover-container {
  width: 300px;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  transition: transform 0.3s ease;
}

.cover-container:hover {
  transform: scale(1.05);
  cursor: pointer;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.cover-container:hover .cover-image {
  transform: scale(1.1);
}

/* Zoom icon on hover */
.zoom-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cover-container:hover .zoom-overlay {
  opacity: 1;
}
```

### 2. SCREENSHOT THUMBNAILS
```css
.screenshot-gallery {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  overflow-x: auto;
  padding: 8px 0;
  scrollbar-width: thin;
}

.screenshot-thumb {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.screenshot-thumb:hover {
  border-color: var(--primary);
  transform: translateY(-4px);
}

.screenshot-thumb.active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}
```

### 3. GAME INFO SECTION
```css
.game-header {
  padding: 32px;
  background: linear-gradient(
    135deg, 
    rgba(15, 23, 42, 0.95), 
    rgba(30, 41, 59, 0.9)
  );
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.back-button:hover {
  color: var(--primary);
}

.game-title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #fff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.game-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  color: var(--text-secondary);
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-divider {
  color: var(--text-muted);
}
```

### 4. PRIMARY ACTION BUTTON
```css
.primary-action-button {
  width: 100%;
  height: 64px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.primary-action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255,255,255,0.3), 
    transparent
  );
  transition: left 0.5s ease;
}

.primary-action-button:hover::before {
  left: 100%;
}

.primary-action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
}

.primary-action-button:active {
  transform: translateY(0);
}
```

### 5. SECONDARY ACTION BUTTONS
```css
.secondary-actions {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-top: 16px;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  color: var(--text-secondary);
}

.action-button:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
}

.action-button .icon {
  font-size: 20px;
}

.action-button.active {
  border-color: var(--primary);
  background: rgba(102, 126, 234, 0.1);
  color: var(--primary);
}
```

### 6. PLATFORM ICONS
```css
.platform-icons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.platform-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border);
  font-size: 20px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.platform-icon:hover {
  background: var(--primary);
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.platform-icon.active {
  background: var(--primary);
  border-color: var(--primary);
}
```

### 7. TAGLINE
```css
.game-tagline {
  margin-top: 16px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.1);
  border-left: 3px solid var(--primary);
  border-radius: 0 8px 8px 0;
  color: var(--text-secondary);
  font-size: 15px;
  font-style: italic;
  line-height: 1.6;
}
```

### 8. BACKGROUND
```css
.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(40px) brightness(0.4);
  transform: scale(1.1);
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(15, 23, 42, 0.7),
    rgba(15, 23, 42, 0.95)
  );
}
```

---

## 🎭 ANİMASYONLAR VE MICRO-INTERACTIONS

### Entry Animations
```css
.hero-section {
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cover-container {
  animation: scaleIn 0.5s ease 0.2s both;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.game-title {
  animation: slideInRight 0.6s ease 0.3s both;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Interactive States
```css
/* Button Press Effect */
.action-button:active {
  transform: scale(0.95);
}

/* Icon Bounce on Hover */
.action-button:hover .icon {
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* Screenshot Thumbnail Pulse */
.screenshot-thumb.active {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(102, 126, 234, 0);
  }
}
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Desktop Large */
@media (min-width: 1920px) {
  .cover-container { width: 350px; height: 467px; }
  .game-title { font-size: 56px; }
}

/* Desktop */
@media (max-width: 1440px) {
  .cover-container { width: 280px; height: 373px; }
  .game-title { font-size: 42px; }
}

/* Tablet */
@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
  }
  
  .cover-container { 
    width: 240px; 
    height: 320px; 
    margin: 0 auto;
  }
  
  .game-title { font-size: 36px; }
  
  .secondary-actions {
    grid-template-columns: repeat(5, 1fr);
  }
}

/* Mobile */
@media (max-width: 768px) {
  .cover-container { 
    width: 200px; 
    height: 300px; 
  }
  
  .game-title { font-size: 28px; }
  
  .screenshot-gallery {
    margin-top: 12px;
  }
  
  .screenshot-thumb {
    width: 60px;
    height: 45px;
  }
  
  .secondary-actions {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .game-meta {
    flex-direction: column;
    gap: 8px;
  }
}

/* Mobile Small */
@media (max-width: 375px) {
  .cover-container { 
    width: 180px; 
    height: 270px; 
  }
  
  .game-title { font-size: 24px; }
  
  .primary-action-button {
    height: 56px;
    font-size: 16px;
  }
}
```

---

## 🎯 KULLANICI ETKİLEŞİMLERİ

### 1. Cover Image Click
- **Action:** Fullscreen görsel galerisi aç
- **Animation:** Zoom in efekti
- **Duration:** 300ms

### 2. Screenshot Thumbnail Click
- **Action:** Ana görseli değiştir
- **Animation:** Fade transition
- **Duration:** 400ms

### 3. Play/Add Button Click
- **Action:** Modal aç veya oyunu başlat
- **Animation:** Scale + fade
- **Feedback:** Haptic feedback (mobile)

### 4. Secondary Action Buttons
- **Status:** Durum değiştirme dropdown
- **Favorite:** Toggle + animation
- **Notes:** Yan panel slide-in
- **Share:** Share modal popup

### 5. Platform Icons
- **Action:** Platform filtreleme
- **Feedback:** Active state + tooltip

---

## 💡 İYİLEŞTİRME ÖNERİLERİ

### UX İyileştirmeleri
1. **Video Autoplay:** Cover yerine trailer otomatik oynatma (sound off)
2. **Quick Stats:** Metacritic puanını hero'da göster
3. **Social Proof:** "X kişi oynuyor" badge'i
4. **Trending Badge:** Popüler oyunlar için badge

### Erişilebilirlik
1. **Alt Text:** Tüm görseller için
2. **Keyboard Navigation:** Tab ile tüm elementlere erişim
3. **Screen Reader:** ARIA labels
4. **Focus Indicators:** Belirgin focus stilleri

### Performance
1. **Image Lazy Loading:** Screenshot'lar için
2. **Progressive Image:** Düşük kalite → Yüksek kalite
3. **Preload:** Cover image öncelikli
4. **WebP Format:** Tüm görseller için

---

## 📊 BAŞARI METRİKLERİ

### Yükleme Süreleri
- **Hero Section:** < 1s
- **Cover Image:** < 500ms
- **Screenshot Thumbnails:** < 1.5s
- **Background Image:** Low priority

### Kullanıcı Etkileşimi
- **Click Rate (Play Button):** > 40%
- **Screenshot Engagement:** > 30%
- **Action Button Usage:** > 25%

---

**Durum:** ✅ Wireframe Tamamlandı
**Son Güncelleme:** 2024
**Sonraki:** Bölüm 2 - Quick Stats Wireframe
