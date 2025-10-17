# 🎨 CSS ARKA PLAN VE METİN RENGİ KURALLARI - AI İÇİN

## ⚠️ ASLA YAPMAMASI GEREKENLER

### 1. Tanımsız CSS Değişkenleri Kullanma
```css
/* ❌ YANLIŞ - Değişken tanımlı değilse kullanma! */
background: var(--dark-background);
background: var(--undefined-color);

/* ✅ DOĞRU - Önce design-system.css'de tanımla */
background: var(--bg-gradient-1);
```

### 2. Arka Plan Renklerini Kontrol Etmeden Ekleme
```css
/* ❌ YANLIŞ - Üst katmanlardaki arka planları kontrol etmeden */
.my-component {
  background: white;
}

/* ✅ DOĞRU - Tüm parent'ları kontrol et */
body { background: #050508; }
#root { background: transparent; }
.my-component { background: rgba(20, 25, 40, 0.3); }
```

### 3. Metin Renklerini Arka Plana Göre Ayarlamamak
```css
/* ❌ YANLIŞ - Koyu arka planda koyu metin */
body { background: #000; }
p { color: #333; }

/* ✅ DOĞRU - Kontrast sağla */
body { background: #000; }
p { color: #fff; }
```

## ✅ MUTLAKA YAPMASI GEREKENLER

### 1. CSS Değişkenlerini Design System'de Katalogla
```css
/* design-system.css */
:root {
  /* Arka Plan Renkleri */
  --bg-gradient-1: #050508;
  --bg-gradient-2: #0f0f1a;
  
  /* Metin Renkleri - Sayfa Tipine Göre */
  --text-on-dark: #ffffff;
  --text-on-light: #1a1d29;
  --text-on-gradient: #ffffff;
}
```

### 2. Arka Plan Katmanlarını Kontrol Et
```css
/* Üstten alta doğru kontrol */
html { background: X; }
body { background: Y; }
#root { background: Z; }
.page-wrapper { background: W; }
```

### 3. `:has()` Selector ile Koşullu Stiller
```css
/* Belirli bir component varsa body'yi değiştir */
body:has(.game-tracker-page) {
  background: linear-gradient(...);
}

/* İç elementler transparent */
.game-tracker-page .inner-content {
  background: transparent;
}
```

### 4. Metin Renklerini Design System'den Kullan
```css
/* ✅ DOĞRU */
.my-dark-page {
  background: #000;
  color: var(--text-on-dark);
}

.my-light-page {
  background: #fff;
  color: var(--text-on-light);
}
```

### 5. !important Kullanırken Dikkatli Ol
```css
/* Sadece gerçekten gerekiyorsa */
body:has(.special-page) {
  background: #000 !important; /* Override için zorunlu */
}

/* Normal durumlarda kullanma */
.regular-component {
  background: #fff; /* !important yok */
}
```

## 🔍 DEBUG ADIMLARI

Arka plan rengi beklediğin gibi değilse:

1. **Browser DevTools'u Aç** (F12)
2. **Elements/Inspector** tab'ına git
3. **Problematic element'i seç**
4. **Computed/Hesaplanmış** tab'ına bak
5. **`background` veya `background-color`** özelliğine tıkla
6. **Hangi CSS dosyası ve satırdan geldiğini gör**
7. **O CSS kuralını override et**

## 📋 CHECKLIST - Yeni Sayfa Eklerken

- [ ] Arka plan rengi design-system.css'de tanımlı mı?
- [ ] Metin rengi arka planla kontrast sağlıyor mu?
- [ ] Parent elementlerin arka planı kontrol edildi mi?
- [ ] `:has()` selector ile koşullu stiller eklendi mi?
- [ ] Tüm heading'ler okunabilir mi?
- [ ] Button'lar ve linkler görünüyor mu?
- [ ] Input ve form elementleri okunabilir mi?
- [ ] Modal ve overlay'ler doğru renkte mi?

## 🎯 ÖZETİ

**TEMEL KURAL:** 
```
Koyu arka plan → Açık metin (beyaz/açık gri)
Açık arka plan → Koyu metin (siyah/koyu gri)
```

**CSS DEĞİŞKENLERİ:**
- Her renk design-system.css'de kataloglanmalı
- Sayfa tipine göre (`--text-on-dark`, `--text-on-light`) kullanılmalı

**KATMAN HİYERARŞİSİ:**
```
html → body → #root → .app → .page-wrapper → .content
```

Her katmanı kontrol et, gerekirse transparent yap!
