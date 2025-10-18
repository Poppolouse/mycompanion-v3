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

  // Tür renklendirme fonksiyonu
  const getGenreColor = (genre) => {
    const genreColors = {
      'Aksiyon': '#ff6b6b',        // Kırmızı - Heyecan
      'RPG': '#4ecdc4',            // Turkuaz - Macera
      'Strateji': '#45b7d1',       // Mavi - Zeka
      'Spor': '#96ceb4',           // Yeşil - Aktivite
      'Yarış': '#feca57',          // Sarı - Hız
      'Simülasyon': '#ff9ff3',     // Pembe - Yaratıcılık
      'Platform': '#54a0ff',       // Açık Mavi - Eğlence
      'Bulmaca': '#5f27cd',        // Mor - Düşünce
      'Korku': '#2d3436',          // Koyu Gri - Gerilim
      'Macera': '#00b894',         // Yeşil - Keşif
      'Savaş': '#e17055',          // Turuncu - Çatışma
      'Indie': '#a29bfe',          // Lavanta - Özgünlük
      'Multiplayer': '#fd79a8',    // Pembe - Sosyal
      'Sandbox': '#fdcb6e',        // Altın - Özgürlük
      'Survival': '#6c5ce7',       // Mor - Mücadele
      'default': '#74b9ff'         // Varsayılan mavi
    };
    
    return genreColors[genre] || genreColors['default'];
  };

  // Oyun detay sayfasına git
  const handleGameClick = () => {
    navigate(`/game-tracking-hub/game-tracker/game/${game.id || index}`);
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
    <div 
      className={`game-list-item ${isSelected ? 'selected' : ''}`}
      onClick={handleGameClick}
    >
      {/* Afiş Resmi */}
      <div 
        className="game-poster-image"
        style={{
          backgroundImage: game.imageUrl 
            ? `url(${game.imageUrl})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        {!game.imageUrl && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: '3rem',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            🎮
          </div>
        )}
      </div>

      {/* Afiş İçeriği */}
      <div className="game-poster-content">
        <div className="game-poster-title">
          {game.name || game.title || 'Bilinmeyen Oyun'}
        </div>
        
        <div className="game-poster-info">
          <div 
            className="game-poster-genre"
            style={{
              backgroundColor: getGenreColor(game.genre || game.tur || 'Aksiyon'),
              color: '#ffffff'
            }}
          >
            {game.genre || game.tur || 'Aksiyon'}
          </div>
          
          <div className="game-poster-status">
            {getGameStatus(game)} • {game.progress || 0}%
          </div>
        </div>
      </div>

      {/* Gizli elementler (eski format için) */}
      <div className="game-item-checkbox" style={{ display: 'none' }}>
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect(game, e.target.checked);
          }}
        />
      </div>
      <div className="game-item-platform" style={{ display: 'none' }}>
        <span>{game.platform || game.sistem || 'PC'}</span>
      </div>
      <div className="game-item-progress" style={{ display: 'none' }}>
        <span>{game.progress || 0}%</span>
      </div>
      <div className="game-item-last-played" style={{ display: 'none' }}>
        <span>
          {game.lastPlayed 
            ? new Date(game.lastPlayed).toLocaleDateString('tr-TR')
            : '-'
          }
        </span>
      </div>
      <div className="game-item-actions" style={{ display: 'none' }}>
        <button onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(game); }}>✏️</button>
        <button onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(game); }}>🗑️</button>
      </div>
    </div>
  );
}

export default GameListItem;