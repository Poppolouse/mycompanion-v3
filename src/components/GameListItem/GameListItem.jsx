import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GameListItem.css';

function GameListItem({ 
  game, 
  index, 
  isSelected, 
  onSelect, 
  onStatusChange, 
  onProgressChange, 
  onEdit, 
  onDelete 
}) {
  const navigate = useNavigate();

  // Oyun durumunu belirle
  const getGameStatus = (game) => {
    if (game.status) return game.status;
    if (game.durum) return game.durum;
    if (game.progress >= 100) return 'Tamamlandı';
    if (game.progress > 0) return 'Oynuyor';
    return 'Oynanmadı';
  };

  // Oyun detay sayfasına git
  const handleGameClick = () => {
    navigate(`/game-tracker/game/${game.id || index}`);
  };

  // Checkbox değişimi
  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onSelect(!isSelected);
  };

  // Durum değişimi
  const handleStatusChange = (e) => {
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(e.target.value);
    }
  };

  return (
    <div className="game-list-item" onClick={handleGameClick}>
      {/* Checkbox */}
      <div className="game-item-checkbox">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Oyun Resmi */}
      <div className="game-item-image">
        {game.imageUrl ? (
          <img src={game.imageUrl} alt={game.name || game.title} />
        ) : (
          <div className="game-placeholder">🎮</div>
        )}
      </div>

      {/* Oyun Adı */}
      <div className="game-item-name">
        <span className="game-title">{game.name || game.title || 'Bilinmeyen Oyun'}</span>
      </div>

      {/* Platform */}
      <div className="game-item-platform">
        <span>{game.platform || game.sistem || 'PC'}</span>
      </div>

      {/* Tür */}
      <div className="game-item-genre">
        <span>{game.genre || game.tur || 'Aksiyon'}</span>
      </div>

      {/* Durum */}
      <div className="game-item-status">
        <select 
          value={getGameStatus(game)} 
          onChange={handleStatusChange}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="Oynanmadı">Oynanmadı</option>
          <option value="Oynuyor">Oynuyor</option>
          <option value="Tamamlandı">Tamamlandı</option>
          <option value="Bırakıldı">Bırakıldı</option>
        </select>
      </div>

      {/* İlerleme */}
      <div className="game-item-progress">
        <span>{game.progress || 0}%</span>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${game.progress || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Son Oynanma */}
      <div className="game-item-last-played">
        <span>
          {game.lastPlayed 
            ? new Date(game.lastPlayed).toLocaleDateString('tr-TR')
            : '-'
          }
        </span>
      </div>

      {/* Aksiyonlar */}
      <div className="game-item-actions">
        <button 
          className="action-btn edit-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onEdit) onEdit(game);
          }}
          title="Düzenle"
        >
          ✏️
        </button>
        <button 
          className="action-btn delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete(game);
          }}
          title="Sil"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default GameListItem;