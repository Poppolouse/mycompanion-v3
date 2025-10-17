import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoute } from '../../../contexts/RouteContext';
import './RoutePlanner.css';

/**
 * RoutePlanner - VAULT ROUTE v2.2 takip sistemi
 * 
 * 117 oyunluk route sistemini yönetmek için ana sayfa
 * - Sol sidebar: Aktif cycle, hızlı erişim, filtreler
 * - Ana içerik: Progress bar, aktif/sonraki cycle, cycle listesi
 */
function RoutePlanner() {
  const navigate = useNavigate();
  
  const { 
    routeState, 
    loading, 
    getCurrentCycle, 
    getNextCycle, 
    getActiveGame, 
    getRouteProgress,
    startRoute,
    startCycle,
    selectGame: contextSelectGame,
    completeGame: contextCompleteGame,
    refreshFromLibrary,
    ROUTE_CONFIG 
  } = useRoute();

  // Filter state
  const [activeFilters, setActiveFilters] = useState({
    rpg: false,
    story: false,
    strategy: false,
    favorites: false,
    status: 'all' // all, completed, active, pending
  });

  // Rule guide modal state
  const [showRuleGuide, setShowRuleGuide] = useState(false);
  const [ruleGuideType, setRuleGuideType] = useState(null); // 'completion' | 'route'

  // Oyun seçimi için state'ler
  const [showGameSelector, setShowGameSelector] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  
  // Cycle düzenleme için state'ler
  const [showEditCycleModal, setShowEditCycleModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  
  // Toast notification state
  const [toasts, setToasts] = useState([]);
  
  // Expandable cycle history state
  const [expandedCycles, setExpandedCycles] = useState(new Set());
  

  
  // Dark mode her zaman aktif (light mode kaldırıldı)
  const isDarkMode = true;
  
  // Ana ekrana dönme fonksiyonu
  const goToHome = () => {
    navigate('/');
  };

  const goToGameHub = () => {
    navigate('/game-tracking-hub');
  };
  
  // Dark mode class'ını body'ye ekle/çıkar
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);
  
  // Toast notification fonksiyonları
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    // 3 saniye sonra otomatik kaldır
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };
  
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Cycle düzenleme fonksiyonları
  const handleEditCycle = (cycle) => {
    setEditingCycle(cycle);
    setShowEditCycleModal(true);
  };

  // Cycle expand/collapse fonksiyonu
  const toggleCycleExpansion = (cycleNumber) => {
    setExpandedCycles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cycleNumber)) {
        newSet.delete(cycleNumber);
      } else {
        newSet.add(cycleNumber);
      }
      return newSet;
    });
  };

  const handleResetGameStatus = (cycleNumber, gameIndex) => {
    // Bu fonksiyon RouteContext'e eklenecek
    showToast(`Cycle ${cycleNumber} - Oyun ${gameIndex + 1} durumu sıfırlandı`, 'success');
  };
  
  // Oyun seçimi için mevcut oyunları getir
  const getAvailableGames = (gameType) => {
    const libraryGames = loadGamesFromLibrary();
    
    // Oyun tipine göre filtrele
    const typeMapping = {
      'rpg': ['RPG', 'Role-Playing'],
      'story': ['Story', 'Indie', 'Adventure'],
      'strategy': ['Strategy', 'Simulation', 'Management']
    };
    
    const allowedGenres = typeMapping[gameType] || [];
    
    return libraryGames.filter(game => 
      allowedGenres.some(genre => 
        game.genre?.toLowerCase().includes(genre.toLowerCase())
      )
    );
  };

  // Seçilen oyun tipine göre mevcut oyunları al
  const availableGames = selectedGameType ? getAvailableGames(selectedGameType) : [];

  // Basit oyun listesi (gerçek uygulamada API'den gelecek)
  const gameDatabase = {
    rpg: [
      { id: 'witcher3', name: 'The Witcher 3: Wild Hunt', hours: 50 },
      { id: 'skyrim', name: 'The Elder Scrolls V: Skyrim', hours: 60 },
      { id: 'persona5', name: 'Persona 5 Royal', hours: 80 },
      { id: 'divinity2', name: 'Divinity: Original Sin 2', hours: 70 }
    ],
    story: [
      { id: 'firewatch', name: 'Firewatch', hours: 6 },
      { id: 'life_strange', name: 'Life is Strange', hours: 12 },
      { id: 'what_remains', name: 'What Remains of Edith Finch', hours: 3 },
      { id: 'stanley', name: 'The Stanley Parable', hours: 4 }
    ],
    strategy: [
      { id: 'civ6', name: 'Civilization VI', hours: 40 },
      { id: 'xcom2', name: 'XCOM 2', hours: 35 },
      { id: 'total_war', name: 'Total War: Warhammer III', hours: 50 },
      { id: 'crusader', name: 'Crusader Kings III', hours: 60 }
    ]
  };

  // Filter functions
  const toggleFilter = (filterType) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const setStatusFilter = (status) => {
    setActiveFilters(prev => ({
      ...prev,
      status
    }));
  };

  // Filter cycles based on active filters
  const getFilteredCycles = () => {
    return routeState.cycles.filter(cycle => {
      // Oyun türü filtreleri
      if (activeFilters.rpg || activeFilters.story || activeFilters.strategy) {
        const hasRPG = cycle.games.some(g => g.type === 'rpg');
        const hasStory = cycle.games.some(g => g.type === 'story');
        const hasStrategy = cycle.games.some(g => g.type === 'strategy');
        
        if (activeFilters.rpg && !hasRPG) return false;
        if (activeFilters.story && !hasStory) return false;
        if (activeFilters.strategy && !hasStrategy) return false;
      }
      
      // Durum filtresi
      if (activeFilters.status !== 'all') {
        const cycleStatus = 
          cycle.cycleNumber < config.currentCycle ? 'completed' :
          cycle.cycleNumber === config.currentCycle ? 
            (!config.currentCycleStarted ? 'pending' : 'active') :
          'pending';
        
        if (activeFilters.status !== cycleStatus) return false;
      }
      
      return true;
    });
  };

  // Oyun seçme fonksiyonu
  const selectGame = (gameType) => {
    setSelectedGameType(gameType);
    setShowGameSelector(true);
  };
  
  // Oyun seçimini onayla
  const confirmGameSelection = (gameId) => {
    const currentCycle = getCurrentCycle();
    if (!currentCycle || !selectedGameType) return;
    
    // Oyun türüne göre position bulma
    const gamePosition = currentCycle.games.findIndex(g => g.type === selectedGameType);
    if (gamePosition === -1) return;
    
    // Seçilen oyunun adını bul
    const selectedGame = gameDatabase[selectedGameType]?.find(game => game.id === gameId);
    
    // Eğer oyunun birden fazla campaign'i varsa ve campaign seçilmemişse uyar
    if (selectedGame?.campaigns && selectedGame.campaigns.length > 1 && !selectedCampaign) {
      showToast('Bu oyunun birden fazla campaign\'i var. Lütfen bir campaign seçin.', 'warning');
      return;
    }

    const gameData = {
      gameId: selectedGame?.id,
      campaignId: selectedCampaign?.id || null,
      campaignName: selectedCampaign?.name || null
    };
    
    contextSelectGame(currentCycle.cycleNumber, gamePosition, gameId, gameData);
    setShowGameSelector(false);
    setSelectedGameType(null);
    setSelectedCampaign(null);
    
    // Toast notification göster
    const campaignText = selectedCampaign ? ` (${selectedCampaign.name})` : '';
    showToast(`🎮 ${selectedGame?.name || 'Oyun'}${campaignText} seçildi!`, 'success');
  };



  // Oyun tamamlama fonksiyonu
  const completeGame = (gameType) => {
    const currentCycle = getCurrentCycle();
    if (!currentCycle) return;
    
    // Oyun türüne göre position bulma
    const gamePosition = currentCycle.games.findIndex(g => g.type === gameType);
    if (gamePosition === -1) return;
    
    // Basit saat hesaplaması (gerçek uygulamada kullanıcıdan alınacak)
    const estimatedHours = gameType === 'rpg' ? 50 : gameType === 'story' ? 15 : 30;
    
    contextCompleteGame(currentCycle.cycleNumber, gamePosition, estimatedHours);
    
    // Toast notification göster
    const gameTypeNames = {
      rpg: 'RPG',
      story: 'Story/Indie',
      strategy: 'Strategy/Sim'
    };
    showToast(`✅ ${gameTypeNames[gameType]} oyunu tamamlandı!`, 'success');
  };



  // Sonraki cycle'a geçiş fonksiyonu
  const goToNextCycle = () => {
    const currentCycle = getCurrentCycle();
    if (!currentCycle) return;
    
    // Tüm oyunlar tamamlandı mı kontrol et
    const allCompleted = currentCycle.games.every(g => g.status === 'completed');
    if (!allCompleted) return;
    
    // Sonraki cycle'ı başlat
    const nextCycleNumber = currentCycle.cycleNumber + 1;
    if (nextCycleNumber <= ROUTE_CONFIG.totalCycles) {
      startCycle(nextCycleNumber);
      showToast(`🚀 Cycle ${nextCycleNumber} başlatıldı!`, 'success');
    } else {
      showToast(`🎉 Tebrikler! Tüm route tamamlandı!`, 'success');
    }
  };

  if (loading) {
    return (
      <div className="route-planner">
        <div className="loading-state">
          <h2>🎯 Route Planner Yükleniyor...</h2>
        </div>
      </div>
    );
  }

  const currentCycle = getCurrentCycle();
  const nextCycle = getNextCycle();
  const activeGame = getActiveGame();
  const routeProgress = getRouteProgress();
  const { config, analytics } = routeState;

  return (
    <div className="route-planner">
      <div className="route-planner-container">
        {/* Header */}
        <header className="tracker-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🎯 VAULT ROUTE v2.2</h1>
            <p>117 oyunluk route sistemini takip edin ve cycle'ları yönetin</p>
          </div>
          
          <div className="header-controls">
            {/* Navigation Buttons */}
            <div className="navigation-buttons">
              <button 
                className="nav-btn home-btn"
                onClick={goToHome}
                title="Ana Sayfaya Dön"
              >
                🏠 Ana Sayfa
              </button>
              <button 
                className="nav-btn hub-btn"
                onClick={goToGameHub}
                title="Oyun Hub'ına Dön"
              >
                🎮 Oyun Hub
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cycle Overview Card */}
      <div className="route-progress-card cycle-overview-card">
        <div className="cycle-overview-content">
          <div className="cycle-overview-header">
            <div className="cycle-overview-icon">📊</div>
            <h3>CYCLE GENEL DURUMU</h3>
          </div>
          
          {/* Progress Bar */}
          <div className="cycle-progress-container">
            <div className="cycle-progress-bar">
              <div 
                className="cycle-progress-fill" 
                style={{
                  width: `${Math.round((routeState.cycles.filter(c => c.cycleNumber < config.currentCycle).length / 39) * 100)}%`
                }}
              ></div>
            </div>
            <div className="cycle-progress-text">
              {Math.round((routeState.cycles.filter(c => c.cycleNumber < config.currentCycle).length / 39) * 100)}% Tamamlandı
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="cycle-stats-grid">
            <div className="cycle-stat-item">
              <div className="cycle-stat-icon">🎯</div>
              <div className="cycle-stat-info">
                <div className="cycle-stat-value">39</div>
                <div className="cycle-stat-label">Toplam Cycle</div>
              </div>
            </div>
            <div className="cycle-stat-item">
              <div className="cycle-stat-icon">✅</div>
              <div className="cycle-stat-info">
                <div className="cycle-stat-value">
                  {routeState.cycles.filter(c => c.cycleNumber < config.currentCycle).length}
                </div>
                <div className="cycle-stat-label">Tamamlanan</div>
              </div>
            </div>
            <div className="cycle-stat-item">
              <div className="cycle-stat-icon">🔥</div>
              <div className="cycle-stat-info">
                <div className="cycle-stat-value">{config.currentCycle || 1}</div>
                <div className="cycle-stat-label">Aktif Cycle</div>
              </div>
            </div>
            <div className="cycle-stat-item">
              <div className="cycle-stat-icon">⏳</div>
              <div className="cycle-stat-info">
                <div className="cycle-stat-value">
                  {39 - routeState.cycles.filter(c => c.cycleNumber < config.currentCycle).length}
                </div>
                <div className="cycle-stat-label">Kalan</div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="cycle-additional-info">
            <div className="cycle-info-item">
              <span className="cycle-info-icon">🎮</span>
              <span className="cycle-info-text">
                Aktif Cycle'da {currentCycle ? currentCycle.games.filter(g => g.status === 'completed').length : 0}/3 oyun tamamlandı
              </span>
            </div>
            <div className="cycle-info-item">
              <span className="cycle-info-icon">📈</span>
              <span className="cycle-info-text">
                Ortalama cycle tamamlama süresi: ~2 hafta
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="route-planner__content">
        {/* Sol Sidebar - Gaming Navigation Hub */}
        <div className="route-planner__sidebar slide-in-left">
          {/* Header */}
          <div className="sidebar-header">
            <h2>🎮 GAMING NAVIGATION HUB</h2>
          </div>

          {/* Oyun Modu Sekciyonu */}
          <div className="sidebar-section gaming-mode-section">
            <h3>🎮 OYUN MODU</h3>
            <div className="current-game-card">
              <div className="game-status-indicator">
                <span className="status-dot active"></span>
                <span className="status-text">ŞU AN OYNUYOR</span>
              </div>
              <div className="game-info">
                <div className="game-title">
                  {activeGame ? activeGame.name : 'Oyun Seçilmedi'}
                </div>
                <div className="game-details">
                  <span>Başlama: {new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}</span>
                  <span>Süre: 2s 15dk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bu Hafta Sekciyonu */}
          <div className="sidebar-section weekly-summary-section">
            <h3>📅 BU HAFTA</h3>
            <div className="weekly-summary-card">
              <div className="weekly-stats">
                <div className="stat-row">
                  <span className="stat-icon">🎯</span>
                  <span className="stat-label">Hedef:</span>
                  <span className="stat-value">15 saat</span>
                </div>
                <div className="stat-row">
                  <span className="stat-icon">⏱️</span>
                  <span className="stat-label">Oynanan:</span>
                  <span className="stat-value">8.5 saat</span>
                </div>
                <div className="stat-row">
                  <span className="stat-icon">📊</span>
                  <span className="stat-label">İlerleme:</span>
                  <span className="stat-value">%57</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hızlı Kısayollar Sekciyonu */}
          <div className="sidebar-section shortcuts-section">
            <h3>⚡ HIZLI KISAYOLLAR</h3>
            <div className="shortcuts-grid">
              <button className="shortcut-btn" onClick={() => window.location.href = '/game-tracker'}>
                <span className="shortcut-icon">📁</span>
                <span className="shortcut-label">Oyun Kütüphanesi</span>
              </button>
              <button className="shortcut-btn">
                <span className="shortcut-icon">💾</span>
                <span className="shortcut-label">Veri Yedekleme</span>
              </button>
              <button className="shortcut-btn">
                <span className="shortcut-icon">📤</span>
                <span className="shortcut-label">Veri İçe/Dışa Aktarma</span>
              </button>
              <button className="shortcut-btn" onClick={refreshFromLibrary}>
                <span className="shortcut-icon">🔄</span>
                <span className="shortcut-label">Senkronizasyon</span>
              </button>
            </div>
          </div>

          {/* Son Aktiviteler Sekciyonu */}
          <div className="sidebar-section activities-section">
            <h3>📊 SON AKTİVİTELER</h3>
            <div className="activities-feed">
              <div className="activity-item">
                <span className="activity-icon">✅</span>
                <span className="activity-text">Witcher 3 tamamlandı</span>
              </div>
              <div className="activity-item">
                <span className="activity-icon">🎯</span>
                <span className="activity-text">Cycle 12 başlatıldı</span>
              </div>
              <div className="activity-item">
                <span className="activity-icon">📚</span>
                <span className="activity-text">3 oyun eklendi</span>
              </div>
              <div className="activity-item">
                <span className="activity-icon">💾</span>
                <span className="activity-text">Backup alındı</span>
              </div>
            </div>
          </div>

          {/* Sistem Durumu Sekciyonu */}
          <div className="sidebar-section system-status-section">
            <h3>🔧 SİSTEM DURUMU</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-indicator online"></span>
                <span className="status-label">Bağlantı: Aktif</span>
              </div>
              <div className="status-item">
                <span className="status-indicator synced"></span>
                <span className="status-label">Veri: Senkronize</span>
              </div>
              <div className="status-item">
                <span className="status-indicator updated"></span>
                <span className="status-label">Son Güncelleme: 2dk önce</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="route-planner__main">
          <div className="main-content slide-in-right">
            {/* Route Command Center */}
            <div className="route-command-center">
              <h2>🎯 ROUTE COMMAND CENTER</h2>
              <div className="metrics-grid">
                <div className="metric-card total-cycles">
                  <div className="metric-icon">📊</div>
                  <div className="metric-value">39</div>
                  <div className="metric-label">Total Cycle</div>
                </div>
                <div className="metric-card active-cycle">
                  <div className="metric-icon">🔥</div>
                  <div className="metric-value">
                    {config.currentCycle ? `Cycle ${config.currentCycle}` : 'Cycle 1'}
                  </div>
                  <div className="metric-label">Aktif</div>
                </div>
                <div className="metric-card completed-cycles">
                  <div className="metric-icon">✅</div>
                  <div className="metric-value">
                    {routeState.cycles.filter(c => c.cycleNumber < config.currentCycle).length}
                  </div>
                  <div className="metric-label">Tamamlandı</div>
                </div>
                <div className="metric-card remaining-cycles">
                  <div className="metric-icon">⏳</div>
                  <div className="metric-value">
                    {39 - routeState.cycles.filter(c => c.cycleNumber < config.currentCycle).length}
                  </div>
                  <div className="metric-label">Kalan</div>
                </div>
              </div>
            </div>

            {/* Cycle Roadmap Panel */}
            <div className="cycle-roadmap-panel">
              <h2>🎯 CYCLE {config.currentCycle || 1} ROADMAP</h2>
              
              {/* Timeline Progress Bar */}
              <div className="timeline-container">
                <div className="timeline-progress">
                  <div className="timeline-line">
                    <div 
                      className="timeline-fill" 
                      style={{
                        width: currentCycle ? 
                          `${Math.round((currentCycle.games.filter(g => g.status === 'completed').length / 3) * 100)}%` : 
                          '0%'
                      }}
                    ></div>
                  </div>
                  <div className="timeline-labels">
                    <span className="timeline-start">START</span>
                    <span className="timeline-progress-text">
                      {currentCycle ? 
                        `${Math.round((currentCycle.games.filter(g => g.status === 'completed').length / 3) * 100)}% PROGRESS` : 
                        '0% PROGRESS'
                      }
                    </span>
                    <span className="timeline-end">END</span>
                  </div>
                </div>
              </div>

              {/* Game Slots Timeline */}
              <div className="game-slots-timeline">
                {/* Gaming Progress Bar Background */}
                <div className="gaming-progress-container">
                  <div className="gaming-progress-bar">
                    <div 
                      className="gaming-progress-fill"
                      style={{
                        width: currentCycle ? 
                          `${Math.round((currentCycle.games.filter(g => g.status === 'completed').length / 3) * 100)}%` : 
                          '0%'
                      }}
                    ></div>
                    <div className="progress-segments">
                      <div className="segment segment-1"></div>
                      <div className="segment segment-2"></div>
                      <div className="segment segment-3"></div>
                    </div>
                  </div>
                </div>

                {/* Game Cards */}
                <div className="game-cards-container">
                  {currentCycle && currentCycle.games.map((game, index) => (
                    <div key={index} className={`game-slot-timeline ${game.status}`}>
                      <div className="slot-header">
                        <div className="slot-type">
                          {game.type === 'rpg' ? '🗡️ RPG' : 
                           game.type === 'story' ? '📖 STORY' : 
                           game.type === 'strategy' ? '🏗️ STRATEGY' : '🎮 GAME'}
                        </div>
                        <div className="slot-status">
                          {game.status === 'completed' ? '✅ COMPLETE' :
                           game.status === 'selected' ? '🎮 PLAYING' :
                           '⏳ QUEUE'}
                        </div>
                      </div>
                      <div className="slot-content">
                        <div className="game-name">
                          {game.status === 'not_started' ? 'Empty' : 
                           game.name || `${game.type.charAt(0).toUpperCase() + game.type.slice(1)} Game`}
                        </div>
                        <div className="game-time">
                          {game.status === 'completed' ? '45h / 45h' :
                           game.status === 'selected' ? '12h / 20h' :
                           '0h / ?h'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="roadmap-actions">
                <button 
                  className="roadmap-btn primary"
                  onClick={() => {
                    if (!config.currentCycleStarted && currentCycle) {
                      startCycle(currentCycle.cycleNumber);
                    }
                  }}
                  disabled={config.currentCycleStarted}
                >
                  🚀 Next Phase
                </button>
                <button className="roadmap-btn secondary">
                  ⏸️ Pause Cycle
                </button>
                <button className="roadmap-btn secondary">
                  📊 Stats
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
              <h2>⚡ QUICK ACTIONS</h2>
              <div className="quick-actions-grid">
                <button className="quick-action-btn game-select">
                  <div className="action-icon">🎮</div>
                  <div className="action-label">OYUN SEÇ</div>
                </button>
                <button className="quick-action-btn time-log">
                  <div className="action-icon">⏱️</div>
                  <div className="action-label">SÜRE KAYDET</div>
                </button>
                <button className="quick-action-btn report-gen">
                  <div className="action-icon">📊</div>
                  <div className="action-label">RAPOR OLUŞTUR</div>
                </button>
                <button className="quick-action-btn settings">
                  <div className="action-icon">⚙️</div>
                  <div className="action-label">AYAR PANEL</div>
                </button>
              </div>
            </div>

            <div className="filter-info">
              {Object.values(activeFilters).some(f => f !== false && f !== 'all') && (
                <p className="active-filters">
                  🔍 Filtreler aktif: {getFilteredCycles().length}/{routeState.cycles.length} cycle gösteriliyor
                </p>
              )}
            </div>
            {/* Cycle History & Management */}
            <div className="cycle-history-section">

              <div className="history-timeline">
                {getFilteredCycles().slice(0, 15).map((cycle) => {
                  const completedGames = cycle.games.filter(g => g.status === 'completed').length;
                  const progress = Math.round((completedGames / 3) * 100);
                  const cycleStatus = 
                    cycle.cycleNumber < config.currentCycle ? 'completed' :
                    cycle.cycleNumber === config.currentCycle ? 
                      (!config.currentCycleStarted ? 'pending' : 'in_progress') :
                    'pending';
                  
                  const isExpanded = expandedCycles.has(cycle.cycleNumber);
                  
                  return (
                    <div key={cycle.cycleNumber} className={`design2-cycle-card ${cycleStatus} ${isExpanded ? 'expanded' : 'collapsed'}`}>
                      {/* Design 2: Progress Bar Focused Layout */}
                      <div 
                        className="design2-header clickable"
                        onClick={() => toggleCycleExpansion(cycle.cycleNumber)}
                      >
                        {/* Minimal Header */}
                        <div className="design2-title-row">
                          <div className="expand-indicator">
                            {isExpanded ? '▼' : '▶'}
                          </div>
                          <h3 className="design2-cycle-title">CYCLE {cycle.cycleNumber}</h3>
                          <span className={`design2-status-badge ${cycleStatus}`}>
                            {cycleStatus === 'completed' ? '✅' :
                             cycleStatus === 'in_progress' ? '🎮' :
                             '⏳'}
                          </span>
                          <span className="design2-games-count">{completedGames}/3 oyun</span>
                        </div>
                        
                        {/* Cycle Genel Progress Bar */}
                        <div className="cycle-overall-progress">
                          <div className="cycle-progress-bar">
                            <div 
                              className={`cycle-progress-fill ${cycleStatus}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="cycle-progress-text">{progress}%</span>
                        </div>
                      </div>
                        
                        <div className={`cycle-details ${isExpanded ? 'expanded' : 'collapsed'}`}>
                          <div className="cycle-games">
                            {cycle.games.map((game, index) => {
                              // Tarih bilgilerini hesapla
                              const startDate = game.startDate || '—';
                              const endDate = game.endDate || (game.status === 'completed' ? 'Tamamlandı' : '—');
                              
                              // Progress hesapla (örnek - gerçek progress logic'i buraya eklenebilir)
                              const gameProgress = game.status === 'completed' ? 100 : 
                                                 game.status === 'selected' ? 45 : 0;
                              
                              return (
                                <div key={index} className={`game-mini compact ${game.status}`}>
                                  <div className="game-single-row">
                                    <div className="game-icon">
                                      {game.type === 'rpg' ? '🗡️' : 
                                       game.type === 'story' ? '📖' : 
                                       game.type === 'strategy' ? '🏗️' : '🎮'}
                                    </div>
                                    <div className="game-name">
                                      {game.name || (game.type === 'rpg' ? 'RPG Oyunu' :
                                       game.type === 'story' ? 'Story Oyunu' :
                                       game.type === 'strategy' ? 'Strategy Oyunu' : 'Oyun')}
                                    </div>
                                    <div className="game-dates-inline">
                                      <span className="date-start">{startDate}</span>
                                      <span className="date-separator">→</span>
                                      <span className="date-end">{endDate}</span>
                                    </div>
                                    <div className="game-status">
                                      {game.status === 'completed' ? '✅' :
                                       game.status === 'selected' ? '🎮' :
                                       '⏳'}
                                    </div>
                                    <div className="game-progress-container">
                                      <div className="game-progress-bar-individual">
                                        <div 
                                          className={`game-progress-fill-individual ${game.status}`}
                                          style={{ width: `${gameProgress}%` }}
                                        ></div>
                                      </div>
                                      <span className="game-progress-text">{gameProgress}%</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                    </div>
                  );
                })}
                {getFilteredCycles().length > 15 && (
                  <div className="history-cycle-card more">
                    <div className="cycle-content">
                      <span>... ve {getFilteredCycles().length - 15} cycle daha</span>
                    </div>
                  </div>
                )}
                {getFilteredCycles().length === 0 && (
                  <div className="history-cycle-card no-results">
                    <div className="cycle-content">
                      <span>🔍 Filtre kriterlerine uygun cycle bulunamadı</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Rule Guide Modal */}
        {showRuleGuide && (
          <div className="modal-overlay" onClick={() => setShowRuleGuide(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {ruleGuideType === 'completion' && '✅ Tamamlama Kriterleri'}
                  {ruleGuideType === 'route' && '🎯 Route Sistemi'}
                  {ruleGuideType === 'tips' && '💡 İpuçları & Stratejiler'}
                </h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowRuleGuide(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                {ruleGuideType === 'completion' && (
                  <div className="rule-content">
                    <h3>🎮 Oyun Tamamlama Kriterleri</h3>
                    <ul>
                      <li><strong>🗡️ RPG Oyunları:</strong> Ana hikaye + önemli side quest'ler (minimum 40-60 saat)</li>
                      <li><strong>📖 Story/Indie:</strong> Ana hikaye tamamlanmalı (10-20 saat)</li>
                      <li><strong>🏗️ Strategy/Sim:</strong> Temel mekanikleri öğrenme + 1 kampanya (20-40 saat)</li>
                    </ul>
                    
                    <h3>⏱️ Süre Limitleri</h3>
                    <ul>
                      <li>Her cycle maksimum <strong>3 ay</strong> sürmeli</li>
                      <li>Oyun başına minimum <strong>10 saat</strong> oynanmalı</li>
                      <li>Eğer oyun beğenilmezse <strong>5 saat</strong> sonra bırakılabilir</li>
                    </ul>
                  </div>
                )}
                
                {ruleGuideType === 'route' && (
                  <div className="rule-content">
                    <h3>🎯 VAULT ROUTE v2.2 Sistemi</h3>
                    <ul>
                      <li><strong>39 Cycle:</strong> Toplam 117 oyun (3 oyun/cycle)</li>
                      <li><strong>Oyun Türleri:</strong> Her cycle'da 1 RPG, 1 Story/Indie, 1 Strategy/Sim</li>
                      <li><strong>Sıralı İlerleme:</strong> Cycle'lar sırayla tamamlanmalı</li>
                      <li><strong>Esneklik:</strong> Cycle içinde oyun sırası değiştirilebilir</li>
                    </ul>
                    
                    <h3>📊 İlerleme Takibi</h3>
                    <ul>
                      <li>Her oyun için süre ve ilerleme kaydedilir</li>
                      <li>Cycle tamamlandığında sonraki cycle açılır</li>
                      <li>İstatistikler ve analytics sürekli güncellenir</li>
                    </ul>
                  </div>
                )}
                
                {ruleGuideType === 'tips' && (
                  <div className="rule-content">
                    <h3>💡 Başarı İpuçları</h3>
                    <ul>
                      <li><strong>🎯 Hedef Belirleme:</strong> Her cycle için net hedefler koy</li>
                      <li><strong>⏰ Zaman Yönetimi:</strong> Günlük 1-2 saat oyun oyna</li>
                      <li><strong>📝 Not Tutma:</strong> Oyun deneyimlerini kaydet</li>
                      <li><strong>🔄 Çeşitlilik:</strong> Farklı türleri dengeyle</li>
                    </ul>
                    
                    <h3>🚫 Kaçınılması Gerekenler</h3>
                    <ul>
                      <li>Aynı anda çok fazla oyun oynamak</li>
                      <li>Cycle'ları atlamak veya karıştırmak</li>
                      <li>Oyunları yarım bırakmak (5 saat kuralı hariç)</li>
                      <li>İstatistikleri takip etmemek</li>
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  className="modal-btn"
                  onClick={() => setShowRuleGuide(false)}
                >
                  Anladım
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Selector Modal */}
        {showGameSelector && selectedGameType && (
          <div className="modal-overlay" onClick={() => setShowGameSelector(false)}>
            <div className="modal-content game-selector-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {selectedGameType === 'rpg' && '🗡️ RPG Oyunu Seç'}
                  {selectedGameType === 'story' && '📖 Story/Indie Oyunu Seç'}
                  {selectedGameType === 'strategy' && '🏗️ Strategy/Sim Oyunu Seç'}
                </h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowGameSelector(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                <div className="game-list">
                  {gameDatabase[selectedGameType]?.map(game => (
                    <div 
                      key={game.id} 
                      className={`game-option ${selectedGame?.id === game.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedGame(game);
                        setSelectedCampaign(null); // Oyun değiştiğinde campaign seçimini sıfırla
                      }}
                    >
                      <div className="game-info">
                        <h4>{game.name}</h4>
                        <p>⏱️ Tahmini süre: {game.hours} saat</p>
                        {game.campaigns && game.campaigns.length > 0 && (
                          <span className="campaign-count">{game.campaigns.length} campaign</span>
                        )}
                      </div>
                      <button 
                        className="btn-select"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!game.campaigns || game.campaigns.length <= 1) {
                            confirmGameSelection(game.id);
                          }
                        }}
                      >
                        Seç
                      </button>
                    </div>
                  ))}
                </div>

                {/* Campaign Seçimi */}
                {selectedGame && selectedGame.campaigns && selectedGame.campaigns.length > 1 && (
                  <div className="campaign-selection">
                    <h4>Campaign Seç:</h4>
                    <div className="campaign-list">
                      {selectedGame.campaigns.map(campaign => (
                        <div 
                          key={campaign.id}
                          className={`campaign-item ${selectedCampaign?.id === campaign.id ? 'selected' : ''}`}
                          onClick={() => setSelectedCampaign(campaign)}
                        >
                          <div className="campaign-info">
                            <h5>{campaign.name}</h5>
                            <p>{campaign.description}</p>
                            <div className="campaign-meta">
                              <span className={`status ${campaign.status.toLowerCase().replace(' ', '-')}`}>
                                {campaign.status}
                              </span>
                              <span className="progress">{campaign.progress}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  className="modal-btn secondary"
                  onClick={() => {
                    setShowGameSelector(false);
                    setSelectedGame(null);
                    setSelectedCampaign(null);
                  }}
                >
                  İptal
                </button>
                {selectedGame && (
                  <button 
                    className="modal-btn primary"
                    onClick={() => confirmGameSelection(selectedGame.id)}
                    disabled={selectedGame.campaigns && selectedGame.campaigns.length > 1 && !selectedCampaign}
                  >
                    Seç
                  </button>
                )}
              </div>
            </div>
           </div>
         )}

        {/* Cycle Düzenleme Modal */}
        {showEditCycleModal && editingCycle && (
          <div className="modal-overlay" onClick={() => setShowEditCycleModal(false)}>
            <div className="modal-content edit-cycle-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>✏️ Cycle {editingCycle.cycleNumber} Düzenle</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowEditCycleModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                <div className="cycle-edit-content">
                  <p className="cycle-info">
                    Bu cycle'daki oyunları düzenleyebilirsin. Her cycle'da 3 oyun olmalı:
                    <strong> 1 RPG, 1 Story/Indie, 1 Strategy/Sim</strong>
                  </p>
                  
                  <div className="games-edit-list">
                    {editingCycle.games.map((game, index) => (
                      <div key={index} className="game-edit-item">
                        <div className="game-type-icon">
                          {game.type === 'rpg' ? '🗡️' : 
                           game.type === 'story' ? '📖' : 
                           game.type === 'strategy' ? '🏗️' : '🎮'}
                        </div>
                        <div className="game-details">
                          <div className="game-type-label">
                            {game.type === 'rpg' ? 'RPG Oyunu' :
                             game.type === 'story' ? 'Story/Indie Oyunu' :
                             game.type === 'strategy' ? 'Strategy/Sim Oyunu' : 'Oyun'}
                          </div>
                          <div className="game-name">
                            {game.name || `${game.type} oyunu seçilmemiş`}
                          </div>
                          <div className="game-status">
                            Durum: {
                              game.status === 'completed' ? '✅ Tamamlandı' :
                              game.status === 'active' ? '🎮 Aktif' :
                              game.status === 'started' ? '▶️ Başlandı' :
                              '⏸️ Başlanmadı'
                            }
                          </div>
                        </div>
                        <div className="game-actions">
                          <button 
                            className="btn-change-game"
                            onClick={() => {
                              setSelectedGameType(game.type);
                              setShowGameSelector(true);
                              setShowEditCycleModal(false);
                            }}
                          >
                            🔄 Değiştir
                          </button>
                          {game.status !== 'completed' && (
                            <button 
                              className="btn-reset-status"
                              onClick={() => handleResetGameStatus(editingCycle.cycleNumber, index)}
                            >
                              🔄 Sıfırla
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="modal-btn secondary"
                  onClick={() => setShowEditCycleModal(false)}
                >
                  Kapat
                </button>
                <button 
                  className="modal-btn primary"
                  onClick={() => {
                    showToast('Cycle düzenleme özelliği yakında aktif olacak!', 'info');
                    setShowEditCycleModal(false);
                  }}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notifications */}
        <div className="toast-container">
          {toasts.map(toast => (
            <div 
              key={toast.id} 
              className={`toast toast-${toast.type}`}
              onClick={() => removeToast(toast.id)}
            >
              <span>{toast.message}</span>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
    );
  }
  
  export default RoutePlanner;