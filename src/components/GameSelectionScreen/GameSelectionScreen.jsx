import React, { useState, useEffect } from 'react';
import styles from './GameSelectionScreen.module.css';
import { useUserGameLibrary } from '../../contexts/UserGameLibraryContext';
import { useGame } from '../../contexts/GameContext';
import { getGameImage } from '../../utils/imageUtils';
import { cleanImageCache, getCacheStats } from '../../api/gameLibraryApi';


/**
 * GameSelectionScreen - Modern ve şık oyun seçim ekranı
 * 
 * Bölümler:
 * 1. Modern Header (başlık + close button)
 * 2. Şık arama çubuğu ve filtreler
 * 3. Son oynanan 4 oyun (9:16 kartlar)
 * 4. Öneriler (yatay scroll ile 7 oyun)
 * 5. Kütüphane (grid layout + sayfalama)
 */
function GameSelectionScreen({ onGameSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isRefreshingImages, setIsRefreshingImages] = useState(false);

  // Context'lerden veri al
  const { userGames, loadUserLibrary } = useUserGameLibrary();
  const { updateAllGameImages } = useGame();

  // Gerçek API kullanılıyor - mock data kaldırıldı

  // 🎮 Gerçek kütüphane verilerini kullan
  const libraryGames = userGames.map(userGame => {
    const game = userGame.game || userGame;
    const gameImage = getGameImage(game, 'cover');
    

    
    return {
      id: game.id || userGame.game_id,
      name: game.title || game.name,
      image: gameImage,
      genre: game.genre || game.genres?.[0] || 'Bilinmiyor',
      platform: game.platform || 'PC',
      lastPlayed: userGame.last_played,
      isRecommended: userGame.rating >= 8 || userGame.is_favorite,
      status: userGame.status,
      progress: userGame.progress_percentage || 0,
      playtime: userGame.playtime_hours || 0
    };
  });
  


  // Filtrelenmiş oyunlar
  const filteredGames = libraryGames.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedGenre === 'all' || game.genre === selectedGenre) &&
    (selectedPlatform === 'all' || game.platform === selectedPlatform)
  );

  // Son oynanan oyunlar (4 adet)
  const recentGames = libraryGames
    .filter(game => game.lastPlayed)
    .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
    .slice(0, 4);

  // Önerilen oyunlar (8 adet) - Favoriler ve yüksek puanlılar
  const recommendedGames = libraryGames
    .filter(game => game.isRecommended)
    .slice(0, 8);

  // 🧹 Cache temizleme fonksiyonları
  const handleRefreshImages = async () => {
    setIsRefreshingImages(true);
    try {
      cleanImageCache();
      await updateAllGameImages();
      await loadUserLibrary();
    } catch (error) {
      console.error('Resim yenileme hatası:', error);
    } finally {
      setIsRefreshingImages(false);
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Tüm resim cache\'i temizlensin mi? Bu işlem geri alınamaz.')) {
      cleanImageCache();
      window.location.reload();
    }
  };

  // Sayfalama için oyunlar
  const gamesPerPage = 16; // 4x4 grid
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const paginatedGames = filteredGames.slice(startIndex, startIndex + gamesPerPage);

  // 🎮 Kütüphane verilerini yükle
  useEffect(() => {
    const loadLibraryData = async () => {
      try {
        await loadUserLibrary();
      } catch (error) {
        console.error('Kütüphane yükleme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLibraryData();
  }, [loadUserLibrary]);



  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterDropdownOpen && !event.target.closest('.searchInputWrapper')) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  const handleGameSelect = (game) => {
    onGameSelect(game);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className={styles.gameSelectionScreen}>
      <main className={styles.gameSelectionContent}>
        {/* Search & Filters Section - Bağımsızlaştırıldı */}
        <section className={styles.searchSectionFullwidth}>
          <div className={styles.searchContainer}>
            {/* Dekoratif oyun elementleri */}
            <div className={styles.gameDecor1}>🎮</div>
            <div className={styles.gameDecor2}>🕹️</div>
            
            <div className={styles.searchInputWrapper}>
              <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                type="text"
                placeholder="Oyun ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              
              {/* Cache Temizleme Butonları */}
              <button 
                className={styles.refreshButton}
                onClick={handleRefreshImages}
                disabled={isRefreshingImages}
                title="Kapak resimlerini yenile"
                aria-label="Kapak resimlerini yenile"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={isRefreshingImages ? styles.spinning : ''}>
                  <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <button 
                className={styles.clearCacheButton}
                onClick={handleClearCache}
                title="Cache'i temizle"
                aria-label="Cache'i temizle"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Filtre Butonu */}
              <button 
                className={styles.filterButton}
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                aria-label="Filtreleri aç/kapat"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              
              {/* Filtre Dropdown */}
              {isFilterDropdownOpen && (
                <div className={styles.filterDropdown}>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Tür:</label>
                    <select 
                      className={styles.filterSelect}
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                    >
                      <option value="all">Tüm Türler</option>
                      <option value="RPG">RPG</option>
                      <option value="Action">Aksiyon</option>
                      <option value="Strategy">Strateji</option>
                      <option value="Adventure">Macera</option>
                    </select>
                  </div>
                  
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Platform:</label>
                    <select 
                      className={styles.filterSelect}
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                    >
                      <option value="all">Tüm Platformlar</option>
                      <option value="PC">PC</option>
                      <option value="PlayStation">PlayStation</option>
                      <option value="Xbox">Xbox</option>
                      <option value="Nintendo">Nintendo</option>
                    </select>
                  </div>
                  
                  {/* Filtreleri Temizle */}
                  <button 
                    className={styles.clearFiltersButton}
                    onClick={() => {
                      setSelectedGenre('all');
                      setSelectedPlatform('all');
                    }}
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              )}
            </div>
            
            {/* Oyun seçimini kapat butonu */}
            <button 
              className={styles.closeSearchButton}
              onClick={onClose}
              aria-label="Oyun seçimini kapat"
            >
              Vazgeç
            </button>
          </div>
        </section>

        {/* Recent Games Section - Bağımsızlaştırıldı */}
        {!searchTerm && recentGames.length > 0 && (
          <section className={styles.recentGamesSectionFullwidth}>
            <h2 className={styles.sectionTitle}>Son Oynanan Oyunlar</h2>
            <div className={styles.recentGamesGrid}>
              {recentGames.map(game => (
                <div
                  key={game.id}
                  className={styles.recentGameCard}
                  onClick={() => handleGameSelect(game)}
                >
                  <div className={styles.gameImageContainer}>
                    <img src={game.image} alt={game.name} />
                    <div className={styles.playOverlay}>
                      <div className={styles.playButton}>▶</div>
                    </div>
                  </div>
                  <div className={styles.gameInfo}>
                    <h3 className={styles.gameTitle}>{game.name}</h3>
                    <span className={styles.gameStatus}>{game.status || 'Oynanıyor'}</span>
                    {game.lastPlayed && (
                      <span className={styles.lastPlayed}>
                        {new Date(game.lastPlayed).toLocaleDateString('tr-TR')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommended Games Section - Bağımsızlaştırıldı */}
        {!searchTerm && recommendedGames.length > 0 && (
          <section className={styles.recommendedGamesSectionFullwidth}>
            <h2 className={styles.sectionTitle}>Önerilen Oyunlar</h2>
            <div className={styles.recommendedGamesGrid}>
              {recommendedGames.map(game => (
                <div
                  key={game.id}
                  className={styles.recommendedGameCard}
                  onClick={() => handleGameSelect(game)}
                >
                  <div className={styles.gameImageContainer}>
                    <img src={game.image} alt={game.name} />
                    <div className={styles.recommendedBadge}>⭐</div>
                    <div className={styles.playOverlay}>
                      <div className={styles.playButton}>▶</div>
                    </div>
                  </div>
                  <div className={styles.gameInfo}>
                    <h3 className={styles.gameTitle}>{game.name}</h3>
                    <span className={styles.gameGenre}>{game.genre}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Library Section */}
        <section className={`${styles.librarySection} ${styles.gameSection}`}>
          <h2 className={styles.sectionTitle}>{searchTerm ? `"${searchTerm}" için sonuçlar` : 'Oyun Kütüphanesi'}</h2>

          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              <p>Oyunlar yükleniyor...</p>
            </div>
          ) : paginatedGames.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎮</div>
              <p>Hiç oyun bulunamadı</p>
            </div>
          ) : (
            <>
              <div className={styles.libraryGamesGrid}>
                {paginatedGames.map(game => (
                  <div
                    key={game.id}
                    className={styles.libraryGameCard}
                    onClick={() => handleGameSelect(game)}
                  >
                    <div className={styles.gameImageContainer}>
                      <img src={game.image} alt={game.name} />
                      <div className={styles.playOverlay}>
                        <div className={styles.playButton}>▶</div>
                      </div>
                    </div>
                    <div className={styles.gameInfo}>
                      <h3 className={styles.gameTitle}>{game.name}</h3>
                      <div className={styles.gameMeta}>
                        <span className={styles.gameGenre}>{game.genre}</span>
                        <span className={styles.gamePlatform}>{game.platform}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.paginationBtn}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ‹ Önceki
                  </button>
                  <div className={styles.paginationInfo}>
                    Sayfa {currentPage} / {totalPages}
                  </div>
                  <button
                    className={styles.paginationBtn}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sonraki ›
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default GameSelectionScreen;