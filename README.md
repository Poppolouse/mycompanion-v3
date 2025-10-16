# 🎮 MyCompanion v3

> **Modern React tabanlı oyun takip ve yardımcı uygulaması**

MyCompanion v3, oyun koleksiyonunuzu takip etmenizi sağlayan modern bir web uygulamasıdır. Excel dosyalarından oyun listelerini import edebilir, ilerlemelerinizi takip edebilir ve oyunlarınızı organize edebilirsiniz.

## ✨ **Özellikler**

### 🎮 **GameTracker Modülü**
- **📁 Excel Import** - `.xlsx` ve `.xls` dosyalarından oyun listesi yükleme
- **🎯 Oyun Kartları** - Modern tasarım ile oyun bilgilerini görüntüleme
- **🏷️ Fraksiyonlar** - Oyun fraksiyonlarını tag'ler halinde gösterme
- **📊 İlerleme Takibi** - Oyun tamamlama yüzdelerini görüntüleme
- **🔄 Dinamik Yükleme** - Yeni Excel dosyaları ile listeyi güncelleme

### 🎨 **Modern UI/UX**
- **🌙 Dark Theme** - Göz yormayan koyu tema
- **✨ Glass Morphism** - Modern cam efektleri
- **🎭 Hover Animasyonları** - Etkileşimli geçişler
- **📱 Desktop-First** - Masaüstü odaklı tasarım
- **🎨 Gradient Backgrounds** - Renkli geçişli arka planlar

## 🚀 **Kurulum**

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Adımlar
```bash
# Projeyi klonlayın
git clone https://github.com/[username]/mycompanion-v3.git
cd mycompanion-v3

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

## 📊 **Excel Dosyası Formatı**

GameTracker modülü aşağıdaki sütunları destekler:

| Sütun | Açıklama | Örnek |
|-------|----------|-------|
| **Title/Name** | Oyun adı | "The Witcher 3" |
| **Type** | Oyun türü | "RPG", "Strategy", "FPS" |
| **Platform** | Platform | "PC", "PS5", "Xbox" |
| **Status** | Durum | "Completed", "Playing", "Backlog" |
| **Progress** | İlerleme (%) | 75, 100, 0 |
| **Factions** | Fraksiyonlar | "Geralt, Triss, Yennefer" |

### Örnek Excel Dosyası
```
Title          | Type    | Platform | Status    | Progress | Factions
The Witcher 3  | RPG     | PC       | Completed | 100      | Geralt, Triss
Cyberpunk 2077 | RPG     | PC       | Playing   | 45       | V, Johnny
```

## 🎯 **Kullanım**

### 1. Ana Sayfa
- Uygulamayı başlattığınızda ana sayfa açılır
- **"🎮 Game Tracker"** butonuna tıklayarak oyun takip modülüne geçin

### 2. Excel Import
- **"📁 Excel Dosyası Seç"** butonuna tıklayın
- `.xlsx` veya `.xls` dosyanızı seçin
- Oyunlar otomatik olarak kartlar halinde yüklenir

### 3. Oyun Kartları
- Her oyun için ayrı kart gösterilir
- Oyun adı, türü, platform, durum ve ilerleme bilgileri
- Fraksiyonlar tag'ler halinde gösterilir

### 4. Yeni Dosya Yükleme
- **"🔄 Yeni Excel Yükle"** butonu ile farklı dosya seçebilirsiniz
- Mevcut liste yeni dosya ile değiştirilir

## 🏗️ **Proje Yapısı**

```
src/
├── components/          # Yeniden kullanılabilir componentler
├── pages/
│   ├── AnaSayfa/       # Ana sayfa
│   ├── GameTracker/    # Oyun takip modülü
│   ├── HavaDurumu/     # Hava durumu modülü
│   ├── HesapMakinesi/  # Hesap makinesi
│   ├── NotDefteri/     # Not defteri
│   └── TodoApp/        # Todo uygulaması
├── utils/
│   ├── excelUtils.js   # Excel işlemleri
│   └── appUtils.js     # Genel yardımcı fonksiyonlar
├── config/             # Konfigürasyon dosyaları
└── hooks/              # Custom React hooks
```

## 🔧 **Teknolojiler**

- **React 18** - Modern React hooks ve features
- **Vite** - Hızlı build tool
- **React Router v6** - Client-side routing
- **XLSX.js** - Excel dosyası parsing
- **Modern CSS** - Grid, Flexbox, CSS Variables
- **Glass Morphism** - Modern UI effects

## 📈 **Gelecek Planlar**

### Phase 3: Oyun Detay Sayfası
- [ ] Oyun kartına tıklayınca detay sayfası
- [ ] İlerleme güncelleme formu
- [ ] Notlar ekleme özelliği
- [ ] Screenshot galeri

### Phase 4: Filtreleme ve Arama
- [ ] Platform bazlı filtreleme
- [ ] Durum bazlı filtreleme
- [ ] Arama fonksiyonu
- [ ] Sıralama seçenekleri

### Phase 5: İstatistikler
- [ ] Toplam oyun sayısı
- [ ] Tamamlanan oyunlar grafiği
- [ ] Platform dağılımı
- [ ] İlerleme istatistikleri

### Phase 6: Veri Yönetimi
- [ ] LocalStorage entegrasyonu
- [ ] Export fonksiyonu
- [ ] Backup/restore
- [ ] Cloud sync özelliği

## 🤝 **Katkıda Bulunma**

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 **Lisans**

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 **İletişim**

Sorularınız için issue açabilir veya pull request gönderebilirsiniz.

---

**🎮 Happy Gaming! 🎮**
