import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { searchGamesIGDB } from '../api/igdbApi';

/**
 * GameContext - Oyun listesi ve filtreleme state'lerini yönetir
 * GameTracker'dan bağımsız olarak çalışır
 */
const GameContext = createContext(null);

// 🎨 RAWG API için constants
const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY || '4b7c3b7b4b7c4b7c4b7c4b7c4b7c4b7c';
const RAWG_BASE_URL = 'https://api.rawg.io/api';

export function GameProvider({ children }) {
  // 🎮 Ana oyun state'leri
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔍 Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');

  // 📋 Seçim state'leri
  const [selectedGames, setSelectedGames] = useState([]);

  // 🎯 Oyun durumu belirleme fonksiyonu
  const getGameStatus = useCallback((game) => {
    if (game.progress >= 100 || game.status === 'completed') return 'completed';
    if (game.status === 'playing' || game.progress > 0) return 'playing';
    if (game.status === 'paused') return 'paused';
    if (game.status === 'dropped') return 'dropped';
    if (game.status === 'planning') return 'planning';
    if (game.status === 'wishlist') return 'wishlist';
    return 'not-started';
  }, []);

  // 🔧 Benzersiz değerleri getir (filtreler için)
  const uniqueValues = useMemo(() => {
    const platforms = [...new Set(games.map(game => game.platform || game.sistem).filter(Boolean))].sort();
    const genres = [...new Set(games.map(game => game.genre || game.tur).filter(Boolean))].sort();
    
    return {
      platform: platforms,
      genre: genres
    };
  }, [games]);

  // 🎯 Filtrelenmiş oyunlar
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      // Arama terimi kontrolü
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const title = (game.title || game.name || '').toLowerCase();
        const platform = (game.platform || game.sistem || '').toLowerCase();
        const genre = (game.genre || game.tur || '').toLowerCase();
        const developer = (game.developer || game.gelistirici || '').toLowerCase();
        
        if (!title.includes(searchLower) && 
            !platform.includes(searchLower) && 
            !genre.includes(searchLower) && 
            !developer.includes(searchLower)) {
          return false;
        }
      }
      
      // Durum filtresi
      if (statusFilter !== 'all') {
        const gameStatus = getGameStatus(game);
        if (gameStatus !== statusFilter) return false;
      }
      
      // Platform filtresi
      if (platformFilter !== 'all') {
        const gamePlatform = game.platform || game.sistem;
        if (gamePlatform !== platformFilter) return false;
      }
      
      // Tür filtresi
      if (genreFilter !== 'all') {
        const gameGenre = game.genre || game.tur;
        if (gameGenre !== genreFilter) return false;
      }
      
      return true;
    });
  }, [games, searchTerm, statusFilter, platformFilter, genreFilter, getGameStatus]);

  // 🧹 Filtreleri temizle
  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setPlatformFilter('all');
    setGenreFilter('all');
  }, []);

  // 🎮 Oyun işlemleri
  const updateGame = useCallback((gameId, updates) => {
    setGames(prevGames => 
      prevGames.map(game => 
        (game.id === gameId || game.name === gameId) 
          ? { ...game, ...updates }
          : game
      )
    );
  }, []);

  const deleteGame = useCallback((gameId) => {
    setGames(prevGames => 
      prevGames.filter(game => 
        game.id !== gameId && game.name !== gameId
      )
    );
  }, []);

  // 🎨 Oyun resimlerini API'den çek (IGDB + RAWG)
  const fetchGameImages = useCallback(async (gameName) => {
    if (!gameName) return null;

    try {
      // Oyun adını temizle (özel karakterleri kaldır)
      const cleanGameName = gameName
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      console.log(`🔍 ${gameName} için resim aranıyor...`);

      // 1. Önce IGDB'den dene
      try {
        const igdbResults = await searchGamesIGDB(cleanGameName, 1);
        
        if (igdbResults && igdbResults.length > 0) {
          const igdbGame = igdbResults[0];
          
          if (igdbGame.cover || igdbGame.screenshots?.length > 0) {
            const images = {
              banner: igdbGame.cover || null,
              background: igdbGame.screenshots?.[0] || igdbGame.cover || null,
              cover: igdbGame.cover || null,
              screenshots: igdbGame.screenshots || []
            };
            
            return images;
          }
        }
      } catch (igdbError) {
        console.warn('IGDB resim çekme hatası:', igdbError);
      }

      // 2. IGDB'den bulunamazsa RAWG'den dene
      const response = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(cleanGameName)}&page_size=1`
      );

      if (!response.ok) {
        throw new Error(`RAWG API hatası: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const game = data.results[0];
        
        // Resim URL'lerini hazırla
        const images = {
          banner: game.background_image || null,
          background: game.background_image_additional || game.background_image || null,
          cover: game.background_image || null,
          screenshots: []
        };

        // Eğer oyunun ID'si varsa, screenshot'ları da çek
        if (game.id) {
          try {
            const screenshotsResponse = await fetch(
              `${RAWG_BASE_URL}/games/${game.id}/screenshots?key=${RAWG_API_KEY}`
            );
            
            if (screenshotsResponse.ok) {
              const screenshotsData = await screenshotsResponse.json();
              images.screenshots = screenshotsData.results?.map(s => s.image) || [];
              
              // Eğer background yoksa, ilk screenshot'ı kullan
              if (!images.background && images.screenshots.length > 0) {
                images.background = images.screenshots[0];
              }
            }
          } catch (screenshotError) {
            console.warn('Screenshot çekme hatası:', screenshotError);
          }
        }

        console.log(`✅ RAWG'den ${gameName} için resim bulundu:`, images);
        return images;
      }

      console.log(`❌ ${gameName} için hiçbir API'den resim bulunamadı`);
      return null;
    } catch (error) {
      console.error('Resim çekme hatası:', error);
      return null;
    }
  }, []);

  // 🎨 Oyuna resim ekle/güncelle
  const updateGameImages = useCallback(async (gameId, gameName) => {
    try {
      const images = await fetchGameImages(gameName);
      
      if (images) {
        setGames(prevGames => 
          prevGames.map(game => {
            const currentGameId = game.id || game.name;
            if (currentGameId === gameId) {
              return {
                ...game,
                banner: images.banner,
                background: images.background,
                screenshots: images.screenshots,
                imagesUpdated: new Date().toISOString()
              };
            }
            return game;
          })
        );
        
        console.log(`✅ ${gameName} için resimler güncellendi`);
        return images;
      }
      
      return null;
    } catch (error) {
      console.error('Oyun resim güncelleme hatası:', error);
      return null;
    }
  }, [fetchGameImages]);

  // 🎨 Tüm oyunlar için resimleri toplu güncelle
  const updateAllGameImages = useCallback(async () => {
    setLoading(true);
    
    try {
      const updatePromises = games.map(async (game) => {
        const gameId = game.id || game.name;
        const gameName = game.title || game.name;
        
        // Eğer resimler zaten varsa ve 7 günden yeniyse, güncelleme
        if (game.imagesUpdated) {
          const lastUpdate = new Date(game.imagesUpdated);
          const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSinceUpdate < 7) {
            console.log(`⏭️ ${gameName} resimleri güncel, atlanıyor`);
            return;
          }
        }
        
        // 1 saniye bekle (API rate limit için)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return updateGameImages(gameId, gameName);
      });
      
      await Promise.all(updatePromises);
      console.log('✅ Tüm oyun resimleri güncellendi');
    } catch (error) {
      console.error('Toplu resim güncelleme hatası:', error);
      setError('Resim güncelleme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [games, updateGameImages]);

  // 📋 Seçim işlemleri
  const toggleGameSelection = useCallback((gameId) => {
    setSelectedGames(prev => {
      if (prev.includes(gameId)) {
        return prev.filter(id => id !== gameId);
      } else {
        return [...prev, gameId];
      }
    });
  }, []);

  const selectAllGames = useCallback(() => {
    const allGameIds = filteredGames.map(game => game.id || game.name);
    setSelectedGames(allGameIds);
  }, [filteredGames]);

  const clearSelection = useCallback(() => {
    setSelectedGames([]);
  }, []);

  // 📊 İstatistikler
  const stats = useMemo(() => {
    const total = games.length;
    const completed = games.filter(game => getGameStatus(game) === 'completed').length;
    const playing = games.filter(game => getGameStatus(game) === 'playing').length;
    const notStarted = games.filter(game => getGameStatus(game) === 'not-started').length;
    
    return {
      total,
      completed,
      playing,
      notStarted,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [games, getGameStatus]);

  // Context değeri
  const value = {
    // State'ler
    games,
    setGames,
    loading,
    setLoading,
    error,
    setError,
    
    // Filtreler
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    platformFilter,
    setPlatformFilter,
    genreFilter,
    setGenreFilter,
    
    // Seçimler
    selectedGames,
    setSelectedGames,
    
    // Computed values
    filteredGames,
    uniqueValues,
    stats,
    
    // Fonksiyonlar
    getGameStatus,
    clearAllFilters,
    updateGame,
    deleteGame,
    toggleGameSelection,
    selectAllGames,
    clearSelection,
    
    // 🎨 Resim fonksiyonları
    fetchGameImages,
    updateGameImages,
    updateAllGameImages
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

// Hook
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}

export default GameContext;