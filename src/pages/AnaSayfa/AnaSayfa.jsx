import { useState } from 'react';
import KullaniciSorusu from '../../components/KullaniciSorusu';
import WebUygulamalariListesi from '../../components/WebUygulamalariListesi';
import './AnaSayfa.css';

/**
 * Ana sayfa komponenti
 * Kullanıcıya soru sorar ve cevabına göre uygun uygulamaları gösterir
 */
function AnaSayfa() {
  const [kullaniciCevabi, setKullaniciCevabi] = useState(null);
  const [secilenUygulama, setSecilenUygulama] = useState(null);
  const [sayfalariGoster, setSayfalariGoster] = useState({
    soru: true,
    uygulamalar: false
  });

  const handleKullaniciCevabi = (cevap) => {
    setKullaniciCevabi(cevap);
    
    // Smooth transition ile uygulamalar listesini göster
    setTimeout(() => {
      setSayfalariGoster({
        soru: false,
        uygulamalar: true
      });
    }, 1000);
  };

  const handleUygulamaSecildi = (uygulama) => {
    setSecilenUygulama(uygulama);
  };

  const handleYenidenBasla = () => {
    setKullaniciCevabi(null);
    setSecilenUygulama(null);
    setSayfalariGoster({
      soru: true,
      uygulamalar: false
    });
  };

  return (
    <div className="ana-sayfa">
      {/* Standart Header */}
      <header className="tracker-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <span className="baslik-ikon">🌟</span>
              MyCompanion
              <span className="baslik-alt">v3</span>
            </h1>
            <p>İhtiyacınıza uygun web uygulamalarını keşfedin ve hemen kullanmaya başlayın</p>
          </div>
          <div className="header-controls">
            <div className="navigation-buttons">
              {kullaniciCevabi && (
                <button 
                  className="nav-btn restart-btn"
                  onClick={handleYenidenBasla}
                >
                  🔄 Yeniden Başla
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="ana-icerik">
        {/* Kullanıcı Sorusu Bölümü */}
        <div className={`soru-bolumu ${sayfalariGoster.soru ? 'goster' : 'gizle'}`}>
          <KullaniciSorusu onCevapVer={handleKullaniciCevabi} />
        </div>

        {/* Uygulamalar Listesi Bölümü */}
        <div className={`uygulamalar-bolumu ${sayfalariGoster.uygulamalar ? 'goster' : 'gizle'}`}>
          {kullaniciCevabi && (
            <>
              <div className="secim-ozeti">
                <div className="ozet-ikon">✨</div>
                <div className="ozet-icerik">
                  <h3>Seçiminiz: {kullaniciCevabi.metin}</h3>
                  <p>{kullaniciCevabi.aciklama}</p>
                </div>
              </div>
              
              <WebUygulamalariListesi 
                onerilenKategoriler={kullaniciCevabi.onerilenKategoriler}
                onUygulamaSecildi={handleUygulamaSecildi}
              />
            </>
          )}
        </div>

        {/* Seçilen Uygulama Bildirimi */}
        {secilenUygulama && (
          <div className="uygulama-secim-bildirimi">
            <div className="bildirim-icerik">
              <div className="bildirim-ikon">{secilenUygulama.icon}</div>
              <div className="bildirim-metin">
                <strong>{secilenUygulama.baslik}</strong> uygulamasına yönlendiriliyorsunuz...
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="ana-sayfa-footer">
        <div className="footer-icerik">
          <p>
            🚀 <strong>MyCompanion v3</strong> - Modern web uygulamaları platformu
          </p>
          <div className="footer-linkler">
            <span>Tüm uygulamalar React ile geliştirilmiştir</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AnaSayfa;