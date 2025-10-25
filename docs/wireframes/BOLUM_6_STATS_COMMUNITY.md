# 📈 BÖLÜM 6: İSTATİSTİKLER VE TOPLULUK WIREFRAME

## 📐 DESKTOP LAYOUT (1920x300px)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│  📊 STATS & COMMUNITY                                                               │
│  ═══════════════════════                                                            │
│                                                                                      │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐ │
│  │  📈 YOUR STATS                      │  │  👥 COMMUNITY DATA                  │ │
│  │  ═════════════                      │  │  ═══════════════                    │ │
│  │                                     │  │                                     │ │
│  │  ┌────────────────────────────┐    │  │  ┌────────────────────────────┐    │ │
│  │  │     Progress Chart         │    │  │  │   Popularity Trend         │    │ │
│  │  │                            │    │  │  │                            │    │ │
│  │  │  [Line Graph showing       │    │  │  │  [Area Chart showing       │    │ │
│  │  │   playtime over weeks]     │    │  │  │   player count over time]  │    │ │
│  │  │                            │    │  │  │                            │    │ │
│  │  └────────────────────────────┘    │  │  └────────────────────────────┘    │ │
│  │                                     │  │                                     │ │
│  │  ⏱️ Total Playtime: 85h            │  │  👥 Active Players                 │ │
│  │  📊 Progress: 65%                  │  │  123,456 playing now               │ │
│  │  🏆 Achievements: 42/78            │  │  +12% this week                    │ │
│  │  📅 Last Played: 2 days ago        │  │                                     │ │
│  │                                     │  │  📺 Live Streams                   │ │
│  │  ┌────────────────────────────┐    │  │  • Twitch: 2.5K viewers           │ │
│  │  │  [Start Session]           │    │  │  • YouTube: 1.2K viewers          │ │
│  │  │  [View Full History]       │    │  │                                     │ │
│  │  └────────────────────────────┘    │  │  💬 Community Links                │ │
│  │                                     │  │  • Reddit: r/witcher (1.2M)       │ │
│  └─────────────────────────────────────┘  │  • Discord: 500K members          │ │
│                                           │  • Forums: Official                │ │
│                                           └─────────────────────────────────────┘ │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## 📱 MOBILE LAYOUT (375x700px)

```
┌─────────────────────────────┐
│                             │
│  📈 YOUR STATS              │
│  ═════════════              │
│                             │
│  ┌───────────────────────┐  │
│  │   Progress Chart      │  │
│  │   [Mini Graph]        │  │
│  └───────────────────────┘  │
│                             │
│  ⏱️ Playtime: 85h           │
│  📊 Progress: 65%           │
│  🏆 Achievements: 42/78     │
│  📅 Last: 2 days ago        │
│                             │
│  [View Full History]        │
│                             │
├─────────────────────────────┤
│                             │
│  👥 COMMUNITY               │
│  ═══════════               │
│                             │
│  ┌───────────────────────┐  │
│  │  Popularity Trend     │  │
│  │  [Mini Chart]         │  │
│  └───────────────────────┘  │
│                             │
│  👥 123K playing now        │
│     +12% this week          │
│                             │
│  📺 Live Streams            │
│  • Twitch: 2.5K             │
│  • YouTube: 1.2K            │
│                             │
│  💬 Community               │
│  • Reddit: 1.2M             │
│  • Discord: 500K            │
│                             │
└─────────────────────────────┘
```

## 🎨 CSS SPESİFİKASYONLARI

```css
.stats-community-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin: 32px 0;
}

.stats-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
}

/* CHART CONTAINER */
.chart-container {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  height: 200px;
  position: relative;
}

.chart-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* STATS GRID */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 12px;
  border-left: 3px solid var(--primary);
  transition: all 0.2s ease;
}

.stat-item:hover {
  transform: translateX(4px);
  background: rgba(102, 126, 234, 0.05);
}

.stat-icon-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-badge {
  display: inline-block;
  padding: 4px 10px;
  background: var(--success);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-top: 4px;
}

/* ACHIEVEMENT PROGRESS */
.achievement-progress {
  position: relative;
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
}

.achievement-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--warning), var(--success));
  border-radius: 4px;
  transition: width 1s ease;
}

/* COMMUNITY LINKS */
.community-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.community-link-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-primary);
  border-radius: 10px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.community-link-item:hover {
  border-color: var(--primary);
  background: rgba(102, 126, 234, 0.05);
  transform: translateX(4px);
}

.link-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.link-icon {
  font-size: 20px;
  color: var(--primary);
}

.link-name {
  font-weight: 600;
  color: var(--text-primary);
}

.link-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.external-icon {
  color: var(--text-muted);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.community-link-item:hover .external-icon {
  opacity: 1;
}

/* TREND INDICATOR */
.trend-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.trend-indicator.up {
  background: rgba(74, 222, 128, 0.1);
  color: var(--success);
}

.trend-indicator.down {
  background: rgba(248, 113, 113, 0.1);
  color: var(--danger);
}

/* ACTION BUTTONS */
.stats-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.stats-action-btn {
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.stats-action-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  transform: translateY(-2px);
}

.stats-action-btn.primary {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}
```

## 📊 CHART LIBRARY (Chart.js Example)

```javascript
// Progress Chart
const progressChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Playtime (hours)',
      data: [12, 19, 25, 35],
      borderColor: 'rgb(102, 126, 234)',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4,
      fill: true
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  }
});

// Popularity Trend Chart
const popularityChart = new Chart(ctx, {
  type: 'area',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Active Players',
      data: [100000, 120000, 115000, 130000, 123456],
      borderColor: 'rgb(251, 191, 36)',
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      fill: true
    }]
  }
});
```

## 🎭 ANIMASYONLAR

```css
.stats-card {
  animation: fadeIn 0.6s ease both;
}

.stat-item {
  animation: slideInLeft 0.5s ease both;
}

.stat-item:nth-child(1) { animation-delay: 0.1s; }
.stat-item:nth-child(2) { animation-delay: 0.2s; }
.stat-item:nth-child(3) { animation-delay: 0.3s; }
.stat-item:nth-child(4) { animation-delay: 0.4s; }

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Counter Animation */
.stat-value {
  animation: countUp 1.5s ease;
}

@keyframes countUp {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}
```

**Durum:** ✅ Tamamlandı
