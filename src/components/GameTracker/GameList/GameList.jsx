import React, { useState } from 'react';
import './GameList.css';

/**
 * Oyun listesi bileşeni - Banner tabanlı 9:16 oranında kartlar
 */
function GameList({
  games,
  filteredGames,
  selectedGames,
  onGameSelect,
  onGameEdit,
  onGameDelete,
  onGameStatusChange,
  onBulkStatusChange,
  onBulkDelete,
  showGameUpdate,
  showAchievement
}) {
  const displayGames = filteredGames || games;
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 8; // 8 oyun per sayfa (2x4 grid)
  
  // Sayfalama hesaplamaları
  const totalPages = Math.ceil(displayGames.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = displayGames.slice(startIndex, endIndex);

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

      {/* Oyun Grid'i - Banner Kartlar */}
      <div className="games-banner-grid">
        {currentGames.map((game, index) => (
          <div 
            key={startIndex + index} 
            className={`game-banner-card ${selectedGames.has(startIndex + index) ? 'selected' : ''}`}
          >
            {/* Seçim Checkbox'ı */}
            <div className="game-banner-select">
              <input 
                type="checkbox"
                checked={selectedGames.has(startIndex + index)}
                onChange={(e) => handleSingleSelect(index, e.target.checked)}
              />
            </div>

            {/* Banner Arka Plan */}
            <div 
              className="game-banner-background"
              style={{
                backgroundImage: game.image ? `url(${game.image})` : 'none',
                backgroundColor: game.image ? 'transparent' : '#1a1a2e'
              }}
            >
              {/* Gradient Overlay */}
              <div className="game-banner-overlay"></div>
              
              {/* Banner İçerik */}
              <div className="game-banner-content">
                {/* Oyun Adı */}
                <h3 className="game-banner-title">{game.title || game.name}</h3>
                
                {/* Aksiyon Butonları */}
                <div className="game-banner-actions">
                  <button 
                    className="banner-action-btn edit-btn"
                    onClick={() => onGameEdit(game)}
                    title="Düzenle"
                  >
                    ✏️
                  </button>
                  <button 
                    className="banner-action-btn delete-btn"
                    onClick={() => handleGameDelete(index)}
                    title="Sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Placeholder Icon (eğer resim yoksa) */}
              {!game.image && (
                <div className="game-banner-placeholder">
                  🎮
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Önceki
          </button>
          
          <div className="pagination-info">
            <span>Sayfa {currentPage} / {totalPages}</span>
            <span className="pagination-details">
              ({startIndex + 1}-{Math.min(endIndex, displayGames.length)} / {displayGames.length} oyun)
            </span>
          </div>
          
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sonraki →
          </button>
        </div>
      )}
    </div>
  );
}

export default GameList;