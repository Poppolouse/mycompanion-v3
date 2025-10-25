/**
 * 🎮 GAME DATABASE API - MULTI-API ENTEGRASYONU
 * 
 * Bu dosya artık Game API Coordinator'ı kullanır
 * RAWG -> IGDB -> Giant Bomb fallback sistemi
 * + Steam, CheapShark, HowLongToBeat, Metacritic entegrasyonu
 */

import { 
  searchGamesWithFallback, 
  getGameDetailsWithFallback,
  getApiStatistics,
  checkAllApiStatuses 
} from './gameApiCoordinator';

// Development'ta proxy kullan, production'da direkt API
const RAWG_API_BASE = import.meta.env.DEV ? '/api/rawg' : 'https://api.rawg.io/api';
const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY || '2bf2ce37dafb4fbea8fc82e308badac7';

/**
 * 🎯 SÜPER AKILLI ARAMA ALGORİTMASI
 * Cyberpunk -> Cyberpunk 2077 (1. sıra)
 * Life is -> Life is Strange (1. sıra)
 * @param {Object} game - Oyun objesi
 * @param {string} searchTerm - Arama terimi
 * @returns {number} Relevans skoru (0-1000)
 */
const calculateRelevanceScore = (game, searchTerm) => {
  const gameName = (game.title || game.name || '').toLowerCase().trim();
  const searchLower = searchTerm.toLowerCase().trim();
  
  // Boş değerler için 0 puan
  if (!gameName || !searchLower) return 0;
  
  let score = 0;
  
  // 🎯 1. TAM EŞLEŞME (1000 puan - garantili 1. sıra)
  if (gameName === searchLower) {
    return 1000;
  }
  
  // 🎯 2. BAŞLANGIÇ TAM EŞLEŞMESİ (900 puan)
  // "cyberpunk" -> "cyberpunk 2077" ✅
  if (gameName.startsWith(searchLower + ' ') || gameName.startsWith(searchLower + ':') || gameName.startsWith(searchLower + '-')) {
    score += 900;
  }
  // Normal başlangıç eşleşmesi
  else if (gameName.startsWith(searchLower)) {
    score += 850;
  }
  
  // 🎯 3. KELIME BAŞLANGIÇ EŞLEŞMESİ (800 puan)
  // "life is" -> "life is strange" ✅
  const gameWords = gameName.split(/[\s\-_:]+/).filter(w => w.length > 0);
  const searchWords = searchLower.split(/[\s\-_:]+/).filter(w => w.length > 0);
  
  // Tüm arama kelimelerinin sıralı eşleşmesi
  if (searchWords.length > 1) {
    let consecutiveMatches = 0;
    let searchIndex = 0;
    
    for (let i = 0; i < gameWords.length && searchIndex < searchWords.length; i++) {
      if (gameWords[i].startsWith(searchWords[searchIndex])) {
        consecutiveMatches++;
        searchIndex++;
      } else if (consecutiveMatches > 0) {
        break; // Sıra bozuldu
      }
    }
    
    if (consecutiveMatches === searchWords.length) {
      score += 800; // Tüm kelimeler sıralı eşleşti
    } else if (consecutiveMatches > 0) {
      score += 600 + (consecutiveMatches * 50); // Kısmi sıralı eşleşme
    }
  }
  
  // 🎯 4. TEK KELİME TAM EŞLEŞMESİ (700 puan)
  if (searchWords.length === 1) {
    const searchWord = searchWords[0];
    for (let i = 0; i < gameWords.length; i++) {
      if (gameWords[i] === searchWord) {
        score += i === 0 ? 700 : 650; // İlk kelime daha değerli
        break;
      } else if (gameWords[i].startsWith(searchWord)) {
        score += i === 0 ? 600 : 550;
        break;
      }
    }
  }
  
  // 🎯 5. İÇERİK EŞLEŞMESİ (500 puan)
  if (gameName.includes(searchLower)) {
    score += 500;
  }
  
  // 🎯 6. KELIME BAZLI EŞLEŞMELERİ (300-400 puan)
  let wordMatchScore = 0;
  searchWords.forEach(searchWord => {
    gameWords.forEach((gameWord, index) => {
      if (gameWord.includes(searchWord)) {
        wordMatchScore += index === 0 ? 50 : 30; // İlk kelime daha değerli
      }
    });
  });
  score += Math.min(wordMatchScore, 400);
  
  // 🎯 7. POPÜLERLIK BONUSLARI (max 100 puan)
  let popularityBonus = 0;
  
  // Rating bonusu
  if (game.rating) {
    const rating = parseFloat(game.rating);
    if (rating >= 4.5) popularityBonus += 30;
    else if (rating >= 4.0) popularityBonus += 20;
    else if (rating >= 3.5) popularityBonus += 10;
  }
  
  // Metacritic bonusu
  if (game.metacritic) {
    const metacritic = parseInt(game.metacritic);
    if (metacritic >= 90) popularityBonus += 25;
    else if (metacritic >= 80) popularityBonus += 15;
    else if (metacritic >= 70) popularityBonus += 10;
  }
  
  // Yenilik bonusu
  if (game.year) {
    const currentYear = new Date().getFullYear();
    const gameYear = parseInt(game.year);
    if (gameYear >= currentYear - 2) popularityBonus += 15;
    else if (gameYear >= currentYear - 5) popularityBonus += 5;
  }
  
  score += Math.min(popularityBonus, 100);
  
  // 🎯 8. VERİ KALİTESİ BONUSLARI (max 150 puan)
  let dataQualityBonus = 0;
  
  // Poster/görsel bonusu
  if (game.image && game.image.length > 0) {
    dataQualityBonus += 30;
  }
  
  // Açıklama bonusu
  if (game.description && game.description.length >= 100) {
    dataQualityBonus += 40;
  } else if (game.description && game.description.length >= 50) {
    dataQualityBonus += 20;
  }
  
  // Genre bilgisi bonusu
  if (game.genres && game.genres.length > 0) {
    dataQualityBonus += 25;
  }
  
  // Platform bilgisi bonusu
  if (game.platforms && game.platforms.length > 0) {
    dataQualityBonus += 15;
  }
  
  // Developer/Publisher bilgisi bonusu
  if (game.developer || game.publisher) {
    dataQualityBonus += 10;
  }
  
  // Birden fazla API'den birleştirilmiş veri bonusu
  if (game.source && game.source.includes('+')) {
    dataQualityBonus += 20;
    console.log(`🔄 Birleştirilmiş veri bonusu: ${game.title} (+20 puan)`);
  }
  
  score += Math.min(dataQualityBonus, 150);
  
  // 🎯 9. CEZA PUANLARI
  
  // DLC/Expansion cezası
  if (gameName.includes('dlc') || gameName.includes('expansion') || gameName.includes('season pass')) {
    score -= 200;
  }
  
  // Çok uzun isim cezası
  if (gameName.length > 60) {
    score -= 100;
  }
  
  // Demo/Beta cezası
  if (gameName.includes('demo') || gameName.includes('beta') || gameName.includes('alpha')) {
    score -= 150;
  }
  
  // 🎯 10. EKSİK VERİ CEZALARI
  let missingDataPenalty = 0;
  
  // Poster eksikse ceza
  if (!game.image || game.image.length === 0) {
    missingDataPenalty += 50;
  }
  
  // Açıklama eksikse ceza
  if (!game.description || game.description.length < 50) {
    missingDataPenalty += 75;
  }
  
  // Genre eksikse ceza
  if (!game.genres || game.genres.length === 0) {
    missingDataPenalty += 25;
  }
  
  // Çok fazla eksik veri varsa ek ceza
  const missingCount = [
    !game.image,
    !game.description || game.description.length < 50,
    !game.genres || game.genres.length === 0,
    !game.platforms || game.platforms.length === 0,
    !game.developer && !game.publisher
  ].filter(Boolean).length;
  
  if (missingCount >= 3) {
    missingDataPenalty += 100; // Çok eksik veri cezası
    console.log(`⚠️ Eksik veri cezası: ${game.title} (-${missingDataPenalty} puan, ${missingCount} eksik alan)`);
  }
  
  score -= missingDataPenalty;
  
  return Math.max(0, score);
};

/**
 * İki string arasındaki benzerlik oranını hesaplar (Levenshtein distance)
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number} Benzerlik oranı (0-1)
 */
const calculateStringSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

/**
 * Levenshtein distance hesaplama
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number} Edit distance
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Oyun arama fonksiyonu
 * @param {string} searchTerm - Arama terimi (minimum 3 karakter)
 * @param {number} limit - Sonuç limiti (varsayılan: 10)
 * @returns {Promise<Array>} Oyun listesi
 */
export const searchGames = async (searchTerm, limit = 10) => {
  try {
    console.log('🎮 gameApi.searchGames çağrıldı:', { searchTerm, limit });
    
    // 3 karakterden az ise boş array döndür
    if (!searchTerm || searchTerm.trim().length < 3) {
      console.log('⚠️ Arama terimi çok kısa:', searchTerm);
      return [];
    }

    // Fallback sistemini kullan - Gelişmiş veri birleştirme ile
    console.log('🔄 Gelişmiş fallback sistemi kullanılıyor...');
    const fallbackResults = await searchGamesWithFallback(searchTerm, {
      limit,
      includeExternal: true,
      searchAllApis: true // 🔄 Veri kalitesi için tüm API'leri ara ve birleştir
    });
    
    console.log('📊 Fallback sonuçları:', {
      totalResults: fallbackResults.results?.length || 0,
      sources: fallbackResults.sources,
      errors: fallbackResults.errors
    });
    
    // Sonuçları normalize et ve relevance score ekle
    const normalizedResults = fallbackResults.results?.map(game => ({
      ...game,
      // Relevance score hesapla
      _relevanceScore: calculateRelevanceScore(game, searchTerm.trim())
    })) || [];
    
    // Relevance score'a göre sırala
    const sortedResults = normalizedResults.sort((a, b) => {
      // Önce relevance score'a göre
      if (a._relevanceScore !== b._relevanceScore) {
        return b._relevanceScore - a._relevanceScore;
      }
      // Sonra rating'e göre
      return (b.rating || 0) - (a.rating || 0);
    });
    
    console.log('✅ Arama tamamlandı:', {
      searchTerm: searchTerm.trim(),
      totalResults: sortedResults.length,
      sources: fallbackResults.sources,
      topResults: sortedResults.slice(0, 3).map(g => ({ 
        title: g.title, 
        score: g._relevanceScore,
        source: g.dataSource 
      }))
    });
    
    return sortedResults;
    
  } catch (error) {
    console.error('🚨 Game search API error:', error);
    
    // Fallback başarısız olursa boş array döndür
    console.log('🔄 Fallback sistemi başarısız, boş sonuç döndürülüyor');
    return [];
  }
};

/**
 * Oyun detaylarını getir - Multi-API Fallback sistemi
 * @param {number|string} gameId - Game ID (RAWG, IGDB, vs.)
 * @param {Object} options - Detay seçenekleri
 * @returns {Promise<Object>} Detaylı oyun bilgisi
 */
export const getGameDetails = async (gameId, options = {}) => {
  try {
    console.log('🎮 gameApi.getGameDetails çağrıldı (Multi-API):', { gameId, options });
    
    // Multi-API fallback sistemi kullan
    const gameDetails = await getGameDetailsWithFallback(gameId, {
      includeSteam: true,
      includePricing: true,
      includeHLTB: true,
      includeMetacritic: true,
      ...options
    });
    
    console.log('✅ Multi-API detay alma tamamlandı:', {
      gameId,
      sources: gameDetails.sources,
      hasMainData: !!gameDetails.mainData,
      hasSteamData: !!gameDetails.steamData,
      hasPricingData: !!gameDetails.pricingData,
      hasHLTBData: !!gameDetails.hltbData,
      hasMetacriticData: !!gameDetails.metacriticData
    });
    
    // Tüm verileri birleştir
    const combinedData = {
      // Ana oyun verisi
      ...gameDetails.mainData,
      
      // Steam verisi
      ...(gameDetails.steamData && {
        steamAppId: gameDetails.steamData.steam_appid,
        steamUrl: gameDetails.steamData.steam_url,
        steamPrice: gameDetails.steamData.price_overview,
        steamAchievements: gameDetails.steamData.achievements,
        steamCategories: gameDetails.steamData.categories,
        steamGenres: gameDetails.steamData.genres
      }),
      
      // Fiyat verisi
      ...(gameDetails.pricingData && {
        deals: gameDetails.pricingData.deals,
        cheapestPrice: gameDetails.pricingData.cheapestPrice,
        stores: gameDetails.pricingData.stores
      }),
      
      // HowLongToBeat verisi
      ...(gameDetails.hltbData && {
        hltb: {
          main: gameDetails.hltbData.gameplayMain,
          plus: gameDetails.hltbData.gameplayMainExtra,
          completionist: gameDetails.hltbData.gameplayCompletionist,
          all: gameDetails.hltbData.gameplayAll
        }
      }),
      
      // Metacritic verisi
      ...(gameDetails.metacriticData && {
        metacriticScore: gameDetails.metacriticData.score,
        metacriticUrl: gameDetails.metacriticData.url,
        metacriticUserScore: gameDetails.metacriticData.userScore
      }),
      
      // Metadata
      dataSources: gameDetails.sources,
      lastUpdated: new Date().toISOString()
    };
    
    return combinedData;
    
  } catch (error) {
    console.error('🚨 Multi-API details error:', error);
    
    // Fallback: Sadece RAWG kullan (eski sistem)
    console.log('🔄 Fallback: Sadece RAWG API kullanılıyor...');
    return await getGameDetailsRAWGOnly(gameId);
  }
};

/**
 * Sadece RAWG API kullanarak detay alma (fallback)
 * @param {number} gameId - RAWG game ID
 * @returns {Promise<Object>} Detaylı oyun bilgisi
 */
const getGameDetailsRAWGOnly = async (gameId) => {
  try {
    const url = `${RAWG_API_BASE}/games/${gameId}?key=${RAWG_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`RAWG API Error: ${response.status} ${response.statusText}`);
    }
    
    const game = await response.json();
    
    return {
      id: game.id,
      title: game.name,
      name: game.name,
      developer: game.developers?.map(d => d.name).join(', ') || '',
      publisher: game.publishers?.map(p => p.name).join(', ') || '',
      genre: game.genres?.map(g => g.name).join(', ') || '',
      platform: game.platforms?.map(p => p.platform.name).join(', ') || 'PC',
      year: game.released ? new Date(game.released).getFullYear().toString() : '',
      release_date: game.released || '',
      rating: game.rating || 0,
      metacritic: game.metacritic || null,
      description: game.description_raw || '',
      image: game.background_image || '',
      screenshots: game.screenshots?.map(s => s.image) || [],
      tags: game.tags?.map(t => t.name) || [],
      esrb_rating: game.esrb_rating?.name || '',
      playtime: game.playtime || 0,
      website: game.website || '',
      reddit_url: game.reddit_url || '',
      // Ek detaylar
      rawg_id: game.id,
      rawg_slug: game.slug,
      rawg_url: `https://rawg.io/games/${game.slug}`,
      // Veri kaynağı
      dataSource: 'rawg',
      dataSources: ['rawg']
    };
    
  } catch (error) {
    console.error('🚨 RAWG details API error:', error);
    throw error;
  }
};



/**
 * API rate limiting için debounce utility
 * @param {Function} func - Debounce edilecek fonksiyon
 * @param {number} wait - Bekleme süresi (ms)
 * @returns {Function} Debounced fonksiyon
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * API durumunu kontrol et - Tüm API'ler
 * @returns {Promise<Object>} Tüm API'lerin durumu
 */
export const checkApiHealth = async () => {
  try {
    console.log('🔍 Tüm API durumları kontrol ediliyor...');
    
    // Tüm API'lerin durumunu kontrol et
    const apiStatuses = await checkAllApiStatuses();
    
    console.log('✅ API durum kontrolü tamamlandı:', apiStatuses);
    return apiStatuses;
    
  } catch (error) {
    console.error('🚨 API health check failed:', error);
    return {
      rawg: { status: 'error', error: error.message },
      igdb: { status: 'error', error: error.message },
      giantBomb: { status: 'error', error: error.message },
      steam: { status: 'error', error: error.message },
      cheapShark: { status: 'error', error: error.message }
    };
  }
};

/**
 * Sadece RAWG API durumunu kontrol et (fallback)
 * @returns {Promise<boolean>} RAWG API erişilebilir mi?
 */
export const checkRAWGHealth = async () => {
  try {
    const response = await fetch(`${RAWG_API_BASE}/games?key=${RAWG_API_KEY}&page_size=1`);
    return response.ok;
  } catch (error) {
    console.error('🚨 RAWG API health check failed:', error);
    return false;
  }
};

/**
 * API istatistiklerini getir
 * @returns {Promise<Object>} API kullanım istatistikleri
 */
export const getApiStats = async () => {
  try {
    const stats = await getApiStatistics();
    console.log('📊 API istatistikleri:', stats);
    return stats;
  } catch (error) {
    console.error('🚨 API stats error:', error);
    return null;
  }
};

/**
 * Gelişmiş oyun arama - Ek filtreler ile
 * @param {string} query - Arama terimi
 * @param {Object} filters - Arama filtreleri
 * @returns {Promise<Array>} Filtrelenmiş oyun listesi
 */
export const searchGamesAdvanced = async (query, filters = {}) => {
  try {
    const {
      genre,
      platform,
      year,
      rating,
      limit = 20,
      includeExternal = true
    } = filters;
    
    console.log('🔍 Gelişmiş oyun arama:', { query, filters });
    
    // Multi-API arama yap
    const results = await searchGamesWithFallback(query, {
      limit,
      includeExternal,
      filters: {
        genre,
        platform,
        year,
        rating
      }
    });
    
    // Sonuçları filtrele (client-side filtering)
    let filteredResults = results.results;
    
    if (genre) {
      filteredResults = filteredResults.filter(game => 
        game.genre?.toLowerCase().includes(genre.toLowerCase())
      );
    }
    
    if (platform) {
      filteredResults = filteredResults.filter(game => 
        game.platform?.toLowerCase().includes(platform.toLowerCase())
      );
    }
    
    if (year) {
      filteredResults = filteredResults.filter(game => 
        game.year === year.toString()
      );
    }
    
    if (rating) {
      filteredResults = filteredResults.filter(game => 
        game.rating >= rating
      );
    }
    
    console.log('✅ Gelişmiş arama tamamlandı:', {
      originalCount: results.results.length,
      filteredCount: filteredResults.length,
      sources: results.sources
    });
    
    return {
      ...results,
      results: filteredResults,
      appliedFilters: filters
    };
    
  } catch (error) {
    console.error('🚨 Advanced search error:', error);
    return { results: [], sources: [], errors: [error.message] };
  }
};

// Export default object
export default {
  searchGames,
  searchGamesAdvanced,
  getGameDetails,
  checkApiHealth,
  checkRAWGHealth,
  getApiStats,
  debounce
};