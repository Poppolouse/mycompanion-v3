import React, { useMemo } from 'react';
import './CycleListItem.css';

/**
 * CycleListItem - Wireframe uyumlu kompakt cycle görüntüleme component'i
 * Tek satır kompakt tasarım + genişletilebilir oyun listesi
 */
function CycleListItem({ 
  cycle, 
  onEditCycle, 
  onDeleteCycle, 
  onEditGame, 
  onDeleteGame, 
  onAddGame,
  isExpanded = false,
  onToggleExpand,
  isSelected = false,
  onSelect,
  isBulkSelectMode = false
}) {
  // Cycle istatistikleri hesaplama
  const cycleStats = useMemo(() => {
    if (!cycle?.games) return { totalGames: 0, totalHours: 0, avgProgress: 0, lastPlayed: null };
    
    const games = cycle.games.filter(game => game.name); // Sadece dolu oyunlar
    const totalGames = games.length;
    const totalHours = games.reduce((sum, game) => sum + (game.playTime || game.estimatedHours || 0), 0);
    const avgProgress = totalGames > 0 ? games.reduce((sum, game) => sum + (game.progress || 0), 0) / totalGames : 0;
    
    // Son oynama tarihi
    const lastPlayedDates = games
      .map(game => game.lastPlayed)
      .filter(date => date)
      .sort((a, b) => new Date(b) - new Date(a));
    
    const lastPlayed = lastPlayedDates.length > 0 ? lastPlayedDates[0] : null;
    
    return { totalGames, totalHours, avgProgress, lastPlayed };
  }, [cycle?.games]);

  // Event handler'lar
  const handleToggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand(cycle.id);
    }
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(cycle.id);
    }
  };

  const handleEditCycle = (e) => {
    e.stopPropagation();
    if (onEditCycle) {
      onEditCycle(cycle);
    }
  };

  const handleDeleteCycle = (e) => {
    e.stopPropagation();
    if (onDeleteCycle) {
      onDeleteCycle(cycle);
    }
  };

  const handleEditGame = (game) => {
    if (onEditGame) {
      onEditGame(game);
    }
  };

  const handleDeleteGame = (game) => {
    if (onDeleteGame) {
      onDeleteGame(game);
    }
  };

  const handleAddGame = () => {
    if (onAddGame) {
      onAddGame(cycle);
    }
  };

  // Son oynama tarihini formatla
  const formatLastPlayed = (date) => {
    if (!date) return null;
    const now = new Date();
    const playDate = new Date(date);
    const diffDays = Math.floor((now - playDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    return playDate.toLocaleDateString('tr-TR');
  };

  return (
    <div className={`cycle-list-item ${isExpanded ? 'expanded' : ''} ${isSelected ? 'selected' : ''} ${isBulkSelectMode ? 'bulk-select-mode' : ''}`}>
      
      {/* Wireframe Uyumlu Kompakt Header */}
      <div className="cycle-header" onClick={handleToggleExpand}>
        
        {/* Sol Taraf - Checkbox + Expand + Title */}
        <div className="cycle-header-left">
          {isBulkSelectMode && (
            <div className="cycle-checkbox" onClick={handleSelect}>
              <input 
                type="checkbox" 
                checked={isSelected}
                onChange={() => {}}
              />
            </div>
          )}
          
          <div className="cycle-expand-icon">
            {isExpanded ? '▼' : '▶'}
          </div>
          
          <div className="cycle-title">
            {cycle.name || `Cycle ${cycle.cycleNumber || cycle.id}`}
          </div>
        </div>

        {/* Orta - Stats (Wireframe'deki bilgiler) */}
        <div className="cycle-stats">
          <span className="cycle-stat">{cycleStats.totalGames} games</span>
          <span className="cycle-stat">{Math.round(cycleStats.totalHours)}h total</span>
          {cycleStats.lastPlayed && (
            <span className="cycle-stat">Last: {formatLastPlayed(cycleStats.lastPlayed)}</span>
          )}
        </div>

        {/* Progress Bar - Wireframe'deki gibi */}
        <div className="cycle-progress-container">
          <div className="cycle-progress-bar">
            <div 
              className="cycle-progress-fill"
              style={{ width: `${Math.round(cycleStats.avgProgress)}%` }}
            />
          </div>
          <span className="cycle-progress-text">
            {Math.round(cycleStats.avgProgress)}%
          </span>
        </div>

        {/* Sağ Taraf - Status + Actions */}
        <div className="cycle-header-right">
          <div className={`cycle-status ${(cycle.status || 'active').toLowerCase()}`}>
            {cycle.status || 'Active'}
          </div>
          
          <div className="cycle-actions">
            <button 
              className="cycle-action-btn edit"
              onClick={handleEditCycle}
              title="Cycle'ı Düzenle"
            >
              ✏
            </button>
            <button 
              className="cycle-action-btn delete"
              onClick={handleDeleteCycle}
              title="Cycle'ı Sil"
            >
              🗑
            </button>
          </div>
        </div>
      </div>

      {/* Genişletilmiş İçerik - Wireframe'deki gibi */}
      {isExpanded && (
        <div className="cycle-expanded-content">
          
          {/* Oyunlar Başlığı + Ekle Butonu */}
          <div className="cycle-games-header">
            <div className="cycle-games-title">
              🎮 Cycle Oyunları
            </div>
            <button 
              className="cycle-add-game"
              onClick={handleAddGame}
            >
              + Ekle
            </button>
          </div>
          
          {/* Oyun Listesi - Wireframe'deki gibi kompakt */}
          <div className="cycle-games-list">
            {cycle.games && cycle.games.length > 0 ? (
              cycle.games
                .filter(game => game.name) // Sadece dolu oyunları göster
                .map((game, index) => (
                  <div key={game.id || index} className="cycle-game-item">
                    
                    {/* Oyun Bilgileri - Sol taraf */}
                    <div className="cycle-game-info">
                      <div className="cycle-game-name">{game.name}</div>
                    </div>
                    
                    {/* Oyun Progress - Wireframe'deki gibi */}
                    <div className="cycle-game-progress">
                      <div className="cycle-game-progress-bar">
                        <div 
                          className="cycle-game-progress-fill"
                          style={{ width: `${game.progress || 0}%` }}
                        />
                      </div>
                      <span className="cycle-game-progress-text">
                        {game.progress || 0}%
                      </span>
                    </div>
                    
                    {/* Oyun Meta Bilgileri */}
                    <div className="cycle-game-meta">
                      <span className="cycle-game-hours">
                        {game.playTime || game.estimatedHours || 0}h
                      </span>
                      <span className={`cycle-game-type ${(game.genre || 'rpg').toLowerCase()}`}>
                        {game.genre || 'RPG'}
                      </span>
                    </div>
                    
                    {/* Oyun Aksiyonları */}
                    <div className="cycle-game-actions">
                      <button 
                        className="cycle-game-action-btn"
                        onClick={() => handleEditGame(game)}
                        title="Oyunu Düzenle"
                      >
                        ✏
                      </button>
                      <button 
                        className="cycle-game-action-btn"
                        onClick={() => handleDeleteGame(game)}
                        title="Oyunu Sil"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              // Boş durum - Wireframe'de yok ama gerekli
              <div className="cycle-game-item" style={{ justifyContent: 'center', fontStyle: 'italic', color: 'rgba(255,255,255,0.5)' }}>
                Bu cycle'da henüz oyun yok
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CycleListItem;