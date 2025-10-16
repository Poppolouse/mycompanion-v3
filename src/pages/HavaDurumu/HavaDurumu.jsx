import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HavaDurumu.css';

/**
 * Hava Durumu Uygulaması
 * Şehir bazlı hava durumu bilgilerini gösterir
 */
function HavaDurumu() {
  const [sehir, setSehir] = useState('İstanbul');
  const [havaDurumu, setHavaDurumu] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');
  const [favoriSehirler, setFavoriSehirler] = useState([]);

  // Demo hava durumu verileri (gerçek API yerine)
  const demoVeriler = {
    'İstanbul': {
      sicaklik: 18,
      durum: 'Parçalı Bulutlu',
      nem: 65,
      ruzgar: 12,
      basinc: 1013,
      gorunurluk: 10,
      ikon: '⛅',
      gunlukTahmin: [
        { gun: 'Bugün', min: 15, max: 20, durum: 'Parçalı Bulutlu', ikon: '⛅' },
        { gun: 'Yarın', min: 12, max: 18, durum: 'Yağmurlu', ikon: '🌧️' },
        { gun: 'Pazartesi', min: 14, max: 22, durum: 'Güneşli', ikon: '☀️' },
        { gun: 'Salı', min: 16, max: 24, durum: 'Az Bulutlu', ikon: '🌤️' },
        { gun: 'Çarşamba', min: 13, max: 19, durum: 'Bulutlu', ikon: '☁️' }
      ]
    },
    'Ankara': {
      sicaklik: 15,
      durum: 'Güneşli',
      nem: 45,
      ruzgar: 8,
      basinc: 1018,
      gorunurluk: 15,
      ikon: '☀️',
      gunlukTahmin: [
        { gun: 'Bugün', min: 12, max: 18, durum: 'Güneşli', ikon: '☀️' },
        { gun: 'Yarın', min: 10, max: 16, durum: 'Az Bulutlu', ikon: '🌤️' },
        { gun: 'Pazartesi', min: 8, max: 14, durum: 'Bulutlu', ikon: '☁️' },
        { gun: 'Salı', min: 11, max: 17, durum: 'Parçalı Bulutlu', ikon: '⛅' },
        { gun: 'Çarşamba', min: 9, max: 15, durum: 'Yağmurlu', ikon: '🌧️' }
      ]
    },
    'İzmir': {
      sicaklik: 22,
      durum: 'Az Bulutlu',
      nem: 70,
      ruzgar: 15,
      basinc: 1010,
      gorunurluk: 12,
      ikon: '🌤️',
      gunlukTahmin: [
        { gun: 'Bugün', min: 18, max: 25, durum: 'Az Bulutlu', ikon: '🌤️' },
        { gun: 'Yarın', min: 20, max: 27, durum: 'Güneşli', ikon: '☀️' },
        { gun: 'Pazartesi', min: 19, max: 26, durum: 'Parçalı Bulutlu', ikon: '⛅' },
        { gun: 'Salı', min: 17, max: 23, durum: 'Yağmurlu', ikon: '🌧️' },
        { gun: 'Çarşamba', min: 21, max: 28, durum: 'Güneşli', ikon: '☀️' }
      ]
    }
  };

  // Favori şehirleri localStorage'dan yükle
  useEffect(() => {
    const kaydedilmis = localStorage.getItem('vaulttracker:hava:favoriler');
    if (kaydedilmis) {
      setFavoriSehirler(JSON.parse(kaydedilmis));
    }
  }, []);

  // Sayfa yüklendiğinde varsayılan şehir bilgisini getir
  useEffect(() => {
    havaDurumuGetir(sehir);
  }, []);

  const havaDurumuGetir = async (sehirAdi) => {
    setYukleniyor(true);
    setHata('');
    
    try {
      // Simüle edilmiş API çağrısı
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const veri = demoVeriler[sehirAdi];
      if (veri) {
        setHavaDurumu(veri);
      } else {
        setHata('Şehir bulunamadı. Lütfen geçerli bir şehir adı girin.');
      }
    } catch (error) {
      setHata('Hava durumu bilgisi alınırken bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };

  const sehirAra = (e) => {
    e.preventDefault();
    if (sehir.trim()) {
      havaDurumuGetir(sehir.trim());
    }
  };

  const favoriEkle = () => {
    if (!favoriSehirler.includes(sehir) && havaDurumu) {
      const yeniFavoriler = [...favoriSehirler, sehir];
      setFavoriSehirler(yeniFavoriler);
      localStorage.setItem('vaulttracker:hava:favoriler', JSON.stringify(yeniFavoriler));
    }
  };

  const favoriCikar = (sehirAdi) => {
    const yeniFavoriler = favoriSehirler.filter(s => s !== sehirAdi);
    setFavoriSehirler(yeniFavoriler);
    localStorage.setItem('vaulttracker:hava:favoriler', JSON.stringify(yeniFavoriler));
  };

  const favoriSehirSec = (sehirAdi) => {
    setSehir(sehirAdi);
    havaDurumuGetir(sehirAdi);
  };

  return (
    <div className="hava-durumu">
      <div className="hava-container">
        {/* Header */}
        <header className="hava-header">
          <Link to="/" className="geri-btn">
            ← Ana Sayfa
          </Link>
          <h1 className="hava-baslik">🌤️ Hava Durumu</h1>
          <div></div>
        </header>

        {/* Arama Formu */}
        <form onSubmit={sehirAra} className="arama-formu">
          <div className="arama-grubu">
            <input
              type="text"
              value={sehir}
              onChange={(e) => setSehir(e.target.value)}
              placeholder="Şehir adı girin..."
              className="sehir-input"
            />
            <button type="submit" className="ara-btn" disabled={yukleniyor}>
              {yukleniyor ? '🔄' : '🔍'}
            </button>
          </div>
        </form>

        {/* Favori Şehirler */}
        {favoriSehirler.length > 0 && (
          <div className="favori-sehirler">
            <h3>⭐ Favori Şehirler</h3>
            <div className="favori-liste">
              {favoriSehirler.map(favoriSehir => (
                <div key={favoriSehir} className="favori-item">
                  <button 
                    onClick={() => favoriSehirSec(favoriSehir)}
                    className="favori-btn"
                  >
                    {favoriSehir}
                  </button>
                  <button 
                    onClick={() => favoriCikar(favoriSehir)}
                    className="favori-sil"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ana İçerik */}
        <div className="hava-icerik">
          {hata && (
            <div className="hata-mesaji">
              <span className="hata-ikon">⚠️</span>
              <p>{hata}</p>
            </div>
          )}

          {yukleniyor && (
            <div className="yukleniyor">
              <div className="yukleniyor-spinner">🌀</div>
              <p>Hava durumu bilgisi alınıyor...</p>
            </div>
          )}

          {havaDurumu && !yukleniyor && !hata && (
            <>
              {/* Mevcut Hava Durumu */}
              <div className="mevcut-hava">
                <div className="mevcut-header">
                  <div className="sehir-bilgi">
                    <h2>{sehir}</h2>
                    <p>{new Date().toLocaleDateString('tr-TR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  <button 
                    onClick={favoriEkle}
                    className="favori-ekle-btn"
                    disabled={favoriSehirler.includes(sehir)}
                  >
                    {favoriSehirler.includes(sehir) ? '⭐' : '☆'}
                  </button>
                </div>

                <div className="hava-detay">
                  <div className="ana-bilgi">
                    <div className="sicaklik-ikon">
                      <span className="hava-ikon">{havaDurumu.ikon}</span>
                      <span className="sicaklik">{havaDurumu.sicaklik}°C</span>
                    </div>
                    <p className="durum">{havaDurumu.durum}</p>
                  </div>

                  <div className="ek-bilgiler">
                    <div className="bilgi-item">
                      <span className="bilgi-ikon">💧</span>
                      <span className="bilgi-label">Nem</span>
                      <span className="bilgi-deger">%{havaDurumu.nem}</span>
                    </div>
                    <div className="bilgi-item">
                      <span className="bilgi-ikon">💨</span>
                      <span className="bilgi-label">Rüzgar</span>
                      <span className="bilgi-deger">{havaDurumu.ruzgar} km/h</span>
                    </div>
                    <div className="bilgi-item">
                      <span className="bilgi-ikon">🌡️</span>
                      <span className="bilgi-label">Basınç</span>
                      <span className="bilgi-deger">{havaDurumu.basinc} hPa</span>
                    </div>
                    <div className="bilgi-item">
                      <span className="bilgi-ikon">👁️</span>
                      <span className="bilgi-label">Görünürlük</span>
                      <span className="bilgi-deger">{havaDurumu.gorunurluk} km</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5 Günlük Tahmin */}
              <div className="gunluk-tahmin">
                <h3>📅 5 Günlük Tahmin</h3>
                <div className="tahmin-liste">
                  {havaDurumu.gunlukTahmin.map((gun, index) => (
                    <div key={index} className="tahmin-item">
                      <div className="gun-adi">{gun.gun}</div>
                      <div className="gun-ikon">{gun.ikon}</div>
                      <div className="gun-durum">{gun.durum}</div>
                      <div className="gun-sicaklik">
                        <span className="max">{gun.max}°</span>
                        <span className="min">{gun.min}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="hava-footer">
          <p>🌍 Demo hava durumu uygulaması</p>
          <p>Gerçek veriler için API entegrasyonu gereklidir</p>
        </footer>
      </div>
    </div>
  );
}

export default HavaDurumu;