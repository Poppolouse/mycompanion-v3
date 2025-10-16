/**
 * Uygulama yönetimi için yardımcı fonksiyonlar
 */

// Uygulama kullanım istatistiklerini al
export const getUygulamaIstatistikleri = () => {
  const kullanımVerileri = JSON.parse(
    localStorage.getItem('vaulttracker:uygulama:kullanim') || '{}'
  );
  
  const toplamKullanim = Object.values(kullanımVerileri).reduce((a, b) => a + b, 0);
  const enCokKullanilanId = Object.keys(kullanımVerileri).reduce((a, b) => 
    kullanımVerileri[a] > kullanımVerileri[b] ? a : b, 
    Object.keys(kullanımVerileri)[0]
  );
  
  return {
    toplamKullanim,
    enCokKullanilanId,
    kullanımVerileri
  };
};

// Uygulama performans metriklerini al
export const getPerformansMetrikleri = () => {
  const performansVerileri = JSON.parse(
    localStorage.getItem('vaulttracker:uygulama:performans') || '{}'
  );
  
  return performansVerileri;
};

// Uygulama performansını kaydet
export const performansKaydet = (uygulamaId, metrik, deger) => {
  const performansVerileri = JSON.parse(
    localStorage.getItem('vaulttracker:uygulama:performans') || '{}'
  );
  
  if (!performansVerileri[uygulamaId]) {
    performansVerileri[uygulamaId] = {};
  }
  
  if (!performansVerileri[uygulamaId][metrik]) {
    performansVerileri[uygulamaId][metrik] = [];
  }
  
  performansVerileri[uygulamaId][metrik].push({
    deger,
    tarih: new Date().toISOString()
  });
  
  // Son 100 kaydı tut
  if (performansVerileri[uygulamaId][metrik].length > 100) {
    performansVerileri[uygulamaId][metrik] = 
      performansVerileri[uygulamaId][metrik].slice(-100);
  }
  
  localStorage.setItem(
    'vaulttracker:uygulama:performans',
    JSON.stringify(performansVerileri)
  );
};

// Uygulama ayarlarını al
export const getUygulamaAyarlari = (uygulamaId) => {
  const ayarlar = JSON.parse(
    localStorage.getItem(`vaulttracker:uygulama:ayarlar:${uygulamaId}`) || '{}'
  );
  
  return ayarlar;
};

// Uygulama ayarlarını kaydet
export const uygulamaAyarlariKaydet = (uygulamaId, ayarlar) => {
  localStorage.setItem(
    `vaulttracker:uygulama:ayarlar:${uygulamaId}`,
    JSON.stringify(ayarlar)
  );
};

// Uygulama verilerini al
export const getUygulamaVerileri = (uygulamaId) => {
  const veriler = JSON.parse(
    localStorage.getItem(`vaulttracker:uygulama:veriler:${uygulamaId}`) || '{}'
  );
  
  return veriler;
};

// Uygulama verilerini kaydet
export const uygulamaVerileriKaydet = (uygulamaId, veriler) => {
  localStorage.setItem(
    `vaulttracker:uygulama:veriler:${uygulamaId}`,
    JSON.stringify(veriler)
  );
};

// Uygulama verilerini sil
export const uygulamaVerileriSil = (uygulamaId) => {
  localStorage.removeItem(`vaulttracker:uygulama:veriler:${uygulamaId}`);
  localStorage.removeItem(`vaulttracker:uygulama:ayarlar:${uygulamaId}`);
};

// Tüm uygulama verilerini temizle
export const tumUygulamaVerileriniTemizle = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('vaulttracker:uygulama:')) {
      localStorage.removeItem(key);
    }
  });
};

// Uygulama verilerini dışa aktar
export const uygulamaVerileriniDisaAktar = () => {
  const veriler = {};
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.startsWith('vaulttracker:')) {
      veriler[key] = localStorage.getItem(key);
    }
  });
  
  return JSON.stringify(veriler, null, 2);
};

// Uygulama verilerini içe aktar
export const uygulamaVerileriniIceAktar = (veriString) => {
  try {
    const veriler = JSON.parse(veriString);
    
    Object.keys(veriler).forEach(key => {
      if (key.startsWith('vaulttracker:')) {
        localStorage.setItem(key, veriler[key]);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Veri içe aktarma hatası:', error);
    return false;
  }
};

// Renk yardımcı fonksiyonları
export const renkYardimcilari = {
  // Hex rengini RGB'ye çevir
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  // RGB'yi hex'e çevir
  rgbToHex: (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
  
  // Rengin açık/koyu olduğunu kontrol et
  isLightColor: (hex) => {
    const rgb = renkYardimcilari.hexToRgb(hex);
    if (!rgb) return false;
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128;
  },
  
  // Rengi açıklaştır/koyulaştır
  adjustBrightness: (hex, percent) => {
    const rgb = renkYardimcilari.hexToRgb(hex);
    if (!rgb) return hex;
    
    const adjust = (color) => {
      const adjusted = Math.round(color * (100 + percent) / 100);
      return Math.max(0, Math.min(255, adjusted));
    };
    
    return renkYardimcilari.rgbToHex(
      adjust(rgb.r),
      adjust(rgb.g),
      adjust(rgb.b)
    );
  }
};

// Tarih yardımcı fonksiyonları
export const tarihYardimcilari = {
  // Tarih formatla
  formatla: (tarih, format = 'tr-TR') => {
    return new Date(tarih).toLocaleDateString(format);
  },
  
  // Zaman farkını hesapla
  zamanFarki: (tarih) => {
    const simdi = new Date();
    const hedefTarih = new Date(tarih);
    const fark = simdi - hedefTarih;
    
    const dakika = Math.floor(fark / 60000);
    const saat = Math.floor(fark / 3600000);
    const gun = Math.floor(fark / 86400000);
    
    if (dakika < 1) return 'Az önce';
    if (dakika < 60) return `${dakika} dakika önce`;
    if (saat < 24) return `${saat} saat önce`;
    if (gun < 7) return `${gun} gün önce`;
    
    return tarihYardimcilari.formatla(tarih);
  },
  
  // Bugünün başlangıcı
  bugunBaslangic: () => {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    return bugun;
  },
  
  // Bu haftanın başlangıcı
  buHaftaBaslangic: () => {
    const bugun = new Date();
    const gun = bugun.getDay();
    const fark = bugun.getDate() - gun + (gun === 0 ? -6 : 1);
    const pazartesi = new Date(bugun.setDate(fark));
    pazartesi.setHours(0, 0, 0, 0);
    return pazartesi;
  }
};

// Dosya yardımcı fonksiyonları
export const dosyaYardimcilari = {
  // Dosya boyutunu formatla
  boyutFormatla: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  // Dosya uzantısını al
  uzantiAl: (dosyaAdi) => {
    return dosyaAdi.split('.').pop().toLowerCase();
  },
  
  // Dosya tipini kontrol et
  dosyaTipiKontrol: (dosyaAdi, izinVerilenTipler) => {
    const uzanti = dosyaYardimcilari.uzantiAl(dosyaAdi);
    return izinVerilenTipler.includes(uzanti);
  }
};

// Performans yardımcı fonksiyonları
export const performansYardimcilari = {
  // Fonksiyon çalışma süresini ölç
  zamanOlc: async (fn, ...args) => {
    const baslangic = performance.now();
    const sonuc = await fn(...args);
    const bitis = performance.now();
    
    return {
      sonuc,
      sure: bitis - baslangic
    };
  },
  
  // Debounce fonksiyonu
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle fonksiyonu
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};