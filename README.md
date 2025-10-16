# 🎮 Vault Tracker - MyCompanion v3

> **Modern React tabanlı oyun takip ve yönetim uygulaması**

Vault Tracker, oyun koleksiyonunuzu profesyonel düzeyde takip etmenizi sağlayan kapsamlı bir web uygulamasıdır. Excel dosyalarından oyun listelerini import edebilir, oyun sürelerinizi takip edebilir, detaylı istatistikler görüntüleyebilir ve verilerinizi yedekleyebilirsiniz.

## ✨ **Özellikler**

### 🎮 **Temel Oyun Yönetimi**
- **📁 Excel Import** - `.xlsx` ve `.xls` dosyalarından oyun listesi yükleme
- **🎯 Oyun Kartları** - Modern tasarım ile oyun bilgilerini görüntüleme
- **✏️ Oyun Düzenleme** - Oyun bilgilerini güncelleme ve düzenleme
- **🗑️ Oyun Silme** - İstenmeyen oyunları kaldırma
- **➕ Manuel Oyun Ekleme** - Yeni oyunları elle ekleme

### 🔄 **117 Oyun Route Sistemi**
- **📋 39 Cycle Yönetimi** - 117 oyunluk route'u 39 cycle'a bölen akıllı sistem
- **🎮 Cycle Düzenleme** - Her cycle'daki oyunları değiştirme ve kaldırma
- **🔍 Akıllı Oyun Seçimi** - Tür bazlı filtreleme ile uygun oyun önerisi
- **📊 Route İlerlemesi** - Cycle ve genel route ilerlemesini takip
- **💾 Otomatik Kayıt** - Tüm değişiklikler otomatik olarak localStorage'a kaydedilir
- **🎯 Oyun Türü Eşleştirme** - RPG, Story/Indie, Strategy/Sim türlerine göre akıllı filtreleme

### 🏷️ **Gelişmiş Kategorilendirme**
- **🎭 Fraksiyonlar** - Oyun karakterlerini ve fraksiyonlarını tag'ler halinde gösterme
- **📊 İlerleme Takibi** - Oyun tamamlama yüzdelerini görüntüleme ve güncelleme
- **🏆 Durum Yönetimi** - Backlog, Playing, Completed, Dropped durumları
- **⭐ Öncelik Sistemi** - Low, Medium, High öncelik seviyeleri

### 🔍 **Filtreleme ve Arama**
- **🔎 Akıllı Arama** - Oyun adı, tür, platform bazlı arama
- **🎮 Platform Filtresi** - PC, PlayStation, Xbox, Nintendo, Mobile
- **📈 Durum Filtresi** - Oyun durumuna göre filtreleme
- **⭐ Öncelik Filtresi** - Öncelik seviyesine göre filtreleme
- **🎯 Tür Filtresi** - RPG, Strategy, FPS vb. türlere göre filtreleme

### ⏱️ **Zaman Takip Sistemi**
- **▶️ Oyun Oturumları** - Her oyun için play/stop butonları
- **⏰ Canlı Zamanlayıcı** - Aktif oyun süresini gerçek zamanlı takip
- **🌐 Global Timer** - Header'da aktif oyun ve süre gösterimi
- **📊 Toplam Süre** - Her oyun için toplam oynama süresi
- **📅 Son Oynama** - En son ne zaman oynandığı bilgisi
- **🎯 Oturum Sayısı** - Toplam kaç oturum oynandığı

### 📈 **İstatistikler ve Raporlar**
- **📊 Genel Bakış** - Toplam oyun, süre, oturum istatistikleri
- **📈 Durum Dağılımı** - Oyunların durumlarına göre dağılımı
- **⭐ Öncelik Analizi** - Öncelik seviyelerine göre analiz
- **🏆 En Çok Oynananlar** - Top 5 en çok oynanan oyunlar
- **📅 Günlük Aktivite** - Son 7 günün oyun aktivitesi
- **🎮 Platform İstatistikleri** - Platform bazlı oyun dağılımı
- **📊 Zaman Filtresi** - Son 7 gün, 30 gün, tüm zamanlar

### 💾 **Veri Yönetimi**
- **📤 Veri Export** - JSON formatında tüm verileri yedekleme
- **📥 Veri Import** - Yedek dosyalarını geri yükleme
- **🔒 LocalStorage** - Veriler tarayıcıda güvenle saklanır
- **📋 Metadata** - Export tarihi, versiyon, oyun sayısı bilgileri

### 🎨 **Modern UI/UX**
- **🌙 Dark Theme** - Göz yormayan koyu tema
- **✨ Glass Morphism** - Modern cam efektleri
- **🎭 Hover Animasyonları** - Etkileşimli geçişler
- **📱 Responsive Design** - Mobil ve masaüstü uyumlu
- **🎨 Gradient Backgrounds** - Renkli geçişli arka planlar
- **🔄 Smooth Transitions** - Akıcı geçiş animasyonları

## 🚀 **Kurulum**

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Adımlar
```bash
# Projeyi klonlayın
git clone https://github.com/[username]/vault-tracker.git
cd vault-tracker

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
| **Type/Genre** | Oyun türü | "RPG", "Strategy", "FPS" |
| **Platform** | Platform | "PC", "PS5", "Xbox" |
| **Status** | Durum | "Completed", "Playing", "Backlog" |
| **Priority** | Öncelik | "High", "Medium", "Low" |
| **Progress** | İlerleme (%) | 75, 100, 0 |
| **Factions** | Fraksiyonlar | "Geralt, Triss, Yennefer" |

### Örnek Excel Dosyası
```
Title          | Type    | Platform | Status    | Priority | Progress | Factions
The Witcher 3  | RPG     | PC       | Completed | High     | 100      | Geralt, Triss
Cyberpunk 2077 | RPG     | PC       | Playing   | Medium   | 45       | V, Johnny
Elden Ring     | RPG     | PS5      | Backlog   | High     | 0        | Tarnished
```

## 🎯 **Kullanım Kılavuzu**

### 1. 🏠 Ana Sayfa
- Uygulamayı başlattığınızda ana sayfa açılır
- **"🎮 Game Tracker"** butonuna tıklayarak oyun takip modülüne geçin
- **"📊 Statistics"** butonuna tıklayarak istatistikler sayfasına geçin

### 2. 📁 Excel Import
- **"📁 Excel Dosyası Seç"** butonuna tıklayın
- `.xlsx` veya `.xls` dosyanızı seçin
- Oyunlar otomatik olarak kartlar halinde yüklenir
- **"🔄 Yeni Excel Yükle"** ile farklı dosya seçebilirsiniz

### 3. 🎮 Oyun Yönetimi
- **Oyun Kartları:** Her oyun için ayrı kart gösterilir
- **Düzenleme:** ✏️ butonuna tıklayarak oyun bilgilerini güncelleyin
- **Silme:** 🗑️ butonuna tıklayarak oyunu kaldırın
- **Manuel Ekleme:** ➕ butonuna tıklayarak yeni oyun ekleyin

### 4. ⏱️ Zaman Takibi
- **Play Butonu:** ▶️ butonuna tıklayarak oyun oturumu başlatın
- **Stop Butonu:** ⏸️ butonuna tıklayarak oturumu sonlandırın
- **Global Timer:** Header'da aktif oyun ve süreyi görün
- **Otomatik Kayıt:** Oturumlar otomatik olarak kaydedilir

### 5. 🔍 Filtreleme ve Arama
- **Arama Çubuğu:** Oyun adı, tür veya platform ile arama yapın
- **Platform Filtresi:** Belirli platformlardaki oyunları görün
- **Durum Filtresi:** Backlog, Playing, Completed oyunları filtreleyin
- **Öncelik Filtresi:** High, Medium, Low öncelikli oyunları seçin

### 6. 📊 İstatistikler
- **Genel Bakış:** Toplam oyun, süre, oturum sayıları
- **Dağılım Grafikleri:** Durum ve öncelik dağılımları
- **Top Oyunlar:** En çok oynanan 5 oyun
- **Günlük Aktivite:** Son 7 günün bar grafiği
- **Zaman Filtresi:** Son 7 gün, 30 gün, tüm zamanlar

### 7. 🔄 Cycle Düzenleme Sistemi
- **Cycle Görünümü:** "Cycles" sekmesine tıklayarak 39 cycle'ı görüntüleyin
- **Oyun Değiştirme:** 🔄 "Değiştir" butonuna tıklayarak cycle'daki oyunu değiştirin
- **Oyun Kaldırma:** 🗑️ "Kaldır" butonuna tıklayarak oyunu cycle'dan çıkarın
- **Akıllı Seçim:** Modal'da oyun türüne uygun oyunlar otomatik filtrelenir
- **Arama Özelliği:** Modal'da oyun adı veya türüne göre arama yapın
- **Otomatik Kayıt:** Tüm değişiklikler anında RouteContext'e kaydedilir

### 8. 💾 Veri Yönetimi
- **Yedekleme:** 💾 "Yedekle" butonuna tıklayarak JSON dosyası indirin
- **Geri Yükleme:** 📥 "Geri Yükle" butonuna tıklayarak yedek dosyası seçin
- **Onay:** İçe aktarılacak veriler hakkında bilgi alın ve onaylayın

## 🏗️ **Proje Yapısı**

```
src/
├── components/              # Yeniden kullanılabilir componentler
│   ├── ExcelReader/        # Excel dosyası okuma componenti
│   └── Sidebar/            # Yan menü componenti
├── pages/
│   ├── AnaSayfa/          # Ana sayfa
│   ├── GameTracker/       # Oyun takip modülü (ana modül)
│   ├── GameDetail/        # Oyun detay sayfası
│   ├── Statistics/        # İstatistikler ve raporlar
│   ├── HavaDurumu/        # Hava durumu modülü
│   ├── HesapMakinesi/     # Hesap makinesi
│   ├── NotDefteri/        # Not defteri
│   └── TodoApp/           # Todo uygulaması
├── utils/
│   ├── excelUtils.js      # Excel işlemleri
│   └── appUtils.js        # Genel yardımcı fonksiyonlar
├── config/                # Konfigürasyon dosyaları
├── hooks/                 # Custom React hooks
└── contexts/              # React Context API
```

## 🔧 **Teknolojiler**

- **React 18** - Modern React hooks ve features
- **Vite** - Hızlı build tool ve dev server
- **React Router v6** - Client-side routing
- **XLSX.js** - Excel dosyası parsing
- **Modern CSS** - Grid, Flexbox, CSS Variables
- **Glass Morphism** - Modern UI effects
- **LocalStorage API** - Tarayıcı tabanlı veri saklama
- **CSS Animations** - Smooth transitions ve hover effects

## 📱 **Responsive Design**

Uygulama tüm cihazlarda mükemmel çalışır:

- **🖥️ Desktop:** 1024px+ (Ana hedef)
- **💻 Laptop:** 768px - 1024px
- **📱 Tablet:** 480px - 768px
- **📱 Mobile:** 320px - 480px

## 🎮 **Desteklenen Platformlar**

- **🖥️ PC** - Steam, Epic Games, GOG
- **🎮 PlayStation** - PS4, PS5
- **🎮 Xbox** - Xbox One, Xbox Series X/S
- **🎮 Nintendo** - Switch, 3DS
- **📱 Mobile** - iOS, Android
- **🌐 Web** - Browser games

## 📈 **Özellik Durumu**

### ✅ Tamamlanan Özellikler
- [x] **Temel oyun yönetimi** - CRUD işlemleri
- [x] **Excel import/export** - Dosya işlemleri
- [x] **Gelişmiş kategorilendirme** - Faction, progress, priority
- [x] **Filtreleme ve arama** - Çoklu filtre sistemi
- [x] **Zaman takip sistemi** - Oyun süresi takibi
- [x] **İstatistikler ve raporlar** - Detaylı analiz
- [x] **Veri export/import** - JSON yedekleme sistemi
- [x] **117 Oyun Route Sistemi** - 39 cycle'lık akıllı route yönetimi
- [x] **Cycle Düzenleme** - Oyun değiştirme, kaldırma ve ekleme
- [x] **Akıllı Oyun Seçimi** - Tür bazlı filtreleme ve arama
- [x] **RouteContext Entegrasyonu** - Merkezi state yönetimi

### 🔄 Gelecek Güncellemeler
- [ ] **Cloud Sync** - Google Drive/OneDrive entegrasyonu
- [ ] **Multiplayer Tracking** - Çok oyunculu oyun takibi
- [ ] **Achievement System** - Başarım sistemi
- [ ] **Social Features** - Arkadaş listesi ve paylaşım
- [ ] **Mobile App** - React Native uygulaması

## 🤝 **Katkıda Bulunma**

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m '✨ Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Commit Mesaj Formatı
```
🎨 :art: - UI/UX iyileştirmeleri
✨ :sparkles: - Yeni özellik
🐛 :bug: - Bug fix
📚 :books: - Dokümantasyon
🚀 :rocket: - Performance iyileştirmesi
🔧 :wrench: - Konfigürasyon değişiklikleri
```

## 📝 **Lisans**

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 📞 **İletişim ve Destek**

- **🐛 Bug Report:** GitHub Issues
- **💡 Feature Request:** GitHub Discussions
- **📧 Email:** [your-email@example.com]
- **💬 Discord:** [Discord Server Link]

## 🙏 **Teşekkürler**

Bu projeyi mümkün kılan açık kaynak kütüphanelere ve React topluluğuna teşekkürler.

---

**🎮 Happy Gaming! 🎮**

> *"Oyunlarınızı takip edin, zamanınızı yönetin, eğlencenizi artırın!"*
