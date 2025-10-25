/**
 * Global Oyun Kütüphanesi API
 * Sunucu tarafında tutulan oyun verilerini yönetir
 */

import { searchGamesIGDB, getGameDetailsIGDB } from './igdbApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Local cache için key'ler
const CACHE_KEYS = {
  GAME_IMAGES: 'gameTracker_imageCache',
  CACHE_METADATA: 'gameTracker_imageCacheMetadata'
};

/**
 * Global oyun kütüphanesinde oyun arama
 * @param {string} query - Arama terimi
 * @param {Object} filters - Filtreleme seçenekleri
 * @returns {Promise<Array>} Bulunan oyunlar
 */
export const searchGlobalGames = async (query, filters = {}) => {
  try {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });
    
    const response = await fetch(`${API_BASE_URL}/games/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`Arama hatası: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Global oyun arama hatası:', error);
    throw error;
  }
};

/**
 * Oyunun global kütüphanede olup olmadığını kontrol et
 * @param {Object} gameData - Kontrol edilecek oyun verisi
 * @returns {Promise<Object|null>} Bulunan oyun veya null
 */
export const checkGameExists = async (gameData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/games/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: gameData.title,
        developer: gameData.developer,
        steam_id: gameData.steam_id,
        epic_id: gameData.epic_id
      })
    });
    
    if (!response.ok) {
      throw new Error(`Kontrol hatası: ${response.status}`);
    }
    
    const result = await response.json();
    return result.exists ? result.game : null;
  } catch (error) {
    console.error('Oyun kontrol hatası:', error);
    throw error;
  }
};

/**
 * Yeni oyunu global kütüphaneye ekle (IGDB'den resim verileri ile birlikte)
 * @param {Object} gameData - Eklenecek oyun verisi
 * @param {string} userId - Ekleyen kullanıcı ID'si
 * @param {Object} imageData - Resim verileri (banner, background, cover, screenshots)
 * @returns {Promise<Object>} Eklenen oyun
 */
export const addGameToGlobal = async (gameData, userId, imageData = {}) => {
  try {
    console.log(`🔍 ${gameData.title} için IGDB'den resim aranıyor...`);
    
    // IGDB'den resim verilerini çek
    let igdbImageData = {};
    try {
      const igdbResults = await searchGamesIGDB(gameData.title, 1);
      
      if (igdbResults && igdbResults.length > 0) {
        const igdbGame = igdbResults[0];
        
        if (igdbGame.cover) {
          igdbImageData = {
            banner: igdbGame.cover,
            background: igdbGame.cover,
            backgroundImage: igdbGame.cover,
            coverImage: igdbGame.cover,
            image: igdbGame.cover,
            screenshots: [],
            source: 'igdb'
          };
          console.log(`✅ IGDB'den ${gameData.title} için resim bulundu`);
        }
      }
    } catch (igdbError) {
      console.warn('IGDB resim çekme hatası:', igdbError);
    }

    // Resim verilerini oyun verisine ekle (öncelik: manuel > IGDB > varsayılan)
    const gameWithImages = {
      ...gameData,
      created_by_user: userId,
      // Resim verileri (öncelik sırası: imageData > igdbImageData > gameData > null)
      banner: imageData.banner || igdbImageData.banner || gameData.banner || null,
      background: imageData.background || igdbImageData.background || gameData.background || null,
      backgroundImage: imageData.backgroundImage || igdbImageData.backgroundImage || gameData.backgroundImage || null,
      coverImage: imageData.coverImage || igdbImageData.coverImage || gameData.coverImage || null,
      image: imageData.image || igdbImageData.image || gameData.image || null,
      screenshots: imageData.screenshots || igdbImageData.screenshots || gameData.screenshots || [],
      // Resim metadata
      images_updated_at: new Date().toISOString(),
      images_source: imageData.source || igdbImageData.source || 'user_upload'
    };

    const response = await fetch(`${API_BASE_URL}/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(gameWithImages)
    });
    
    if (!response.ok) {
      throw new Error(`Ekleme hatası: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Oyun resimlerle birlikte global arşive eklendi:', result.title);
    
    return result;
  } catch (error) {
    console.error('Global oyun ekleme hatası:', error);
    throw error;
  }
};

/**
 * Kullanıcının kütüphanesine oyun ekle
 * @param {string} gameId - Global oyun ID'si
 * @param {string} userId - Kullanıcı ID'si
 * @param {Object} userGameData - Kullanıcıya özel oyun verisi
 * @returns {Promise<Object>} Kullanıcı oyun kaydı
 */
export const addGameToUserLibrary = async (gameId, userId, userGameData = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        game_id: gameId,
        status: userGameData.status || 'not_started',
        playtime_hours: userGameData.playtime_hours || 0,
        progress_percentage: userGameData.progress_percentage || 0,
        rating: userGameData.rating || null,
        is_favorite: userGameData.is_favorite || false,
        notes: userGameData.notes || ''
      })
    });
    
    if (!response.ok) {
      throw new Error(`Kütüphane ekleme hatası: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Kullanıcı kütüphanesi ekleme hatası:', error);
    throw error;
  }
};

/**
 * Kullanıcının oyun kütüphanesini getir (IGDB resim entegrasyonu ile)
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<Array>} Kullanıcının oyunları (resimlerle birlikte)
 */
export const getUserGameLibrary = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/games`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Kütüphane getirme hatası: ${response.status}`);
    }
    
    const games = await response.json();
    
    // Her oyun için IGDB'den resim çek (eğer yoksa)
    const gamesWithImages = await Promise.all(
      games.map(async (userGame) => {
        const game = userGame.game || userGame;
        
        // Eğer oyunun resmi yoksa IGDB'den çek
        if (!game.image && !game.coverImage && !game.banner && game.title) {
          try {
            console.log(`🔍 ${game.title} için IGDB'den resim aranıyor...`);
            
            const igdbResults = await searchGamesIGDB(game.title, 1);
            
            if (igdbResults && igdbResults.length > 0) {
              const igdbGame = igdbResults[0];
              
              if (igdbGame.cover) {
                // Oyun nesnesini resimlerle güncelle
                const updatedGame = {
                  ...game,
                  image: igdbGame.cover,
                  coverImage: igdbGame.cover,
                  banner: igdbGame.cover,
                  background: igdbGame.cover,
                  backgroundImage: igdbGame.cover,
                  images_source: 'igdb',
                  images_updated_at: new Date().toISOString()
                };
                
                console.log(`✅ IGDB'den ${game.title} için resim bulundu`);
                
                return {
                  ...userGame,
                  game: updatedGame
                };
              }
            }
          } catch (igdbError) {
            console.warn(`IGDB resim çekme hatası (${game.title}):`, igdbError);
          }
        }
        
        return userGame;
      })
    );
    
    return gamesWithImages;
  } catch (error) {
    console.error('Kullanıcı kütüphanesi getirme hatası:', error);
    throw error;
  }
};

/**
 * Kullanıcının oyun istatistiklerini güncelle
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} gameId - Oyun ID'si
 * @param {Object} updates - Güncellenecek veriler
 * @returns {Promise<Object>} Güncellenmiş kayıt
 */
export const updateUserGameStats = async (userId, gameId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/games/${gameId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error(`İstatistik güncelleme hatası: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Oyun istatistik güncelleme hatası:', error);
    throw error;
  }
};

/**
 * Oyun hata raporu gönder
 * @param {string} gameId - Oyun ID'si
 * @param {string} userId - Rapor gönderen kullanıcı ID'si
 * @param {Object} reportData - Hata raporu verisi
 * @returns {Promise<Object>} Rapor sonucu
 */
export const reportGameIssue = async (gameId, userId, reportData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        reported_by: userId,
        issue_type: reportData.issue_type,
        description: reportData.description,
        suggested_fix: reportData.suggested_fix || ''
      })
    });
    
    if (!response.ok) {
      throw new Error(`Rapor gönderme hatası: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Oyun rapor hatası:', error);
    throw error;
  }
};

/**
 * 🖼️ Resim Cache Yönetimi
 */

/**
 * Oyun resimlerini local cache'e kaydet
 * @param {string} gameId - Oyun ID'si
 * @param {Object} imageData - Resim verileri
 */
export const cacheGameImages = (gameId, imageData) => {
  try {
    const existingCache = JSON.parse(localStorage.getItem(CACHE_KEYS.GAME_IMAGES) || '{}');
    const metadata = JSON.parse(localStorage.getItem(CACHE_KEYS.CACHE_METADATA) || '{}');
    
    // Resim verilerini cache'e ekle
    existingCache[gameId] = {
      ...imageData,
      cached_at: new Date().toISOString()
    };
    
    // Metadata güncelle
    metadata[gameId] = {
      cached_at: new Date().toISOString(),
      has_banner: !!imageData.banner,
      has_background: !!imageData.background,
      has_cover: !!imageData.coverImage,
      has_screenshots: !!(imageData.screenshots && imageData.screenshots.length > 0)
    };
    
    localStorage.setItem(CACHE_KEYS.GAME_IMAGES, JSON.stringify(existingCache));
    localStorage.setItem(CACHE_KEYS.CACHE_METADATA, JSON.stringify(metadata));
    
    console.log('💾 Oyun resimleri cache\'e kaydedildi:', gameId);
  } catch (error) {
    console.error('Cache kaydetme hatası:', error);
  }
};

/**
 * Cache'den oyun resimlerini getir
 * @param {string} gameId - Oyun ID'si
 * @returns {Object|null} Cache'deki resim verileri
 */
export const getCachedGameImages = (gameId) => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEYS.GAME_IMAGES) || '{}');
    const metadata = JSON.parse(localStorage.getItem(CACHE_KEYS.CACHE_METADATA) || '{}');
    
    if (cache[gameId] && metadata[gameId]) {
      const cachedAt = new Date(metadata[gameId].cached_at);
      const now = new Date();
      const daysDiff = (now - cachedAt) / (1000 * 60 * 60 * 24);
      
      // 7 günden eski cache'i geçersiz say
      if (daysDiff > 7) {
        console.log('⏰ Cache süresi dolmuş, yeniden yüklenecek:', gameId);
        return null;
      }
      
      console.log('✅ Cache\'den resimler alındı:', gameId);
      return cache[gameId];
    }
    
    return null;
  } catch (error) {
    console.error('Cache okuma hatası:', error);
    return null;
  }
};

/**
 * Cache'i temizle (eski verileri sil)
 */
export const cleanImageCache = () => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEYS.GAME_IMAGES) || '{}');
    const metadata = JSON.parse(localStorage.getItem(CACHE_KEYS.CACHE_METADATA) || '{}');
    
    const now = new Date();
    let cleanedCount = 0;
    
    Object.keys(metadata).forEach(gameId => {
      const cachedAt = new Date(metadata[gameId].cached_at);
      const daysDiff = (now - cachedAt) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 7) {
        delete cache[gameId];
        delete metadata[gameId];
        cleanedCount++;
      }
    });
    
    localStorage.setItem(CACHE_KEYS.GAME_IMAGES, JSON.stringify(cache));
    localStorage.setItem(CACHE_KEYS.CACHE_METADATA, JSON.stringify(metadata));
    
    console.log(`🧹 ${cleanedCount} eski cache kaydı temizlendi`);
  } catch (error) {
    console.error('Cache temizleme hatası:', error);
  }
};

/**
 * Cache istatistiklerini getir
 * @returns {Object} Cache istatistikleri
 */
export const getCacheStats = () => {
  try {
    const metadata = JSON.parse(localStorage.getItem(CACHE_KEYS.CACHE_METADATA) || '{}');
    const gameCount = Object.keys(metadata).length;
    
    let totalImages = 0;
    Object.values(metadata).forEach(meta => {
      if (meta.has_banner) totalImages++;
      if (meta.has_background) totalImages++;
      if (meta.has_cover) totalImages++;
      if (meta.has_screenshots) totalImages++;
    });
    
    return {
      cached_games: gameCount,
      total_images: totalImages,
      cache_size_kb: Math.round((JSON.stringify(localStorage.getItem(CACHE_KEYS.GAME_IMAGES) || '{}').length) / 1024)
    };
  } catch (error) {
    console.error('Cache stats hatası:', error);
    return { cached_games: 0, total_images: 0, cache_size_kb: 0 };
  }
};

/**
 * Oyunu yerel kütüphaneye ekle
 * @param {Object} gameData - Eklenecek oyun verisi
 * @returns {Promise<Object>} Eklenen oyun verisi
 */
export const addGameToLibrary = async (gameData) => {
  try {
    // Yerel localStorage'a oyunu ekle
    const existingGames = JSON.parse(localStorage.getItem('gameLibrary') || '[]');
    
    // Oyun ID'si oluştur (eğer yoksa)
    if (!gameData.id) {
      gameData.id = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Oyunu listeye ekle
    existingGames.push(gameData);
    
    // localStorage'a kaydet
    localStorage.setItem('gameLibrary', JSON.stringify(existingGames));
    
    console.log('✅ Oyun yerel kütüphaneye eklendi:', gameData.title);
    return gameData;
  } catch (error) {
    console.error('❌ Oyun ekleme hatası:', error);
    throw error;
  }
};

// Debug fonksiyonları - browser console'dan erişim için
if (typeof window !== 'undefined') {
  window.gameImageCache = {
    getStats: getCacheStats,
    getCache: () => {
      const cache = localStorage.getItem(CACHE_KEYS.GAME_IMAGES);
      return cache ? JSON.parse(cache) : {};
    },
    clearCache: () => {
      localStorage.removeItem(CACHE_KEYS.GAME_IMAGES);
      localStorage.removeItem(CACHE_KEYS.CACHE_METADATA);
      console.log('🧹 Resim cache\'i temizlendi');
    },
    cleanExpired: cleanImageCache
  };
}