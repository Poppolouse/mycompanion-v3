/**
 * 🎮 Oyun Açıklama API Servisi
 * Çoklu dil desteği ve fallback sistemi
 */

import gameApi from './gameApi';
import { searchGamesIGDB } from './igdbApi';
import { searchGamesGiantBomb } from './giantBombApi';
import { translateWithCache, evaluateTranslationQuality } from './translationApi';
import { 
  saveGameDescription, 
  getGameDescription as getStoredDescription, 
  findDescriptionByTitle 
} from './gameDescriptionStorage';

/**
 * Bu sistem oyun konularını şu sırayla çeker:
 * 1. Steam API (Türkçe destekli)
 * 2. Wikipedia API (Türkçe)
 * 3. RAWG API (İngilizce) + Çeviri
 * 4. IGDB API (İngilizce) + Çeviri
 * 5. Giant Bomb API (İngilizce) + Çeviri
 */

// API Öncelik Sıralaması
const DESCRIPTION_API_PRIORITY = [
  'steam_turkish',
  'wikipedia_turkish', 
  'steam_english',
  'rawg_english',
  'igdb_english',
  'giantbomb_english'
];

// Rate limiting
const RATE_LIMITS = {
  steam: { requests: 100, window: 60000, lastReset: Date.now(), count: 0 },
  wikipedia: { requests: 200, window: 60000, lastReset: Date.now(), count: 0 },
  translation: { requests: 100, window: 60000, lastReset: Date.now(), count: 0 }
};

// Cache sistemi
const descriptionCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 saat

/**
 * Rate limiting kontrolü
 */
function checkRateLimit(apiName) {
  const limit = RATE_LIMITS[apiName];
  if (!limit) return true;
  
  const now = Date.now();
  if (now - limit.lastReset > limit.window) {
    limit.count = 0;
    limit.lastReset = now;
  }
  
  if (limit.count >= limit.requests) {
    console.warn(`⚠️ Rate limit aşıldı: ${apiName}`);
    return false;
  }
  
  limit.count++;
  return true;
}

/**
 * Steam API'den oyun açıklaması çek (Türkçe/İngilizce)
 */
async function getDescriptionFromSteam(gameTitle, language = 'turkish') {
  if (!checkRateLimit('steam')) return null;
  
  try {
    // Steam'de oyunu ara
    const searchResponse = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(gameTitle)}&l=${language}&cc=tr`
    );
    
    if (!searchResponse.ok) return null;
    
    const searchData = await searchResponse.json();
    if (!searchData.items || searchData.items.length === 0) return null;
    
    // En iyi eşleşmeyi bul
    const bestMatch = searchData.items.find(item => 
      item.name.toLowerCase().includes(gameTitle.toLowerCase()) ||
      gameTitle.toLowerCase().includes(item.name.toLowerCase())
    ) || searchData.items[0];
    
    // Oyun detaylarını çek
    const detailsResponse = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${bestMatch.id}&l=${language}`
    );
    
    if (!detailsResponse.ok) return null;
    
    const detailsData = await detailsResponse.json();
    const gameData = detailsData[bestMatch.id]?.data;
    
    if (!gameData) return null;
    
    return {
      description: gameData.short_description || gameData.detailed_description,
      source: `steam_${language}`,
      isTranslated: false,
      confidence: calculateSteamConfidence(gameTitle, gameData.name)
    };
    
  } catch (error) {
    console.error('Steam API hatası:', error);
    return null;
  }
}

/**
 * Wikipedia'dan oyun açıklaması çek (Türkçe)
 */
async function getDescriptionFromWikipedia(gameTitle, language = 'tr') {
  if (!checkRateLimit('wikipedia')) return null;
  
  try {
    // Wikipedia'da oyunu ara
    const searchResponse = await fetch(
      `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(gameTitle)}`
    );
    
    if (!searchResponse.ok) {
      // Alternatif arama
      const altSearchResponse = await fetch(
        `https://${language}.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(gameTitle)}&origin=*`
      );
      
      if (!altSearchResponse.ok) return null;
      
      const altSearchData = await altSearchResponse.json();
      if (!altSearchData.query?.search?.length) return null;
      
      const bestMatch = altSearchData.query.search[0];
      const summaryResponse = await fetch(
        `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestMatch.title)}`
      );
      
      if (!summaryResponse.ok) return null;
      
      const summaryData = await summaryResponse.json();
      return {
        description: summaryData.extract,
        source: `wikipedia_${language}`,
        isTranslated: false,
        confidence: calculateWikipediaConfidence(gameTitle, bestMatch.title)
      };
    }
    
    const searchData = await searchResponse.json();
    
    return {
      description: searchData.extract,
      source: `wikipedia_${language}`,
      isTranslated: false,
      confidence: calculateWikipediaConfidence(gameTitle, searchData.title)
    };
    
  } catch (error) {
    console.error('Wikipedia API hatası:', error);
    return null;
  }
}

/**
 * Mevcut API'lardan İngilizce açıklama çek
 */
async function getDescriptionFromExistingAPIs(gameTitle) {
  try {
    // RAWG'den çek
    const rawgResponse = await fetch(
      `https://api.rawg.io/api/games?key=${process.env.REACT_APP_RAWG_API_KEY}&search=${encodeURIComponent(gameTitle)}`
    );
    
    if (rawgResponse.ok) {
      const rawgData = await rawgResponse.json();
      if (rawgData.results?.length > 0) {
        const game = rawgData.results[0];
        if (game.description_raw || game.description) {
          const englishDescription = game.description_raw || game.description;
          
          try {
            const translation = await translateWithCache(englishDescription);
            const quality = evaluateTranslationQuality(englishDescription, translation.translatedText);
            
            return {
              description: translation.translatedText.substring(0, 500) + (translation.translatedText.length > 500 ? '...' : ''),
              source: 'rawg_english',
              originalSource: 'RAWG (İngilizce)',
              isTranslated: true,
              confidence: Math.min(calculateRAWGConfidence(gameTitle, game.name), quality),
              translationConfidence: translation.confidence
            };
          } catch (translationError) {
            console.warn('RAWG çeviri hatası:', translationError.message);
            // Çeviri başarısızsa İngilizce döndür
            return {
              description: englishDescription.substring(0, 500) + '...',
              source: 'rawg_english',
              isTranslated: false,
              confidence: calculateRAWGConfidence(gameTitle, game.name)
            };
          }
        }
      }
    }
    
    // IGDB'den çek (eğer RAWG'de yoksa)
    try {
       const igdbData = await searchGamesIGDB(gameTitle);
      if (igdbData && Array.isArray(igdbData) && igdbData[0]?.summary) {
        const englishDescription = igdbData[0].summary;
        
        try {
          const translation = await translateWithCache(englishDescription);
          const quality = evaluateTranslationQuality(englishDescription, translation.translatedText);
          
          return {
            description: translation.translatedText.substring(0, 500) + (translation.translatedText.length > 500 ? '...' : ''),
            source: 'igdb_english',
            originalSource: 'IGDB (İngilizce)',
            isTranslated: true,
            confidence: Math.min(0.8, quality),
            translationConfidence: translation.confidence
          };
        } catch (translationError) {
          console.warn('IGDB çeviri hatası:', translationError.message);
          // Çeviri başarısızsa İngilizce döndür
          return {
            description: englishDescription.substring(0, 500) + '...',
            source: 'igdb_english',
            isTranslated: false,
            confidence: 0.7
          };
        }
      }
    } catch (error) {
      console.warn('IGDB API hatası:', error.message);
    }
    
    // Giant Bomb API'den çek (eğer diğerleri yoksa)
     try {
       const giantBombData = await searchGamesGiantBomb(gameTitle);
      if (giantBombData?.results?.[0]?.deck) {
        const englishDescription = giantBombData.results[0].deck;
        
        try {
          const translation = await translateWithCache(englishDescription);
          const quality = evaluateTranslationQuality(englishDescription, translation.translatedText);
          
          return {
            description: translation.translatedText.substring(0, 500) + (translation.translatedText.length > 500 ? '...' : ''),
            source: 'giantbomb_english',
            originalSource: 'Giant Bomb (İngilizce)',
            isTranslated: true,
            confidence: Math.min(0.6, quality),
            translationConfidence: translation.confidence
          };
        } catch (translationError) {
          console.warn('Giant Bomb çeviri hatası:', translationError.message);
          // Çeviri başarısızsa İngilizce döndür
          return {
            description: englishDescription.substring(0, 500) + '...',
            source: 'giantbomb_english',
            isTranslated: false,
            confidence: 0.5
          };
        }
      }
    } catch (error) {
      console.warn('Giant Bomb API hatası:', error.message);
    }
    
    return null;
  } catch (error) {
    console.error('Existing APIs hatası:', error);
    return null;
  }
}

/**
 * Google Translate ile çeviri yap
 */
async function translateDescription(text, targetLanguage = 'tr') {
  if (!checkRateLimit('translation')) return null;
  
  try {
    // Google Translate API (ücretsiz endpoint)
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const translatedText = data[0]?.map(item => item[0]).join('');
    
    return translatedText;
  } catch (error) {
    console.error('Çeviri hatası:', error);
    return null;
  }
}

/**
 * Güven skoru hesaplama fonksiyonları
 */
function calculateSteamConfidence(searchTitle, foundTitle) {
  const similarity = calculateStringSimilarity(searchTitle.toLowerCase(), foundTitle.toLowerCase());
  return Math.min(similarity * 100, 95); // Max %95
}

function calculateWikipediaConfidence(searchTitle, foundTitle) {
  const similarity = calculateStringSimilarity(searchTitle.toLowerCase(), foundTitle.toLowerCase());
  return Math.min(similarity * 100, 90); // Max %90
}

function calculateRAWGConfidence(searchTitle, foundTitle) {
  const similarity = calculateStringSimilarity(searchTitle.toLowerCase(), foundTitle.toLowerCase());
  return Math.min(similarity * 100, 85); // Max %85
}

/**
 * String benzerlik hesaplama (Levenshtein distance)
 */
function calculateStringSimilarity(str1, str2) {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;
  
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
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
  
  const maxLen = Math.max(len1, len2);
  return (maxLen - matrix[len2][len1]) / maxLen;
}

/**
 * Ana fonksiyon: Oyun açıklamasını çek
 * @param {string} gameName - Oyun adı
 * @param {string} gameId - Oyun ID'si (opsiyonel)
 * @returns {Promise<Object>}
 */
export async function getGameDescription(gameName, gameId = null) {
  if (!gameName) {
    throw new Error('Oyun adı gerekli');
  }

  if (typeof gameName !== 'string' || gameName.trim().length === 0) {
    throw new Error('Geçerli bir oyun adı gerekli');
  }

  console.log(`🔍 Oyun açıklaması aranıyor: ${gameName}`);

  // Önce kaydedilmiş açıklamayı kontrol et
  if (gameId) {
    const storedDescription = getStoredDescription(gameId);
    if (storedDescription) {
      console.log(`💾 Kaydedilmiş açıklama bulundu: ${gameName}`);
      return storedDescription;
    }
  }

  // Başlığa göre ara (ID yoksa veya bulunamadıysa)
  const foundByTitle = findDescriptionByTitle(gameName);
  if (foundByTitle) {
    console.log(`🔍 Başlığa göre açıklama bulundu: ${gameName}`);
    return foundByTitle;
  }

  console.log(`🌐 API'lerden açıklama çekiliyor: ${gameName}`);

  // Cache kontrolü
  const cacheKey = `${gameName}_${gameId || 'no-id'}`;
  const cached = descriptionCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📋 Cache\'den açıklama alındı:', gameName);
    return cached.data;
  }
  
  // API'ları sırayla dene
  for (const apiType of DESCRIPTION_API_PRIORITY) {
    try {
      let result = null;
      
      switch (apiType) {
        case 'steam_turkish':
          result = await getDescriptionFromSteam(gameName, 'turkish');
          break;
          
        case 'wikipedia_turkish':
          result = await getDescriptionFromWikipedia(gameName, 'tr');
          break;
          
        case 'steam_english':
          result = await getDescriptionFromSteam(gameName, 'english');
          if (result) {
            // İngilizce açıklamayı çevir
            const translated = await translateDescription(result.description);
            if (translated) {
              result.description = translated;
              result.isTranslated = true;
              result.originalSource = result.source;
              result.source = 'steam_english_translated';
            }
          }
          break;
          
        case 'rawg_english':
        case 'igdb_english':
        case 'giantbomb_english':
          result = await getDescriptionFromExistingAPIs(gameName);
          if (result) {
            // İngilizce açıklamayı çevir
            const translated = await translateDescription(result.description);
            if (translated) {
              result.description = translated;
              result.isTranslated = true;
              result.originalSource = result.source;
              result.source = `${apiType}_translated`;
            }
          }
          break;
      }
      
      if (result && result.description && result.description.length > 50) {
        console.log(`✅ Açıklama bulundu (${result.source}):`, gameName);
        
        // Cache'e kaydet
        descriptionCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        // Veritabanına kaydet
        if (gameId && result) {
          await saveGameDescription(gameId, gameName, result);
        }

        console.log(`✅ Açıklama bulundu: ${result.source} (güven: ${result.confidence})`);
        return result;
      }
      
    } catch (error) {
      console.error(`❌ ${apiType} hatası:`, error);
      
      // Rate limit hatası
      if (error.message?.includes('rate limit') || error.status === 429) {
        console.warn(`⏰ ${apiType} rate limit aşıldı, diğer API'ya geçiliyor`);
        continue;
      }
      
      // Network hatası
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        console.warn(`🌐 ${apiType} network hatası, diğer API'ya geçiliyor`);
        continue;
      }
      
      // Diğer hatalar için de devam et
      continue;
    }
  }
  
  console.log('❌ Hiçbir API\'da açıklama bulunamadı:', gameName);
  return null;
}

/**
 * Açıklama cache'ini temizle
 */
export function clearDescriptionCache() {
  descriptionCache.clear();
  console.log('🗑️ Açıklama cache\'i temizlendi');
}

/**
 * Cache istatistikleri
 */
export function getDescriptionCacheStats() {
  return {
    size: descriptionCache.size,
    entries: Array.from(descriptionCache.keys())
  };
}

/**
 * Rate limit durumunu kontrol et
 */
export function getRateLimitStatus() {
  return Object.entries(RATE_LIMITS).map(([api, limit]) => ({
    api,
    remaining: Math.max(0, limit.requests - limit.count),
    resetTime: limit.lastReset + limit.window
  }));
}

// Debug fonksiyonları (development için)
if (process.env.NODE_ENV === 'development') {
  window.gameDescriptionDebug = {
    getDescription: getGameDescription,
    clearCache: clearDescriptionCache,
    getCacheStats: getDescriptionCacheStats,
    getRateLimits: getRateLimitStatus
  };
}