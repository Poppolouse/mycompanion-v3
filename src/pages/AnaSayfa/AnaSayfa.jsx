import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AnaSayfa.css';
import ProfileDropdown from '../../components/ProfileDropdown/ProfileDropdown';
import IGDBTest from '../../components/IGDBTest';

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
      {/* Profile Button - Body üzerinde konumlandırılmış */}
      <div className="ana-sayfa-profile">
        <ProfileDropdown />
      </div>

      {/* Karşılama Ekranı */}
      <section className="karsilama-ekrani">
        <div className="karsilama-container">
          {/* Büyük Şık Saat */}
          <div className="saat-bolumu">
            <div className="buyuk-saat">
              <span className="saat-saat">
                {String(currentTime.getHours()).padStart(2, '0')}
              </span>
              <span className="saat-ayirici">:</span>
              <span className="saat-dakika">
                {String(currentTime.getMinutes()).padStart(2, '0')}
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

          {/* Akıllı Arama - Çok Yakında */}
          <div className="ana-arama-bolumu">
            <div className="arama-container coming-soon-search">
              <div className="arama-ikon">🔍</div>
              <input 
                type="text" 
                className="ana-arama-input"
                placeholder="Akıllı arama ve komut sistemi - Çok yakında..."
                disabled
              />
              <div className="arama-kisayol coming-soon-badge">
                <span>Çok Yakında</span>
              </div>
            </div>
          </div>

          {/* Akıllı Öneriler - Çok Yakında */}
          <div className="oneriler-bolumu">
            <div className="oneriler-baslik">
              <span>🤖 Akıllı Öneriler</span>
              <span className="disclaimer">Çok Yakında</span>
            </div>
            <div className="oneri-kartlari">
              <div className="oneri-kart coming-soon-card">
                <div className="oneri-ikon">🎯</div>
                <div className="oneri-icerik">
                  <h4>Kişiselleştirilmiş Öneriler</h4>
                  <p>Kullanım alışkanlıklarınıza göre akıllı öneriler</p>
                </div>
              </div>
              <div className="oneri-kart coming-soon-card">
                <div className="oneri-ikon">📈</div>
                <div className="oneri-icerik">
                  <h4>Aktivite Analizi</h4>
                  <p>Detaylı kullanım istatistikleri ve raporlar</p>
                </div>
              </div>
            </div>
          </div>

          {/* Uygulama Kartları */}
          <div className="uygulama-kartlari-bolumu">
            <h3>🚀 Tüm Uygulamalar</h3>
            <div className="uygulama-grid">
              <div className="uygulama-kart active-app" onClick={() => handleUygulamaGit('/game-tracking-hub')}>
                <div className="kart-ikon">🎮</div>
                <div className="kart-icerik">
                  <h4>Oyun Merkezi</h4>
                  <p>Oyun kütüphanesi, ilerleme takibi ve istatistikler</p>
                </div>
              </div>
              
              {/* Sosyal Medya */}
              <div className="uygulama-kart coming-soon">
                <div className="coming-soon-overlay">
                  <div className="coming-soon-glow"></div>
                  <div className="coming-soon-text">Çok Yakında</div>
                </div>
                <div className="kart-ikon">🧟</div>
                <div className="kart-icerik">
                  <h4>Zombososyal</h4>
                  <p>Sosyal medya platformu ve topluluk ağı</p>
                </div>
              </div>

              {/* Dizi & Film Takip Uygulamaları */}
              <div className="uygulama-kart coming-soon">
                <div className="coming-soon-overlay">
                  <div className="coming-soon-glow"></div>
                  <div className="coming-soon-text">Çok Yakında</div>
                </div>
                <div className="kart-ikon">🎬</div>
                <div className="kart-icerik">
                  <h4>Sinepedi</h4>
                  <p>Film keşfi, değerlendirme ve izleme listesi</p>
                </div>
              </div>
              
              <div className="uygulama-kart coming-soon">
                <div className="coming-soon-overlay">
                  <div className="coming-soon-glow"></div>
                  <div className="coming-soon-text">Çok Yakında</div>
                </div>
                <div className="kart-ikon">📺</div>
                <div className="kart-icerik">
                  <h4>Bölüm Bölüm</h4>
                  <p>Dizi takibi, bölüm ilerlemesi ve öneriler</p>
                </div>
              </div>
              
              {/* Diğer Yaratıcı Uygulamalar */}
              <div className="uygulama-kart coming-soon">
                <div className="coming-soon-overlay">
                  <div className="coming-soon-glow"></div>
                  <div className="coming-soon-text">Çok Yakında</div>
                </div>
                <div className="kart-ikon">📚</div>
                <div className="kart-icerik">
                  <h4>Sayfa</h4>
                  <p>Kitap okuma takibi, notlar ve alıntılar</p>
                </div>
              </div>
              
              <div className="uygulama-kart coming-soon">
                <div className="coming-soon-overlay">
                  <div className="coming-soon-glow"></div>
                  <div className="coming-soon-text">Çok Yakında</div>
                </div>
                <div className="kart-ikon">🎵</div>
                <div className="kart-icerik">
                  <h4>Melodi</h4>
                  <p>Müzik keşfi, playlist yönetimi ve istatistikler</p>
                </div>
              </div>
              
              <div className="uygulama-kart coming-soon">
                <div className="coming-soon-overlay">
                  <div className="coming-soon-glow"></div>
                  <div className="coming-soon-text">Çok Yakında</div>
                </div>
                <div className="kart-ikon">🍽️</div>
                <div className="kart-icerik">
                  <h4>Besinsepeti</h4>
                  <p>Yemek tarifleri, beslenme takibi ve menü planlama</p>
                </div>
              </div>
              
              <div className="uygulama-kart coming-soon">
                <div className="coming-soon-overlay">
                  <div className="coming-soon-glow"></div>
                  <div className="coming-soon-text">Çok Yakında</div>
                </div>
                <div className="kart-ikon">💪</div>
                <div className="kart-icerik">
                  <h4>Kas Kurdu</h4>
                  <p>Antrenman programları, ilerleme takibi ve hedefler</p>
                </div>
              </div>
              
              <div className="uygulama-kart coming-soon">
                <div className="coming-soon-overlay">
                  <div className="coming-soon-glow"></div>
                  <div className="coming-soon-text">Çok Yakında</div>
                </div>
                <div className="kart-ikon">💰</div>
                <div className="kart-icerik">
                  <h4>FinansLab</h4>
                  <p>Kişisel finans yönetimi ve bütçe planlama</p>
                </div>
              </div>
              
              <div className="uygulama-kart coming-soon">
                <div className="coming-soon-overlay">
                  <div className="coming-soon-glow"></div>
                  <div className="coming-soon-text">Çok Yakında</div>
                </div>
                <div className="kart-ikon">🌱</div>
                <div className="kart-icerik">
                  <h4>Rutin</h4>
                  <p>Alışkanlık oluşturma, takip ve motivasyon</p>
                </div>
              </div>

              {/* Yeni Uygulamalar */}
              <div className="uygulama-kart coming-soon">
                <div className="coming-soon-overlay">
                  <div className="coming-soon-glow"></div>
                  <div className="coming-soon-text">Çok Yakında</div>
                </div>
                <div className="kart-ikon">🛡️</div>
                <div className="kart-icerik">
                  <h4>Titan</h4>
                  <p>Dosya yedekleme, senkronizasyon ve güvenlik</p>
                </div>
              </div>

              <div className="uygulama-kart coming-soon">
                <div className="coming-soon-overlay">
                  <div className="coming-soon-glow"></div>
                  <div className="coming-soon-text">Çok Yakında</div>
                </div>
                <div className="kart-ikon">✅</div>
                <div className="kart-icerik">
                  <h4>Yapyap</h4>
                  <p>Görev yönetimi, proje takibi ve verimlilik</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* IGDB API Test */}
      <IGDBTest />

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