// Web uygulamaları konfigürasyonu
// Yeni uygulamalar buraya kolayca eklenebilir

export const webApps = [
  {
    id: 'todo-app',
    baslik: '📝 Yapılacaklar Listesi',
    aciklama: 'Günlük görevlerinizi organize edin ve takip edin',
    icon: '📝',
    renk: 'var(--color-primary-600)',
    arkaplanRengi: 'var(--surface-1)',
    kategori: 'Verimlilik',
    ozellikler: ['Görev ekleme/silme', 'Öncelik belirleme', 'İlerleme takibi'],
    route: '/todo-app',
    aktif: true
  },
  {
    id: 'hesap-makinesi',
    baslik: '🧮 Hesap Makinesi',
    aciklama: 'Temel matematik işlemlerinizi kolayca yapın',
    icon: '🧮',
    renk: 'var(--color-success-600)',
    arkaplanRengi: 'var(--surface-2)',
    kategori: 'Araçlar',
    ozellikler: ['Temel işlemler', 'Geçmiş', 'Klavye desteği'],
    route: '/hesap-makinesi',
    aktif: true
  },
  {
    id: 'hava-durumu',
    baslik: 'Hava Durumu',
    aciklama: 'Güncel hava durumu bilgilerini görüntüleyin',
    ikon: '🌤️',
    renk: 'var(--color-primary-600)',
    kategori: 'bilgi',
    ozellikler: ['Güncel hava durumu', 'Haftalık tahmin', 'Şehir arama'],
    route: '/hava-durumu',
    aktif: true
  },
  {
    id: 'not-defteri',
    baslik: 'Not Defteri',
    aciklama: 'Notlarınızı yazın ve organize edin',
    ikon: '📝',
    renk: 'var(--color-secondary-500)',
    kategori: 'uretkenlik',
    ozellikler: ['Not yazma', 'Kategorileme', 'Arama'],
    route: '/not-defteri',
    aktif: true
  },
  {
    id: 'pomodoro-timer',
    baslik: '⏰ Pomodoro Timer',
    aciklama: 'Pomodoro tekniği ile verimli çalışın',
    icon: '⏰',
    renk: 'var(--color-warning-600)',
    arkaplanRengi: 'var(--surface-3)',
    kategori: 'Verimlilik',
    ozellikler: ['25 dakika odaklanma', 'Kısa/uzun molalar', 'İstatistikler'],
    route: '/pomodoro-timer',
    aktif: true
  },
  {
    id: 'oyun-takibi',
    baslik: '🎮 Oyun Takibi',
    aciklama: 'Oyun koleksiyonunuzu yönetin ve ilerlemenizi takip edin',
    icon: '🎮',
    renk: 'var(--color-secondary-600)',
    arkaplanRengi: 'var(--surface-4)',
    kategori: 'Eğlence',
    ozellikler: ['İstatistikler', 'Route Planner', 'Oyun Kütüphanesi'],
    route: '/game-tracking-hub',
    aktif: true
  },
  {
    id: 'qr-kod-olusturucu',
    baslik: '📱 QR Kod Oluşturucu',
    aciklama: 'Metinleriniz için QR kod oluşturun',
    icon: '📱',
    renk: 'var(--color-info-600)',
    arkaplanRengi: 'var(--surface-5)',
    kategori: 'Araçlar',
    ozellikler: ['Metin/URL QR kodu', 'İndirme', 'Özelleştirme'],
    route: '/qr-kod-olusturucu',
    aktif: false // Henüz geliştirilmedi
  }
];

// Kategorilere göre gruplandırma
export const kategoriler = [
  'Tümü',
  'Verimlilik',
  'Araçlar',
  'Bilgi',
  'Eğlence'
];

// Aktif uygulamaları getir
export const getAktifUygulamalar = () => {
  return webApps.filter(app => app.aktif);
};

// Kategoriye göre uygulamaları getir
export const getUygulamalarKategoriyeGore = (kategori) => {
  if (kategori === 'Tümü') {
    return getAktifUygulamalar();
  }
  return webApps.filter(app => app.aktif && app.kategori === kategori);
};

// ID'ye göre uygulama getir
export const getUygulamaById = (id) => {
  return webApps.find(app => app.id === id);
};