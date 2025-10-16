import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoute } from '../../contexts/RouteContext';
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
  
  // Toast notification state
  const [toasts, setToasts] = useState([]);
  
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
    
    contextSelectGame(currentCycle.cycleNumber, gamePosition, gameId);
    setShowGameSelector(false);
    setSelectedGameType(null);
    
    // Toast notification göster
    showToast(`🎮 ${selectedGame?.name || 'Oyun'} seçildi!`, 'success');
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
      {/* Genel İlerleme Barı */}
      <div className="route-planner__progress-bar">
        {/* Modern Header Card */}
        <div className="modern-header">
          <div className="header-left">
            <button 
              className="nav-button home-button"
              onClick={goToHome}
              title="Ana Sayfaya Dön"
            >
              🏠
            </button>
            <button 
              className="nav-button hub-button"
              onClick={goToGameHub}
              title="Oyun Hub'ına Dön"
            >
              🎮 Hub
            </button>
          </div>
          
          <div className="header-center">
            <h1 className="route-title">🎯 VAULT ROUTE v2.2</h1>
          </div>
        </div>
        <div className="progress-info">
          <span>
            Cycle {config.currentCycle}/{ROUTE_CONFIG.totalCycles} • 
            Oyun {analytics.completedGames + 1}/{ROUTE_CONFIG.totalGames}
          </span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${routeProgress}%` }}></div>
          </div>
          <span>%{routeProgress} Tamamlandı</span>
        </div>
      </div>

      <div className="route-planner__content">
        {/* Sol Sidebar */}
        <div className="route-planner__sidebar slide-in-left">
          <div className="sidebar-section fade-in">
            <h3>🎯 AKTİF CYCLE</h3>
            <div className="active-cycle-info">
              <p>Cycle {config.currentCycle}/{ROUTE_CONFIG.totalCycles}</p>
              <p>
                {activeGame 
                  ? `Aktif: ${activeGame.type} Oyunu`
                  : `Oyun Seçilmedi`
                }
              </p>
              <p>İlerleme: %{currentCycle ? Math.round(
                (currentCycle.games.filter(g => g.status === 'completed').length / 3) * 100
              ) : 0}</p>
              <p>
                Toplam Süre: {analytics.totalHoursPlayed}h / 
                {currentCycle ? currentCycle.estimatedHours : 0}h
              </p>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>⚡ QUICK ACCESS</h3>
            <div className="quick-actions">
              <button 
                className="quick-btn"
                onClick={() => {
                  if (!config.routeStarted) {
                    startRoute();
                  } else if (!config.currentCycleStarted) {
                    startCycle();
                  }
                }}
                disabled={config.routeStarted && config.currentCycleStarted}
              >
                {!config.routeStarted ? '🚀 Route Başlat' : 
                 !config.currentCycleStarted ? '🎯 Cycle Başlat' : 
                 '🎮 Oyun Seç'}
              </button>
              <button 
                className="quick-btn"
                disabled={!activeGame}
              >
                ✅ Tamamla
              </button>
              <button 
                className="quick-btn"
                disabled={!currentCycle || currentCycle.games.filter(g => g.status === 'completed').length < 3}
              >
                ⏭️ Sonraki Cycle
              </button>
              <button 
                className="quick-btn"
                onClick={() => window.location.href = '/statistics'}
              >
                📊 İstatistikler
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>📋 FİLTRELER</h3>
            
            {/* Game Type Filters */}
            <div className="filter-group">
              <h4>Oyun Türü</h4>
              <button 
                className={`filter-btn ${activeFilters.rpg ? 'active' : ''}`}
                onClick={() => toggleFilter('rpg')}
              >
                🗡️ RPG
              </button>
              <button 
                className={`filter-btn ${activeFilters.story ? 'active' : ''}`}
                onClick={() => toggleFilter('story')}
              >
                📖 Story/Indie
              </button>
              <button 
                className={`filter-btn ${activeFilters.strategy ? 'active' : ''}`}
                onClick={() => toggleFilter('strategy')}
              >
                🏗️ Strategy/Sim
              </button>
            </div>

            {/* Status Filters */}
            <div className="filter-group">
              <h4>Durum</h4>
              <button 
                className={`filter-btn ${activeFilters.status === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                📋 Tümü
              </button>
              <button 
                className={`filter-btn ${activeFilters.status === 'active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                🔥 Aktif
              </button>
              <button 
                className={`filter-btn ${activeFilters.status === 'completed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('completed')}
              >
                ✅ Tamamlandı
              </button>
              <button 
                className={`filter-btn ${activeFilters.status === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                ⏳ Beklemede
              </button>
            </div>

            {/* Clear Filters */}
            <button 
              className="clear-filters-btn"
              onClick={() => setActiveFilters({
                rpg: false,
                story: false,
                strategy: false,
                favorites: false,
                status: 'all'
              })}
            >
              🗑️ Filtreleri Temizle
            </button>
          </div>

          <div className="sidebar-section">
            <h3>📖 KURAL KILAVUZU</h3>
            <button 
              className="rule-btn"
              onClick={() => {
                setRuleGuideType('completion');
                setShowRuleGuide(true);
              }}
            >
              ✅ Tamamlama Kriterleri
            </button>
            <button 
              className="rule-btn"
              onClick={() => {
                setRuleGuideType('route');
                setShowRuleGuide(true);
              }}
            >
              🎯 Route Sistemi
            </button>
            <button 
              className="rule-btn"
              onClick={() => {
                setRuleGuideType('tips');
                setShowRuleGuide(true);
              }}
            >
              💡 İpuçları & Stratejiler
            </button>
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="route-planner__main">
          <div className="main-content slide-in-right">
            {/* Detaylı Progress Section */}
            <div className="detailed-progress-section fade-in">
              <h2>📊 Route İlerlemesi</h2>
              <div className="progress-stats">
                <div className="stat-card fade-in" style={{'--animation-delay': '0.1s'}}>
                  <h4>🎯 Genel İlerleme</h4>
                  <div className="progress-circle">
                    <span className="progress-text">{routeProgress}%</span>
                  </div>
                  <p>{analytics.completedGames}/{analytics.totalGames} Oyun</p>
                </div>
                <div className="stat-card fade-in" style={{'--animation-delay': '0.2s'}}>
                  <h4>🔥 Aktif Cycle</h4>
                  <div className="cycle-progress">
                    <span className="cycle-number">#{config.currentCycle}</span>
                    <div className="cycle-status">
                      {!config.currentCycleStarted ? '⏸️ Başlamadı' : 
                       currentCycle?.games.filter(g => g.status === 'completed').length === 3 ? '✅ Tamamlandı' :
                       '🎮 Devam Ediyor'}
                    </div>
                  </div>
                  <p>{currentCycle?.games.filter(g => g.status !== 'not_started').length || 0}/3 Oyun Seçildi</p>
                </div>
                <div className="stat-card fade-in" style={{'--animation-delay': '0.3s'}}>
                  <h4>⏱️ Zaman</h4>
                  <div className="time-stats">
                    <span className="hours-played">{analytics.totalHours}h</span>
                    <span className="hours-estimated">/{analytics.estimatedHours}h</span>
                  </div>
                  <p>Tahmini Süre</p>
                </div>
              </div>
            </div>

            <h2>🎯 Aktif & Sonraki Cycle'lar</h2>
            
            <div className="cycle-cards">
              {/* Aktif Cycle */}
              {currentCycle && (
                <div className="cycle-card active">
                  <div className="cycle-header">
                    <h3>🔥 AKTİF CYCLE - Cycle {currentCycle.cycleNumber}</h3>
                    <div className="cycle-progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${Math.round((currentCycle.games.filter(g => g.status === 'completed').length / 3) * 100)}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="cycle-info">
                    <div className="cycle-status">
                      <span className="status-badge">
                        {!config.currentCycleStarted ? '⏸️ Başlamadı' :
                         currentCycle.games.filter(g => g.status === 'completed').length === 3 ? '✅ Tamamlandı' :
                         '🎮 Devam Ediyor'}
                      </span>
                      <span className="game-count">
                        {currentCycle.games.filter(g => g.status !== 'not_started').length}/3 Oyun
                      </span>
                    </div>
                  </div>

                  <div className="cycle-games">
                    {currentCycle.games.map((game, index) => (
                      <div key={index} className={`game-slot ${game.status}`}>
                        <div className="game-type">
                          {game.type === 'rpg' ? '🗡️ RPG' : 
                           game.type === 'story' ? '📖 Story' : 
                           game.type === 'strategy' ? '🏗️ Strategy' : '🎮 Game'}
                        </div>
                        <div className="game-name">
                          {game.status === 'not_started' ? 'Oyun Seçilmedi' : 
                           game.name || `${game.type.toUpperCase()} Oyunu`}
                        </div>
                        <div className="game-actions">
                          {game.status === 'not_started' && config.currentCycleStarted && (
                            <button className="select-game-btn" onClick={() => selectGame(game.type)}>
                              Seç
                            </button>
                          )}
                          {game.status === 'selected' && (
                            <button className="complete-game-btn" onClick={() => completeGame(game.type)}>
                              Tamamla
                            </button>
                          )}
                          {game.status === 'completed' && (
                            <span className="completed-badge">✅</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="cycle-actions">
                    <button 
                      className="cycle-btn primary"
                      onClick={() => {
                        if (!config.currentCycleStarted) {
                          startCycle(currentCycle.cycleNumber);
                        }
                      }}
                      disabled={config.currentCycleStarted}
                    >
                      {!config.currentCycleStarted ? '🚀 Cycle Başlat' : '🎮 Devam Ediyor'}
                    </button>
                    {config.currentCycleStarted && currentCycle.games.filter(g => g.status === 'completed').length === 3 && (
                      <button className="cycle-btn success" onClick={goToNextCycle}>
                        ➡️ Sonraki Cycle
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Sonraki Cycle */}
              {nextCycle && (
                <div className="cycle-card next">
                  <div className="cycle-header">
                    <h3>⏳ SONRAKİ CYCLE - Cycle {nextCycle.cycleNumber}</h3>
                    <div className="cycle-progress-bar">
                      <div className="progress-fill" style={{width: '0%'}}></div>
                    </div>
                  </div>
                  
                  <div className="cycle-info">
                    <div className="cycle-status">
                      <span className="status-badge">⏳ Beklemede</span>
                      <span className="game-count">0/3 Oyun</span>
                    </div>
                  </div>

                  <div className="cycle-games">
                    {nextCycle.games.map((game, index) => (
                      <div key={index} className="game-slot not_started">
                        <div className="game-type">
                          {game.type === 'rpg' ? '🗡️ RPG' : 
                           game.type === 'story' ? '📖 Story' : 
                           game.type === 'strategy' ? '🏗️ Strategy' : '🎮 Game'}
                        </div>
                        <div className="game-name">Beklemede</div>
                        <div className="game-actions">
                          <span className="waiting-badge">⏳</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="cycle-actions">
                    <button className="cycle-btn disabled" disabled>
                      🔒 Aktif Cycle'ı Tamamla
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <h2>📋 Tüm Cycle'lar</h2>
            <div className="filter-info">
              {Object.values(activeFilters).some(f => f !== false && f !== 'all') && (
                <p className="active-filters">
                  🔍 Filtreler aktif: {getFilteredCycles().length}/{routeState.cycles.length} cycle gösteriliyor
                </p>
              )}
            </div>
            <div className="all-cycles">
              {getFilteredCycles().slice(0, 15).map((cycle) => {
                const completedGames = cycle.games.filter(g => g.status === 'completed').length;
                const progress = Math.round((completedGames / 3) * 100);
                
                return (
                  <div key={cycle.cycleNumber} className="cycle-item">
                    <span>Cycle {cycle.cycleNumber}</span>
                    <span>{
                      cycle.cycleNumber < config.currentCycle ? 'Tamamlandı' :
                      cycle.cycleNumber === config.currentCycle ? 
                        (!config.currentCycleStarted ? 'Başlamadı' : 'Devam Ediyor') :
                      'Beklemede'
                    }</span>
                    <span>{cycle.games.filter(g => g.status !== 'not_started').length}/3</span>
                    <span>%{progress}</span>
                    <span className="cycle-games-preview">
                      {cycle.games.map(g => 
                        g.type === 'rpg' ? '🗡️' : 
                        g.type === 'story' ? '📖' : 
                        g.type === 'strategy' ? '🏗️' : '🎮'
                      ).join(' ')}
                    </span>
                  </div>
                );
              })}
              {getFilteredCycles().length > 15 && (
                <div className="cycle-item more">
                  <span>... ve {getFilteredCycles().length - 15} cycle daha</span>
                </div>
              )}
              {getFilteredCycles().length === 0 && (
                <div className="cycle-item no-results">
                  <span>🔍 Filtre kriterlerine uygun cycle bulunamadı</span>
                </div>
              )}
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
                    <div key={game.id} className="game-option" onClick={() => confirmGameSelection(game.id)}>
                      <div className="game-info">
                        <h4>{game.name}</h4>
                        <p>⏱️ Tahmini süre: {game.hours} saat</p>
                      </div>
                      <button className="btn-select">Seç</button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="modal-btn secondary"
                  onClick={() => setShowGameSelector(false)}
                >
                  İptal
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
    );
  }
  
  export default RoutePlanner;