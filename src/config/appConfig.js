/**
 * Uygulama konfigürasyon yönetim sistemi
 */

// Varsayılan uygulama ayarları
export const varsayilanAyarlar = {
  tema: 'light',
  dil: 'tr',
  animasyonlar: true,
  sesler: false,
  bildirimler: true,
  otomatikKaydet: true,
  kaydetmeAraligi: 30000, // 30 saniye
  maksimumGecmisKaydi: 100,
  performansIzleme: true,
  gelismisOzellikler: false
};

// Uygulama kategorileri ve özellikleri
export const uygulamaKategorileri = {
  verimlilik: {
    baslik: 'Verimlilik',
    ikon: '⚡',
    renk: '#667eea',
    aciklama: 'Günlük işlerinizi organize etmenize yardımcı uygulamalar'
  },
  hesaplama: {
    baslik: 'Hesaplama',
    ikon: '🧮',
    renk: '#f093fb',
    aciklama: 'Matematiksel hesaplamalar ve analiz araçları'
  },
  bilgi: {
    baslik: 'Bilgi',
    ikon: '📚',
    renk: '#4facfe',
    aciklama: 'Bilgi edinme ve araştırma uygulamaları'
  },
  genel: {
    baslik: 'Genel',
    ikon: '🔧',
    renk: '#43e97b',
    aciklama: 'Genel amaçlı kullanışlı araçlar'
  },
  eglence: {
    baslik: 'Eğlence',
    ikon: '🎮',
    renk: '#fa709a',
    aciklama: 'Eğlenceli ve interaktif uygulamalar'
  },
  sosyal: {
    baslik: 'Sosyal',
    ikon: '👥',
    renk: '#fee140',
    aciklama: 'Sosyal ve iletişim araçları'
  }
};

// Uygulama durumları
export const uygulamaDurumlari = {
  AKTIF: 'aktif',
  PASIF: 'pasif',
  GELIŞTIRME: 'gelistirme',
  BAKIM: 'bakim',
  KULLANIM_DISI: 'kullanim_disi'
};

// Uygulama öncelik seviyeleri
export const oncelikSeviyeleri = {
  YUKSEK: 'yuksek',
  ORTA: 'orta',
  DUSUK: 'dusuk'
};

// Uygulama yetkileri
export const uygulamaYetkileri = {
  OKUMA: 'okuma',
  YAZMA: 'yazma',
  SILME: 'silme',
  YONETIM: 'yonetim',
  ADMIN: 'admin'
};

// Performans metrikleri
export const performansMetrikleri = {
  YUKLEME_SURESI: 'yukleme_suresi',
  BELLEK_KULLANIMI: 'bellek_kullanimi',
  CPU_KULLANIMI: 'cpu_kullanimi',
  NETWORK_ISTEKLERI: 'network_istekleri',
  HATA_ORANI: 'hata_orani',
  KULLANICI_MEMNUNIYETI: 'kullanici_memnuniyeti'
};

// Uygulama olayları
export const uygulamaOlaylari = {
  ACILDI: 'acildi',
  KAPATILDI: 'kapatildi',
  HATA: 'hata',
  GUNCELLENDI: 'guncellendi',
  AYAR_DEGISTI: 'ayar_degisti',
  VERI_KAYDEDILDI: 'veri_kaydedildi',
  VERI_YUKLENDI: 'veri_yuklendi'
};

// Bildirim tipleri
export const bildirimTipleri = {
  BILGI: 'bilgi',
  UYARI: 'uyari',
  HATA: 'hata',
  BASARI: 'basari'
};

// Tema ayarları
export const temaAyarlari = {
  light: {
    baslik: 'Açık Tema',
    renkler: {
      primary: '#667eea',
      secondary: '#764ba2',
      success: '#43e97b',
      warning: '#fee140',
      error: '#fa709a',
      info: '#4facfe',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#2d3748',
      textSecondary: '#718096'
    }
  },
  dark: {
    baslik: 'Koyu Tema',
    renkler: {
      primary: '#667eea',
      secondary: '#764ba2',
      success: '#43e97b',
      warning: '#fee140',
      error: '#fa709a',
      info: '#4facfe',
      background: '#1a202c',
      surface: '#2d3748',
      text: '#f7fafc',
      textSecondary: '#a0aec0'
    }
  },
  auto: {
    baslik: 'Otomatik',
    aciklama: 'Sistem temasını takip eder'
  }
};

// Dil ayarları
export const dilAyarlari = {
  tr: {
    baslik: 'Türkçe',
    kod: 'tr-TR',
    ikon: '🇹🇷'
  },
  en: {
    baslik: 'English',
    kod: 'en-US',
    ikon: '🇺🇸'
  }
};

// Uygulama konfigürasyon şeması
export const uygulamaSeması = {
  id: {
    tip: 'string',
    zorunlu: true,
    benzersiz: true,
    aciklama: 'Uygulamanın benzersiz kimliği'
  },
  baslik: {
    tip: 'string',
    zorunlu: true,
    minUzunluk: 1,
    maksUzunluk: 50,
    aciklama: 'Uygulamanın görünen başlığı'
  },
  aciklama: {
    tip: 'string',
    zorunlu: true,
    minUzunluk: 10,
    maksUzunluk: 200,
    aciklama: 'Uygulamanın kısa açıklaması'
  },
  ikon: {
    tip: 'string',
    zorunlu: true,
    aciklama: 'Uygulamanın ikonu (emoji veya URL)'
  },
  renk: {
    tip: 'string',
    zorunlu: true,
    pattern: '^#[0-9A-Fa-f]{6}$',
    aciklama: 'Uygulamanın ana rengi (hex format)'
  },
  kategori: {
    tip: 'string',
    zorunlu: true,
    enum: Object.keys(uygulamaKategorileri),
    aciklama: 'Uygulamanın kategorisi'
  },
  durum: {
    tip: 'string',
    varsayilan: uygulamaDurumlari.AKTIF,
    enum: Object.values(uygulamaDurumlari),
    aciklama: 'Uygulamanın mevcut durumu'
  },
  oncelik: {
    tip: 'string',
    varsayilan: oncelikSeviyeleri.ORTA,
    enum: Object.values(oncelikSeviyeleri),
    aciklama: 'Uygulamanın öncelik seviyesi'
  },
  yol: {
    tip: 'string',
    zorunlu: true,
    aciklama: 'Uygulamanın route yolu'
  },
  component: {
    tip: 'string',
    zorunlu: true,
    aciklama: 'Uygulamanın React component adı'
  },
  ozellikler: {
    tip: 'array',
    varsayilan: [],
    aciklama: 'Uygulamanın özellik listesi'
  },
  etiketler: {
    tip: 'array',
    varsayilan: [],
    aciklama: 'Uygulamanın etiket listesi'
  },
  minSurum: {
    tip: 'string',
    varsayilan: '1.0.0',
    aciklama: 'Minimum desteklenen sürüm'
  },
  maksimumSurum: {
    tip: 'string',
    aciklama: 'Maksimum desteklenen sürüm'
  },
  bagimliliklar: {
    tip: 'array',
    varsayilan: [],
    aciklama: 'Uygulamanın bağımlılık listesi'
  },
  ayarlar: {
    tip: 'object',
    varsayilan: {},
    aciklama: 'Uygulamaya özel ayarlar'
  },
  metadata: {
    tip: 'object',
    varsayilan: {},
    aciklama: 'Ek meta veriler'
  }
};

// Konfigürasyon doğrulama fonksiyonu
export const konfigurasyonDogrula = (uygulama) => {
  const hatalar = [];
  
  Object.keys(uygulamaSeması).forEach(alan => {
    const sema = uygulamaSeması[alan];
    const deger = uygulama[alan];
    
    // Zorunlu alan kontrolü
    if (sema.zorunlu && (deger === undefined || deger === null || deger === '')) {
      hatalar.push(`${alan} alanı zorunludur`);
      return;
    }
    
    // Tip kontrolü
    if (deger !== undefined && typeof deger !== sema.tip) {
      hatalar.push(`${alan} alanı ${sema.tip} tipinde olmalıdır`);
      return;
    }
    
    // String uzunluk kontrolü
    if (sema.tip === 'string' && deger) {
      if (sema.minUzunluk && deger.length < sema.minUzunluk) {
        hatalar.push(`${alan} en az ${sema.minUzunluk} karakter olmalıdır`);
      }
      if (sema.maksUzunluk && deger.length > sema.maksUzunluk) {
        hatalar.push(`${alan} en fazla ${sema.maksUzunluk} karakter olmalıdır`);
      }
      if (sema.pattern && !new RegExp(sema.pattern).test(deger)) {
        hatalar.push(`${alan} geçerli formatta değil`);
      }
    }
    
    // Enum kontrolü
    if (sema.enum && deger && !sema.enum.includes(deger)) {
      hatalar.push(`${alan} geçerli değerlerden biri olmalıdır: ${sema.enum.join(', ')}`);
    }
  });
  
  return {
    gecerli: hatalar.length === 0,
    hatalar
  };
};

// Varsayılan değerleri uygula
export const varsayilanDegerleriUygula = (uygulama) => {
  const yeniUygulama = { ...uygulama };
  
  Object.keys(uygulamaSeması).forEach(alan => {
    const sema = uygulamaSeması[alan];
    if (sema.varsayilan !== undefined && yeniUygulama[alan] === undefined) {
      yeniUygulama[alan] = sema.varsayilan;
    }
  });
  
  return yeniUygulama;
};

// Konfigürasyon yöneticisi
export class KonfigurasyonYoneticisi {
  constructor() {
    this.uygulamalar = new Map();
    this.dinleyiciler = new Map();
  }
  
  // Uygulama ekle
  uygulamaEkle(uygulama) {
    const uygulamaVarsayilanlarla = varsayilanDegerleriUygula(uygulama);
    const dogrulama = konfigurasyonDogrula(uygulamaVarsayilanlarla);
    
    if (!dogrulama.gecerli) {
      throw new Error(`Uygulama konfigürasyonu geçersiz: ${dogrulama.hatalar.join(', ')}`);
    }
    
    this.uygulamalar.set(uygulama.id, uygulamaVarsayilanlarla);
    this.olayTetikle('uygulamaEklendi', uygulamaVarsayilanlarla);
    
    return uygulamaVarsayilanlarla;
  }
  
  // Uygulama güncelle
  uygulamaGuncelle(id, guncellemeler) {
    const mevcutUygulama = this.uygulamalar.get(id);
    if (!mevcutUygulama) {
      throw new Error(`Uygulama bulunamadı: ${id}`);
    }
    
    const guncellenmisUygulama = { ...mevcutUygulama, ...guncellemeler };
    const dogrulama = konfigurasyonDogrula(guncellenmisUygulama);
    
    if (!dogrulama.gecerli) {
      throw new Error(`Uygulama konfigürasyonu geçersiz: ${dogrulama.hatalar.join(', ')}`);
    }
    
    this.uygulamalar.set(id, guncellenmisUygulama);
    this.olayTetikle('uygulamaGuncellendi', guncellenmisUygulama);
    
    return guncellenmisUygulama;
  }
  
  // Uygulama sil
  uygulamaSil(id) {
    const uygulama = this.uygulamalar.get(id);
    if (!uygulama) {
      throw new Error(`Uygulama bulunamadı: ${id}`);
    }
    
    this.uygulamalar.delete(id);
    this.olayTetikle('uygulamaSilindi', uygulama);
    
    return uygulama;
  }
  
  // Uygulama al
  uygulamaAl(id) {
    return this.uygulamalar.get(id);
  }
  
  // Tüm uygulamaları al
  tumUygulamalariAl() {
    return Array.from(this.uygulamalar.values());
  }
  
  // Kategoriye göre filtrele
  kategoriyeGoreFiltrele(kategori) {
    return this.tumUygulamalariAl().filter(uygulama => uygulama.kategori === kategori);
  }
  
  // Duruma göre filtrele
  durumaGoreFiltrele(durum) {
    return this.tumUygulamalariAl().filter(uygulama => uygulama.durum === durum);
  }
  
  // Olay dinleyici ekle
  dinleyiciEkle(olay, callback) {
    if (!this.dinleyiciler.has(olay)) {
      this.dinleyiciler.set(olay, []);
    }
    this.dinleyiciler.get(olay).push(callback);
  }
  
  // Olay dinleyici kaldır
  dinleyiciKaldir(olay, callback) {
    if (this.dinleyiciler.has(olay)) {
      const dinleyiciler = this.dinleyiciler.get(olay);
      const index = dinleyiciler.indexOf(callback);
      if (index > -1) {
        dinleyiciler.splice(index, 1);
      }
    }
  }
  
  // Olay tetikle
  olayTetikle(olay, veri) {
    if (this.dinleyiciler.has(olay)) {
      this.dinleyiciler.get(olay).forEach(callback => {
        try {
          callback(veri);
        } catch (error) {
          console.error(`Olay dinleyici hatası (${olay}):`, error);
        }
      });
    }
  }
}

// Global konfigürasyon yöneticisi instance
export const konfigurasyonYoneticisi = new KonfigurasyonYoneticisi();