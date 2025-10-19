import React, { useState } from 'react';
import './GameList.css';

/**
 * Oyun listesi bileşeni - Kütüphanedeki oyunları grid formatında listeler
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
  const gamesPerPage = 4; // Maksimum 4 oyun per sayfa
  
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

  // Durum değiştirme
  const handleStatusChange = (game, newStatus, gameIndex) => {
    const actualIndex = startIndex + gameIndex;
    onGameStatusChange(game, newStatus, actualIndex);
  };

  // Oyun silme
  const handleGameDelete = (gameIndex) => {
    const actualIndex = startIndex + gameIndex;
    onGameDelete(actualIndex);
  };

  // Durum renkleri
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4ade80';
      case 'playing': return '#3b82f6';
      case 'paused': return '#f59e0b';
      case 'not-started': return '#6b7280';
      default: return '#6b7280';
    }
  };

  // Durum metni
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'playing': return 'Oynuyor';
      case 'paused': return 'Duraklatıldı';
      case 'not-started': return 'Başlanmadı';
      default: return 'Belirsiz';
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

      {/* Toplu İşlemler */}
      {selectedGames.size > 0 && (
        <div className="bulk-operations">
          <div className="bulk-info">
            <span className="selected-count">{selectedGames.size} oyun seçildi</span>
          </div>
          <div className="bulk-actions">
            <button 
              className="bulk-btn status-btn"
              onClick={() => onBulkStatusChange('playing')}
              title="Seçili oyunları 'Oynuyor' yap"
            >
              🎮 Oynuyor Yap
            </button>
            <button 
              className="bulk-btn status-btn"
              onClick={() => onBulkStatusChange('completed')}
              title="Seçili oyunları 'Tamamlandı' yap"
            >
              ✅ Tamamlandı Yap
            </button>
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

      {/* Oyun Grid'i */}
      <div className="games-grid">
        {currentGames.map((game, index) => (
          <div 
            key={startIndex + index} 
            className={`game-card ${selectedGames.has(startIndex + index) ? 'selected' : ''}`}
          >
            {/* Seçim Checkbox'ı */}
            <div className="game-card-select">
              <input 
                type="checkbox"
                checked={selectedGames.has(startIndex + index)}
                onChange={(e) => handleSingleSelect(index, e.target.checked)}
              />
            </div>

            {/* Oyun Görseli */}
            <div className="game-card-image">
              {game.image ? (
                <img src={game.image} alt={game.title || game.name} />
              ) : (
                <div className="game-card-placeholder">
                  🎮
                </div>
              )}
            </div>

            {/* Oyun Bilgileri */}
            <div className="game-card-info">
              <h3 className="game-card-title">{game.title || game.name}</h3>
              
              <div className="game-card-details">
                <div className="game-detail">
                  <span className="detail-label">Platform:</span>
                  <span className="detail-value">{game.platform || 'Belirsiz'}</span>
                </div>
                
                <div className="game-detail">
                  <span className="detail-label">Tür:</span>
                  <span className="detail-value">{game.genre || 'Belirsiz'}</span>
                </div>
                
                <div className="game-detail">
                  <span className="detail-label">Durum:</span>
                  <span 
                    className="detail-value status-badge"
                    style={{ backgroundColor: getStatusColor(game.status) }}
                  >
                    {getStatusText(game.status)}
                  </span>
                </div>

                {game.progress !== undefined && (
                  <div className="game-detail">
                    <span className="detail-label">İlerleme:</span>
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${game.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{game.progress || 0}%</span>
                    </div>
                  </div>
                )}

                {game.lastPlayed && (
                  <div className="game-detail">
                    <span className="detail-label">Son Oynanma:</span>
                    <span className="detail-value">{game.lastPlayed}</span>
                  </div>
                )}
              </div>

              {/* Durum Değiştirme Butonları */}
              <div className="game-card-status-buttons">
                <button 
                  className={`status-btn ${game.status === 'not-started' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(game, 'not-started', index)}
                  title="Başlanmadı"
                >
                  ⏸️
                </button>
                <button 
                  className={`status-btn ${game.status === 'playing' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(game, 'playing', index)}
                  title="Oynuyor"
                >
                  🎮
                </button>
                <button 
                  className={`status-btn ${game.status === 'paused' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(game, 'paused', index)}
                  title="Duraklatıldı"
                >
                  ⏯️
                </button>
                <button 
                  className={`status-btn ${game.status === 'completed' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(game, 'completed', index)}
                  title="Tamamlandı"
                >
                  ✅
                </button>
              </div>

              {/* Aksiyon Butonları */}
              <div className="game-card-actions">
                <button 
                  className="action-btn edit-btn"
                  onClick={() => onGameEdit(game)}
                  title="Düzenle"
                >
                  ✏️
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleGameDelete(index)}
                  title="Sil"
                >
                  🗑️
                </button>
              </div>
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