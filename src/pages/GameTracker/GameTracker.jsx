import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { readExcelFile, parseGameList } from '../../utils/excelUtils';
import './GameTracker.css';

/**
 * 🎮 Game Tracker - Phase 1: Temel Altyapı
 * Bağımsız oyun takip sayfası
 */
function GameTracker() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Sayfa yüklendiğinde localStorage'dan oyunları yükle
  useEffect(() => {
    const savedGames = localStorage.getItem('gameTracker_games');
    if (savedGames) {
      try {
        const gameList = JSON.parse(savedGames);
        setGames(gameList);
        console.log('📊 LocalStorage\'dan yüklendi:', gameList.length, 'oyun');
      } catch (err) {
        console.error('❌ LocalStorage yükleme hatası:', err);
        localStorage.removeItem('gameTracker_games');
      }
    }
  }, []);

  // Ana sayfaya dönüş
  const handleGoHome = () => {
    navigate('/');
  };

  // Excel dosyası seçme
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Excel dosyası yükleme
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Excel dosyasını oku
      const rawData = await readExcelFile(file);
      
      // Oyun listesi formatına çevir
      const gameList = parseGameList(rawData);
      
      // State'i güncelle
      setGames(gameList);
      
      // LocalStorage'a kaydet
      localStorage.setItem('gameTracker_games', JSON.stringify(gameList));
      
      console.log('📊 Excel yüklendi:', gameList.length, 'oyun');
    } catch (err) {
      console.error('❌ Excel yükleme hatası:', err);
      setError('Excel dosyası yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Oyun detayına git
  const handleGameClick = (gameId) => {
    navigate(`/game-tracker/game/${gameId}`);
  };

  return (
    <div className="game-tracker-page">
      {/* Ana Ekrana Dönüş Tuşu */}
      <button className="home-button" onClick={handleGoHome}>
        🏠 Ana Sayfa
      </button>

      {/* Sayfa Başlığı */}
      <div className="page-header">
        <h1>🎮 Game Tracker</h1>
        <p>Oyun koleksiyonunu takip et</p>
      </div>

      {/* Ana İçerik */}
      <div className="main-content">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {/* Error mesajı */}
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {/* Empty state - oyun yoksa göster */}
        {games.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h2>Henüz oyun listesi yüklenmemiş</h2>
            <p>Excel dosyanızı seçerek oyun takibine başlayın</p>
            <button 
              className="import-button"
              onClick={handleFileSelect}
              disabled={loading}
            >
              {loading ? '⏳ Yükleniyor...' : '📁 Excel Dosyası Seç'}
            </button>
          </div>
        )}

        {/* Oyun listesi - oyunlar varsa göster */}
        {games.length > 0 && (
          <div className="games-list">
            <div className="games-header">
              <h2>Oyun Listesi ({games.length} oyun)</h2>
              <button 
                className="import-button small"
                onClick={handleFileSelect}
                disabled={loading}
              >
                {loading ? '⏳ Yükleniyor...' : '🔄 Yeni Excel Yükle'}
              </button>
            </div>
            
            <div className="games-grid">
              {games.map(game => (
                <div 
                  key={game.id} 
                  className="game-card clickable"
                  onClick={() => handleGameClick(game.id)}
                >
                  <div className="game-header">
                    <h3>{game.title || 'İsimsiz Oyun'}</h3>
                    <span className="game-type">{game.type || 'Bilinmiyor'}</span>
                  </div>
                  
                  <div className="game-info">
                    <div className="info-row">
                      <span className="label">Platform:</span>
                      <span className="value">{game.platform || 'Belirtilmemiş'}</span>
                    </div>
                    
                    <div className="info-row">
                      <span className="label">Durum:</span>
                      <span className="value">{game.status || 'Başlanmadı'}</span>
                    </div>
                    
                    {game.progress && (
                      <div className="info-row">
                        <span className="label">İlerleme:</span>
                        <span className="value">{game.progress}%</span>
                      </div>
                    )}
                  </div>
                  
                  {game.factions && game.factions.length > 0 && (
                    <div className="game-factions">
                      <span className="factions-label">Fraksiyonlar:</span>
                      <div className="factions-list">
                        {game.factions.map((faction, index) => (
                          <span key={index} className="faction-tag">
                            {faction.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Phase Bilgisi */}
      <div className="phase-info">
        <span className="phase-badge">Phase 1: Temel Altyapı</span>
        <span className="status-badge">🚧 Geliştiriliyor</span>
      </div>
    </div>
  );
}

export default GameTracker;