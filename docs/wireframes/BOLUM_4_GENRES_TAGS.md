# 🏷️ BÖLÜM 4: TÜRLER VE ETİKETLER WIREFRAME

## 📐 DESKTOP LAYOUT (1920x150px)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│  🎮 GENRES & TAGS                                                                  │
│  ═══════════════════                                                               │
│                                                                                     │
│  PRIMARY GENRES (Ana Türler - Büyük Chip'ler):                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                            │
│  │  ACTION  │ │   RPG    │ │OPEN WORLD│ │ADVENTURE │                            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                            │
│                                                                                     │
│  COMMUNITY TAGS (Küçük Badge'ler - Wrap):                                         │
│  [Singleplayer] [Story Rich] [Fantasy] [Medieval] [Atmospheric]                  │
│  [Character Action Game] [Dark Fantasy] [Magic] [Witches]                        │
│  [Choices Matter] [Open World] [Third Person] [Multiple Endings]                 │
│  [Great Soundtrack] [+ Show More (24)]                                            │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 📱 MOBILE LAYOUT (375x300px)

```
┌──────────────────────────┐
│                          │
│  🎮 GENRES & TAGS        │
│  ═══════════════         │
│                          │
│  PRIMARY GENRES          │
│  ┌─────────────────────┐ │
│  │      ACTION        │ │
│  └─────────────────────┘ │
│  ┌─────────────────────┐ │
│  │        RPG          │ │
│  └─────────────────────┘ │
│  ┌─────────────────────┐ │
│  │    OPEN WORLD       │ │
│  └─────────────────────┘ │
│                          │
│  TAGS                    │
│  [Singleplayer]          │
│  [Story Rich]            │
│  [Fantasy]               │
│  [Medieval]              │
│  [Atmospheric]           │
│  [+ 19 more]             │
│                          │
└──────────────────────────┘
```

## 🎨 CSS SPESİFİKASYONLARI

```css
.genres-tags-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
  margin: 32px 0;
}

/* PRIMARY GENRES */
.primary-genres {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.genre-chip {
  padding: 16px 32px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.genre-chip:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
  border-color: white;
}

/* COMMUNITY TAGS */
.community-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-badge {
  padding: 8px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tag-badge:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  transform: translateY(-2px);
}

.tag-badge.popular {
  border-color: var(--primary);
  background: rgba(102, 126, 234, 0.1);
  color: var(--primary);
  font-weight: 600;
}

.show-more-btn {
  padding: 8px 16px;
  background: transparent;
  border: 2px dashed var(--border);
  border-radius: 20px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.show-more-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(102, 126, 234, 0.05);
}
```

**Durum:** ✅ Tamamlandı
