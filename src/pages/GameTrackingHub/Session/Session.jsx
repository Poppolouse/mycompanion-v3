import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Session.css';

/**
 * Session - Aktif oyun session yönetim sayfası
 * O anlık aktif oynadığımız oyun hakkında işlemler yapacağımız sayfa
 */
function Session() {
  const navigate = useNavigate();

  return (
    <div className="session-page" style={{
      background: 'linear-gradient(135deg, var(--bg-gradient-1) 0%, var(--bg-gradient-2) 25%, var(--bg-gradient-3) 50%, var(--bg-gradient-4) 100%)',
      minHeight: '100vh',
      width: '100vw'
    }}>
      <div className="session-container">
        {/* Header */}
        <header className="tracker-header">
          <div className="header-content">
            <div className="header-left">
              <h1>🎯 Session</h1>
              <p>Aktif oyun session'ınızı yönetin ve takip edin</p>
            </div>
            
            <div className="header-controls">
              {/* Navigation Buttons */}
              <div className="navigation-buttons">
                <button 
                  className="nav-btn home-btn"
                  onClick={() => navigate('/')}
                  title="Ana Sayfaya Dön"
                >
                  🏠 Ana Sayfa
                </button>
                <button 
                  className="nav-btn hub-btn"
                  onClick={() => navigate('/game-tracking-hub')}
                  title="Oyun Hub'ına Dön"
                >
                  🎮 Oyun Hub
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Ana İçerik - Şimdilik boş */}
        <main className="session-main">
          {/* İçerik buraya eklenecek */}
        </main>
      </div>
    </div>
  );
}

export default Session;