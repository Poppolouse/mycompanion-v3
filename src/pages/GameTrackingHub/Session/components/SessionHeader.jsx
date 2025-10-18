import React from 'react';
import ProfileDropdown from '../../../../components/ProfileDropdown';

/**
 * SessionHeader - Session sayfası header component'i
 * Navigation ve view switcher kontrollerini içerir
 */
function SessionHeader({ 
  currentView, 
  setCurrentView, 
  navigate
}) {

  return (
    <header className="page-header">
      <div className="tracker-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🎯 Gaming Session</h1>
            <p>Aktif oyun deneyiminizi takip edin ve kaydedin</p>
          </div>
          
          <div className="header-controls">
            {/* View Switcher */}
            <div className="view-switcher">
              <button 
                className={`view-btn ${currentView === 'session' ? 'active' : ''}`}
                onClick={() => setCurrentView('session')}
              >
                🎯 Aktif Session
              </button>
              <button 
                className={`view-btn ${currentView === 'history' ? 'active' : ''}`}
                onClick={() => setCurrentView('history')}
              >
                📚 Session History
              </button>
            </div>

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
            
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}

export default SessionHeader;