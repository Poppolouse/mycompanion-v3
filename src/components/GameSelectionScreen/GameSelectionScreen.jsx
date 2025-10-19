import React, { useState, useEffect } from 'react';
import styles from './GameSelectionScreen.module.css';

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

  // Mock oyun verisi - gerçek uygulamada API'den gelecek
  const mockGames = [
    {
      id: 1,
      name: 'The Witcher 3: Wild Hunt',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp',
      genre: 'RPG',
      platform: 'PC',
      lastPlayed: '2024-01-15',
      isRecommended: true
    },
    {
      id: 2,
      name: 'Cyberpunk 2077',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2n13.webp',
      genre: 'RPG',
      platform: 'PC',
      lastPlayed: '2024-01-14',
      isRecommended: true
    },
    {
      id: 3,
      name: 'Red Dead Redemption 2',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp',
      genre: 'Action',
      platform: 'PC',
      lastPlayed: '2024-01-13',
      isRecommended: false
    },
    {
      id: 4,
      name: 'God of War',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.webp',
      genre: 'Action',
      platform: 'PC',
      lastPlayed: '2024-01-12',
      isRecommended: true
    },
    {
      id: 5,
      name: 'Horizon Zero Dawn',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1u8k.webp',
      genre: 'Action RPG',
      platform: 'PC',
      lastPlayed: null,
      isRecommended: true
    },
    {
      id: 6,
      name: 'Death Stranding',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1sxd.webp',
      genre: 'Action',
      platform: 'PC',
      lastPlayed: null,
      isRecommended: true
    },
    {
      id: 7,
      name: 'Elden Ring',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
      genre: 'Action RPG',
      platform: 'PC',
      lastPlayed: null,
      isRecommended: true
    },
    {
      id: 8,
      name: 'Spider-Man Remastered',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5w2z.webp',
      genre: 'Action',
      platform: 'PC',
      lastPlayed: null,
      isRecommended: false
    },
    {
      id: 9,
      name: 'Assassins Creed Valhalla',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2a64.webp',
      genre: 'Action RPG',
      platform: 'PC',
      lastPlayed: null,
      isRecommended: false
    },
    {
      id: 10,
      name: 'Control',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vg3.webp',
      genre: 'Action',
      platform: 'PC',
      lastPlayed: null,
      isRecommended: false
    },
    {
      id: 11,
      name: 'Hades',
      image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2dqb.webp',
      genre: 'Roguelike',
      platform: 'PC',
      lastPlayed: null,
      isRecommended: false
    }
  ];

  // Filtrelenmiş oyunlar
  const filteredGames = mockGames.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Son oynanan oyunlar (4 adet)
  const recentGames = mockGames
    .filter(game => game.lastPlayed)
    .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
    .slice(0, 4);

  // Önerilen oyunlar (8 adet)
  const recommendedGames = mockGames
    .filter(game => game.isRecommended)
    .slice(0, 8);

  // Sayfalama için oyunlar
  const gamesPerPage = 16; // 4x4 grid
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const paginatedGames = filteredGames.slice(startIndex, startIndex + gamesPerPage);

  useEffect(() => {
    // Simüle edilmiş loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
            </div>
            
            {/* Oyun seçimini kapat butonu */}
            <button 
              className={styles.closeSearchButton}
              onClick={onClose}
              aria-label="Oyun seçimini kapat"
            >
              Vazgeç
            </button>
            
            {/* Filter Buttons */}
            <div className={styles.filterButtons}>
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