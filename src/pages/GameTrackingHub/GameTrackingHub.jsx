import { useNavigate } from 'react-router-dom';
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
    navigate('/statistics');
  };

  const navigateToRoutePlanner = () => {
    navigate('/route-planner');
  };

  const navigateToLibrary = () => {
    navigate('/game-tracker');
  };

  const navigateToSession = () => {
    navigate('/session');
  };

  return (
    <div className="game-tracking-hub">
      {/* Header */}
      <header className="hub-header">
        <button 
          className="home-button"
          onClick={handleGoHome}
          title="Ana Sayfaya Dön"
        >
          🏠 Ana Sayfa
        </button>
        
        <div className="header-title">
          <h1>🎯 Oyun Takibi Merkezi</h1>
          <p>Oyun deneyiminizi yönetmek için araçları seçin</p>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="hub-main">
        <div className="hub-grid">
          {/* Statistics Card */}
          <div className="hub-card statistics-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h2>İstatistikler</h2>
              <p>Oyun oynama alışkanlıklarınızı analiz edin, zaman takibi yapın ve ilerlemenizi görselleştirin.</p>
              <ul className="feature-list">
                <li>📈 Detaylı oyun istatistikleri</li>
                <li>⏱️ Zaman takibi ve analizi</li>
                <li>📅 Günlük/haftalık/aylık raporlar</li>
                <li>🎯 Hedef takibi</li>
              </ul>
            </div>
            <button 
              className="hub-button statistics-button"
              onClick={navigateToStatistics}
            >
              📊 İstatistiklere Git
            </button>
          </div>

          {/* Route Planner Card */}
          <div className="hub-card route-planner-card">
            <div className="card-icon">🗺️</div>
            <div className="card-content">
              <h2>Route Planner</h2>
              <p>117 oyun için optimize edilmiş rota planlama sistemi. Oyun sıralamanızı ve stratejinizi belirleyin.</p>
              <ul className="feature-list">
                <li>🎮 117 oyun rotası</li>
                <li>📋 Akıllı sıralama sistemi</li>
                <li>⚡ Hızlı erişim butonları</li>
                <li>🔄 Döngü yönetimi</li>
              </ul>
            </div>
            <button 
              className="hub-button route-planner-button"
              onClick={navigateToRoutePlanner}
            >
              🗺️ Route Planner'a Git
            </button>
          </div>

          {/* Session Card */}
          <div className="hub-card session-card">
            <div className="card-icon">🎯</div>
            <div className="card-content">
              <h2>Session</h2>
              <p>Aktif oyun session'ınızı yönetin ve takip edin. O anlık oynadığınız oyun hakkında işlemler yapın.</p>
              <ul className="feature-list">
                <li>🎮 Aktif oyun takibi</li>
                <li>⏱️ Session süre takibi</li>
                <li>📊 Anlık istatistikler</li>
                <li>🎯 Session hedefleri</li>
              </ul>
            </div>
            <button 
              className="hub-button session-button"
              onClick={navigateToSession}
            >
              🎯 Session'a Git
            </button>
          </div>

          {/* Library Card */}
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
        </div>

        {/* Alt Bilgi */}
        <div className="hub-footer">
          <div className="info-section">
            <h3>💡 İpucu</h3>
            <p>
              Her araç farklı ihtiyaçlar için tasarlanmıştır. İstatistikler için analiz, 
              Route Planner için planlama, Kütüphane için koleksiyon yönetimi kullanın.
            </p>
          </div>
          
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-icon">🎮</span>
              <span className="stat-label">4 Araç</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⚡</span>
              <span className="stat-label">Hızlı Erişim</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📊</span>
              <span className="stat-label">Detaylı Analiz</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GameTrackingHub;