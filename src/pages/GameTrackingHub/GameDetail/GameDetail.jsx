import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../../contexts/GameContext';
import { useUserStats } from '../../../contexts/UserStatsContext';
import ProfileDropdown from '../../../components/ProfileDropdown';
import { getGameDetails } from '../../../api/gameApi';

// Hero section component'i koruyoruz
import GameHeroSection from './components/GameHeroSection';

import './GameDetail.css';

/**
 * GameDetail - Oyun detay sayfası
 * Hero section ve basit oyun bilgileri içerir:
 * 1. Hero Section (Kapak, başlık, temel bilgiler)
 * 2. Ana İçerik (Açıklama ve detaylar)
 */
function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { games } = useGame();
  const { getGameStats, toggleFavorite } = useUserStats();
  
  // State'ler
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameStats, setGameStats] = useState(null);
  const [dataSource, setDataSource] = useState(null); // 'local' veya 'rawg'

  // Oyun verilerini yükle - Önce yerel veri, yoksa RAWG'den çek
  useEffect(() => {
    const loadGameData = async () => {
      console.log('🔍 GameDetail - Oyun yükleniyor, ID:', id);
      
      try {
        setLoading(true);
        setError(null);
        
        // 1. Önce yerel verilerden ara (localStorage)
        if (games && games.length > 0) {
          const foundGame = games.find(game => 
            game.id == id || 
            game.id === parseInt(id) ||
            game.rawg_id == id ||
            game.rawgId == id
          );
          
          if (foundGame) {
            console.log('✅ Yerel veri bulundu:', foundGame.title || foundGame.name);
            setGame(foundGame);
            setDataSource('local');
            
            // Oyun istatistiklerini yükle
            const stats = getGameStats(foundGame.id);
            setGameStats(stats);
            
            setLoading(false);
            return;
          }
        }
        
        // 2. Yerel veri yoksa RAWG'den çek
        console.log('🌐 Yerel veri bulunamadı, RAWG\'den çekiliyor...');
        
        // ID'nin RAWG ID olup olmadığını kontrol et
        const rawgId = parseInt(id);
        if (isNaN(rawgId)) {
          throw new Error('Geçersiz oyun ID\'si');
        }
        
        const rawgGame = await getGameDetails(rawgId);
        
        if (rawgGame) {
          console.log('✅ RAWG\'den veri alındı:', rawgGame.title);
          
          // RAWG verisini normalize et
          const normalizedGame = {
            id: rawgGame.id,
            title: rawgGame.title || rawgGame.name,
            name: rawgGame.name,
            developer: rawgGame.developer,
            publisher: rawgGame.publisher,
            genre: rawgGame.genre,
            platform: rawgGame.platform,
            year: rawgGame.year,
            releaseDate: rawgGame.release_date,
            rating: rawgGame.rating,
            metacritic: rawgGame.metacritic,
            description: rawgGame.description,
            image: rawgGame.image,
            screenshots: rawgGame.screenshots || [],
            tags: rawgGame.tags || [],
            esrbRating: rawgGame.esrb_rating,
            playtime: rawgGame.playtime,
            website: rawgGame.website,
            redditUrl: rawgGame.reddit_url,
            rawgId: rawgGame.rawg_id || rawgGame.id,
            rawgSlug: rawgGame.rawg_slug,
            rawgUrl: rawgGame.rawg_url,
            dataSource: 'rawg'
          };
          
          setGame(normalizedGame);
          setDataSource('rawg');
          setLoading(false);
        } else {
          throw new Error('RAWG\'de oyun bulunamadı');
        }
        
      } catch (err) {
        console.error('❌ Oyun yükleme hatası:', err);
        setError(err.message || 'Oyun bilgileri yüklenemedi');
        setLoading(false);
      }
    };
    
    if (id) {
      loadGameData();
    }
  }, [id, games, getGameStats]);

  // Navigation fonksiyonları
  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToHub = () => {
    navigate('/game-tracking-hub');
  };

  // Geri dönüş fonksiyonu
  const handleGoBack = () => {
    navigate('/game-tracking-hub');
  };

  // Favori toggle fonksiyonu
  const handleToggleFavorite = () => {
    if (game) {
      toggleFavorite(game.id);
    }
  };

  // Loading durumu
  if (loading) {
    return (
      <div className="game-detail-page">
        <div className="game-detail-loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Oyun bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error || !game) {
    return (
      <div className="game-detail-page">
        <div className="game-detail-error">
          <div className="error-icon">❌</div>
          <h2 className="error-title">Hata</h2>
          <p className="error-message">{error || 'Oyun bulunamadı'}</p>
          <button onClick={handleGoBack} className="retry-button">
            ← Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-detail-page">
      {/* Standart Header */}
      <header className="tracker-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🎮 {game?.title || 'Oyun Detayı'}</h1>
            <p>
              Oyun bilgileri, istatistikler ve topluluk yorumları
              {dataSource && (
                <span className={`data-source-badge ${dataSource}`}>
                  {dataSource === 'local' ? '💾 Yerel Veri' : '🌐 RAWG API'}
                </span>
              )}
            </p>
          </div>
          <div className="header-controls">
            <div className="navigation-buttons">
              <button 
                className="nav-btn"
                onClick={handleGoBack}
                title="Geri Dön"
              >
                ← Geri
              </button>
              <button 
                className="nav-btn hub-btn"
                onClick={handleGoToHub}
                title="Oyun Hub'ına Dön"
              >
                🎯 Oyun Hub
              </button>
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

      {/* Hero Section - Kapak, başlık, temel bilgiler */}
      <GameHeroSection 
        game={game}
        gameStats={gameStats}
        onGoBack={handleGoBack}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Ana içerik container - Çok Yakında */}
      <div className="game-detail-main">
        <div className="coming-soon-container">
          {/* Çok Yakında Ana Başlık */}
          <div className="coming-soon-header">
            <div className="coming-soon-icon">
              <span className="icon-sparkle">✨</span>
              <span className="icon-rocket">🚀</span>
              <span className="icon-star">⭐</span>
            </div>
            <h2 className="coming-soon-title">Çok Yakında</h2>
            <p className="coming-soon-subtitle">
              Bu sayfa için harika özellikler geliştiriyoruz!
            </p>
          </div>

          {/* Gelecek Özellikler Grid */}
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Fiyat Karşılaştırması</h3>
              <p>Farklı platformlardaki fiyatları karşılaştırın ve en uygun fırsatları bulun</p>
              <div className="feature-status status-soon">Yakında</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎮</div>
              <h3>Oyun Galerisi</h3>
              <p>Ekran görüntüleri, videolar ve medya içerikleri</p>
              <div className="feature-status status-soon">Yakında</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Topluluk Yorumları</h3>
              <p>Kullanıcı değerlendirmeleri ve yorumları</p>
              <div className="feature-status status-soon">Yakında</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📰</div>
              <h3>Oyun Haberleri</h3>
              <p>Oyunla ilgili güncel haberler, güncellemeler ve duyurular</p>
              <div className="feature-status status-soon">Yakında</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Genel Bilgiler</h3>
              <p>Oyun hakkında detaylı bilgiler, sistem gereksinimleri ve özellikler</p>
              <div className="feature-status status-soon">Yakında</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Kişisel Öneriler</h3>
              <p>AI destekli oyun önerileri</p>
              <div className="feature-status status-soon">Yakında</div>
            </div>
          </div>

          {/* Alt Bilgi */}
          <div className="coming-soon-footer">
            <div className="progress-indicator">
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '0%'}}></div>
              </div>
              <span className="progress-text">Geliştirme İlerlemesi: %0</span>
            </div>
            <p className="footer-note">
              🔔 Yeni özellikler eklendiğinde bildirim alacaksınız!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameDetail;