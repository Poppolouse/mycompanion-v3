/**
 * 🎮 QuickStats API Servisi
 * Kartlar için tüm API verilerini koordine eder
 * Metacritic, HowLongToBeat ve diğer servisleri birleştirir
 */

import { searchMetacritic, getMetacriticDetails } from './metacriticScraper.js';
import { searchHowLongToBeat, findBestMatch } from './howLongToBeatScraper.js';

// Cache sistemi - 1 saat cache
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 saat

/**
 * Cache'den veri al veya yeni veri getir
 */
const getCachedData = async (key, fetchFunction) => {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 Cache'den alındı: ${key}`);
    return cached.data;
  }
  
  try {
    const data = await fetchFunction();
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`🔄 API'den alındı: ${key}`);
    return data;
  } catch (error) {
    console.error(`❌ API hatası (${key}):`, error);
    return cached ? cached.data : null;
  }
};

/**
 * 📊 Metacritic verilerini getir (1. ve 4. kart için)
 */
export const getMetacriticData = async (gameName, platform = 'pc') => {
  const cacheKey = `metacritic_${gameName}_${platform}`;
  
  return getCachedData(cacheKey, async () => {
    try {
      // Önce arama yap
      const searchResults = await searchMetacritic(gameName, platform);
      
      if (!searchResults || searchResults.length === 0) {
        throw new Error('Oyun bulunamadı');
      }
      
      // En iyi eşleşmeyi bul
      const bestMatch = searchResults[0];
      
      // Detaylı bilgileri al
      const details = await getMetacriticDetails(gameName, platform);
      
      return {
        criticScore: bestMatch.criticScore || details?.criticScore || 0,
        userScore: bestMatch.userScore || details?.userScore || 0,
        criticReviews: details?.criticReviews || [],
        userReviews: details?.userReviews || [],
        reviewCount: details?.reviewCount || 0,
        userReviewCount: details?.userReviewCount || 0,
        url: bestMatch.url || details?.url || '',
        platform: platform,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Metacritic API hatası:', error);
      return {
        criticScore: 0,
        userScore: 0,
        criticReviews: [],
        userReviews: [],
        reviewCount: 0,
        userReviewCount: 0,
        url: '',
        platform: platform,
        error: error.message
      };
    }
  });
};

/**
 * ⏱️ HowLongToBeat verilerini getir (2. kart için)
 */
export const getHowLongToBeatData = async (gameName) => {
  const cacheKey = `hltb_${gameName}`;
  
  return getCachedData(cacheKey, async () => {
    try {
      const searchResults = await searchHowLongToBeat(gameName);
      
      if (!searchResults || searchResults.length === 0) {
        throw new Error('Oyun bulunamadı');
      }
      
      // En iyi eşleşmeyi bul
      const bestMatch = findBestMatch(gameName, searchResults);
      
      return {
        mainStory: bestMatch.gameplayMain || 0,
        mainExtra: bestMatch.gameplayMainExtra || 0,
        completionist: bestMatch.gameplayCompletionist || 0,
        allStyles: bestMatch.gameplayAll || 0,
        gameId: bestMatch.game_id || '',
        gameName: bestMatch.game_name || gameName,
        gameImage: bestMatch.game_image || '',
        similarity: bestMatch.similarity || 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('HowLongToBeat API hatası:', error);
      return {
        mainStory: 0,
        mainExtra: 0,
        completionist: 0,
        allStyles: 0,
        gameId: '',
        gameName: gameName,
        gameImage: '',
        similarity: 0,
        error: error.message
      };
    }
  });
};

/**
 * 🎯 Tüm kart verilerini getir
 */
export const getAllQuickStatsData = async (gameName, platform = 'pc') => {
  console.log(`🚀 Tüm veriler getiriliyor: ${gameName} (${platform})`);
  
  try {
    // Paralel olarak tüm API'leri çağır
    const [metacriticData, hltbData] = await Promise.allSettled([
      getMetacriticData(gameName, platform),
      getHowLongToBeatData(gameName)
    ]);
    
    return {
      metacritic: metacriticData.status === 'fulfilled' ? metacriticData.value : null,
      howLongToBeat: hltbData.status === 'fulfilled' ? hltbData.value : null,
      lastUpdated: new Date().toISOString(),
      success: true
    };
  } catch (error) {
    console.error('QuickStats API genel hatası:', error);
    return {
      metacritic: null,
      howLongToBeat: null,
      lastUpdated: new Date().toISOString(),
      success: false,
      error: error.message
    };
  }
};

/**
 * 🧹 Cache temizle
 */
export const clearQuickStatsCache = () => {
  cache.clear();
  console.log('🧹 QuickStats cache temizlendi');
};

/**
 * 📈 Cache istatistikleri
 */
export const getCacheStats = () => {
  const now = Date.now();
  const stats = {
    totalEntries: cache.size,
    validEntries: 0,
    expiredEntries: 0
  };
  
  cache.forEach((entry) => {
    if (now - entry.timestamp < CACHE_DURATION) {
      stats.validEntries++;
    } else {
      stats.expiredEntries++;
    }
  });
  
  return stats;
};

// Debug için window'a ekle
if (typeof window !== 'undefined') {
  window.quickStatsApi = {
    getMetacriticData,
    getHowLongToBeatData,
    getAllQuickStatsData,
    clearCache: clearQuickStatsCache,
    getCacheStats
  };
}