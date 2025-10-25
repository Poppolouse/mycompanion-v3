import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { getGameImage, generateGamePlaceholder } from '../../../utils/imageUtils';
import './GameList.css';

/**
 * Oyun listesi bileşeni - Banner tabanlı 9:16 oranında kartlar
 */
function GameList({
  games,
  selectedGames,
  onGameSelect,
  onGameEdit,
  onGameDelete,
  onBulkDelete,
  onBulkStatusUpdate,
  onGameImageUpdate,
  onGameStatusUpdate,
  onGameProgressUpdate,
  onGameNotesUpdate,
  onGameRatingUpdate,
  onGamePlatformUpdate,
  onGameGenreUpdate,
  onGameDeveloperUpdate,
  onGamePublisherUpdate,
  onGameReleaseDateUpdate,
  onGameCompletionDateUpdate,
  onGamePlaytimeUpdate,
  onGamePriceUpdate
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name'); // name, lastPlayed, status
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const gamesPerPage = 8; // 8 oyun per sayfa (2x4 grid)

  // 🖼️ Dinamik resim sistemi için useGame hook'u
  const { 
    updateGameImages,
    filteredGames
  } = useGame();

  // 🚀 Dinamik resim yükleme - oyunlar yüklendiğinde eksik resimleri çek
  useEffect(() => {
    const loadMissingImages = async () => {
      const gamesToUpdate = (filteredGames || games).filter(game => {
        // Resim yoksa veya 7 günden eski ise güncelle
        const hasImages = game.banner || game.background || game.coverImage;
        const isOld = game.lastImageUpdate && 
          (Date.now() - new Date(game.lastImageUpdate).getTime()) > 7 * 24 * 60 * 60 * 1000;
        
        return !hasImages || isOld;
      });

      // Her oyun için resim güncelle (rate limit için 1 saniye bekle)
      for (const game of gamesToUpdate.slice(0, 5)) { // İlk 5 oyun için
        try {
          await updateGameImages(game.id || game.title, game.title || game.name);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
        } catch (error) {
          console.warn(`Resim yüklenemedi: ${game.title}`, error);
        }
      }
    };

    if ((filteredGames || games).length > 0) {
      loadMissingImages();
    }
  }, [filteredGames, games, updateGameImages]);

  // Local sorting - sadece filteredGames'i kullan (üstteki arama ve filtreler)
  const processedGames = useMemo(() => {
    let result = filteredGames || games || [];

    // Sorting
    result = [...result].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = (a.title || a.başlık || '').toLowerCase();
          bValue = (b.title || b.başlık || '').toLowerCase();
          break;

        case 'lastPlayed':
          aValue = new Date(a.lastPlayed || 0);
          bValue = new Date(b.lastPlayed || 0);
          break;
        case 'status':
          aValue = a.status || a.durum || 'Not Started';
          bValue = b.status || b.durum || 'Not Started';
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [games, filteredGames, sortBy, sortOrder]);

  const displayGames = processedGames || [];
  
  // Sayfalama hesaplamaları
  const totalPages = Math.ceil(displayGames.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = displayGames.slice(startIndex, endIndex) || [];

  // Sayfa değiştirme
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Sayfa değiştiğinde seçimleri temizle
    onGameSelect(new Set());
  };

  // Tüm oyunları seç/seçimi kaldır (sadece mevcut sayfa)
  const handleSelectAll = (checked) => {
    if (checked) {
      const currentPageIndices = currentGames.map((_, index) => startIndex + index);
      const newSelected = new Set([...selectedGames, ...currentPageIndices]);
      onGameSelect(newSelected);
    } else {
      const newSelected = new Set(selectedGames);
      currentGames.forEach((_, index) => {
        newSelected.delete(startIndex + index);
      });
      onGameSelect(newSelected);
    }
  };

  // Tek oyun seçimi
  const handleSingleSelect = (gameIndex, selected) => {
    const actualIndex = startIndex + gameIndex;
    const newSelected = new Set(selectedGames);
    if (selected) {
      newSelected.add(actualIndex);
    } else {
      newSelected.delete(actualIndex);
    }
    onGameSelect(newSelected);
  };

  // Oyun silme
  const handleGameDelete = (gameIndex) => {
    const actualIndex = startIndex + gameIndex;
    onGameDelete(actualIndex);
  };

  // Oyun kartına tıklama
  const handleGameClick = (game, gameIndex) => {
    if (onGameClick) {
      const actualIndex = startIndex + gameIndex;
      onGameClick(game, actualIndex);
    }
  };

  if (displayGames.length === 0) {
    return (
      <div className="game-list-empty">
        <div className="empty-icon">🎮</div>
        <h3>Henüz oyun yüklenmedi</h3>
        <p>Oyun eklemek için yukarıdaki butonları kullanabilirsiniz</p>
      </div>
    );
  }

  return (
    <div className="game-list-container">
      {/* Başlık ve Oyun Sayısı */}
      <div className="games-header">
        <h2>📋 Oyun Listesi</h2>
        <div className="games-count">
          {displayGames.length} / {games.length} oyun
        </div>
      </div>

      {/* Sadece Sıralama Kontrolleri - Arama ve Filtreler üstte */}
      <div className="games-controls">
        <div className="sort-section">
          <div className="sort-controls">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">📝 İsme Göre</option>
              <option value="lastPlayed">🕒 Son Oynanana Göre</option>
              <option value="status">📋 Duruma Göre</option>
            </select>
            
            <button
              className={`sort-order-btn ${sortOrder === 'desc' ? 'desc' : 'asc'}`}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Sıralama: ${sortOrder === 'asc' ? 'Artan' : 'Azalan'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Toplu İşlemler */}
      {selectedGames.size > 0 && (
        <div className="bulk-operations">
          <div className="bulk-info">
            <span className="selected-count">{selectedGames.size} oyun seçildi</span>
          </div>
          <div className="bulk-actions">
            <button 
              className="bulk-btn delete-btn"
              onClick={onBulkDelete}
              title="Seçili oyunları sil"
            >
              🗑️ Sil ({selectedGames.size})
            </button>
          </div>
        </div>
      )}

      {/* Toplu Seçim */}
      <div className="bulk-select">
        <label className="bulk-select-label">
          <input 
            type="checkbox" 
            checked={currentGames.every((_, index) => selectedGames.has(startIndex + index)) && currentGames.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
          <span>Bu sayfadaki tüm oyunları seç</span>
        </label>
      </div>

      {/* Modern Oyun Grid'i */}
      <div className="modern-games-grid">
        {currentGames.map((game, index) => (
          <div key={`${game.title || game.name}-${index}`} className="modern-game-card">
            {/* Oyun Poster/Banner */}
            <div 
              className="game-poster"
              style={{
                backgroundImage: `url(${getGameImage(game, 'banner')})`,
              }}
              onClick={() => handleGameClick(game, index)}
            >
              {/* Gradient Overlay */}
              <div className="game-poster-overlay"></div>
              
              {/* Durum Badge */}
              <div className={`game-status-badge status-${game.status?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`}>
                {game.status || 'Bilinmiyor'}
              </div>
              
              {/* Seçim Checkbox */}
              <div className="game-selection-modern">
                <input
                  type="checkbox"
                  className="modern-game-checkbox"
                  checked={selectedGames.has(startIndex + index)}
                  onChange={(e) => handleSingleSelect(index, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              {/* Aksiyon Butonları */}
              <div className="game-actions-modern">
                <button 
                  className="modern-action-btn edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGameEdit(game);
                  }}
                  title="Düzenle"
                >
                  ✏️
                </button>
                <button 
                  className="modern-action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGameDelete(index);
                  }}
                  title="Sil"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Oyun Bilgileri */}
            <div className="game-info-modern">
              <h3 className="game-title-modern">{game.title || game.name}</h3>
              
              <div className="game-meta-modern">
                {game.genre && (
                  <span className="game-genre">{game.genre}</span>
                )}
                {game.developer && (
                  <span className="game-developer">{game.developer}</span>
                )}
              </div>
              

              
              {/* Rating */}
              {game.rating && (
                <div className="game-rating-modern">
                  <span className="rating-stars">
                    {'★'.repeat(Math.floor(game.rating))}
                    {'☆'.repeat(5 - Math.floor(game.rating))}
                  </span>
                  <span className="rating-number">{game.rating}/5</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modern Sayfalama */}
      {totalPages > 1 && (
        <div className="modern-pagination">
          <button 
            className="modern-pagination-btn prev"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span className="pagination-icon">←</span>
            <span className="pagination-text">Önceki</span>
          </button>
          
          <div className="modern-pagination-info">
            <div className="page-indicator">
              <span className="current-page">{currentPage}</span>
              <span className="page-separator">/</span>
              <span className="total-pages">{totalPages}</span>
            </div>
            <div className="items-info">
              {startIndex + 1}-{Math.min(endIndex, displayGames.length)} / {displayGames.length} oyun
            </div>
          </div>
          
          <button 
            className="modern-pagination-btn next"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span className="pagination-text">Sonraki</span>
            <span className="pagination-icon">→</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default GameList;