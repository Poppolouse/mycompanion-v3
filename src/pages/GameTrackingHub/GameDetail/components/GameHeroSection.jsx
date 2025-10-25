import React, { useState, useEffect, useRef } from 'react';
import { getGameImage } from '../../../../utils/imageUtils';
import { getGameDescription, clearDescriptionCache } from '../../../../api/gameDescriptionApi';
import TranslationDisclaimer from '../../../../components/TranslationDisclaimer';
import './GameHeroSection.css';

/**
 * GameHeroSection - Oyun detay sayfasının hero bölümü
 * Wireframe'e göre tasarlanmış:
 * - Sol: Kapak görseli + screenshot thumbnails
 * - Sağ: Oyun bilgileri, meta veriler, aksiyon butonları
 * - Responsive tasarım (mobile'da dikey düzen)
 */
function GameHeroSection({ game, gameStats, onGoBack, onToggleFavorite }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);
  const [gameDescription, setGameDescription] = useState(null);
  const [descriptionLoading, setDescriptionLoading] = useState(false);
  const [descriptionError, setDescriptionError] = useState(null);
  
  // 🎭 Animasyon state'leri
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Oyun görselleri (kapak + screenshot'lar)
  const gameImages = [
    getGameImage(game, 'cover'),
    ...(game.screenshots || []).slice(0, 4) // İlk 4 screenshot
  ];

  // Oyun açıklamasını çek
  useEffect(() => {
    async function fetchDescription() {
      if (!game?.title) return;
      
      console.log('🎮 GameHeroSection - Oyun bilgileri:', {
        title: game.title,
        id: game.id,
        gameObject: game
      });
      
      // Her yeni oyun için cache'i temizle
      if (game?.title) {
        clearDescriptionCache();
        console.log('🗑️ Cache temizlendi, yeni açıklama çekiliyor...');
      }
      
      setDescriptionLoading(true);
      setDescriptionError(null);
      setGameDescription(null); // Önceki açıklamayı temizle
      
      try {
        console.log(`🔍 Açıklama çekiliyor: "${game.title}" (ID: ${game.id})`);
        const description = await getGameDescription(game.title, game.id);
        console.log('✅ Açıklama alındı:', description);
        setGameDescription(description);
      } catch (error) {
        console.error('❌ Açıklama çekme hatası:', error);
        setDescriptionError({
          message: 'Oyun açıklaması yüklenirken bir hata oluştu',
          canRetry: true,
          details: error.message
        });
      } finally {
        setDescriptionLoading(false);
      }
    }

    fetchDescription();
  }, [game?.title, game?.id]);

  // Açıklama yeniden deneme fonksiyonu
  const retryDescription = () => {
    setGameDescription(null);
    setDescriptionError(null);
    // useEffect tekrar çalışacak
  };

  // Metacritic puanı renk hesaplama
  const getMetacriticColor = (score) => {
    if (score >= 75) return 'var(--score-excellent)'; // Yeşil
    if (score >= 50) return 'var(--score-good)'; // Sarı
    return 'var(--score-poor)'; // Kırmızı
  };



  // 🎬 Animasyon Sequence
  useEffect(() => {
    // Component mount olduğunda animasyonları başlat
    setIsVisible(true);
    
    const animationSequence = [
      () => setAnimationPhase(1), // Title fade-in
      () => setAnimationPhase(2), // Meta info slide-in
      () => setAnimationPhase(3), // Score badge pop-in
      () => setAnimationPhase(4), // Description show
    ];
    
    animationSequence.forEach((animation, index) => {
      setTimeout(animation, index * 300);
    });
  }, []);

  // Platform ikonları
  const getPlatformIcon = (platform) => {
    const platformIcons = {
      'PC': '🖥️',
      'PlayStation': '🎮',
      'Xbox': '🎮',
      'Nintendo': '🎮',
      'Steam': '🟦',
      'Epic Games': '⚫',
      'Origin': '🟠',
      'Uplay': '🔵'
    };
    return platformIcons[platform] || '🎮';
  };

  return (
    <section className={`hero-section ${isVisible ? 'hero-visible' : ''}`}>
      {/* Arka plan görseli */}
      <div className="hero-background">
        <img 
          src={getGameImage(game, 'background')} 
          alt={game.title}
          className="hero-bg-image"
        />
        <div className="hero-overlay"></div>
      </div>

      {/* Ana içerik */}
      <div className="hero-content">
        {/* Sol taraf - Kapak ve galeri */}
        <div className="hero-left">
          {/* Ana kapak görseli */}
          <div className="cover-container">
            <img 
              src={gameImages[selectedImageIndex]}
              alt={game.title}
              className="cover-image"
              onClick={() => setShowFullscreenGallery(true)}
            />
            <div className="cover-overlay">
              <span className="zoom-icon">🔍</span>
            </div>
          </div>


        </div>

        {/* Sağ taraf - Oyun bilgileri */}
        <div className="hero-right">
          {/* Header - Geri buton ve favori */}
          <div className="hero-header">
            <button onClick={onGoBack} className="back-button">
              ← Geri Dön
            </button>
            <button 
              onClick={onToggleFavorite}
              className={`favorite-button ${gameStats?.isFavorite ? 'favorited' : ''}`}
            >
              {gameStats?.isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Oyun başlığı */}
          <h1 className={`game-title ${animationPhase >= 1 ? 'title-visible' : ''}`}>
            {game.title}
          </h1>

          {/* Meta bilgiler */}
          <div className={`game-meta ${animationPhase >= 2 ? 'meta-visible' : ''}`}>
            <span className="developer">{game.developer || game.gelistirici || 'Bilinmeyen Geliştirici'}</span>
            <span className="separator">•</span>
            <span className="release-date">{game.releaseDate || game.yil || 'Bilinmeyen Tarih'}</span>
            <span className="separator">•</span>
            <span className="platform">{game.platform || game.sistem || 'PC'}</span>
          </div>

          {/* Metacritic puanı */}
          {game.metacriticScore && (
            <div className={`metacritic-score ${animationPhase >= 3 ? 'score-visible' : ''}`}>
              <div 
                className="score-badge score-badge-animated"
                style={{ backgroundColor: getMetacriticColor(game.metacriticScore) }}
              >
                {game.metacriticScore}
              </div>
              <span className="score-label">Metacritic</span>
            </div>
          )}

          {/* Oyun Konusu */}
          <div className={`game-description-section ${animationPhase >= 4 ? 'description-visible' : ''}`}>
            {descriptionLoading ? (
              <div className="description-loading">
                <span className="loading-spinner-small"></span>
                <span>Oyun konusu yükleniyor...</span>
              </div>
            ) : descriptionError ? (
              <div className="description-error">
                <span className="error-icon">⚠️</span>
                <div className="error-content">
                  <span className="error-message">{descriptionError.message}</span>
                  {descriptionError.canRetry && (
                    <button 
                      className="retry-button"
                      onClick={retryDescription}
                      title="Tekrar dene"
                    >
                      🔄 Tekrar Dene
                    </button>
                  )}
                </div>
              </div>
            ) : gameDescription ? (
              <div className="game-description">
                <p className="description-text">
                  {gameDescription.description}
                </p>
                {gameDescription.isTranslated && (
                  <TranslationDisclaimer 
                    source={gameDescription.originalSource || gameDescription.source}
                    size="small"
                    position="bottom"
                  />
                )}
              </div>
            ) : (
              <div className="description-not-found">
                <span className="no-description-icon">📝</span>
                <span>Bu oyun için açıklama bulunamadı</span>
              </div>
            )}
          </div>

          {/* Tagline */}
          {game.tagline && (
            <p className="game-tagline">"{game.tagline}"</p>
          )}

          {/* Ana aksiyon butonları */}
          <div className="hero-actions">
            <button className="primary-action-btn">
              ▶️ Oyunu Başlat
            </button>
            
            <div className="secondary-actions">
              <button className="secondary-btn">
                📊 İstatistikler
              </button>
              <button className="secondary-btn">
                ⭐ Değerlendir
              </button>
              <button className="secondary-btn">
                📝 Not Ekle
              </button>
              <button className="secondary-btn">
                🔗 Paylaş
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen galeri modal */}
      {showFullscreenGallery && (
        <div className="fullscreen-gallery" onClick={() => setShowFullscreenGallery(false)}>
          <div className="gallery-content" onClick={e => e.stopPropagation()}>
            <button 
              className="close-gallery"
              onClick={() => setShowFullscreenGallery(false)}
            >
              ✕
            </button>
            <img 
              src={gameImages[selectedImageIndex]}
              alt={game.title}
              className="fullscreen-image"
            />
            <div className="gallery-nav">
              {gameImages.map((_, index) => (
                <button
                  key={index}
                  className={`nav-dot ${selectedImageIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default GameHeroSection;