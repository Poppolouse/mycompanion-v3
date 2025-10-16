import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * RouteContext - VAULT ROUTE v2.2 Data Management
 * 
 * 117 oyunluk route sistemini yönetir:
 * - 39 Cycle (her cycle 3 oyun)
 * - Route progress tracking
 * - localStorage persistence
 */

const RouteContext = createContext(null);

// Route Configuration
const ROUTE_CONFIG = {
  totalCycles: 39,
  totalGames: 117,
  gamesPerCycle: 3,
  gameTypes: ['RPG', 'Story/Indie', 'Strategy/Sim']
};

// Initial Route State
const createInitialRouteState = () => ({
  config: {
    ...ROUTE_CONFIG,
    currentCycle: 1,
    currentGame: 1,
    startDate: null,
    estimatedEndDate: null,
    isActive: false
  },
  cycles: Array.from({ length: ROUTE_CONFIG.totalCycles }, (_, index) => ({
    cycleNumber: index + 1,
    status: index === 0 ? 'pending' : 'locked', // 'locked', 'pending', 'active', 'completed'
    startDate: null,
    endDate: null,
    estimatedHours: 180, // 60 saat x 3 oyun
    actualHours: 0,
    games: ROUTE_CONFIG.gameTypes.map((type, gameIndex) => ({
      position: gameIndex + 1,
      type: type,
      gameId: null, // GameTracker'dan seçilecek
      status: 'empty', // 'empty', 'selected', 'active', 'completed'
      completionCriteria: getCompletionCriteria(type),
      estimatedHours: getEstimatedHours(type),
      actualHours: 0,
      startDate: null,
      endDate: null,
      notes: '',
      progress: 0 // 0-100
    }))
  })),
  analytics: {
    totalHoursPlayed: 0,
    completedCycles: 0,
    completedGames: 0,
    averageGameHours: 0,
    currentStreak: 0,
    longestStreak: 0,
    startDate: null,
    lastPlayDate: null
  }
});

// Tamamlama kriterleri
function getCompletionCriteria(gameType) {
  switch (gameType) {
    case 'RPG':
      return 'Ana hikaye + önemli yan görevler';
    case 'Story/Indie':
      return '%100 tamamlama veya hikaye sonu';
    case 'Strategy/Sim':
      return 'Minimum 50 saat oynanış';
    default:
      return 'Oyunu bitir';
  }
}

// Tahmini süreler
function getEstimatedHours(gameType) {
  switch (gameType) {
    case 'RPG':
      return 80;
    case 'Story/Indie':
      return 20;
    case 'Strategy/Sim':
      return 80;
    default:
      return 60;
  }
}

export function RouteProvider({ children }) {
  const [routeState, setRouteState] = useState(createInitialRouteState);
  const [loading, setLoading] = useState(true);

  // localStorage'dan route state'i yükle
  useEffect(() => {
    const savedRoute = localStorage.getItem('vaulttracker:route:state');
    if (savedRoute) {
      try {
        const parsedRoute = JSON.parse(savedRoute);
        setRouteState(parsedRoute);
        console.log('🎯 Route state localStorage\'dan yüklendi');
      } catch (error) {
        console.error('❌ Route state yükleme hatası:', error);
        // Hatalı data varsa sıfırla
        localStorage.removeItem('vaulttracker:route:state');
      }
    }
    setLoading(false);
  }, []);

  // Route state'i localStorage'a kaydet
  const saveRouteState = (newState) => {
    setRouteState(newState);
    localStorage.setItem('vaulttracker:route:state', JSON.stringify(newState));
    console.log('💾 Route state kaydedildi');
  };

  // Route'u başlat
  const startRoute = (startDate = new Date()) => {
    const newState = {
      ...routeState,
      config: {
        ...routeState.config,
        startDate: startDate.toISOString(),
        isActive: true,
        currentCycle: 1,
        currentGame: 1
      },
      cycles: routeState.cycles.map((cycle, index) => ({
        ...cycle,
        status: index === 0 ? 'pending' : 'locked'
      })),
      analytics: {
        ...routeState.analytics,
        startDate: startDate.toISOString()
      }
    };
    saveRouteState(newState);
  };

  // Cycle başlat
  const startCycle = (cycleNumber) => {
    const newState = {
      ...routeState,
      config: {
        ...routeState.config,
        currentCycle: cycleNumber
      },
      cycles: routeState.cycles.map(cycle => 
        cycle.cycleNumber === cycleNumber
          ? { ...cycle, status: 'active', startDate: new Date().toISOString() }
          : cycle
      )
    };
    saveRouteState(newState);
  };

  // Oyun seç
  const selectGame = (cycleNumber, gamePosition, gameId) => {
    const newState = {
      ...routeState,
      cycles: routeState.cycles.map(cycle => 
        cycle.cycleNumber === cycleNumber
          ? {
              ...cycle,
              games: cycle.games.map(game =>
                game.position === gamePosition
                  ? { ...game, gameId, status: 'selected' }
                  : game
              )
            }
          : cycle
      )
    };
    saveRouteState(newState);
  };

  // Oyun başlat
  const startGame = (cycleNumber, gamePosition) => {
    const newState = {
      ...routeState,
      cycles: routeState.cycles.map(cycle => 
        cycle.cycleNumber === cycleNumber
          ? {
              ...cycle,
              games: cycle.games.map(game =>
                game.position === gamePosition
                  ? { 
                      ...game, 
                      status: 'active', 
                      startDate: new Date().toISOString() 
                    }
                  : game
              )
            }
          : cycle
      )
    };
    saveRouteState(newState);
  };

  // Oyun tamamla
  const completeGame = (cycleNumber, gamePosition, actualHours = 0, notes = '') => {
    const newState = {
      ...routeState,
      cycles: routeState.cycles.map(cycle => 
        cycle.cycleNumber === cycleNumber
          ? {
              ...cycle,
              games: cycle.games.map(game =>
                game.position === gamePosition
                  ? { 
                      ...game, 
                      status: 'completed',
                      endDate: new Date().toISOString(),
                      actualHours,
                      notes,
                      progress: 100
                    }
                  : game
              ),
              actualHours: cycle.actualHours + actualHours
            }
          : cycle
      ),
      analytics: {
        ...routeState.analytics,
        totalHoursPlayed: routeState.analytics.totalHoursPlayed + actualHours,
        completedGames: routeState.analytics.completedGames + 1,
        lastPlayDate: new Date().toISOString()
      }
    };

    // Cycle tamamlandı mı kontrol et
    const updatedCycle = newState.cycles.find(c => c.cycleNumber === cycleNumber);
    const allGamesCompleted = updatedCycle.games.every(g => g.status === 'completed');
    
    if (allGamesCompleted) {
      newState.cycles = newState.cycles.map(cycle => 
        cycle.cycleNumber === cycleNumber
          ? { ...cycle, status: 'completed', endDate: new Date().toISOString() }
          : cycle.cycleNumber === cycleNumber + 1
          ? { ...cycle, status: 'pending' }
          : cycle
      );
      
      newState.analytics.completedCycles += 1;
      newState.config.currentCycle = Math.min(cycleNumber + 1, ROUTE_CONFIG.totalCycles);
    }

    saveRouteState(newState);
  };

  // Progress güncelle
  const updateGameProgress = (cycleNumber, gamePosition, progress, hours = 0) => {
    const newState = {
      ...routeState,
      cycles: routeState.cycles.map(cycle => 
        cycle.cycleNumber === cycleNumber
          ? {
              ...cycle,
              games: cycle.games.map(game =>
                game.position === gamePosition
                  ? { ...game, progress, actualHours: game.actualHours + hours }
                  : game
              )
            }
          : cycle
      )
    };
    saveRouteState(newState);
  };

  // Route sıfırla
  const resetRoute = () => {
    const newState = createInitialRouteState();
    saveRouteState(newState);
  };

  // Helper functions
  const getCurrentCycle = () => {
    return routeState.cycles.find(cycle => cycle.cycleNumber === routeState.config.currentCycle);
  };

  const getNextCycle = () => {
    const nextCycleNumber = routeState.config.currentCycle + 1;
    return routeState.cycles.find(cycle => cycle.cycleNumber === nextCycleNumber);
  };

  const getActiveGame = () => {
    const currentCycle = getCurrentCycle();
    if (!currentCycle) return null;
    return currentCycle.games.find(game => game.status === 'active');
  };

  const getRouteProgress = () => {
    const completedGames = routeState.analytics.completedGames;
    const totalGames = ROUTE_CONFIG.totalGames;
    return Math.round((completedGames / totalGames) * 100);
  };

  const value = {
    // State
    routeState,
    loading,
    
    // Actions
    startRoute,
    startCycle,
    selectGame,
    startGame,
    completeGame,
    updateGameProgress,
    resetRoute,
    
    // Helpers
    getCurrentCycle,
    getNextCycle,
    getActiveGame,
    getRouteProgress,
    
    // Config
    ROUTE_CONFIG
  };

  return (
    <RouteContext.Provider value={value}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoute() {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRoute must be used within RouteProvider');
  }
  return context;
}

export default RouteContext;