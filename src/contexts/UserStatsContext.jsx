import React, { createContext, useContext, useState, useEffect } from 'react';

const UserStatsContext = createContext(null);

/**
 * Kullanıcı istatistikleri context'i
 * Playtime tracking, favoriler, clips ve diğer kullanıcı verilerini yönetir
 */
export function UserStatsProvider({ children }) {
  // Temel state'ler
  const [userStats, setUserStats] = useState({
    totalPlaytime: 0, // Toplam oyun süresi (dakika)
    gamesPlayed: 0,   // Oynanan oyun sayısı
    averageProgress: 0, // Ortalama ilerleme
    lastUpdated: null
  });

  const [gamePlaytimes, setGamePlaytimes] = useState({}); // gameId: { totalMinutes, sessions: [] }
  const [favorites, setFavorites] = useState(new Set()); // Favori oyun ID'leri
  const [clips, setClips] = useState([]); // Oyun klipleri
  const [achievements, setAchievements] = useState([]); // Başarımlar
  const [isTracking, setIsTracking] = useState(false); // Aktif tracking durumu
  const [currentSession, setCurrentSession] = useState(null); // Aktif oyun oturumu

  // LocalStorage key'leri
  const STORAGE_KEYS = {
    USER_STATS: 'vaulttracker:stats:user',
    GAME_PLAYTIMES: 'vaulttracker:stats:playtimes',
    FAVORITES: 'vaulttracker:stats:favorites',
    CLIPS: 'vaulttracker:stats:clips',
    ACHIEVEMENTS: 'vaulttracker:stats:achievements'
  };

  // Component mount'ta verileri yükle
  useEffect(() => {
    loadUserStats();
  }, []);

  // Verileri localStorage'dan yükle
  const loadUserStats = () => {
    try {
      // Kullanıcı istatistikleri
      const savedStats = localStorage.getItem(STORAGE_KEYS.USER_STATS);
      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
      }

      // Oyun playtime'ları
      const savedPlaytimes = localStorage.getItem(STORAGE_KEYS.GAME_PLAYTIMES);
      if (savedPlaytimes) {
        setGamePlaytimes(JSON.parse(savedPlaytimes));
      }

      // Favoriler
      const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }

      // Klipler
      const savedClips = localStorage.getItem(STORAGE_KEYS.CLIPS);
      if (savedClips) {
        setClips(JSON.parse(savedClips));
      }

      // Başarımlar
      const savedAchievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (savedAchievements) {
        setAchievements(JSON.parse(savedAchievements));
      }
    } catch (error) {
      console.error('Kullanıcı istatistikleri yüklenirken hata:', error);
    }
  };

  // Verileri localStorage'a kaydet
  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Veri kaydedilirken hata:', error);
    }
  };

  // Oyun oturumu başlat
  const startGameSession = (gameId, gameTitle) => {
    if (isTracking) {
      console.warn('Zaten bir oyun oturumu aktif!');
      return;
    }

    const session = {
      gameId,
      gameTitle,
      startTime: Date.now(),
      endTime: null,
      duration: 0
    };

    setCurrentSession(session);
    setIsTracking(true);
    
    console.log(`🎮 Oyun oturumu başlatıldı: ${gameTitle}`);
  };

  // Oyun oturumu bitir
  const endGameSession = () => {
    if (!isTracking || !currentSession) {
      console.warn('Aktif oyun oturumu bulunamadı!');
      return;
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - currentSession.startTime) / 1000 / 60); // Dakika

    // Oturum verilerini güncelle
    const completedSession = {
      ...currentSession,
      endTime,
      duration
    };

    // Oyun playtime'ını güncelle
    updateGamePlaytime(currentSession.gameId, duration, completedSession);

    // Oturumu temizle
    setCurrentSession(null);
    setIsTracking(false);

    console.log(`⏹️ Oyun oturumu bitirildi: ${currentSession.gameTitle} (${duration} dakika)`);
    
    return completedSession;
  };

  // Oyun playtime'ını güncelle
  const updateGamePlaytime = (gameId, sessionMinutes, sessionData) => {
    setGamePlaytimes(prev => {
      const gameData = prev[gameId] || { totalMinutes: 0, sessions: [] };
      
      const updated = {
        totalMinutes: gameData.totalMinutes + sessionMinutes,
        sessions: [...gameData.sessions, sessionData],
        lastPlayed: Date.now()
      };

      const newPlaytimes = { ...prev, [gameId]: updated };
      saveToStorage(STORAGE_KEYS.GAME_PLAYTIMES, newPlaytimes);
      
      // Genel istatistikleri güncelle
      updateUserStats();
      
      return newPlaytimes;
    });
  };

  // Genel kullanıcı istatistiklerini güncelle
  const updateUserStats = () => {
    // Bu fonksiyon gamePlaytimes güncellendiğinde çağrılacak
    // useEffect ile handle edeceğiz
  };

  // gamePlaytimes değiştiğinde genel istatistikleri güncelle
  useEffect(() => {
    const totalPlaytime = Object.values(gamePlaytimes).reduce(
      (sum, game) => sum + game.totalMinutes, 0
    );
    
    const gamesPlayed = Object.keys(gamePlaytimes).length;
    
    const newStats = {
      totalPlaytime,
      gamesPlayed,
      averageProgress: 0, // Bu değer oyun listesinden hesaplanacak
      lastUpdated: Date.now()
    };

    setUserStats(newStats);
    saveToStorage(STORAGE_KEYS.USER_STATS, newStats);
  }, [gamePlaytimes]);

  // Favori ekle/çıkar
  const toggleFavorite = (gameId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      
      if (newFavorites.has(gameId)) {
        newFavorites.delete(gameId);
      } else {
        newFavorites.add(gameId);
      }
      
      saveToStorage(STORAGE_KEYS.FAVORITES, Array.from(newFavorites));
      return newFavorites;
    });
  };

  // Klip ekle
  const addClip = (clipData) => {
    const newClip = {
      id: Date.now().toString(),
      gameId: clipData.gameId,
      gameTitle: clipData.gameTitle,
      title: clipData.title,
      description: clipData.description || '',
      timestamp: Date.now(),
      duration: clipData.duration || 0,
      tags: clipData.tags || [],
      thumbnail: clipData.thumbnail || null,
      videoUrl: clipData.videoUrl || null
    };

    setClips(prev => {
      const updated = [newClip, ...prev];
      saveToStorage(STORAGE_KEYS.CLIPS, updated);
      return updated;
    });

    return newClip;
  };

  // Klip sil
  const removeClip = (clipId) => {
    setClips(prev => {
      const updated = prev.filter(clip => clip.id !== clipId);
      saveToStorage(STORAGE_KEYS.CLIPS, updated);
      return updated;
    });
  };

  // Başarım ekle
  const addAchievement = (achievementData) => {
    const newAchievement = {
      id: Date.now().toString(),
      gameId: achievementData.gameId,
      gameTitle: achievementData.gameTitle,
      title: achievementData.title,
      description: achievementData.description,
      icon: achievementData.icon || '🏆',
      rarity: achievementData.rarity || 'common', // common, rare, epic, legendary
      unlockedAt: Date.now()
    };

    setAchievements(prev => {
      const updated = [newAchievement, ...prev];
      saveToStorage(STORAGE_KEYS.ACHIEVEMENTS, updated);
      return updated;
    });

    return newAchievement;
  };

  // Oyun istatistiklerini getir
  const getGameStats = (gameId) => {
    const playtime = gamePlaytimes[gameId] || { totalMinutes: 0, sessions: [] };
    const isFavorite = favorites.has(gameId);
    const gameClips = clips.filter(clip => clip.gameId === gameId);
    const gameAchievements = achievements.filter(achievement => achievement.gameId === gameId);

    return {
      playtime: playtime.totalMinutes,
      sessions: playtime.sessions,
      lastPlayed: playtime.lastPlayed,
      isFavorite,
      clips: gameClips,
      achievements: gameAchievements,
      totalSessions: playtime.sessions.length
    };
  };

  // Playtime'ı formatla
  const formatPlaytime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} dakika`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours < 24) {
      return remainingMinutes > 0 
        ? `${hours} saat ${remainingMinutes} dakika`
        : `${hours} saat`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    return remainingHours > 0
      ? `${days} gün ${remainingHours} saat`
      : `${days} gün`;
  };

  // Context value
  const value = {
    // State
    userStats,
    gamePlaytimes,
    favorites,
    clips,
    achievements,
    isTracking,
    currentSession,

    // Actions
    startGameSession,
    endGameSession,
    toggleFavorite,
    addClip,
    removeClip,
    addAchievement,
    getGameStats,
    formatPlaytime,
    loadUserStats
  };

  return (
    <UserStatsContext.Provider value={value}>
      {children}
    </UserStatsContext.Provider>
  );
}

// Hook
export function useUserStats() {
  const context = useContext(UserStatsContext);
  if (!context) {
    throw new Error('useUserStats must be used within UserStatsProvider');
  }
  return context;
}

export default UserStatsContext;