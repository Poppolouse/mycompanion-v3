import React from 'react';

/**
 * GameBanner - Oyun banner component'i
 * Seçili oyunun büyük banner görünümünü sağlar
 */
function GameBanner({ 
  currentGame, 
  isSessionActive, 
  startSession, 
  stopSession 
}) {
  if (!currentGame) return null;

  return (
    <section className="hero-game-banner">
      <div className="hero-banner-content">
        {/* Session Status - Banner'ın sağ üstü */}
        <div className="banner-session-status">
          <div className={`status-indicator-small ${isSessionActive ? 'active' : 'paused'}`}></div>
          <span className="status-text">{isSessionActive ? 'Recording' : 'Paused'}</span>
        </div>
        
        <div className="game-cover-large">
          <img src={currentGame.coverImage} alt={currentGame.title} />
        </div>
        <div className="game-info-overlay">
          <div className="game-details">
            <h2 className="game-title">{currentGame.title}</h2>
            <p className="game-meta">{currentGame.platform} • {currentGame.genre}</p>
            <div className="progress-section">
              <div className="progress-bar-large">
                <div 
                  className="progress-fill-large" 
                  style={{ width: `${currentGame.progress}%` }}
                ></div>
              </div>
              <span className="progress-text-large">{currentGame.progress}% Tamamlandı</span>
            </div>
          </div>
        
          {/* Banner Action Buttons */}
          <div className="banner-actions">
            <button className="banner-action-btn start-btn" onClick={startSession}>
              ▶️ BAŞLAT
            </button>
            <button className="banner-action-btn finish-btn" onClick={stopSession}>
              🏁 BITIR
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GameBanner;