# 📝 BÖLÜM 3: AÇIKLAMA VE MEDYA WIREFRAME

## 📐 DESKTOP LAYOUT (1920x600px)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                             │
│  ┌────────────────────────────────────────────────┐  ┌──────────────────────────────────┐ │
│  │                                                │  │                                  │ │
│  │  📝 GAME DESCRIPTION                           │  │  🖼️ MEDIA GALLERY               │ │
│  │  ═══════════════════════════════                │  │  ═══════════════════            │ │
│  │                                                │  │                                  │ │
│  │  The Witcher 3: Wild Hunt is an               │  │  ┌────────┬────────┐            │ │
│  │  action role-playing game set in              │  │  │        │        │            │ │
│  │  a visually stunning fantasy                   │  │  │ Image1 │ Image2 │            │ │
│  │  universe full of meaningful                   │  │  │  220px │  220px │            │ │
│  │  choices and impactful consequences.           │  │  └────────┴────────┘            │ │
│  │                                                │  │  ┌────────┬────────┐            │ │
│  │  As a witcher, you take on the role           │  │  │        │        │            │ │
│  │  of Geralt of Rivia, a monster                │  │  │ Image3 │ Video  │            │ │
│  │  hunter for hire. Your mission:                │  │  │  220px │  220px │            │ │
│  │  find the child of prophecy in a               │  │  └────────┴────────┘            │ │
│  │  vast open world.                              │  │                                  │ │
│  │                                                │  │  ┌──────────────────────────┐  │ │
│  │  With over 100 hours of core and              │  │  │                          │  │ │
│  │  side quest content, The Witcher 3            │  │  │   [View All Media]       │  │ │
│  │  offers an unparalleled adventure.             │  │  │                          │  │ │
│  │                                                │  │  └──────────────────────────┘  │ │
│  │  [Read More ▼]                                 │  │                                  │ │
│  │                                                │  │  📊 12 Screenshots               │ │
│  │  ┌─────────────────────────────────────────┐  │  │  🎬 3 Videos                    │ │
│  │  │ 💬 "A masterpiece of storytelling      │  │  │  🎨 5 Artworks                  │ │
│  │  │    and world building"                 │  │  │                                  │ │
│  │  │    - IGN                               │  │  └──────────────────────────────────┘ │
│  │  └─────────────────────────────────────────┘  │                                        │
│  │                                                │                                        │
│  │  🏆 KEY FEATURES                               │                                        │
│  │  • Massive open world exploration              │                                        │
│  │  • Deep character progression                  │                                        │
│  │  • Morally ambiguous choices                   │                                        │
│  │  • Dynamic combat system                       │                                        │
│  │  • Rich narrative with multiple endings        │                                        │
│  │                                                │                                        │
│  └────────────────────────────────────────────────┘                                        │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 MOBILE LAYOUT (375x800px)

```
┌─────────────────────────────────┐
│                                 │
│  📝 GAME DESCRIPTION            │
│  ═══════════════════            │
│                                 │
│  The Witcher 3: Wild Hunt      │
│  is an action role-playing     │
│  game set in a visually        │
│  stunning fantasy universe...  │
│                                 │
│  With over 100 hours of        │
│  core and side quest           │
│  content...                    │
│                                 │
│  [Read More ▼]                 │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 💬 "A masterpiece..."     │ │
│  │    - IGN                  │ │
│  └───────────────────────────┘ │
│                                 │
│  🏆 KEY FEATURES               │
│  • Open world exploration      │
│  • Character progression       │
│  • Morally ambiguous choices   │
│  • Dynamic combat              │
│  • Multiple endings            │
│                                 │
├─────────────────────────────────┤
│                                 │
│  🖼️ MEDIA GALLERY              │
│  ═══════════════════           │
│                                 │
│  ┌───────────────┐             │
│  │               │             │
│  │   Featured    │             │
│  │   Image       │             │
│  │   300x200     │             │
│  └───────────────┘             │
│                                 │
│  ┌──┬──┬──┬──┬──┐              │
│  │📷│📷│🎬│📷│📷│              │
│  └──┴──┴──┴──┴──┘              │
│  [Swipe for more]              │
│                                 │
│  ┌───────────────────────────┐ │
│  │   [View All Media]        │ │
│  └───────────────────────────┘ │
│                                 │
│  📊 12 Screenshots              │
│  🎬 3 Videos                    │
│  🎨 5 Artworks                  │
│                                 │
└─────────────────────────────────┘
```

---

## 🎨 TASARIM SPESİFİKASYONLARI

### 1. DESCRIPTION SECTION
```css
.description-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
  position: relative;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.section-icon {
  font-size: 28px;
  color: var(--primary);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-divider {
  height: 2px;
  background: linear-gradient(90deg, 
    var(--primary), 
    transparent
  );
  margin-bottom: 24px;
}

/* Description Text */
.game-description {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.game-description p {
  margin-bottom: 16px;
}

.game-description p:last-child {
  margin-bottom: 0;
}

/* Text Gradient Effect */
.game-description::first-letter {
  font-size: 48px;
  font-weight: 700;
  float: left;
  line-height: 1;
  margin-right: 8px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Read More Button */
.read-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  margin-top: 16px;
}

.read-more-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.read-more-btn .icon {
  transition: transform 0.3s ease;
}

.read-more-btn:hover .icon {
  transform: translateY(2px);
}

.read-more-btn.expanded .icon {
  transform: rotate(180deg);
}

/* Expanded Content */
.description-expanded {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s ease;
}

.description-expanded.active {
  max-height: 1000px;
  margin-top: 16px;
}
```

### 2. QUOTE BOX
```css
.quote-box {
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.1), 
    rgba(118, 75, 162, 0.05)
  );
  border-left: 4px solid var(--primary);
  padding: 20px 24px;
  border-radius: 0 12px 12px 0;
  margin: 24px 0;
  position: relative;
}

.quote-box::before {
  content: '"';
  position: absolute;
  top: -10px;
  left: 16px;
  font-size: 64px;
  font-weight: 700;
  color: var(--primary);
  opacity: 0.2;
  line-height: 1;
}

.quote-text {
  font-size: 17px;
  font-style: italic;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.quote-author {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 600;
  text-align: right;
}

.quote-author::before {
  content: '— ';
  color: var(--primary);
}
```

### 3. KEY FEATURES LIST
```css
.key-features {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.features-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.features-title .icon {
  color: var(--warning);
}

.features-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: all 0.2s ease;
  cursor: default;
}

.feature-item:hover {
  border-color: var(--primary);
  background: rgba(102, 126, 234, 0.05);
  transform: translateX(4px);
}

.feature-bullet {
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
  flex-shrink: 0;
}

.feature-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
}
```

### 4. MEDIA GALLERY SECTION
```css
.media-gallery {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  position: sticky;
  top: 80px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.gallery-item {
  position: relative;
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.gallery-item:hover {
  border-color: var(--primary);
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.gallery-item:hover .gallery-image {
  transform: scale(1.1);
}

/* Video Overlay */
.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.gallery-item:hover .video-overlay {
  background: rgba(0,0,0,0.4);
}

.play-icon {
  width: 60px;
  height: 60px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  transition: all 0.3s ease;
}

.gallery-item:hover .play-icon {
  transform: scale(1.15);
  background: var(--secondary);
}

/* Type Badge */
.media-type-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.media-type-badge.video {
  background: rgba(239, 68, 68, 0.9);
}

.media-type-badge.screenshot {
  background: rgba(59, 130, 246, 0.9);
}
```

### 5. VIEW ALL BUTTON
```css
.view-all-btn {
  width: 100%;
  padding: 16px;
  background: var(--bg-primary);
  border: 2px dashed var(--border);
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.view-all-btn:hover {
  border-color: var(--primary);
  border-style: solid;
  color: var(--primary);
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-2px);
}

.view-all-btn .icon {
  transition: transform 0.3s ease;
}

.view-all-btn:hover .icon {
  transform: translateX(4px);
}
```

### 6. MEDIA STATS
```css
.media-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.media-stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-primary);
  border-radius: 8px;
  font-size: 13px;
}

.stat-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
}

.stat-icon {
  font-size: 16px;
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
}
```

---

## 🎭 ANIMASYONLAR

### Entry Animations
```css
.description-section,
.media-gallery {
  animation: fadeInUp 0.6s ease both;
}

.description-section {
  animation-delay: 0.1s;
}

.media-gallery {
  animation-delay: 0.2s;
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
```

### Gallery Item Stagger
```css
.gallery-item {
  animation: scaleIn 0.4s ease both;
}

.gallery-item:nth-child(1) { animation-delay: 0.1s; }
.gallery-item:nth-child(2) { animation-delay: 0.2s; }
.gallery-item:nth-child(3) { animation-delay: 0.3s; }
.gallery-item:nth-child(4) { animation-delay: 0.4s; }

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
```

### Text Reveal
```css
.game-description p {
  animation: textReveal 0.8s ease both;
}

.game-description p:nth-child(1) { animation-delay: 0.2s; }
.game-description p:nth-child(2) { animation-delay: 0.3s; }
.game-description p:nth-child(3) { animation-delay: 0.4s; }

@keyframes textReveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Tablet (1024px) */
@media (max-width: 1024px) {
  .content-container {
    grid-template-columns: 1fr;
  }
  
  .media-gallery {
    position: static;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Mobile (768px) */
@media (max-width: 768px) {
  .description-section,
  .media-gallery {
    padding: 20px;
  }
  
  .gallery-grid {
    grid-template-columns: 1fr;
  }
  
  .features-list {
    grid-template-columns: 1fr;
  }
  
  .game-description {
    font-size: 15px;
    line-height: 1.7;
  }
}
```

---

## 🎯 KULLANICI ETKİLEŞİMLERİ

### 1. Read More Toggle
```javascript
const readMoreBtn = document.querySelector('.read-more-btn');
const expandedContent = document.querySelector('.description-expanded');

readMoreBtn.addEventListener('click', () => {
  expandedContent.classList.toggle('active');
  readMoreBtn.classList.toggle('expanded');
  
  const btnText = readMoreBtn.querySelector('.text');
  btnText.textContent = expandedContent.classList.contains('active') 
    ? 'Read Less' 
    : 'Read More';
});
```

### 2. Gallery Item Click
```javascript
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    const mediaType = item.dataset.type;
    const mediaSrc = item.dataset.src;
    
    // Open lightbox modal
    openMediaLightbox(mediaSrc, mediaType);
  });
});
```

### 3. Lazy Loading Images
```javascript
const observerOptions = {
  threshold: 0.1,
  rootMargin: '50px'
};

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.add('loaded');
      imageObserver.unobserve(img);
    }
  });
}, observerOptions);

document.querySelectorAll('.gallery-image').forEach(img => {
  imageObserver.observe(img);
});
```

---

## 💡 GELİŞMİŞ ÖZELLİKLER

### 1. Lightbox Modal
```css
.media-lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.media-lightbox.active {
  opacity: 1;
  visibility: visible;
}

.lightbox-content {
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
}

.lightbox-image {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
}

.lightbox-controls {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
}
```

### 2. Image Comparison Slider
```css
.comparison-container {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
}

.comparison-slider {
  position: absolute;
  width: 4px;
  height: 100%;
  background: white;
  cursor: ew-resize;
  z-index: 10;
}

.comparison-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
```

---

**Durum:** ✅ Wireframe Tamamlandı
**Son Güncelleme:** 2024
**Sonraki:** Bölüm 4 - Genres & Tags Wireframe
