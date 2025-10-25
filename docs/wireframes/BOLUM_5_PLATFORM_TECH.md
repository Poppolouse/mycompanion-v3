# 🎮 BÖLÜM 5: PLATFORM VE TEKNİK BİLGİLER WIREFRAME

## 📐 DESKTOP LAYOUT (1920x250px)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│  ⚙️ PLATFORM & TECHNICAL INFORMATION                                                │
│  ═════════════════════════════════════                                              │
│                                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │  🖥️ PLATFORMS        │  │  💻 REQUIREMENTS     │  │  🔧 FEATURES         │    │
│  │  ════════════        │  │  ══════════════       │  │  ══════════          │    │
│  │                      │  │                      │  │                      │    │
│  │  ✓ PC (Windows)      │  │  MINIMUM:            │  │  🎧 Audio            │    │
│  │    • Steam           │  │  OS: Win 7 64-bit    │  │  English (Voice)     │    │
│  │    • GOG             │  │  CPU: i5-2500K       │  │  + 15 languages      │    │
│  │    • Epic            │  │  RAM: 6 GB           │  │                      │    │
│  │                      │  │  GPU: GTX 660        │  │  🌐 Online           │    │
│  │  ✓ PlayStation 5     │  │                      │  │  Single-player       │    │
│  │    • Digital         │  │  RECOMMENDED:        │  │  Achievements        │    │
│  │    • Disc            │  │  OS: Win 10 64-bit   │  │  Cloud Saves         │    │
│  │                      │  │  CPU: i7-3770        │  │                      │    │
│  │  ✓ Xbox Series X/S   │  │  RAM: 8 GB           │  │  🔧 Mods             │    │
│  │    • Game Pass       │  │  GPU: GTX 770        │  │  Steam Workshop      │    │
│  │                      │  │                      │  │  Nexus Mods          │    │
│  │  ✓ Nintendo Switch   │  │  [View Full Specs]   │  │                      │    │
│  │                      │  │                      │  │  ♿ Accessibility     │    │
│  └──────────────────────┘  └──────────────────────┘  │  Subtitles           │    │
│                                                       │  Colorblind Mode     │    │
│                                                       │  Remappable Keys     │    │
│                                                       └──────────────────────┘    │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## 📱 MOBILE LAYOUT (375x600px)

```
┌─────────────────────────────┐
│                             │
│  ⚙️ PLATFORM & TECH         │
│  ═══════════════            │
│                             │
│  🖥️ PLATFORMS               │
│  ┌───────────────────────┐  │
│  │ ✓ PC (Windows)       │  │
│  │   • Steam            │  │
│  │   • GOG              │  │
│  │   • Epic             │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ ✓ PlayStation 5      │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ ✓ Xbox Series X/S    │  │
│  └───────────────────────┘  │
│                             │
│  💻 REQUIREMENTS            │
│  ┌───────────────────────┐  │
│  │ MINIMUM:             │  │
│  │ OS: Win 7 64-bit     │  │
│  │ CPU: i5-2500K        │  │
│  │ RAM: 6 GB            │  │
│  │ GPU: GTX 660         │  │
│  └───────────────────────┘  │
│  [View Full Specs]          │
│                             │
│  🔧 FEATURES                │
│  🎧 15+ Languages           │
│  🌐 Single-player           │
│  🔧 Mod Support             │
│  ♿ Accessibility            │
│                             │
└─────────────────────────────┘
```

## 🎨 CSS SPESİFİKASYONLARI

```css
.platform-tech-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 32px 0;
}

.info-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

/* PLATFORMS */
.platform-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.platform-item {
  padding: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.platform-item:hover {
  border-color: var(--primary);
  background: rgba(102, 126, 234, 0.05);
}

.platform-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.platform-check {
  color: var(--success);
}

.platform-stores {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 30px;
}

.store-link {
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s ease;
}

.store-link:hover {
  color: var(--primary);
}

/* REQUIREMENTS */
.requirements-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.req-tab {
  flex: 1;
  padding: 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.req-tab.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.req-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: var(--bg-primary);
  border-radius: 8px;
}

.req-label {
  font-weight: 600;
  color: var(--text-secondary);
}

.req-value {
  color: var(--text-primary);
  text-align: right;
}

/* FEATURES */
.features-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-group {
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 12px;
  border-left: 3px solid var(--primary);
}

.feature-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.feature-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.feature-item {
  font-size: 14px;
  color: var(--text-secondary);
  padding-left: 20px;
}

.feature-item::before {
  content: '•';
  color: var(--primary);
  font-weight: bold;
  margin-right: 8px;
  margin-left: -20px;
}
```

## 🎭 ANIMASYONLAR

```css
.info-card {
  animation: fadeInUp 0.6s ease both;
}

.info-card:nth-child(1) { animation-delay: 0.1s; }
.info-card:nth-child(2) { animation-delay: 0.2s; }
.info-card:nth-child(3) { animation-delay: 0.3s; }

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

**Durum:** ✅ Tamamlandı
