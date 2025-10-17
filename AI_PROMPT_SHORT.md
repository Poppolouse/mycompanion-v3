# 🤖 AI PROMPT - CSS Arka Plan & Metin Renkleri

Yeni bir sayfa veya component eklerken şu kurallara uy:

## ✅ ZORUNLU KONTROLLER

1. **Arka plan rengi** → `design-system.css`'de tanımlı değişken kullan
2. **Metin rengi** → Arka planla kontrast sağla (`--text-on-dark` veya `--text-on-light`)
3. **Parent katmanları** → html, body, #root, .app arka planlarını kontrol et
4. **`:has()` selector** → Koşullu stiller için kullan
5. **Okunabilirlik** → Tüm heading, button, input, link'ler okunabilir olmalı

## 🚫 ASLA YAPMA

- ❌ Tanımsız CSS değişkeni kullanma: `var(--undefined-color)`
- ❌ Koyu arka planda koyu metin
- ❌ Üst katman arka planlarını kontrol etmeden değiştirme
- ❌ !important'ı gereksiz yere kullanma

## 📋 HIZLI TEMPLATE

```css
/* Design System'e ekle */
:root {
  --my-new-bg: #050508;
  --text-on-my-bg: #ffffff;
}

/* Sayfaya uygula */
body:has(.my-new-page) {
  background: var(--my-new-bg) !important;
}

.my-new-page {
  color: var(--text-on-my-bg);
}

.my-new-page h1, h2, h3 {
  color: var(--heading-on-dark);
}
```

## 🔍 DEBUG

Sorun varsa F12 → Elements → Computed → `background` özelliğine bak!

---

**TL;DR:** Koyu arka plan = Beyaz metin, Açık arka plan = Koyu metin. Her renk design-system.css'de tanımlı olmalı!
