import { useState, useEffect, useCallback } from 'react';
import { webApps } from '../config/webApps';
import { konfigurasyonYoneticisi, uygulamaKategorileri } from '../config/appConfig';
import { 
  getUygulamaIstatistikleri, 
  performansKaydet,
  getUygulamaAyarlari,
  uygulamaAyarlariKaydet 
} from '../utils/appUtils';

/**
 * Web uygulamalarını yönetmek için custom hook
 */
export const useWebApps = () => {
  const [tumUygulamalar, setTumUygulamalar] = useState([]);
  const [aktifUygulamalar, setAktifUygulamalar] = useState([]);
  const [seciliKategori, setSeciliKategori] = useState('tumu');
  const [aramaMetni, setAramaMetni] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [istatistikler, setIstatistikler] = useState(null);

  // Uygulamaları ve istatistikleri yükle
  useEffect(() => {
    setYukleniyor(true);
    
    // Konfigürasyon yöneticisine uygulamaları ekle
    webApps.forEach(uygulama => {
      try {
        konfigurasyonYoneticisi.uygulamaEkle(uygulama);
      } catch (error) {
        // Uygulama zaten ekliyse güncelle
        if (error.message.includes('benzersiz')) {
          konfigurasyonYoneticisi.uygulamaGuncelle(uygulama.id, uygulama);
        }
      }
    });
    
    // Simüle edilmiş yükleme süresi
    const timer = setTimeout(() => {
      const tumUygulamalar = konfigurasyonYoneticisi.tumUygulamalariAl();
      const aktifler = konfigurasyonYoneticisi.durumaGoreFiltrele('aktif');
      
      setTumUygulamalar(tumUygulamalar);
      setAktifUygulamalar(aktifler);
      setIstatistikler(getUygulamaIstatistikleri());
      setYukleniyor(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Filtrelenmiş uygulamalar
  const filtrelenmisUygulamalar = aktifUygulamalar.filter(uygulama => {
    const kategoriEslesmesi = seciliKategori === 'tumu' || uygulama.kategori === seciliKategori;
    const aramaEslesmesi = aramaMetni === '' || 
      uygulama.baslik.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      uygulama.aciklama.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      uygulama.ozellikler.some(ozellik => 
        ozellik.toLowerCase().includes(aramaMetni.toLowerCase())
      );
    
    return kategoriEslesmesi && aramaEslesmesi;
  });

  // Kategorileri al
  const kategoriler = Object.keys(uygulamaKategorileri);

  // Kategori değiştir
  const kategoriDegistir = (kategoriId) => {
    setSeciliKategori(kategoriId);
  };

  // Arama metni değiştir
  const aramaDegistir = (metin) => {
    setAramaMetni(metin);
  };

  // Arama temizle
  const aramaTemizle = () => {
    setAramaMetni('');
  };

  // Uygulama ID'sine göre uygulama bul
  const uygulamaBul = (id) => {
    return getUygulamaById(id);
  };

  // Kategoriye göre uygulama sayısı
  const kategoriUygulamaSayisi = (kategoriId) => {
    if (kategoriId === 'tumu') {
      return aktifUygulamalar.length;
    }
    return getKategoriyeGoreUygulamalar(kategoriId).length;
  };

  // Uygulama kullanımını kaydet
  const uygulamaKullan = useCallback((uygulamaId) => {
    const kullanımVerileri = JSON.parse(
      localStorage.getItem('vaulttracker:uygulama:kullanim') || '{}'
    );
    
    kullanımVerileri[uygulamaId] = (kullanımVerileri[uygulamaId] || 0) + 1;
    
    localStorage.setItem(
      'vaulttracker:uygulama:kullanim',
      JSON.stringify(kullanımVerileri)
    );
    
    // Son kullanılanları güncelle
    const sonKullanilanlar = JSON.parse(
      localStorage.getItem('vaulttracker:uygulama:son-kullanilanlar') || '[]'
    );
    
    const index = sonKullanilanlar.indexOf(uygulamaId);
    if (index > -1) {
      sonKullanilanlar.splice(index, 1);
    }
    sonKullanilanlar.unshift(uygulamaId);
    
    localStorage.setItem(
      'vaulttracker:uygulama:son-kullanilanlar',
      JSON.stringify(sonKullanilanlar.slice(0, 10))
    );
    
    // Performans kaydı
    performansKaydet(uygulamaId, 'kullanim', 1);
    
    // İstatistikleri güncelle
    setIstatistikler(getUygulamaIstatistikleri());
  }, []);

  // En popüler uygulamaları al (localStorage'dan kullanım verilerine göre)
  const getPopulerUygulamalar = useCallback(() => {
    const kullanımVerileri = JSON.parse(
      localStorage.getItem('vaulttracker:uygulama:kullanim') || '{}'
    );
    
    return aktifUygulamalar
      .map(uygulama => ({
        ...uygulama,
        kullanımSayisi: kullanımVerileri[uygulama.id] || 0
      }))
      .sort((a, b) => b.kullanımSayisi - a.kullanımSayisi)
      .slice(0, 6);
  }, [aktifUygulamalar]);

  // Uygulama kullanımını kaydet
  const uygulamaKullanımKaydet = (uygulamaId) => {
    const kullanımVerileri = JSON.parse(
      localStorage.getItem('vaulttracker:uygulama:kullanim') || '{}'
    );
    
    kullanımVerileri[uygulamaId] = (kullanımVerileri[uygulamaId] || 0) + 1;
    
    localStorage.setItem(
      'vaulttracker:uygulama:kullanim',
      JSON.stringify(kullanımVerileri)
    );
  };

  // Son kullanılan uygulamaları al
  const getSonKullanilanUygulamalar = useCallback(() => {
    const sonKullanilanlar = JSON.parse(
      localStorage.getItem('vaulttracker:uygulama:son-kullanilanlar') || '[]'
    );
    
    return sonKullanilanlar
      .map(id => aktifUygulamalar.find(uygulama => uygulama.id === id))
      .filter(Boolean)
      .slice(0, 5);
  }, [aktifUygulamalar]);

  // Son kullanılan uygulamaya ekle
  const sonKullanilanEkle = (uygulamaId) => {
    const sonKullanilanlar = JSON.parse(
      localStorage.getItem('vaulttracker:uygulama:son-kullanilan') || '[]'
    );
    
    // Eğer zaten listede varsa çıkar
    const filtrelenmis = sonKullanilanlar.filter(id => id !== uygulamaId);
    
    // Başa ekle
    const yeniListe = [uygulamaId, ...filtrelenmis].slice(0, 10);
    
    localStorage.setItem(
      'vaulttracker:uygulama:son-kullanilan',
      JSON.stringify(yeniListe)
    );
  };

  // Favori uygulamaları al
  const getFavoriUygulamalar = useCallback(() => {
    const favoriler = JSON.parse(
      localStorage.getItem('vaulttracker:uygulama:favoriler') || '[]'
    );
    
    return favoriler
      .map(id => aktifUygulamalar.find(uygulama => uygulama.id === id))
      .filter(Boolean);
  }, [aktifUygulamalar]);

  // Favori durumunu değiştir
  const favoriDegistir = useCallback((uygulamaId) => {
    const favoriler = JSON.parse(
      localStorage.getItem('vaulttracker:uygulama:favoriler') || '[]'
    );
    
    const index = favoriler.indexOf(uygulamaId);
    if (index > -1) {
      favoriler.splice(index, 1);
    } else {
      favoriler.push(uygulamaId);
    }
    
    localStorage.setItem(
      'vaulttracker:uygulama:favoriler',
      JSON.stringify(favoriler)
    );
  }, []);

  // Uygulama favori mi kontrol et
  const uygulamaFavoriMi = (uygulamaId) => {
    const favoriler = JSON.parse(
      localStorage.getItem('vaulttracker:uygulama:favoriler') || '[]'
    );
    return favoriler.includes(uygulamaId);
  };

  // Uygulama ayarlarını yönet
  const uygulamaAyarlariAl = useCallback((uygulamaId) => {
    return getUygulamaAyarlari(uygulamaId);
  }, []);

  const uygulamaAyarlariKaydet = useCallback((uygulamaId, ayarlar) => {
    uygulamaAyarlariKaydet(uygulamaId, ayarlar);
  }, []);

  // Kategori bilgilerini al
  const getKategoriBilgisi = useCallback((kategoriId) => {
    return uygulamaKategorileri[kategoriId] || null;
  }, []);

  return {
    // Veriler
    tumUygulamalar,
    aktifUygulamalar,
    filtrelenmisUygulamalar,
    kategoriler,
    yukleniyor,
    istatistikler,
    
    // State
    seciliKategori,
    aramaMetni,
    
    // Actions
    setSeciliKategori,
    setAramaMetni,
    uygulamaKullan,
    favoriDegistir,
    uygulamaAyarlariAl,
    uygulamaAyarlariKaydet,
    
    // Computed
    getSonKullanilanUygulamalar,
    getFavoriUygulamalar,
    getPopulerUygulamalar,
    getKategoriBilgisi,
    
    // Utils
    getUygulamaById: (id) => aktifUygulamalar.find(uygulama => uygulama.id === id),
    konfigurasyonYoneticisi,
    
    // Legacy functions
    kategoriDegistir,
    aramaDegistir,
    aramaTemizle,
    uygulamaBul,
    kategoriUygulamaSayisi,
    uygulamaKullanımKaydet,
    sonKullanilanEkle,
    uygulamaFavoriMi
  };
};

export default useWebApps;