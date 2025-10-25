import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import './GameTrackingHub.css';

/**
 * 🎯 Game Tracking Hub - Oyun Takibi Merkezi
 * Statistics, Route Planner ve Kütüphane sayfalarına yönlendiren hub
 */
function GameTrackingHub() {
  const navigate = useNavigate();

  // Ana sayfaya dönüş
  const handleGoHome = () => {
    navigate('/');
  };

  // Sayfa navigasyonları
  const navigateToStatistics = () => {
    navigate('/game-tracking-hub/statistics');
  };

  const navigateToRoutePlanner = () => {
    navigate('/game-tracking-hub/route-planner');
  };

  const navigateToLibrary = () => {
    navigate('/game-tracking-hub/game-tracker');
  };

  const navigateToSession = () => {
    navigate('/game-tracking-hub/session');
  };

  return (
    <div className="game-tracking-hub">
      {/* Standart Header */}
      <header className="tracker-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🎯 Oyun Merkezi</h1>
            <p>Oyun deneyiminizi yönetmek için araçları seçin</p>
          </div>
          <div className="header-controls">
            <div className="navigation-buttons">
              <button 
                className="nav-btn home-btn"
                onClick={handleGoHome}
                title="Ana Sayfaya Dön"
              >
                🏠 Ana Sayfa
              </button>
            </div>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="hub-main">
        <div className="hub-grid">
          {/* Library Card - Üst sıra */}
          <div className="hub-card library-card">
            <div className="card-icon">📚</div>
            <div className="card-content">
              <h2>Oyun Kütüphanesi</h2>
              <p>Oyun koleksiyonunuzu görüntüleyin, arayın ve yönetin. Excel dosyalarından oyun listesi yükleyebilirsiniz.</p>
              <ul className="feature-list">
                <li>📁 Excel dosyası desteği</li>
                <li>🔍 Gelişmiş arama ve filtreleme</li>
                <li>🎯 Tür ve platform filtreleri</li>
                <li>📋 Düzenli liste görünümü</li>
              </ul>
            </div>
            <button 
              className="hub-button library-button"
              onClick={navigateToLibrary}
            >
              📚 Kütüphaneye Git
            </button>
          </div>

          {/* Aktif Oyun Card - Üst sıra */}
          <div className="hub-card session-card">
            <div className="card-icon">🎯</div>
            <div className="card-content">
              <h2>Aktif Oyun</h2>
              <p>Şu anda oynadığınız oyunu yönetin ve takip edin. Anlık oyun deneyiminizi kaydedin ve analiz edin.</p>
              <ul className="feature-list">
                <li>⏱️ Oyun süresi takibi</li>
                <li>🎯 Hedef belirleme</li>
                <li>📊 İstatistik toplama</li>
                <li>💾 İlerleme kaydetme</li>
              </ul>
            </div>
            <button 
              className="hub-button session-button"
              onClick={navigateToSession}
            >
              🎯 Aktif Oyun'a Git
            </button>
          </div>

          {/* Rota Merkezi Card - Çok Yakında */}
          <div className="hub-card coming-soon-card">
            <div className="coming-soon-overlay">
              <div className="coming-soon-glow"></div>
              <div className="coming-soon-text">Çok Yakında</div>
            </div>
            <div className="card-icon">🗺️</div>
            <div className="card-content">
              <h2>Rota Merkezi</h2>
              <p>Oyun kütüphaneniz için kişisel rota planlama sistemi. Hangi oyunu ne zaman oynayacağınızı planlayın.</p>
              <div className="progress-section">
                <div className="progress-label">Yapım Aşaması</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '78%'}}></div>
                </div>
                <div className="progress-text">78%</div>
              </div>
              <ul className="feature-list">
                <li>🎯 Oyun sırası planlama</li>
                <li>📋 Hedef belirleme</li>
                <li>📈 İlerleme takibi</li>
                <li>🧠 Strateji geliştirme</li>
              </ul>
            </div>
            <button 
              className="hub-button disabled"
              disabled
            >
              🗺️ Yakında Gelecek
            </button>
          </div>

          {/* Statistics Card - Çok Yakında */}
          <div className="hub-card coming-soon-card statistics-card">
            <div className="coming-soon-overlay">
              <div className="coming-soon-glow"></div>
              <div className="coming-soon-text">Çok Yakında</div>
            </div>
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h2>İstatistikler</h2>
              <p>Oyun oynama alışkanlıklarınızı analiz edin, zaman takibi yapın ve ilerlemenizi görselleştirin.</p>
              <div className="progress-section">
                <div className="progress-label">Planlama Aşaması</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '20%'}}></div>
                </div>
                <div className="progress-text">20%</div>
              </div>
              <ul className="feature-list">
                <li>📈 Detaylı oyun istatistikleri</li>
                <li>⏱️ Zaman takibi ve analizi</li>
                <li>📅 Günlük/haftalık/aylık raporlar</li>
                <li>🎯 Hedef takibi</li>
              </ul>
            </div>
            <button 
              className="hub-button statistics-button disabled"
              disabled
            >
              📊 Çok Yakında
            </button>
          </div>

          {/* Gallery Card - Çok Yakında */}
          <div className="hub-card coming-soon-card gallery-card">
            <div className="coming-soon-overlay">
              <div className="coming-soon-glow"></div>
              <div className="coming-soon-text">Çok Yakında</div>
            </div>
            <div className="card-icon">🖼️</div>
            <div className="card-content">
              <h2>Galeri</h2>
              <p>Tüm oyunlarınızdan kaydettiğiniz ekran görüntüleri, videolar ve anıları tek yerde görüntüleyin.</p>
              <div className="progress-section">
                <div className="progress-label">Henüz Başlanmadı</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '0%'}}></div>
                </div>
                <div className="progress-text">0%</div>
              </div>
              <ul className="feature-list">
                <li>📸 Ekran görüntüleri koleksiyonu</li>
                <li>🎥 Video kayıtları</li>
                <li>🏆 Başarım anları</li>
                <li>📅 Tarih bazlı organizasyon</li>
              </ul>
            </div>
            <button 
              className="hub-button gallery-button disabled"
              disabled
            >
              🖼️ Çok Yakında
            </button>
          </div>
        </div>


      </main>
    </div>
  );
}

export default GameTrackingHub;