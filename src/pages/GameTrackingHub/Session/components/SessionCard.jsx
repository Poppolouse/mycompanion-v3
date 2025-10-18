import React from 'react';

/**
 * SessionCard - Aktif session bilgilerini gösteren component
 * Timer, istatistikler ve mini kartları içerir
 */
function SessionCard({ 
  isSessionActive, 
  sessionTime, 
  pauseSession, 
  shareSession, 
  formatTime 
}) {
  return (
    <section className="session-card-large">
      <div className="session-card-content">
        <div className="session-header">
          <div className="session-title-group">
            <h3>🎮 Active Gaming Session</h3>
          </div>
          <button className="share-btn" onClick={shareSession}>
            📤 PAYLAŞ
          </button>
        </div>
        
        {/* Session Timer & Analytics Mini Cards */}
        <div className="session-mini-cards-grid">
          <div className={`mini-card timer-mini-card ${isSessionActive ? 'active' : 'paused'}`}>
            <div className="mini-card-header">
              <div className="mini-icon">⏱️</div>
              <button 
                className={`pause-btn-mini ${isSessionActive ? 'active' : 'paused'}`}
                onClick={pauseSession}
              >
                {isSessionActive ? '⏸️' : '▶️'}
              </button>
            </div>
            <div className="mini-card-content">
              <h5>Session Time</h5>
              <div className="timer-display-mini">{formatTime(sessionTime)}</div>
              <div className={`timer-status-mini ${isSessionActive ? 'recording' : 'paused'}`}>
                {isSessionActive ? 'Recording...' : 'Paused'}
              </div>
              
              {/* Detaylı İstatistikler */}
              <div className="timer-stats">
                <div className="stat-row">
                  <span className="stat-label">🎯 Günlük Hedef:</span>
                  <span className="stat-value">2h 30m</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '67%'}}></div>
                </div>
                <div className="stat-row">
                  <span className="stat-label">📊 Ortalama Süre:</span>
                  <span className="stat-value">1h 45m</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">🔥 Streak:</span>
                  <span className="stat-value">7 gün</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">⏰ Başlama Saati:</span>
                  <span className="stat-value">19:30</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">🎮 Bu Hafta:</span>
                  <span className="stat-value">12h 15m</span>
                </div>
              </div>
            </div>
          </div>
      
          <div className="mini-card coming-soon-card">
            <div className="mini-card-header">
              <div className="mini-icon">🚀</div>
              <span className="mini-title">Çok Yakında</span>
            </div>
            <div className="mini-card-content">
              <div className="coming-soon-content">
                <div className="coming-soon-icon">⏳</div>
                <h6>Yeni Özellikler</h6>
                <p>Bu bölümde yakında harika yeni özellikler olacak!</p>
                <div className="feature-list">
                  <div className="feature-item">🎯 Gelişmiş İstatistikler</div>
                  <div className="feature-item">🏆 Başarım Sistemi</div>
                  <div className="feature-item">📊 Detaylı Analitik</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mini-card coming-soon-card">
            <div className="mini-card-header">
              <div className="mini-icon">🔮</div>
              <span className="mini-title">Çok Yakında</span>
            </div>
            <div className="mini-card-content">
              <div className="coming-soon-content">
                <div className="coming-soon-icon">🎮</div>
                <h6>Oyun Analizi</h6>
                <p>Oyun performansınızı detaylı analiz edecek araçlar geliyor!</p>
                <div className="feature-list">
                  <div className="feature-item">📈 Performans Grafikleri</div>
                  <div className="feature-item">🎯 Hedef Takibi</div>
                  <div className="feature-item">🏅 Skor Karşılaştırma</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SessionCard;