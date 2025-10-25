import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../../contexts/GameContext';
import { useUserStats } from '../../../contexts/UserStatsContext';
import ProfileDropdown from '../../../components/ProfileDropdown';
import { getGameDetails } from '../../../api/gameApi';
import { getGameScreenshots } from '../../../utils/imageUtils';

// Yeni component'ler - Wireframe'lere göre
import GameHeroSection from './components/GameHeroSection';
import QuickStatsCards from './components/QuickStatsCards';
import MediaGallery from './components/MediaGallery';
import DescriptionMedia from './components/DescriptionMedia';
import GenresTags from './components/GenresTags';
import PlatformTech from './components/PlatformTech';
import StatsCommunity from './components/StatsCommunity';
import RelatedGames from './components/RelatedGames';

import './GameDetail.css';

/**
 * GameDetail - Wireframe'lere göre yeniden tasarlanmış oyun detay sayfası
 * 7 ana bölümden oluşur:
 * 1. Hero Section (Kapak, başlık, temel bilgiler)
 * 2. Quick Stats (Metacritic, süre, yaş sınırı, topluluk puanı)
 * 3. Description & Media (Açıklama, galeri, özellikler)
 * 4. Genres & Tags (Türler ve topluluk etiketleri)
 * 5. Platform & Tech (Platformlar, sistem gereksinimleri)
 * 6. Stats & Community (İstatistikler, yorumlar)
 * 7. Related Games (Benzer oyunlar, öneriler)
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

      {/* 1. Hero Section - Kapak, başlık, temel bilgiler */}
      <GameHeroSection 
        game={game}
        gameStats={gameStats}
        onGoBack={handleGoBack}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Ana içerik container */}
      <div className="game-detail-content">
        {/* Media Gallery */}
        <MediaGallery game={game} />

        {/* 2. Quick Stats - Metacritic, süre, yaş sınırı, topluluk puanı */}
        <QuickStatsCards game={game} />

        {/* 3. Description & Media - Açıklama, galeri, özellikler */}
        <DescriptionMedia game={game} />

        {/* 4. Genres & Tags - Türler ve topluluk etiketleri */}
        <GenresTags game={game} />

        {/* 5. Platform & Tech - Platformlar, sistem gereksinimleri */}
        <PlatformTech game={game} />

        {/* 6. Stats & Community - İstatistikler, yorumlar */}
        <StatsCommunity game={game} gameStats={gameStats} />

        {/* 7. Related Games - Benzer oyunlar, öneriler */}
        <RelatedGames game={game} allGames={games} />
      </div>
    </div>
  );
}

export default GameDetail;