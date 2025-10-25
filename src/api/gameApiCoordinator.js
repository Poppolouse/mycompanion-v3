/**
 * Game API Coordinator
 * Tüm oyun API'lerini koordine eder ve fallback sistemi sağlar
 * RAWG -> IGDB -> Giant Bomb sıralaması
 */

import { searchGamesIGDB, getGameDetailsIGDB, checkIGDBStatus } from './igdbApi';
import { searchGamesGiantBomb, getGameDetailsGiantBomb, checkGiantBombStatus } from './giantBombApi';
import { searchGamesSteam, getSteamGameDetails, checkSteamStatus } from './steamApi';
import { searchGamesCheapShark, getGameDeals, checkCheapSharkStatus } from './cheapSharkApi';
import { searchHowLongToBeat, findBestMatch as findBestHLTBMatch } from './howLongToBeatScraper';
import { searchMetacritic, getMetacriticDetails, findBestMetacriticMatch } from './metacriticScraper';
import { 
  logApiRequest as trackApiRequest, 
  logApiSuccess as trackApiSuccess, 
  logApiError as trackApiError, 
  logCacheHit as trackCacheHit, 
  logCacheMiss as trackCacheMiss,
  logCacheSave as trackCacheSave,
  logRateLimit,
  getLogStatistics as getApiLogStatistics 
} from '../utils/apiLogger.js';

// RAWG API constants ve fonksiyonları (circular import'u önlemek için)
// Development'ta proxy kullan, production'da direkt API
const RAWG_API_BASE = import.meta.env.DEV ? '/api/rawg' : 'https://api.rawg.io/api';
const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY || '2bf2ce37dafb4fbea8fc82e308badac7';

/**
 * RAWG API ile oyun arama
 * @param {string} query - Arama terimi
 * @param {number} limit - Sonuç limiti
 * @returns {Promise<Array>} Oyun listesi
 */
const searchRAWG = async (query, limit = 10) => {
  try {
    if (!query || query.trim().length < 3) {
      return [];
    }

    const cleanQuery = query.trim().replace(/[^\w\s-:]/g, '').replace(/\s+/g, ' ');
    const url = `${RAWG_API_BASE}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(cleanQuery)}&page_size=${limit}&ordering=-relevance,-rating`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`RAWG API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // DLC/Mod/Expansion filtrelemesi - sadece ana oyunları döndür
    const filteredResults = data.results?.filter(game => {
      const title = game.name?.toLowerCase() || '';
      const tags = game.tags?.map(t => t.name.toLowerCase()) || [];
      
      // DLC/Expansion/Mod keyword'leri
      const dlcKeywords = ['dlc', 'expansion', 'add-on', 'addon', 'pack', 'mod', 'bundle', 'season pass', 'content pack'];
      const hasDlcKeyword = dlcKeywords.some(keyword => 
        title.includes(keyword) || tags.some(tag => tag.includes(keyword))
      );
      
      // Demo/Beta filtrelemesi
      const demoKeywords = ['demo', 'beta', 'alpha', 'preview', 'test'];
      const isDemoOrBeta = demoKeywords.some(keyword => 
        title.includes(keyword) || tags.some(tag => tag.includes(keyword))
      );
      
      // Ana oyun olarak kabul et
      return !hasDlcKeyword && !isDemoOrBeta;
    }) || [];
    
    return filteredResults.map(game => ({
      id: game.id,
      title: game.name,
      name: game.name,
      developer: game.developers?.[0]?.name || '',
      publisher: game.publishers?.[0]?.name || '',
      genre: game.genres?.map(g => g.name).join(', ') || '',
      platform: game.platforms?.map(p => p.platform.name).join(', ') || 'PC',
      year: game.released ? new Date(game.released).getFullYear().toString() : '',
      release_date: game.released || '',
      rating: game.rating || 0,
      metacritic: game.metacritic || null,
      description: game.description_raw || '',
      image: game.background_image || '',
      tags: game.tags?.map(t => t.name).slice(0, 5) || [],
      esrb_rating: game.esrb_rating?.name || '',
      playtime: game.playtime || 0,
      rawg_id: game.id,
      rawg_slug: game.slug,
      rawg_url: `https://rawg.io/games/${game.slug}`,
      dataSource: 'rawg'
    })) || [];
    
  } catch (error) {
    console.error('🚨 RAWG search error:', error);
    return [];
  }
};

/**
 * RAWG API ile oyun detayları
 * @param {number} gameId - RAWG game ID
 * @returns {Promise<Object>} Oyun detayları
 */
const getRAWGDetails = async (gameId) => {
  try {
    const url = `${RAWG_API_BASE}/games/${gameId}?key=${RAWG_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`RAWG API Error: ${response.status}`);
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
      coverImage: game.background_image || '', // Cover image için de background_image kullan
      screenshots: game.screenshots?.map(s => s.image) || [],
      tags: game.tags?.map(t => t.name) || [],
      esrb_rating: game.esrb_rating?.name || '',
      playtime: game.playtime || 0,
      website: game.website || '',
      reddit_url: game.reddit_url || '',
      rawg_id: game.id,
      rawg_slug: game.slug,
      rawg_url: `https://rawg.io/games/${game.slug}`,
      dataSource: 'rawg'
    };
    
  } catch (error) {
    console.error('🚨 RAWG details error:', error);
    throw error;
  }
};

// API durumları ve öncelikleri
const API_PRIORITY = {
  IGDB: 1,
  RAWG: 2,
  GIANT_BOMB: 3
};

const API_STATUS = {
  AVAILABLE: 'available',
  RATE_LIMITED: 'rate_limited',
  ERROR: 'error',
  UNAVAILABLE: 'unavailable'
};

// API durumlarını takip et
let apiStatuses = {
  rawg: API_STATUS.ERROR, // RAWG API key geçersiz - geçici olarak devre dışı
  igdb: API_STATUS.AVAILABLE, // ✅ Yeni access token ile aktif
  giantBomb: API_STATUS.AVAILABLE,
  steam: API_STATUS.ERROR, // CORS sorunu - proxy gerekli, geçici devre dışı
  cheapShark: API_STATUS.AVAILABLE,
  hltb: API_STATUS.AVAILABLE,
  metacritic: API_STATUS.AVAILABLE
};

// Rate limiting bilgileri
let rateLimits = {
  rawg: { requests: 0, resetTime: Date.now() + 60000 },
  igdb: { requests: 0, resetTime: Date.now() + 60000 },
  giantBomb: { requests: 0, resetTime: Date.now() + 3600000 },
  steam: { requests: 0, resetTime: Date.now() + 60000 },
  cheapShark: { requests: 0, resetTime: Date.now() + 1000 },
  hltb: { requests: 0, resetTime: Date.now() + 1000 },
  metacritic: { requests: 0, resetTime: Date.now() + 2000 }
};

// 📊 API KULLANIM İSTATİSTİKLERİ TRACKING
let apiUsageStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  cacheHits: 0,
  byApi: {
    rawg: { requests: 0, successful: 0, errors: 0, cacheHits: 0 },
    igdb: { requests: 0, successful: 0, errors: 0, cacheHits: 0 },
    giantBomb: { requests: 0, successful: 0, errors: 0, cacheHits: 0 },
    steam: { requests: 0, successful: 0, errors: 0, cacheHits: 0 },
    cheapShark: { requests: 0, successful: 0, errors: 0, cacheHits: 0 },
    hltb: { requests: 0, successful: 0, errors: 0, cacheHits: 0 },
    metacritic: { requests: 0, successful: 0, errors: 0, cacheHits: 0 }
  },
  startTime: Date.now()
};

// 🚀 CACHE SİSTEMİ - API kullanımını azaltmak için
const searchCache = new Map();
const detailsCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 dakika

/**
 * 🧹 TÜM CACHE'İ TEMİZLE - ULTRA CLEAR
 */
export const clearAllCaches = () => {
  // Memory cache'leri temizle
  searchCache.clear();
  detailsCache.clear();
  
  // LocalStorage cache'lerini temizle
  const cacheKeys = [
    'gameTracker_imageCache',
    'gameTracker_imageCacheMetadata',
    'vaulttracker:game_descriptions',
    'vaulttracker:description_cache',
    'vaulttracker:descriptions_last_update',
    'gameTracker_searchHistory'
  ];
  
  cacheKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('🧹 TÜM CACHE\'LER TEMİZLENDİ - ULTRA CLEAR YAPILDI!');
  
  // Sayfayı yenile
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

const getCacheKey = (type, query, options = {}) => {
  return `${type}:${query}:${JSON.stringify(options)}`;
};

const isValidCache = (cacheEntry) => {
  return cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;
};

const getFromCache = (cacheMap, key) => {
  const entry = cacheMap.get(key);
  if (isValidCache(entry)) {
    console.log(`💾 Cache'den alındı: ${key}`);
    return entry.data;
  }
  return null;
};

const setToCache = (cacheMap, key, data) => {
  cacheMap.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`💾 Cache'e kaydedildi: ${key}`);
};

/**
 * SUPER SMART SEARCH ALGORITHM - Arama sonuçlarının relevance skorunu hesapla
 * @param {Object} game - Oyun objesi
 * @param {string} query - Arama terimi
 * @returns {number} Relevance skoru (0-1000)
 */
const calculateRelevanceScore = (game, query) => {
  const queryLower = query.toLowerCase().trim();
  const titleLower = (game.title || game.name || '').toLowerCase();
  
  let score = 0;
  
  // 🎯 1. EXACT MATCH - TAM EŞLEŞMELİ ARAMA (1000 puan)
  if (titleLower === queryLower) {
    score = 1000;
    console.log(`🎯 EXACT MATCH: "${game.title}" = "${query}" -> ${score} puan`);
    return score; // Direkt döndür, en yüksek puan
  }
  
  // 🚀 2. STARTING EXACT MATCH - BAŞLANGIÇ TAM EŞLEŞMESİ (950 puan)
  // "cyberpunk" -> "cyberpunk 2077" gibi durumlar için
  if (titleLower.startsWith(queryLower + ' ') || titleLower.startsWith(queryLower + ':') || titleLower.startsWith(queryLower + '-')) {
    score = 950;
    console.log(`🚀 STARTING EXACT: "${game.title}" starts with "${query}" -> ${score} puan`);
  }
  // 🔥 3. PARTIAL STARTING MATCH - KISMÎ BAŞLANGIÇ EŞLEŞMESİ (900 puan)
  else if (titleLower.startsWith(queryLower)) {
    score = 900;
    console.log(`🔥 PARTIAL START: "${game.title}" starts with "${query}" -> ${score} puan`);
  }
  // 🎮 3.5. FIRST WORD EXACT MATCH - İLK KELİME TAM EŞLEŞMESİ (850 puan)
  // "cyberpunk" -> "cyberpunk 2077" için özel durum
  else {
    const firstTitleWord = titleLower.split(/[\s\-:]+/)[0];
    if (firstTitleWord === queryLower) {
      score = 850;
      console.log(`🎮 FIRST WORD EXACT: "${game.title}" first word matches "${query}" -> ${score} puan`);
    }
  }
  
  // 🎮 4. SMART WORD MATCHING - AKILLI KELİME EŞLEŞMESİ
  const queryWords = queryLower.split(/[\s\-:]+/).filter(word => word.length > 1);
  const titleWords = titleLower.split(/[\s\-:]+/);
  
  if (score < 850) { // Sadece yüksek skorlu eşleşme yoksa kelime analizi yap
    let wordMatchScore = 0;
    let sequentialMatches = 0;
    
    // Sequential word matching (sıralı kelime eşleşmesi)
    for (let i = 0; i <= titleWords.length - queryWords.length; i++) {
      let isSequential = true;
      for (let j = 0; j < queryWords.length; j++) {
        if (!titleWords[i + j] || !titleWords[i + j].includes(queryWords[j])) {
          isSequential = false;
          break;
        }
      }
      if (isSequential) {
        sequentialMatches++;
        wordMatchScore += 200; // Sequential match bonus
      }
    }
    
    // Individual word matching
    queryWords.forEach(queryWord => {
      titleWords.forEach(titleWord => {
        if (titleWord === queryWord) {
          wordMatchScore += 100; // Exact word match
        } else if (titleWord.startsWith(queryWord)) {
          wordMatchScore += 80; // Word starts with query
        } else if (titleWord.includes(queryWord)) {
          wordMatchScore += 50; // Word contains query
        }
      });
    });
    
    if (sequentialMatches > 0) {
      score = Math.max(score, 700 + wordMatchScore); // Sequential word match
      console.log(`🎮 SEQUENTIAL WORDS: "${game.title}" -> ${score} puan`);
    } else if (wordMatchScore > 0) {
      score = Math.max(score, 600 + wordMatchScore); // Single word matches
      console.log(`🎮 WORD MATCH: "${game.title}" -> ${score} puan`);
    }
  }
  
  // 📝 5. CONTENT MATCH - İÇERİK EŞLEŞMESİ (500 puan base)
  if (score === 0 && titleLower.includes(queryLower)) {
    score = 500;
    console.log(`📝 CONTENT MATCH: "${game.title}" contains "${query}" -> ${score} puan`);
  }
  
  // 🚫 6. AGGRESSIVE FILTERING - AGRESİF FİLTRELEME
  const title = game.title || game.name || '';
  
  // ULTRA AGGRESSIVE MOD/DLC/SFX FILTERING - Bu tür içerikleri tamamen elemek
  if (/\b(sfx|sound effects?|audio pack|music pack|soundtrack|ost|mod|modification|trainer|cheat|hack)\b/i.test(title)) {
    score = 0; // Tamamen sıfırla
    console.log(`🚫 ULTRA FILTER: "${title}" -> TAMAMEN ELENDİ (0 puan)`);
    return 0; // Direkt döndür
  }
  
  // DLC/Expansion penalty (büyük ceza)
  if (/\b(dlc|expansion|add-on|addon|pack|bundle|season pass|content pack)\b/i.test(title)) {
    score -= 300; // Daha büyük ceza
    console.log(`🚫 DLC/EXPANSION PENALTY: "${title}" -> -300 puan`);
  }
  
  // Demo/Beta penalty
  if (/\b(demo|beta|alpha|preview|test)\b/i.test(title)) {
    score -= 200; // Daha büyük ceza
    console.log(`🚫 DEMO/BETA PENALTY: "${title}" -> -200 puan`);
  }
  
  // Very long name penalty (çok uzun isim cezası)
  if (title.length > 50) {
    score -= 150; // Daha büyük ceza
    console.log(`🚫 LONG NAME PENALTY: "${title}" -> -150 puan`);
  }
  
  // 🎯 CYBERPUNK 2077 SPECIAL BOOST - ÖZEL CYBERPUNK 2077 BONUSU
  if (/cyberpunk 2077/i.test(title) && queryLower.includes('cyberpunk')) {
    score += 500; // Mega bonus
    console.log(`🎯 CYBERPUNK 2077 MEGA BONUS: "${title}" -> +500 puan`);
  }
  
  // 🏆 7. POPULARITY BONUS SYSTEM - POPÜLERLİK BONUS SİSTEMİ (max 100 puan)
  let popularityBonus = 0;
  
  // High rating bonus
  if (game.rating && game.rating > 85) {
    popularityBonus += 30;
  } else if (game.rating && game.rating > 75) {
    popularityBonus += 15;
  }
  
  // Metacritic bonus
  if (game.metacritic && game.metacritic > 85) {
    popularityBonus += 25;
  } else if (game.metacritic && game.metacritic > 75) {
    popularityBonus += 10;
  }
  
  // New game bonus (son 2 yıl)
  if (game.release_date || game.releaseDate) {
    const releaseDate = new Date(game.release_date || game.releaseDate);
    const currentYear = new Date().getFullYear();
    const releaseYear = releaseDate.getFullYear();
    if (currentYear - releaseYear <= 2) {
      popularityBonus += 15;
    }
  }
  
  score += popularityBonus;
  
  // Final score (minimum 0, maximum 1000)
  const finalScore = Math.max(0, Math.min(1000, score));
  
  if (finalScore > 0) {
    console.log(`🎯 FINAL SCORE: "${game.title}" -> ${finalScore} puan (bonus: +${popularityBonus})`);
  }
  
  return finalScore;
};

/**
 * Arama sonuçlarını relevance'a göre sırala
 * @param {Array} games - Oyun listesi
 * @param {string} query - Arama terimi
 * @returns {Array} Sıralanmış oyun listesi
 */
const sortByRelevance = (games, query) => {
  return games
    .map(game => ({
      ...game,
      relevanceScore: calculateRelevanceScore(game, query)
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
};

/**
 * Oyun arama - Fallback sistemi ile
 * @param {string} query - Arama terimi
 * @param {Object} options - Arama seçenekleri
 * @returns {Promise<Object>} Arama sonuçları ve kaynak bilgisi
 */
export const searchGamesWithFallback = async (query, options = {}) => {
  const { limit = 10, includeExternal = true } = options;
  
  console.log(`🔍 Oyun arama başlatılıyor: "${query}"`);
  
  // 💾 Cache kontrolü
  const cacheKey = getCacheKey('search', query, { limit, includeExternal });
  const cachedResult = getFromCache(searchCache, cacheKey);
  if (cachedResult) {
    console.log(`⚡ Cache'den hızlı sonuç döndürüldü`);
    trackCacheHit('search', cacheKey); // 📊 Cache hit tracking
    return cachedResult;
  }

  // 📊 Cache miss tracking
  trackCacheMiss('search', cacheKey);

  const results = {
    query,
    results: [],
    sources: [],
    errors: [],
    totalResults: 0,
    searchTime: Date.now()
  };
  
  // Ana API'ler (IGDB -> RAWG -> Giant Bomb)
  const mainApis = [
    { name: 'igdb', func: () => searchGamesIGDB(query, limit) },
    { name: 'rawg', func: () => searchRAWG(query, limit) },
    { name: 'giantBomb', func: () => searchGamesGiantBomb(query, limit) }
  ];
  
  // Ana API'lerden veri al
  for (const api of mainApis) {
    if (results.results.length >= limit) break;
    
    try {
      if (!isApiAvailable(api.name)) {
        console.log(`⚠️ ${api.name} API kullanılamıyor, atlanıyor`);
        continue;
      }
      
      console.log(`📡 ${api.name} API'sinden arama yapılıyor...`);
      const startTime = Date.now();
      trackApiRequest(api.name, 'search', { query, limit }); // 📊 API request tracking
      const apiResults = await api.func();
      const duration = Date.now() - startTime;
      
      if (apiResults && Array.isArray(apiResults) && apiResults.length > 0) {
        results.results.push(...apiResults.slice(0, limit - results.results.length));
        results.sources.push(api.name);
        console.log(`✅ ${api.name}: ${apiResults.length} sonuç bulundu`);
        trackApiSuccess(api.name, 'search', apiResults, duration); // 📊 API success tracking
        
        // 🔄 Veri kalitesi kontrolü - eksik veriler varsa diğer API'leri de dene
        const hasIncompleteData = apiResults.some(game => 
          !game.image || !game.description || game.description.length < 50
        );
        
        // İlk başarılı API'den sonra dur (sadece veriler complete ise)
        if (!options.searchAllApis && !hasIncompleteData) {
          console.log(`✅ ${api.name} API'sinden complete veri alındı, diğer API'ler atlanıyor`);
          break;
        } else if (hasIncompleteData) {
          console.log(`⚠️ ${api.name} API'sinden eksik veriler var, diğer API'ler de denenecek`);
        }
      } else {
        const noResultsError = new Error('No results found');
        trackApiError(api.name, 'search', noResultsError, duration); // 📊 API error tracking (no results)
      }
      
      updateApiStatus(api.name, API_STATUS.AVAILABLE);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${api.name} API hatası:`, error);
      trackApiError(api.name, 'search', error, duration); // 📊 API error tracking
      results.errors.push({ api: api.name, error: error.message });
      
      if (error.message.includes('rate limit')) {
        updateApiStatus(api.name, API_STATUS.RATE_LIMITED);
        logRateLimit(api.name, Date.now() + 60000); // 1 dakika sonra reset
      } else {
        updateApiStatus(api.name, API_STATUS.ERROR);
      }
    }
  }
  
  // 🔍 Eksik veri tespiti ve otomatik tamamlama
  if (results.results.length > 0) {
    console.log('🔍 Eksik veri tespiti başlatılıyor...');
    
    const incompleteGames = results.results.filter(game => 
      !game.image || !game.description || game.description.length < 50
    );
    
    if (incompleteGames.length > 0) {
      console.log(`⚠️ ${incompleteGames.length} oyunda eksik veri tespit edildi, tamamlama deneniyor...`);
      
      // Eksik verileri tamamlamaya çalış
      for (const game of incompleteGames) {
        await tryCompleteGameData(game, query);
      }
    }
  }
  
  // Eğer hiç sonuç bulunamadıysa hata mesajı logla
  if (results.results.length === 0) {
    console.log('❌ Hiçbir API\'den sonuç alınamadı');
  }
  
  // Harici API'ler (Steam, CheapShark) - opsiyonel
  if (includeExternal && results.results.length < limit) {
    const externalApis = [
      { name: 'steam', func: () => searchGamesSteam(query, limit) },
      { name: 'cheapShark', func: () => searchGamesCheapShark(query, limit) }
    ];
    
    for (const api of externalApis) {
      if (results.results.length >= limit) break;
      
      try {
        if (!isApiAvailable(api.name)) continue;
        
        console.log(`📡 ${api.name} API'sinden arama yapılıyor...`);
        const startTime = Date.now();
        trackApiRequest(api.name, 'search', { query, limit }); // 📊 API request tracking
        const apiResults = await api.func();
        const duration = Date.now() - startTime;
        
        if (apiResults && apiResults.length > 0) {
          results.results.push(...apiResults.slice(0, limit - results.results.length));
          results.sources.push(api.name);
          console.log(`✅ ${api.name}: ${apiResults.length} sonuç bulundu`);
          trackApiSuccess(api.name, 'search', apiResults, duration); // 📊 API success tracking
        } else {
          const noResultsError = new Error('No results found');
          trackApiError(api.name, 'search', noResultsError, duration); // 📊 API error tracking (no results)
        }
        
        updateApiStatus(api.name, API_STATUS.AVAILABLE);
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ ${api.name} API hatası:`, error);
        trackApiError(api.name, 'search', error, duration); // 📊 API error tracking
        results.errors.push({ api: api.name, error: error.message });
        updateApiStatus(api.name, API_STATUS.ERROR);
      }
    }
  }
  
  // 🔄 Veri birleştirme ve dedupe işlemi
  if (results.results.length > 0) {
    console.log(`🔄 ${results.results.length} sonuç birleştiriliyor...`);
    
    // Veri kalitesi analizi
    const beforeAnalysis = analyzeDataCompleteness(results.results);
    console.log(`📊 Birleştirme öncesi: ${beforeAnalysis.complete} complete, ${beforeAnalysis.incomplete} incomplete`);
    
    // Sonuçları birleştir ve dedupe et
    results.results = mergeAndDeduplicateResults(results.results, query);
    
    // Birleştirme sonrası analiz
    const afterAnalysis = analyzeDataCompleteness(results.results);
    console.log(`📊 Birleştirme sonrası: ${afterAnalysis.complete} complete, ${afterAnalysis.incomplete} incomplete`);
    
    // Relevance'a göre sırala
    console.log(`🔄 ${results.results.length} sonuç relevance'a göre sıralanıyor...`);
    results.results = sortByRelevance(results.results, query);
    console.log(`✅ En iyi eşleşme: "${results.results[0]?.title}" (skor: ${results.results[0]?.relevanceScore})`);
  }
  
  results.totalResults = results.results.length;
  results.searchTime = Date.now() - results.searchTime;
  
  console.log(`🎯 Arama tamamlandı: ${results.totalResults} sonuç, ${results.searchTime}ms`);
  
  // 💾 Sonucu cache'e kaydet
  if (results.totalResults > 0) {
    setToCache(searchCache, cacheKey, results);
    trackCacheSave('search', cacheKey, results); // 📊 Cache save tracking
  }
  
  return results;
};

/**
 * Oyun detayı getir - Fallback sistemi ile
 * @param {string} gameId - Oyun ID'si (source prefix ile)
 * @param {Object} options - Detay seçenekleri
 * @returns {Promise<Object>} Oyun detayları ve ek veriler
 */
export const getGameDetailsWithFallback = async (gameId, options = {}) => {
  const { includeExternal = true, includePricing = true, includeHLTB = true, includeMetacritic = true } = options;
  
  console.log(`🔍 Oyun detayı alınıyor: ${gameId}`);
  
  const result = {
    gameId,
    gameData: null,
    externalData: {},
    sources: [],
    errors: [],
    loadTime: Date.now()
  };
  
  // Ana oyun verisini al
  try {
    result.gameData = await getMainGameDetails(gameId);
    if (result.gameData) {
      result.sources.push(result.gameData.source);
      console.log(`✅ Ana veri alındı: ${result.gameData.source}`);
    }
  } catch (error) {
    console.error('❌ Ana oyun verisi alınamadı:', error);
    result.errors.push({ type: 'main_data', error: error.message });
  }
  
  if (!result.gameData) {
    console.log('❌ Hiçbir kaynaktan oyun verisi alınamadı');
    return result;
  }
  
  // Harici verileri paralel olarak al
  const externalPromises = [];
  
  // Steam verileri
  if (includeExternal && result.gameData.steamAppId) {
    externalPromises.push(
      getSteamGameDetails(result.gameData.steamAppId)
        .then(data => {
          if (data) {
            result.externalData.steam = data;
            result.sources.push('steam');
            console.log('✅ Steam verileri alındı');
          }
        })
        .catch(error => {
          console.error('❌ Steam verileri alınamadı:', error);
          result.errors.push({ type: 'steam', error: error.message });
        })
    );
  }
  
  // Fiyat verileri (CheapShark)
  if (includePricing) {
    externalPromises.push(
      getGamePricing(result.gameData)
        .then(pricing => {
          if (pricing && pricing.length > 0) {
            result.externalData.pricing = pricing;
            result.sources.push('cheapshark');
            console.log(`✅ Fiyat verileri alındı: ${pricing.length} mağaza`);
          }
        })
        .catch(error => {
          console.error('❌ Fiyat verileri alınamadı:', error);
          result.errors.push({ type: 'pricing', error: error.message });
        })
    );
  }
  
  // HowLongToBeat verileri
  if (includeHLTB) {
    externalPromises.push(
      searchHowLongToBeat(result.gameData.title)
        .then(hltbResults => {
          const bestMatch = findBestHLTBMatch(result.gameData.title, hltbResults);
          if (bestMatch) {
            result.externalData.howLongToBeat = bestMatch;
            result.sources.push('hltb');
            console.log('✅ HowLongToBeat verileri alındı');
          }
        })
        .catch(error => {
          console.error('❌ HowLongToBeat verileri alınamadı:', error);
          result.errors.push({ type: 'hltb', error: error.message });
        })
    );
  }
  
  // Metacritic verileri
  if (includeMetacritic) {
    externalPromises.push(
      getMetacriticDetails(result.gameData.title, 'pc')
        .then(metacriticData => {
          if (metacriticData) {
            result.externalData.metacritic = metacriticData;
            result.sources.push('metacritic');
            console.log('✅ Metacritic verileri alındı');
          }
        })
        .catch(error => {
          console.error('❌ Metacritic verileri alınamadı:', error);
          result.errors.push({ type: 'metacritic', error: error.message });
        })
    );
  }
  
  // Tüm harici verileri bekle
  await Promise.allSettled(externalPromises);
  
  result.loadTime = Date.now() - result.loadTime;
  console.log(`🎯 Oyun detayları tamamlandı: ${result.sources.length} kaynak, ${result.loadTime}ms`);
  
  return result;
};

/**
 * Ana oyun detaylarını al (fallback ile)
 * @param {string} gameId - Oyun ID'si
 * @returns {Promise<Object>} Oyun detayları
 */
const getMainGameDetails = async (gameId) => {
  // ID'den source'u belirle
  const [source, id] = gameId.split('_');
  
  const detailFunctions = {
    rawg: () => getRAWGDetails(id),
    igdb: () => getGameDetailsIGDB(id),
    giantbomb: () => getGameDetailsGiantBomb(id),
    steam: () => getSteamGameDetails(id)
  };
  
  // Önce belirtilen source'u dene
  if (detailFunctions[source] && isApiAvailable(source)) {
    try {
      const result = await detailFunctions[source]();
      if (result) return result;
    } catch (error) {
      console.error(`❌ ${source} detay hatası:`, error);
    }
  }
  
  // Fallback: Diğer API'leri dene (IGDB → RAWG → GiantBomb sırası)
  const fallbackApis = ['igdb', 'rawg', 'giantbomb'].filter(api => api !== source);
  
  for (const api of fallbackApis) {
    if (!isApiAvailable(api)) continue;
    
    try {
      const result = await detailFunctions[api]();
      if (result) {
        console.log(`✅ ${api} fallback başarılı`);
        return result;
      } else {
        console.log(`⚠️ ${api} null döndürdü, devam ediliyor`);
      }
    } catch (error) {
      console.error(`❌ ${api} fallback hatası:`, error);
    }
  }
  
  throw new Error('Hiçbir API\'den oyun detayı alınamadı');
};

/**
 * Oyun fiyat bilgilerini al
 * @param {Object} gameData - Oyun verisi
 * @returns {Promise<Array>} Fiyat bilgileri
 */
const getGamePricing = async (gameData) => {
  try {
    // Steam App ID varsa CheapShark'ta ara
    if (gameData.steamAppId) {
      const gameId = await findGameBySteamId(gameData.steamAppId);
      if (gameId) {
        return await getGameDeals(gameId);
      }
    }
    
    // Oyun adıyla ara
    const searchResults = await searchGamesCheapShark(gameData.title, 1);
    if (searchResults.length > 0) {
      return await getGameDeals(searchResults[0].cheapSharkId);
    }
    
    return [];
  } catch (error) {
    console.error('❌ Fiyat bilgisi alma hatası:', error);
    return [];
  }
};

/**
 * API'nin kullanılabilir olup olmadığını kontrol et
 * @param {string} apiName - API adı
 * @returns {boolean} Kullanılabilir mi?
 */
const isApiAvailable = (apiName) => {
  const status = apiStatuses[apiName];
  const rateLimit = rateLimits[apiName];
  
  // Rate limit kontrolü
  if (status === API_STATUS.RATE_LIMITED && Date.now() < rateLimit.resetTime) {
    return false;
  }
  
  // Genel durum kontrolü
  return status === API_STATUS.AVAILABLE || status === API_STATUS.RATE_LIMITED;
};

/**
 * API durumunu güncelle
 * @param {string} apiName - API adı
 * @param {string} status - Yeni durum
 */
const updateApiStatus = (apiName, status) => {
  apiStatuses[apiName] = status;
  
  // Rate limit durumunda reset zamanını ayarla
  if (status === API_STATUS.RATE_LIMITED) {
    const resetTimes = {
      rawg: 60000, // 1 dakika
      igdb: 60000, // 1 dakika
      giantBomb: 3600000, // 1 saat
      steam: 60000, // 1 dakika
      cheapShark: 1000, // 1 saniye
      hltb: 1000, // 1 saniye
      metacritic: 2000 // 2 saniye
    };
    
    rateLimits[apiName].resetTime = Date.now() + (resetTimes[apiName] || 60000);
  }
};

/**
 * Tüm API'lerin durumunu kontrol et
 * @returns {Promise<Object>} API durumları
 */
export const checkAllApiStatuses = async () => {
  console.log('🔍 Tüm API durumları kontrol ediliyor...');
  
  const statusChecks = [
    { name: 'rawg', check: () => Promise.resolve(true) }, // RAWG her zaman mevcut
    { name: 'igdb', check: checkIGDBStatus },
    { name: 'giantBomb', check: checkGiantBombStatus },
    { name: 'steam', check: checkSteamStatus },
    { name: 'cheapShark', check: checkCheapSharkStatus }
  ];
  
  const results = {};
  
  for (const { name, check } of statusChecks) {
    try {
      const isAvailable = await check();
      results[name] = {
        status: isAvailable ? API_STATUS.AVAILABLE : API_STATUS.UNAVAILABLE,
        lastChecked: new Date().toISOString()
      };
      
      if (isAvailable) {
        updateApiStatus(name, API_STATUS.AVAILABLE);
      } else {
        updateApiStatus(name, API_STATUS.UNAVAILABLE);
      }
    } catch (error) {
      results[name] = {
        status: API_STATUS.ERROR,
        error: error.message,
        lastChecked: new Date().toISOString()
      };
      updateApiStatus(name, API_STATUS.ERROR);
    }
  }
  
  console.log('✅ API durum kontrolü tamamlandı');
  return results;
};

// 📊 API KULLANIM İSTATİSTİKLERİ - Tracking fonksiyonları apiLogger.js'den import ediliyor

/**
 * API istatistiklerini getir
 * @returns {Object} API kullanım istatistikleri
 */
export const getApiStatistics = () => {
  const uptime = Date.now() - apiUsageStats.startTime;
  const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
  const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  
  // Logger istatistiklerini al
  const logStats = getApiLogStatistics();
  
  return {
    // Genel istatistikler
    totalRequests: apiUsageStats.totalRequests,
    successfulRequests: apiUsageStats.successfulRequests,
    failedRequests: apiUsageStats.failedRequests,
    cacheHits: apiUsageStats.cacheHits,
    successRate: apiUsageStats.totalRequests > 0 
      ? ((apiUsageStats.successfulRequests / apiUsageStats.totalRequests) * 100).toFixed(1)
      : 0,
    cacheHitRate: apiUsageStats.totalRequests > 0 
      ? ((apiUsageStats.cacheHits / apiUsageStats.totalRequests) * 100).toFixed(1)
      : 0,
    
    // Uptime bilgisi
    uptime: `${uptimeHours}s ${uptimeMinutes}d`,
    startTime: new Date(apiUsageStats.startTime).toLocaleString('tr-TR'),
    
    // API bazlı istatistikler
    byApi: { ...apiUsageStats.byApi },
    
    // Logger istatistikleri
    logs: {
      totalLogs: logStats.totalLogs,
      last24Hours: logStats.last24Hours,
      lastHour: logStats.lastHour,
      byLevel: logStats.byLevel,
      oldestLog: logStats.oldestLog,
      newestLog: logStats.newestLog
    },
    
    // Sistem durumu
    statuses: { ...apiStatuses },
    rateLimits: { ...rateLimits },
    priority: API_PRIORITY,
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Rate limit'leri sıfırla
 */
export const resetRateLimits = () => {
  Object.keys(rateLimits).forEach(api => {
    rateLimits[api] = { requests: 0, resetTime: Date.now() };
    if (apiStatuses[api] === API_STATUS.RATE_LIMITED) {
      apiStatuses[api] = API_STATUS.AVAILABLE;
    }
  });
  
  console.log('🔄 Rate limitler sıfırlandı');
};



/**
  * 🔄 Veri Birleştirme Sistemi
  * Birden fazla API'den gelen verileri birleştirerek eksik bilgileri tamamlar
  */

/**
 * Eksik oyun verisini tamamlamaya çalış
 * @param {Object} game - Eksik verili oyun
 * @param {string} originalQuery - Orijinal arama terimi
 * @returns {Promise<Object>} Tamamlanmış oyun verisi
 */
const tryCompleteGameData = async (game, originalQuery) => {
  if (!game || !game.title) return game;
  
  console.log(`🔧 "${game.title}" için eksik veri tamamlanmaya çalışılıyor...`);
  
  // Eksik alanları tespit et
  const missingFields = [];
  if (!game.image) missingFields.push('poster');
  if (!game.description || game.description.length < 50) missingFields.push('description');
  if (!game.genres || game.genres.length === 0) missingFields.push('genres');
  
  console.log(`📋 Eksik alanlar: ${missingFields.join(', ')}`);
  
  // Alternatif API'lerden arama yap
  const alternativeApis = [
    { name: 'igdb', func: () => searchGamesIGDB(game.title, 3) },
    { name: 'rawg', func: () => searchRAWG(game.title, 3) },
    { name: 'giantBomb', func: () => searchGamesGiantBomb(game.title, 3) }
  ];
  
  for (const api of alternativeApis) {
    // Eğer bu API'den zaten veri geldiyse atla
    if (game.source && game.source.includes(api.name)) continue;
    
    try {
      if (!isApiAvailable(api.name)) continue;
      
      console.log(`🔍 ${api.name} API'sinden "${game.title}" aranıyor...`);
      const apiResults = await api.func();
      
      if (apiResults && apiResults.length > 0) {
        // En iyi eşleşmeyi bul
        const bestMatch = apiResults.find(result => 
          result.title.toLowerCase().includes(game.title.toLowerCase()) ||
          game.title.toLowerCase().includes(result.title.toLowerCase())
        ) || apiResults[0];
        
        if (bestMatch) {
          // Eksik verileri tamamla
          const originalGame = { ...game };
          const completedGame = mergeGameData(game, bestMatch);
          
          // Hangi alanların tamamlandığını logla
          const completedFields = [];
          if (!originalGame.image && completedGame.image) completedFields.push('poster');
          if ((!originalGame.description || originalGame.description.length < 50) && 
              completedGame.description && completedGame.description.length >= 50) {
            completedFields.push('description');
          }
          if ((!originalGame.genres || originalGame.genres.length === 0) && 
              completedGame.genres && completedGame.genres.length > 0) {
            completedFields.push('genres');
          }
          
          if (completedFields.length > 0) {
            console.log(`✅ ${api.name} API'sinden tamamlanan alanlar: ${completedFields.join(', ')}`);
            Object.assign(game, completedGame);
            
            // Tüm eksik alanlar tamamlandıysa dur
            const stillMissing = [];
            if (!game.image) stillMissing.push('poster');
            if (!game.description || game.description.length < 50) stillMissing.push('description');
            if (!game.genres || game.genres.length === 0) stillMissing.push('genres');
            
            if (stillMissing.length === 0) {
              console.log(`🎉 "${game.title}" için tüm eksik veriler tamamlandı!`);
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error(`❌ ${api.name} API'sinden veri tamamlama hatası:`, error.message);
    }
  }
  
  return game;
};

/**
 * İki oyun verisini birleştir - eksik alanları tamamla
 * @param {Object} primaryGame - Ana oyun verisi
 * @param {Object} secondaryGame - Tamamlayıcı oyun verisi
 * @returns {Object} Birleştirilmiş oyun verisi
 */
const mergeGameData = (primaryGame, secondaryGame) => {
  if (!primaryGame || !secondaryGame) return primaryGame || secondaryGame;
  
  // Temel bilgileri birleştir
  const merged = { ...primaryGame };
  
  // 🖼️ Görsel verilerini tamamla
  if (!merged.image && secondaryGame.image) {
    merged.image = secondaryGame.image;
    console.log(`🖼️ Poster tamamlandı: ${merged.title}`);
  }
  
  if (!merged.screenshots && secondaryGame.screenshots) {
    merged.screenshots = secondaryGame.screenshots;
  }
  
  // 📝 Açıklama verilerini tamamla
  if ((!merged.description || merged.description.length < 50) && 
      secondaryGame.description && secondaryGame.description.length >= 50) {
    merged.description = secondaryGame.description;
    console.log(`📝 Açıklama tamamlandı: ${merged.title}`);
  }
  
  // 🎮 Oyun bilgilerini tamamla
  if (!merged.genres && secondaryGame.genres) {
    merged.genres = secondaryGame.genres;
  }
  
  if (!merged.platforms && secondaryGame.platforms) {
    merged.platforms = secondaryGame.platforms;
  }
  
  if (!merged.releaseDate && secondaryGame.releaseDate) {
    merged.releaseDate = secondaryGame.releaseDate;
  }
  
  if (!merged.rating && secondaryGame.rating) {
    merged.rating = secondaryGame.rating;
  }
  
  if (!merged.developer && secondaryGame.developer) {
    merged.developer = secondaryGame.developer;
  }
  
  if (!merged.publisher && secondaryGame.publisher) {
    merged.publisher = secondaryGame.publisher;
  }
  
  // 🔗 Ek bilgileri birleştir
  if (!merged.metacriticScore && secondaryGame.metacriticScore) {
    merged.metacriticScore = secondaryGame.metacriticScore;
  }
  
  if (!merged.steamAppId && secondaryGame.steamAppId) {
    merged.steamAppId = secondaryGame.steamAppId;
  }
  
  // 🏷️ Kaynak bilgisini güncelle
  if (merged.source && secondaryGame.source && merged.source !== secondaryGame.source) {
    merged.source = `${merged.source}+${secondaryGame.source}`;
    merged.mergedFrom = [merged.source.split('+')[0], secondaryGame.source];
  }
  
  return merged;
};

/**
 * Oyun listesindeki eksik verileri tespit et
 * @param {Array} games - Oyun listesi
 * @returns {Object} Eksik veri analizi
 */
const analyzeDataCompleteness = (games) => {
  if (!games || games.length === 0) return { complete: 0, incomplete: 0, issues: [] };
  
  let complete = 0;
  let incomplete = 0;
  const issues = [];
  
  games.forEach((game, index) => {
    const gameIssues = [];
    
    if (!game.image) gameIssues.push('poster');
    if (!game.description || game.description.length < 50) gameIssues.push('description');
    if (!game.genres || game.genres.length === 0) gameIssues.push('genres');
    if (!game.releaseDate) gameIssues.push('releaseDate');
    
    if (gameIssues.length === 0) {
      complete++;
    } else {
      incomplete++;
      issues.push({
        index,
        title: game.title,
        issues: gameIssues
      });
    }
  });
  
  return { complete, incomplete, issues };
};

/**
 * Aynı oyunu farklı API'lerden bulup birleştir
 * @param {Array} allResults - Tüm API'lerden gelen sonuçlar
 * @param {string} query - Arama terimi
 * @returns {Array} Birleştirilmiş ve dedupe edilmiş sonuçlar
 */
const mergeAndDeduplicateResults = (allResults, query) => {
  if (!allResults || allResults.length === 0) return [];
  
  console.log(`🔄 ${allResults.length} sonuç birleştiriliyor ve dedupe ediliyor...`);
  
  const mergedGames = [];
  const processedTitles = new Set();
  
  // Önce tüm sonuçları normalize et
  const normalizedResults = allResults.map(game => ({
    ...game,
    normalizedTitle: game.title?.toLowerCase().replace(/[^\w\s]/g, '').trim()
  }));
  
  // Her oyun için en iyi eşleşmeleri bul ve birleştir
  normalizedResults.forEach(game => {
    if (processedTitles.has(game.normalizedTitle)) return;
    
    // Aynı oyunun diğer versiyonlarını bul
    const duplicates = normalizedResults.filter(other => 
      other.normalizedTitle === game.normalizedTitle && other !== game
    );
    
    let mergedGame = { ...game };
    
    // Duplikatları birleştir
    duplicates.forEach(duplicate => {
      mergedGame = mergeGameData(mergedGame, duplicate);
    });
    
    mergedGames.push(mergedGame);
    processedTitles.add(game.normalizedTitle);
  });
  
  console.log(`✅ ${allResults.length} sonuçtan ${mergedGames.length} benzersiz oyun elde edildi`);
  
  return mergedGames;
};

// Debug fonksiyonları
if (typeof window !== 'undefined') {
  window.gameApiCoordinator = {
    search: searchGamesWithFallback,
    getDetails: getGameDetailsWithFallback,
    checkStatuses: checkAllApiStatuses,
    getStats: getApiStatistics,
    resetLimits: resetRateLimits,
    statuses: apiStatuses,
    rateLimits: rateLimits
  };
  
  // 🔧 DEBUG TOOLS - Browser console'dan erişim için
  window.gameApiDebug = {
    getStats: () => apiUsageStats,
    resetStats: () => {
      Object.keys(apiUsageStats.byApi).forEach(api => {
        apiUsageStats.byApi[api] = { requests: 0, successful: 0, errors: 0, cacheHits: 0 };
      });
      apiUsageStats.totalRequests = 0;
      apiUsageStats.successfulRequests = 0;
      apiUsageStats.failedRequests = 0;
      apiUsageStats.cacheHits = 0;
      apiUsageStats.startTime = Date.now();
      console.log('📊 API istatistikleri sıfırlandı');
    },
    getCacheSize: () => ({
      search: searchCache.size,
      details: detailsCache.size
    }),
    clearCache: () => {
      searchCache.clear();
      detailsCache.clear();
      console.log('🗑️ Cache temizlendi');
    },
    ultraClear: clearAllCaches // 🧹 ULTRA CLEAR fonksiyonu
  };
  
  // Global erişim için
  window.clearAllCaches = clearAllCaches;
  
  console.log('🔧 Game API Debug Tools yüklendi:');
  console.log('  - window.gameApiDebug.ultraClear() : Tüm cache\'leri temizle ve sayfayı yenile');
  console.log('  - window.clearAllCaches() : Direkt ultra clear');
}