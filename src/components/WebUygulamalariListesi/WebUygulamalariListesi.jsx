import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUygulamalarKategoriyeGore, kategoriler } from '../../config/webApps';
import './WebUygulamalariListesi.css';

/**
 * Web uygulamalarını listeleyen ve seçim yapılmasını sağlayan komponent
 * 
 * @param {Object} props
 * @param {Array} props.onerilenKategoriler - Önerilen kategoriler listesi
 * @param {Function} props.onUygulamaSecildi - Uygulama seçildiğinde çağrılacak fonksiyon
 */
function WebUygulamalariListesi({ onerilenKategoriler = ['Tümü'], onUygulamaSecildi }) {
  const [secilenKategori, setSecilenKategori] = useState(onerilenKategoriler[0]);
  const [uygulamalar, setUygulamalar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Kategori değiştiğinde uygulamaları güncelle
    setYukleniyor(true);
    
    setTimeout(() => {
      const filtrelenmisUygulamalar = getUygulamalarKategoriyeGore(secilenKategori);
      setUygulamalar(filtrelenmisUygulamalar);
      setYukleniyor(false);
    }, 300); // Smooth transition için kısa gecikme
  }, [secilenKategori]);

  const handleKategoriDegistir = (kategori) => {
    setSecilenKategori(kategori);
  };

  const handleUygulamaAc = (uygulama) => {
    // Önce callback'i çağır
    if (onUygulamaSecildi) {
      onUygulamaSecildi(uygulama);
    }
    
    // Sonra yönlendirme yap
    setTimeout(() => {
      navigate(uygulama.route);
    }, 500);
  };

  return (
    <div className="web-uygulamalari-listesi">
      <div className="liste-header">
        <h2 className="liste-baslik">
          🚀 Mevcut Web Uygulamaları
        </h2>
        <p className="liste-aciklama">
          İhtiyacınıza uygun uygulamayı seçin ve hemen kullanmaya başlayın
        </p>
      </div>

      {/* Kategori Filtreleri */}
      <div className="kategori-filtreler">
        {kategoriler.map((kategori) => {
          const isOnerilen = onerilenKategoriler.includes(kategori);
          const isSecili = kategori === secilenKategori;
          
          return (
            <button
              key={kategori}
              className={`kategori-buton ${isSecili ? 'aktif' : ''} ${isOnerilen ? 'onerilen' : ''}`}
              onClick={() => handleKategoriDegistir(kategori)}
            >
              {kategori}
              {isOnerilen && <span className="onerilen-badge">✨</span>}
            </button>
          );
        })}
      </div>

      {/* Uygulamalar Grid */}
      <div className="uygulamalar-container">
        {yukleniyor ? (
          <div className="yukleniyor">
            <div className="yukleniyor-spinner"></div>
            <p>Uygulamalar yükleniyor...</p>
          </div>
        ) : (
          <div className="uygulamalar-grid">
            {uygulamalar.map((uygulama, index) => (
              <div
                key={uygulama.id}
                className="uygulama-kartı"
                style={{
                  '--kart-renk': uygulama.renk,
                  '--kart-arkaplan': uygulama.arkaplanRengi,
                  '--animasyon-gecikme': `${index * 0.1}s`
                }}
                onClick={() => handleUygulamaAc(uygulama)}
              >
                <div className="kart-header">
                  <div className="uygulama-ikon">
                    {uygulama.icon}
                  </div>
                  <div className="kategori-badge">
                    {uygulama.kategori}
                  </div>
                </div>
                
                <div className="kart-icerik">
                  <h3 className="uygulama-baslik">
                    {uygulama.baslik}
                  </h3>
                  <p className="uygulama-aciklama">
                    {uygulama.aciklama}
                  </p>
                  
                  <div className="ozellikler-listesi">
                    {uygulama.ozellikler.slice(0, 3).map((ozellik, idx) => (
                      <span key={idx} className="ozellik-tag">
                        {ozellik}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="kart-footer">
                  <button className="ac-btn">
                    Uygulamayı Aç
                    <span className="btn-ikon">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!yukleniyor && uygulamalar.length === 0 && (
          <div className="bos-durum">
            <div className="bos-durum-ikon">📭</div>
            <h3>Bu kategoride henüz uygulama yok</h3>
            <p>Farklı bir kategori seçerek diğer uygulamaları keşfedebilirsiniz.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WebUygulamalariListesi;