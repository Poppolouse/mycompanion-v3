import React, { useState, useEffect, useRef } from 'react';
import { searchGames, debounce } from '../../api/gameApi';
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
  const searchInputRef = useRef(null);

  // Debounced search fonksiyonu
  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (query.length >= 3) {
        await performSearch(query);
      }
    }, 500)
  ).current;

  // Modal açıldığında input'a focus
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // ESC tuşu ile modal kapatma
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Arama terimi değiştiğinde otomatik arama (debounced)
  useEffect(() => {
    if (searchTerm.length >= 3) {
      debouncedSearch(searchTerm);
    } else {
      setSearchResults([]);
      setError(null);
      setIsLoading(false);
    }
  }, [searchTerm, debouncedSearch]);

  // Oyun arama fonksiyonu
  const performSearch = async (query) => {
    console.log('🔍 Oyun arama başlatıldı:', query);
    setIsLoading(true);
    setError(null);

    try {
      // Gerçek API çağrısı
      console.log('📡 API çağrısı yapılıyor...');
      const results = await searchGames(query, 10);
      console.log('✅ API sonucu:', results);
      console.log('📊 Bulunan oyun sayısı:', results?.length || 0);
      setSearchResults(results);
    } catch (err) {
      console.error('❌ Oyun arama hatası:', err);
      setError('Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
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
    <div className="game-search-modal-overlay" onClick={handleClose}>
      <div className="game-search-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h2>🎮 Oyun Ara</h2>
          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* Arama Kutusu */}
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
            {searchTerm && (
              <button 
                className="clear-btn"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
          
          {searchTerm.length > 0 && searchTerm.length < 3 && (
            <p className="search-hint">
              En az 3 karakter yazın...
            </p>
          )}
        </div>

        {/* Arama Sonuçları */}
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
              <small>Farklı bir arama terimi deneyin</small>
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
                    <img src={game.image} alt={game.title} />
                  </div>
                  <div className={styles.gameInfo}>
                    <h3 className={styles.gameTitle}>{game.title}</h3>
                    <p className="game-developer">{game.developer}</p>
                    <div className="game-meta">
                      <span className="game-year">{game.year}</span>
                      <span className={styles.gameGenre}>{game.genre}</span>
                      <span className={styles.gamePlatform}>{game.platform}</span>
                    </div>
                    <p className="game-description">{game.description}</p>
                  </div>
                  <div className="select-indicator">
                    <span>➤</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <p className="footer-hint">
            💡 Oyunu seçtikten sonra bilgiler otomatik olarak doldurulacak
          </p>
        </div>
      </div>
    </div>
  );
}

export default GameSearchModal;
