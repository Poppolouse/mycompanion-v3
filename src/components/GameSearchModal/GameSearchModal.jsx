import React, { useState, useEffect, useRef } from 'react';
import { searchGames, debounce } from '../../api/gameApi';
import FloatingApiHelp from '../FloatingApiHelp';
import styles from './GameSearchModal.module.css';

/**
 * GameSearchModal - Oyun arama modal bileşeni
 * 
 * @param {boolean} isOpen - Modal açık mı?
 * @param {Function} onClose - Modal kapatma handler
 * @param {Function} onGameSelect - Oyun seçme handler
 */
function GameSearchModal({ isOpen, onClose, onGameSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('options'); // 'options' veya 'search'
  const searchInputRef = useRef(null);

  // Debounced search fonksiyonu
  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (query.length >= 3) {
        await performSearch(query);
      }
    }, 500)
  ).current;

  // Modal açıldığında input'a focus ve viewMode sıfırlama
  useEffect(() => {
    if (isOpen) {
      setViewMode('options'); // Modal açıldığında seçenekleri göster
      setSearchTerm('');
      setSearchResults([]);
      setError(null);
    }
  }, [isOpen]);

  // Search term değiştiğinde debounced search çalıştır
  useEffect(() => {
    if (searchTerm.length >= 3) {
      debouncedSearch(searchTerm);
    } else {
      setSearchResults([]);
      setError(null);
    }
  }, [searchTerm, debouncedSearch]);

  // ESC tuşu ile modal kapatma
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen]);

  // Arama fonksiyonu
  const performSearch = async (query) => {
    console.log('🔍 Arama başlatılıyor:', query);
    setIsLoading(true);
    setError(null);

    try {
      const results = await searchGames(query);
      console.log('📊 Arama sonuçları:', results);
      setSearchResults(results);
      
      if (results.length === 0) {
        console.log('❌ Sonuç bulunamadı');
      }
    } catch (err) {
      console.error('💥 Arama hatası:', err);
      setError('Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
      console.log('🏁 Arama tamamlandı');
    }
  };

  // Modal kapatma
  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    setError(null);
    onClose();
  };

  // Oyun seçimi
  const handleGameSelect = (game) => {
    onGameSelect(game);
    handleClose();
  };

  // Modal açık değilse render etme
  if (!isOpen) return null;

  return (
    <>
      <div className="game-search-modal-overlay" onClick={handleClose}>
      <div className="game-search-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h2>🎮 Oyun Ekle</h2>
          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* Oyun Ekleme Seçenekleri */}
        {viewMode === 'options' && (
          <div className={styles.addGameOptions}>
            <div className={styles.optionCard} onClick={() => setViewMode('search')}>
              <div className={styles.optionIcon}>🔍</div>
              <h3>Tek Oyun Ara</h3>
              <p>Oyun adı ile arayarak tek bir oyun ekleyin</p>
            </div>
            
            <div className={styles.optionCard}>
              <div className={styles.optionIcon}>📊</div>
              <h3>Excel ile Toplu Ekle</h3>
              <p>Excel dosyası yükleyerek birden fazla oyun ekleyin</p>
              <small className={styles.comingSoon}>Yakında...</small>
            </div>
          </div>
        )}

        {/* Geri Dön Butonu */}
        {viewMode === 'search' && (
          <div className={styles.backButton}>
            <button onClick={() => setViewMode('options')} className={styles.backBtn}>
              ← Geri Dön
            </button>
          </div>
        )}

        {/* Arama Kutusu */}
        {viewMode === 'search' && (
          <div className="search-container">
            <div className={styles.searchInputWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Oyun adı yazın... (en az 3 karakter)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            {searchTerm.length > 0 && searchTerm.length < 3 && (
              <p className="search-hint">
                En az 3 karakter yazın...
              </p>
            )}
          </div>
        )}



        {/* Arama Sonuçları */}
        {viewMode === 'search' && (
          <div className="search-results">
            {isLoading && (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner}></div>
                <p>Oyunlar aranıyor...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {!isLoading && !error && searchResults.length === 0 && searchTerm.length >= 3 && (
              <div className={styles.noResults}>
                <span className="no-results-icon">🎮</span>
                <p>"{searchTerm}" için oyun bulunamadı</p>
                <small>Farklı bir arama terimi deneyin veya yukarıdaki API linklerini kullanın</small>
              </div>
            )}

            {!isLoading && searchResults.length > 0 && (
              <div className="results-list">
                {searchResults.map((game) => (
                  <div
                    key={game.id}
                    className="game-result-item"
                    onClick={() => handleGameSelect(game)}
                  >
                    <div className={styles.gameImage}>
                      {game.image ? (
                        <img 
                          src={game.image} 
                          alt={game.title || game.name}
                          loading="lazy"
                          decoding="async"
                          style={{
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%',
                            borderRadius: '8px'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          onLoad={(e) => {
                            e.target.style.opacity = '1';
                          }}
                          onLoadStart={(e) => {
                            e.target.style.opacity = '0.5';
                          }}
                        />
                      ) : null}
                      <div className={styles.imagePlaceholder} style={{ display: game.image ? 'none' : 'flex' }}>
                        🎮
                      </div>
                    </div>
                    <div className={styles.gameInfo}>
                      <h3 className={styles.gameTitle}>{game.title || game.name}</h3>
                      {game.developer && (
                        <p className={styles.gameDeveloper}>{game.developer}</p>
                      )}
                      <div className={styles.gameMeta}>
                        {game.year && (
                          <span className={styles.gameYear}>{game.year}</span>
                        )}
                        {game.genre && (
                          <span className={styles.gameGenre}>
                            {game.genre.replace(/<[^>]*>/g, '').substring(0, 50)}
                            {game.genre.length > 50 ? '...' : ''}
                          </span>
                        )}
                        {game.platform && (
                          <span className={styles.gamePlatform}>
                            {game.platform.replace(/<[^>]*>/g, '').substring(0, 30)}
                            {game.platform.length > 30 ? '...' : ''}
                          </span>
                        )}
                        {game.rating && (
                          <span className={styles.gameRating}>⭐ {game.rating.toFixed(1)}</span>
                        )}
                        {game.dataSource && (
                          <span className={styles.gameSource}>{game.dataSource.toUpperCase()}</span>
                        )}
                      </div>
                      {game.description && (
                        <p className={styles.gameDescription}>
                          {game.description.length > 150 
                            ? `${game.description.substring(0, 150)}...` 
                            : game.description
                          }
                        </p>
                      )}
                    </div>
                    <div className={styles.selectIndicator}>
                      <span>➤</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="modal-footer">
          <p className="footer-hint">
            💡 Oyunu seçtikten sonra bilgiler otomatik olarak doldurulacak
          </p>
        </div>
      </div>
      </div>
      
      {/* Floating API Help - Modal açıkken modalin sağında görünür */}
      <FloatingApiHelp />
    </>
  );
}

export default GameSearchModal;
