import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AnaSayfa.css';

/**
 * Ana sayfa komponenti
 * Kullanıcıya soru sorar ve cevabına göre uygun uygulamaları gösterir
 */
function AnaSayfa() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Gerçek zamanlı saat güncellemesi
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Uygulama navigasyon fonksiyonu
  const handleUygulamaGit = (route) => {
    navigate(route);
  };

  return (
    <div className="ana-sayfa">
      {/* Standart Header */}
      <header className="tracker-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              MyCompanion
              <span className="baslik-alt">v3</span>
            </h1>
            <p>İhtiyacınıza uygun web uygulamalarını keşfedin ve hemen kullanmaya başlayın</p>
          </div>
        </div>
      </header>

      {/* Karşılama Ekranı */}
      <section className="karsilama-ekrani">
        <div className="karsilama-container">
          {/* Büyük Şık Saat */}
          <div className="saat-bolumu">
            <div className="buyuk-saat">
              <span className="saat-saat">
                {currentTime.toLocaleTimeString('tr-TR', { 
                  hour: '2-digit' 
                })}
              </span>
              <span className="saat-ayirici">:</span>
              <span className="saat-dakika">
                {currentTime.toLocaleTimeString('tr-TR', { 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <div className="tarih-bilgisi">
              {currentTime.toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Uzun Search Bar */}
          <div className="ana-arama-bolumu">
            <div className="arama-container">
              <div className="arama-ikon">🔍</div>
              <input 
                type="text" 
                className="ana-arama-input"
                placeholder="Ne yapmak istiyorsun? Uygulama ara, komut yaz..."
              />
              <div className="arama-kisayol">
                <span>Enter</span>
              </div>
            </div>
          </div>

          {/* Son Aktivitelere Göre Öneriler */}
          <div className="oneriler-bolumu">
            <div className="oneriler-baslik">
              <span>📊 Son aktivitelere göre öneriler</span>
              <span className="disclaimer">! Henüz aktif değil, örnek veriler gösteriliyor</span>
            </div>
            <div className="oneri-kartlari">
              <div className="oneri-kart">
                <div className="oneri-ikon">🎮</div>
                <div className="oneri-icerik">
                  <h4>Oyun Tracker</h4>
                  <p>Son oynadığın: Cyberpunk 2077</p>
                </div>
              </div>
              <div className="oneri-kart">
                <div className="oneri-ikon">📝</div>
                <div className="oneri-icerik">
                  <h4>Todo App</h4>
                  <p>3 tamamlanmamış görev var</p>
                </div>
              </div>
            </div>
          </div>

          {/* Uygulama Kartları */}
          <div className="uygulama-kartlari-bolumu">
            <h3>🚀 Tüm Uygulamalar</h3>
            <div className="uygulama-grid">
              <div className="uygulama-kart" onClick={() => handleUygulamaGit('/game-tracking-hub')}>
                <div className="kart-ikon">🎮</div>
                <div className="kart-icerik">
                  <h4>Game Tracking Hub</h4>
                  <p>Oyun yönetimi merkezi</p>
                </div>
              </div>
              <div className="uygulama-kart" onClick={() => handleUygulamaGit('/todo')}>
                <div className="kart-ikon">📝</div>
                <div className="kart-icerik">
                  <h4>Todo App</h4>
                  <p>Görevlerini organize et</p>
                </div>
              </div>
              <div className="uygulama-kart" onClick={() => handleUygulamaGit('/hava-durumu')}>
                <div className="kart-ikon">🌤️</div>
                <div className="kart-icerik">
                  <h4>Hava Durumu</h4>
                  <p>Güncel hava bilgileri</p>
                </div>
              </div>
              <div className="uygulama-kart" onClick={() => handleUygulamaGit('/hesap-makinesi')}>
                <div className="kart-ikon">🧮</div>
                <div className="kart-icerik">
                  <h4>Hesap Makinesi</h4>
                  <p>Hızlı hesaplamalar</p>
                </div>
              </div>
              <div className="uygulama-kart" onClick={() => handleUygulamaGit('/not-defteri')}>
                <div className="kart-ikon">📝</div>
                <div className="kart-icerik">
                  <h4>Not Defteri</h4>
                  <p>Notlarını yönet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



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