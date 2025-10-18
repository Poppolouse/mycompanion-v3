import React from 'react';

/**
 * HistoryView - Session geçmişini gösteren component
 * Filtreleme, sıralama ve detaylı session bilgilerini içerir
 */
function HistoryView({
  selectedTimePeriod,
  setSelectedTimePeriod,
  isFilterExpanded,
  toggleFilterAccordion,
  activeFiltersCount,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  activeQuickFilters,
  handleQuickFilterToggle,
  filters,
  handleFilterChange,
  clearAllFilters,
  applyAccordionFilters,
  expandedSessions,
  toggleSessionExpansion,
  handleSort,
  getSortIcon
}) {
  // Mock session data - gerçek uygulamada props'tan gelecek
  const sessionData = [
    {
      id: 1,
      game: 'Cyberpunk 2077',
      platform: 'PC',
      date: '2024-01-15',
      duration: '2h 45m',
      rating: 5,
      mood: '😍',
      screenshots: 12,
      videos: 3,
      achievements: ['First Blood', 'Street Cred', 'Corpo Lifepath'],
      notes: 'Amazing graphics and storyline! The character development is incredible and the side quests are really engaging.',
      tags: ['RPG', 'Open World', 'Cyberpunk'],
      startTime: '19:30',
      endTime: '22:15'
    },
    {
      id: 2,
      game: 'The Witcher 3',
      platform: 'PC',
      date: '2024-01-14',
      duration: '4h 20m',
      rating: 4,
      mood: '😊',
      screenshots: 8,
      videos: 2,
      achievements: ['Griffin School Techniques', 'Butcher of Blaviken'],
      notes: 'Great RPG experience, loved the quests. Combat system feels smooth and the story is captivating.',
      tags: ['RPG', 'Fantasy', 'Open World'],
      startTime: '14:00',
      endTime: '18:20'
    },
    {
      id: 3,
      game: 'Red Dead Redemption 2',
      platform: 'PC',
      date: '2024-01-13',
      duration: '3h 15m',
      rating: 5,
      mood: '😍',
      screenshots: 15,
      videos: 5,
      achievements: ['Lending a Hand', 'Friends With Benefits'],
      notes: 'Incredible open world, spent hours just exploring. The attention to detail is phenomenal.',
      tags: ['Action', 'Western', 'Open World'],
      startTime: '20:00',
      endTime: '23:15'
    },
    {
      id: 4,
      game: 'Elden Ring',
      platform: 'PC',
      date: '2024-01-12',
      duration: '1h 30m',
      rating: 3,
      mood: '😤',
      screenshots: 3,
      videos: 1,
      achievements: ['Margit the Fell Omen'],
      notes: 'Challenging boss fights, died many times. Need to level up more before continuing.',
      tags: ['Souls-like', 'RPG', 'Dark Fantasy'],
      startTime: '16:30',
      endTime: '18:00'
    }
  ];

  return (
    <div className="history-view">
      <div className="history-header">
        <h2>📊 Session History</h2>
      </div>

      {/* Time Period Selector */}
      <div className="time-period-selector">
        {['1 Hafta', '1 Ay', '6 Ay', '1 Sene', 'All Time'].map((period) => (
          <button 
            key={period}
            className={`time-period-btn ${selectedTimePeriod === period ? 'active' : ''}`}
            onClick={() => setSelectedTimePeriod(period)}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Statistics Cards */}
      <div className="history-stats-grid">
        <div className="history-stat-card">
          <div className="stat-icon">🎮</div>
          <div className="stat-content">
            <div className="stat-value">47</div>
            <div className="stat-label">Total Sessions</div>
          </div>
        </div>
        
        <div className="history-stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">156h</div>
            <div className="stat-label">Total Time</div>
          </div>
        </div>
        
        <div className="history-stat-card">
          <div className="stat-icon">📸</div>
          <div className="stat-content">
            <div className="stat-value">124</div>
            <div className="stat-label">Screenshots</div>
          </div>
        </div>
        
        <div className="history-stat-card">
          <div className="stat-icon">🎬</div>
          <div className="stat-content">
            <div className="stat-value">37</div>
            <div className="stat-label">Video Clips</div>
          </div>
        </div>
        
        <div className="history-stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">Cyberpunk 2077</div>
            <div className="stat-label">Most Played</div>
          </div>
        </div>
      </div>

      {/* Accordion Style Filter Card */}
      <div className="accordion-filter-container">
        <div className="accordion-filter-header" onClick={toggleFilterAccordion}>
          <div className="filter-header-left">
            <div className="filter-icon">🔍</div>
            <span className="filter-title">Filtreler & Sıralama</span>
            {activeFiltersCount > 0 && (
              <div className="active-filters-badge">
                {activeFiltersCount}
              </div>
            )}
          </div>
          <div className="filter-header-right">
            <select 
              className="quick-sort-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="date-desc">📅 Yeni → Eski</option>
              <option value="date-asc">📅 Eski → Yeni</option>
              <option value="game-asc">🎮 A → Z</option>
              <option value="game-desc">🎮 Z → A</option>
              <option value="platform-asc">🎯 A → Z</option>
              <option value="platform-desc">🎯 Z → A</option>
              <option value="duration-desc">⏱️ Uzun → Kısa</option>
              <option value="duration-asc">⏱️ Kısa → Uzun</option>
            </select>
            <div className={`accordion-arrow ${isFilterExpanded ? 'expanded' : ''}`}>
              ▼
            </div>
          </div>
        </div>

        <div className={`accordion-filter-body ${isFilterExpanded ? 'expanded' : ''}`}>
          <div className="accordion-content">
            
            {/* Quick Filter Pills */}
            <div className="quick-filters-section">
              <div className="section-title">⚡ Hızlı Filtreler</div>
              <div className="quick-filter-pills">
                <button 
                  className={`filter-pill ${activeQuickFilters.includes('today') ? 'active' : ''}`}
                  onClick={() => handleQuickFilterToggle('today')}
                >
                  📅 Bugün
                </button>
                <button 
                  className={`filter-pill ${activeQuickFilters.includes('week') ? 'active' : ''}`}
                  onClick={() => handleQuickFilterToggle('week')}
                >
                  📅 Bu Hafta
                </button>
                <button 
                  className={`filter-pill ${activeQuickFilters.includes('hasMedia') ? 'active' : ''}`}
                  onClick={() => handleQuickFilterToggle('hasMedia')}
                >
                  📱 Medya Var
                </button>
                <button 
                  className={`filter-pill ${activeQuickFilters.includes('longSession') ? 'active' : ''}`}
                  onClick={() => handleQuickFilterToggle('longSession')}
                >
                  ⏱️ Uzun Oturum
                </button>
                <button 
                  className={`filter-pill ${activeQuickFilters.includes('highRating') ? 'active' : ''}`}
                  onClick={() => handleQuickFilterToggle('highRating')}
                >
                  ⭐ Yüksek Puan
                </button>
                <button 
                  className={`filter-pill ${activeQuickFilters.includes('recent') ? 'active' : ''}`}
                  onClick={() => handleQuickFilterToggle('recent')}
                >
                  🔥 Son Oynanan
                </button>
              </div>
            </div>

            {/* Detailed Filters */}
            <div className="detailed-filters-section">
              <div className="section-title">🎯 Detaylı Filtreler</div>
              <div className="filter-grid-compact">
                
                <div className="filter-group">
                  <label>🎮 Oyun</label>
                  <select 
                    value={filters.game}
                    onChange={(e) => handleFilterChange('game', e.target.value)}
                  >
                    <option value="">Tüm Oyunlar</option>
                    <option value="cyberpunk">Cyberpunk 2077</option>
                    <option value="witcher">The Witcher 3</option>
                    <option value="rdr2">Red Dead Redemption 2</option>
                    <option value="elden">Elden Ring</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>🎯 Platform</label>
                  <select 
                    value={filters.platform}
                    onChange={(e) => handleFilterChange('platform', e.target.value)}
                  >
                    <option value="">Tüm Platformlar</option>
                    <option value="pc">PC</option>
                    <option value="ps5">PlayStation 5</option>
                    <option value="xbox">Xbox Series X</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>📅 Tarih Aralığı</label>
                  <select 
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  >
                    <option value="">Tüm Zamanlar</option>
                    <option value="today">Bugün</option>
                    <option value="week">Bu Hafta</option>
                    <option value="month">Bu Ay</option>
                    <option value="year">Bu Yıl</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>⏱️ Oturum Süresi</label>
                  <select 
                    value={filters.duration}
                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                  >
                    <option value="">Tüm Süreler</option>
                    <option value="short">Kısa (&lt; 1 saat)</option>
                    <option value="medium">Orta (1-3 saat)</option>
                    <option value="long">Uzun (&gt; 3 saat)</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>📱 Medya Durumu</label>
                  <select 
                    value={filters.hasMedia}
                    onChange={(e) => handleFilterChange('hasMedia', e.target.value)}
                  >
                    <option value="">Tümü</option>
                    <option value="yes">Medya Var</option>
                    <option value="no">Medya Yok</option>
                  </select>
                </div>

                <div className="filter-group-spacer"></div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="accordion-actions">
              <button 
                className="action-btn clear-btn"
                onClick={clearAllFilters}
              >
                <span className="btn-icon">🗑️</span>
                Temizle
              </button>
              <button 
                className="action-btn apply-btn"
                onClick={applyAccordionFilters}
              >
                <span className="btn-icon">✅</span>
                Uygula
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Session List */}
      <div className="session-list">
        <div className="session-list-header">
          <div className="header-game" onClick={() => handleSort('game')}>
            Oyun İsmi {getSortIcon('game')}
          </div>
          <div className="header-platform" onClick={() => handleSort('platform')}>
            Platform {getSortIcon('platform')}
          </div>
          <div className="header-date" onClick={() => handleSort('date')}>
            Tarih {getSortIcon('date')}
          </div>
          <div className="header-duration" onClick={() => handleSort('duration')}>
            Süre {getSortIcon('duration')}
          </div>
          <div className="header-media" onClick={() => handleSort('media')}>
            Medya {getSortIcon('media')}
          </div>
          <div className="header-expand"></div>
        </div>
        
        {sessionData.map(session => {
          const isExpanded = expandedSessions.has(session.id);
          
          return (
            <div key={session.id} className={`session-list-item ${isExpanded ? 'expanded' : ''}`}>
              <div className="session-compact-view" onClick={() => toggleSessionExpansion(session.id)}>
                <div className="session-game-column">
                  <div className="session-game-title">{session.game}</div>
                </div>
                
                <div className="session-platform-column">
                  <div className="session-platform-badge">{session.platform}</div>
                </div>
                
                <div className="session-date-column">
                  <span className="session-date">{session.date}</span>
                </div>
                
                <div className="session-duration-column">
                  <span className="session-duration">{session.duration}</span>
                </div>
                
                <div className="session-media-column">
                  <div className="session-media-count">
                    <span className="media-item">📸 {session.screenshots}</span>
                    <span className="media-item">🎥 {session.videos}</span>
                  </div>
                </div>
                
                <div className="session-expand-indicator">
                  <span className={`expand-arrow ${isExpanded ? 'rotated' : ''}`}>▼</span>
                </div>
              </div>
              
              {isExpanded && (
                <div className="session-expanded-view">
                  <div className="session-detailed-info">
                    <div className="session-time-info">
                      <div className="time-detail">
                        <span className="time-label">Start Time:</span>
                        <span className="time-value">{session.startTime}</span>
                      </div>
                      <div className="time-detail">
                        <span className="time-label">End Time:</span>
                        <span className="time-value">{session.endTime}</span>
                      </div>
                    </div>
                    
                    <div className="session-media-stats">
                      <div className="media-stat">
                        <span className="media-icon">📸</span>
                        <span className="media-count">{session.screenshots} Screenshots</span>
                      </div>
                      <div className="media-stat">
                        <span className="media-icon">🎥</span>
                        <span className="media-count">{session.videos} Videos</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HistoryView;