import React, { useMemo } from 'react';
import './LibraryCycleItem.css';

/**
 * LibraryCycleItem - Kütüphane sayfası için özel tasarlanmış cycle component'i
 * Modern, gradient tabanlı, kompakt ve görsel olarak çekici tasarım
 */
function LibraryCycleItem({ 
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
    
    const games = cycle.games.filter(game => game.name);
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

  // Progress rengi hesaplama
  const getProgressColor = (progress) => {
    if (progress < 25) return '#ff6b6b'; // Kırmızı
    if (progress < 50) return '#ffa726'; // Turuncu
    if (progress < 75) return '#42a5f5'; // Mavi
    return '#66bb6a'; // Yeşil
  };

  return (
    <div className={`library-cycle-item ${isExpanded ? 'expanded' : ''} ${isSelected ? 'selected' : ''}`}>
      
      {/* Ana Header - Gradient Background */}
      <div className="library-cycle-header" onClick={handleToggleExpand}>
        
        {/* Sol Taraf - Expand Icon + Title */}
        <div className="library-cycle-left">
          {isBulkSelectMode && (
            <div className="library-cycle-checkbox" onClick={handleSelect}>
              <input 
                type="checkbox" 
                checked={isSelected}
                onChange={() => {}}
              />
            </div>
          )}
          
          <div className="library-cycle-expand">
            <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          </div>
          
          <div className="library-cycle-title">
            <h3>{cycle.name || `Cycle ${cycle.cycleNumber || cycle.id}`}</h3>
            <span className="cycle-subtitle">{cycleStats.totalGames} oyun • {Math.round(cycleStats.totalHours)} saat</span>
          </div>
        </div>

        {/* Orta - Progress Circle */}
        <div className="library-cycle-progress">
          <div className="progress-circle">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r="25"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="4"
              />
              <circle
                cx="30"
                cy="30"
                r="25"
                fill="none"
                stroke={getProgressColor(cycleStats.avgProgress)}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 25}`}
                strokeDashoffset={`${2 * Math.PI * 25 * (1 - cycleStats.avgProgress / 100)}`}
                transform="rotate(-90 30 30)"
              />
            </svg>
            <div className="progress-text">
              <span className="progress-percentage">{Math.round(cycleStats.avgProgress)}%</span>
            </div>
          </div>
        </div>

        {/* Sağ Taraf - Actions */}
        <div className="library-cycle-actions">
          {cycleStats.lastPlayed && (
            <div className="last-played">
              <span>Son: {formatLastPlayed(cycleStats.lastPlayed)}</span>
            </div>
          )}
          
          <div className="action-buttons">
            <button 
              className="library-action-btn edit-btn"
              onClick={handleEditCycle}
              title="Cycle'ı Düzenle"
            >
              ✏️
            </button>
            <button 
              className="library-action-btn delete-btn"
              onClick={handleDeleteCycle}
              title="Cycle'ı Sil"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Genişletilmiş İçerik - Oyun Listesi */}
      {isExpanded && (
        <div className="library-cycle-content">
          <div className="games-header">
            <h4>Oyunlar ({cycleStats.totalGames})</h4>
            <button 
              className="add-game-btn"
              onClick={handleAddGame}
            >
              + Oyun Ekle
            </button>
          </div>
          
          <div className="games-grid">
            {cycle.games && cycle.games.filter(game => game.name).map((game, index) => (
              <div key={index} className="library-game-card">
                <div className="game-info">
                  <h5>{game.name}</h5>
                  <div className="game-stats">
                    <span>{game.playTime || game.estimatedHours || 0}h</span>
                    <span>{game.progress || 0}%</span>
                  </div>
                </div>
                
                <div className="game-progress-bar">
                  <div 
                    className="game-progress-fill"
                    style={{ 
                      width: `${game.progress || 0}%`,
                      backgroundColor: getProgressColor(game.progress || 0)
                    }}
                  />
                </div>
                
                <div className="game-actions">
                  <button 
                    className="game-action-btn edit"
                    onClick={() => handleEditGame(game)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="game-action-btn delete"
                    onClick={() => handleDeleteGame(game)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LibraryCycleItem;