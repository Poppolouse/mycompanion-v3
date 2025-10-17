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



// Initial Route State - Kütüphane verilerinden oluşturulur
const createInitialRouteState = () => {
  // Önce localStorage'dan mevcut route state'i kontrol et
  const savedRouteState = localStorage.getItem('vaulttracker:route:state');
  if (savedRouteState) {
    try {
      const parsed = JSON.parse(savedRouteState);
      console.log('💾 Kaydedilmiş route state yüklendi - cycle\'lar korunuyor');
      return parsed;
    } catch (error) {
      console.warn('⚠️ Kaydedilmiş route state bozuk, yenisi oluşturuluyor');
    }
  }

  console.log('🆕 Yeni route state oluşturuluyor - deterministik cycle\'lar');
  // Kütüphaneden cycle'ları oluştur (deterministik)
  const cycles = createCyclesFromLibrary();
  
  return {
    config: {
      ...ROUTE_CONFIG,
      currentCycle: 1,
      currentGame: 1,
      startDate: new Date().toISOString(),
      estimatedEndDate: null,
      isActive: false // Başlangıçta aktif değil
    },
    cycles,
    analytics: {
      totalHoursPlayed: 0,
      completedCycles: 0,
      completedGames: 0,
      averageGameHours: 0,
      currentStreak: 0,
      longestStreak: 0,
      startDate: new Date().toISOString(),
      lastPlayDate: null
    }
  };
};

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

// Kütüphaneden oyunları yükle
function loadGamesFromLibrary() {
  try {
    const savedGames = localStorage.getItem('gameTracker_games');
    if (!savedGames) {
      console.warn('⚠️ Kütüphanede oyun bulunamadı');
      return [];
    }
    
    const games = JSON.parse(savedGames);
    console.log('📚 Kütüphaneden yüklenen oyunlar:', games.length);
    return games;
  } catch (error) {
    console.error('❌ Kütüphane yükleme hatası:', error);
    return [];
  }
}

// Oyunları türlerine göre kategorilere ayır
function categorizeGamesByType(games) {
  const gamesByType = {
    'RPG': [],
    'Story/Indie': [],
    'Strategy/Sim': []
  };

  games.forEach(game => {
    const genre = (game.genre || game.tur || '').toLowerCase();
    const title = (game.title || game.name || '').toLowerCase();
    
    // RPG kategorisi
    if (genre.includes('rpg') || genre.includes('role') || title.includes('rpg')) {
      gamesByType['RPG'].push(game);
    }
    // Story/Indie kategorisi
    else if (
      genre.includes('story') || 
      genre.includes('indie') || 
      genre.includes('adventure') ||
      genre.includes('narrative') ||
      genre.includes('action adventure')
    ) {
      gamesByType['Story/Indie'].push(game);
    }
    // Strategy/Sim kategorisi
    else if (
      genre.includes('strategy') || 
      genre.includes('simulation') || 
      genre.includes('sim') ||
      genre.includes('management') ||
      genre.includes('city') ||
      genre.includes('building')
    ) {
      gamesByType['Strategy/Sim'].push(game);
    }
    // Eğer hiçbir kategoriye uymuyorsa, en az oyunu olan kategoriye ekle
    else {
      const minCategory = Object.keys(gamesByType).reduce((min, key) => 
        gamesByType[key].length < gamesByType[min].length ? key : min
      );
      gamesByType[minCategory].push(game);
    }
  });

  console.log('🎯 Kategorilere ayrılan oyunlar:', {
    RPG: gamesByType['RPG'].length,
    'Story/Indie': gamesByType['Story/Indie'].length,
    'Strategy/Sim': gamesByType['Strategy/Sim'].length
  });

  return gamesByType;
}

// Deterministik rastgele sayı üretici (seed-based)
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Kütüphaneden cycle'ları oluştur (deterministik)
function createCyclesFromLibrary() {
  const libraryGames = loadGamesFromLibrary();
  
  if (libraryGames.length === 0) {
    console.warn('⚠️ Kütüphanede oyun bulunamadığı için varsayılan cycle oluşturuluyor');
    return createDefaultCycles();
  }

  const gamesByType = categorizeGamesByType(libraryGames);
  const cycles = [];

  // Sabit seed kullanarak her zaman aynı sonucu al
  const baseSeed = 12345; // Sabit seed değeri

  // Her cycle için 3 oyun seç (RPG, Story/Indie, Strategy/Sim)
  for (let cycleIndex = 0; cycleIndex < ROUTE_CONFIG.totalCycles; cycleIndex++) {
    const cycleNumber = cycleIndex + 1;
    const cycle = {
      cycleNumber,
      status: cycleIndex === 0 ? 'pending' : 'locked',
      startDate: null,
      endDate: null,
      estimatedHours: 180,
      actualHours: 0,
      games: []
    };

    // Her türden bir oyun seç
    ['RPG', 'Story/Indie', 'Strategy/Sim'].forEach((gameType, gameIndex) => {
      const availableGames = gamesByType[gameType];
      
      if (availableGames.length > 0) {
        // Deterministik oyun seçimi (daha önce seçilmemiş olanlardan)
        const usedGameIds = cycles.flatMap(c => c.games.map(g => g.gameId)).filter(Boolean);
        const unusedGames = availableGames.filter(game => 
          !usedGameIds.includes(game.id || game.gameId)
        );
        
        // Cycle ve oyun pozisyonuna göre unique seed oluştur
        const seed = baseSeed + (cycleIndex * 3) + gameIndex;
        const randomValue = seededRandom(seed);
        
        const selectedGame = unusedGames.length > 0 
          ? unusedGames[Math.floor(randomValue * unusedGames.length)]
          : availableGames[Math.floor(randomValue * availableGames.length)];

        cycle.games.push({
          position: gameIndex + 1,
          type: gameType,
          gameId: selectedGame.id || selectedGame.gameId,
          name: selectedGame.title || selectedGame.name || `${gameType} Oyunu`,
          status: 'empty',
          completionCriteria: getCompletionCriteria(gameType),
          estimatedHours: getEstimatedHours(gameType),
          actualHours: 0,
          startDate: null,
          endDate: null,
          notes: '',
          progress: 0
        });
      } else {
        // Eğer o türde oyun yoksa placeholder ekle
        cycle.games.push({
          position: gameIndex + 1,
          type: gameType,
          gameId: null,
          name: null,
          status: 'empty',
          completionCriteria: getCompletionCriteria(gameType),
          estimatedHours: getEstimatedHours(gameType),
          actualHours: 0,
          startDate: null,
          endDate: null,
          notes: '',
          progress: 0
        });
      }
    });

    cycles.push(cycle);
  }

  console.log('🔄 Kütüphaneden oluşturulan cycle\'lar:', cycles.length);
  return cycles;
}

// Varsayılan cycle'ları oluştur (kütüphanede oyun yoksa)
function createDefaultCycles() {
  return Array.from({ length: ROUTE_CONFIG.totalCycles }, (_, index) => {
    const cycleNumber = index + 1;
    
    return {
      cycleNumber,
      status: index === 0 ? 'pending' : 'locked',
      startDate: null,
      endDate: null,
      estimatedHours: 180,
      actualHours: 0,
      games: ROUTE_CONFIG.gameTypes.map((type, gameIndex) => ({
        position: gameIndex + 1,
        type: type,
        gameId: null,
        name: null,
        status: 'empty',
        completionCriteria: getCompletionCriteria(type),
        estimatedHours: getEstimatedHours(type),
        actualHours: 0,
        startDate: null,
        endDate: null,
        notes: '',
        progress: 0
      }))
    };
  });
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
        // Hatalı state varsa kütüphaneden yeniden oluştur
        const newState = createInitialRouteState();
        setRouteState(newState);
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

  // Route'u sıfırla
  const resetRoute = () => {
    const newState = createInitialRouteState();
    saveRouteState(newState);
  };

  // Kütüphaneden oyunları yeniden yükle
  const refreshFromLibrary = () => {
    console.log('🔄 Kütüphaneden yeni oyunlar kontrol ediliyor...');
    
    // Mevcut route state'i koru, sadece yeni oyunları ekle
    const currentLibraryGames = loadGamesFromLibrary();
    const currentGamesByType = categorizeGamesByType(currentLibraryGames);
    
    // Mevcut cycle'ları koru, sadece boş slotları doldur
    const updatedCycles = routeState.cycles.map(cycle => {
      const updatedGames = cycle.games.map(game => {
        // Eğer oyun seçilmemişse (gameId null) ve o türde yeni oyunlar varsa
        if (!game.gameId && currentGamesByType[game.type]?.length > 0) {
          const availableGames = currentGamesByType[game.type];
          const usedGameIds = routeState.cycles.flatMap(c => 
            c.games.map(g => g.gameId).filter(Boolean)
          );
          const unusedGames = availableGames.filter(g => 
            !usedGameIds.includes(g.id || g.gameId)
          );
          
          if (unusedGames.length > 0) {
            // Deterministik seçim (cycle ve pozisyona göre)
            const seed = 12345 + (cycle.cycleNumber * 3) + game.position;
            const randomValue = seededRandom(seed);
            const selectedGame = unusedGames[Math.floor(randomValue * unusedGames.length)];
            
            return {
              ...game,
              gameId: selectedGame.id || selectedGame.gameId,
              name: selectedGame.title || selectedGame.name || `${game.type} Oyunu`
            };
          }
        }
        return game;
      });
      
      return { ...cycle, games: updatedGames };
    });
    
    const newState = {
      ...routeState,
      cycles: updatedCycles
    };
    
    saveRouteState(newState);
    console.log('✅ Kütüphane güncellendi - mevcut cycle\'lar korundu');
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

  // Cycle düzenleme fonksiyonları
  const updateCycleGame = (cycleNumber, gamePosition, newGameId, gameData = null) => {
    console.log(`🎮 Cycle ${cycleNumber} - Pozisyon ${gamePosition} oyunu güncelleniyor:`, newGameId, gameData);
    
    // Kütüphaneden oyun bilgilerini al
    const libraryGames = loadGamesFromLibrary();
    const selectedGame = libraryGames.find(game => 
      (game.id && game.id === newGameId) || (game.gameId && game.gameId === newGameId)
    );
    
    if (!selectedGame) {
      console.error('❌ Seçilen oyun kütüphanede bulunamadı:', newGameId);
      return false;
    }

    // Campaign bilgilerini hazırla
    let campaignInfo = {};
    if (gameData && gameData.campaignId) {
      const selectedCampaign = selectedGame.campaigns?.find(c => c.id === gameData.campaignId);
      if (selectedCampaign) {
        campaignInfo = {
          campaignId: selectedCampaign.id,
          campaignName: selectedCampaign.name,
          campaignDescription: selectedCampaign.description
        };
      }
    }

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
                      gameId: selectedGame.id || selectedGame.gameId,
                      name: selectedGame.title || selectedGame.name || `${game.type} Oyunu`,
                      status: game.status === 'completed' ? 'completed' : 'selected', // Tamamlanmış oyunları koru
                      ...campaignInfo // Campaign bilgilerini ekle
                    }
                  : game
              )
            }
          : cycle
      )
    };
    
    saveRouteState(newState);
    console.log('✅ Cycle oyunu güncellendi', campaignInfo.campaignName ? `(Campaign: ${campaignInfo.campaignName})` : '');
    return true;
  };

  const removeCycleGame = (cycleNumber, gamePosition) => {
    console.log(`🗑️ Cycle ${cycleNumber} - Pozisyon ${gamePosition} oyunu kaldırılıyor`);
    
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
                      gameId: null,
                      name: `${game.type} Oyunu`,
                      status: 'pending',
                      progress: 0,
                      actualHours: 0,
                      startDate: null,
                      endDate: null,
                      notes: ''
                    }
                  : game
              )
            }
          : cycle
      )
    };
    
    saveRouteState(newState);
    console.log('✅ Cycle oyunu kaldırıldı');
    return true;
  };

  const resetCycleGameStatus = (cycleNumber, gamePosition) => {
    console.log(`🔄 Cycle ${cycleNumber} - Pozisyon ${gamePosition} oyun durumu sıfırlanıyor`);
    
    const newState = {
      ...routeState,
      cycles: routeState.cycles.map(cycle => 
        cycle.cycleNumber === cycleNumber
          ? {
              ...cycle,
              games: cycle.games.map(game =>
                game.position === gamePosition && game.gameId
                  ? { 
                      ...game, 
                      status: 'selected',
                      progress: 0,
                      actualHours: 0,
                      startDate: null,
                      endDate: null,
                      notes: ''
                    }
                  : game
              )
            }
          : cycle
      )
    };
    
    saveRouteState(newState);
    console.log('✅ Cycle oyun durumu sıfırlandı');
    return true;
  };

  // Yeni cycle oluştur
  const createNewCycle = () => {
    console.log('🆕 Yeni cycle oluşturuluyor...');
    
    const newCycleNumber = routeState.cycles.length + 1;
    
    // Maksimum cycle sayısını kontrol et
    if (newCycleNumber > ROUTE_CONFIG.totalCycles) {
      console.warn('⚠️ Maksimum cycle sayısına ulaşıldı');
      return false;
    }
    
    const newCycle = {
      cycleNumber: newCycleNumber,
      status: 'locked',
      startDate: null,
      endDate: null,
      estimatedHours: 180,
      actualHours: 0,
      games: ROUTE_CONFIG.gameTypes.map((type, gameIndex) => ({
        position: gameIndex + 1,
        type: type.toLowerCase().replace('/', '_').replace(' ', '_'), // rpg, story_indie, strategy_sim
        gameId: null,
        name: null,
        status: 'empty',
        completionCriteria: getCompletionCriteria(type),
        estimatedHours: getEstimatedHours(type),
        actualHours: 0,
        startDate: null,
        endDate: null,
        notes: '',
        progress: 0
      }))
    };
    
    const newState = {
      ...routeState,
      cycles: [...routeState.cycles, newCycle],
      config: {
        ...routeState.config,
        totalCycles: newCycleNumber
      }
    };
    
    saveRouteState(newState);
    console.log(`✅ Cycle ${newCycleNumber} oluşturuldu`);
    return newCycle;
  };

  // Cycle sil
  const deleteCycle = (cycleNumber) => {
    console.log(`🗑️ Cycle ${cycleNumber} siliniyor...`);
    
    // Aktif cycle'ı silmeye izin verme
    if (cycleNumber === routeState.config.currentCycle) {
      console.warn('⚠️ Aktif cycle silinemez');
      return false;
    }
    
    // Tamamlanmış cycle'ı silmeye izin verme
    const cycleToDelete = routeState.cycles.find(c => c.cycleNumber === cycleNumber);
    if (cycleToDelete?.status === 'completed') {
      console.warn('⚠️ Tamamlanmış cycle silinemez');
      return false;
    }
    
    // Cycle'ı sil ve sonraki cycle'ların numaralarını güncelle
    const filteredCycles = routeState.cycles
      .filter(cycle => cycle.cycleNumber !== cycleNumber)
      .map((cycle, index) => ({
        ...cycle,
        cycleNumber: index + 1
      }));
    
    // Current cycle'ı güncelle (eğer silinen cycle'dan sonraysa)
    let newCurrentCycle = routeState.config.currentCycle;
    if (cycleNumber < routeState.config.currentCycle) {
      newCurrentCycle = Math.max(1, routeState.config.currentCycle - 1);
    }
    
    const newState = {
      ...routeState,
      cycles: filteredCycles,
      config: {
        ...routeState.config,
        currentCycle: newCurrentCycle,
        totalCycles: filteredCycles.length
      }
    };
    
    saveRouteState(newState);
    console.log(`✅ Cycle ${cycleNumber} silindi`);
    return true;
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
    refreshFromLibrary,
    
    // Cycle Management Actions
    createNewCycle,
    deleteCycle,
    
    // Cycle Editing Actions
    updateCycleGame,
    removeCycleGame,
    resetCycleGameStatus,
    
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