/**
 * Giant Bomb API
 * Üçüncü fallback API olarak kullanılacak
 * API key gerekli (ücretsiz, non-commercial use)
 */

// Development'ta proxy kullan, production'da direkt API
const GIANT_BOMB_BASE_URL = import.meta.env.DEV ? '/api/giantbomb' : 'https://www.giantbomb.com/api';

// Rate limiting: 200 requests per resource per hour
let requestCount = 0;
let lastResetTime = Date.now();
const RATE_LIMIT = 200;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 saat

const checkRateLimit = () => {
  const now = Date.now();
  if (now - lastResetTime > RATE_LIMIT_WINDOW) {
    requestCount = 0;
    lastResetTime = now;
  }
  
  if (requestCount >= RATE_LIMIT) {
    throw new Error('Giant Bomb API rate limit aşıldı. 1 saat bekleyin.');
  }
  
  requestCount++;
};

const getGiantBombHeaders = () => {
  const apiKey = import.meta.env.VITE_GIANT_BOMB_API_KEY;
  
  if (!apiKey) {
    throw new Error('Giant Bomb API key eksik. .env dosyasında VITE_GIANT_BOMB_API_KEY tanımlanmalı.');
  }
  
  return {
    'User-Agent': 'VaultTracker/1.0'
  };
};

/**
 * Giant Bomb'da oyun arama
 * @param {string} query - Arama terimi
 * @param {number} limit - Sonuç limiti (varsayılan: 10)
 * @returns {Promise<Array>} Bulunan oyunlar
 */
export const searchGamesGiantBomb = async (query, limit = 10) => {
  try {
    checkRateLimit();
    
    const apiKey = import.meta.env.VITE_GIANT_BOMB_API_KEY;
    const headers = getGiantBombHeaders();
    
    const params = new URLSearchParams({
      api_key: apiKey,
      format: 'json',
      query: query,
      limit: limit.toString(),
      resources: 'game',
      field_list: 'id,name,deck,description,original_release_date,platforms,genres,developers,publishers,image,images'
    });
    
    const response = await fetch(`${GIANT_BOMB_BASE_URL}/search/?${params}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Giant Bomb API hatası: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error !== 'OK') {
      throw new Error(`Giant Bomb API hatası: ${data.error}`);
    }
    
    // DLC/Mod/Expansion filtrelemesi - sadece ana oyunları döndür
    const filteredResults = data.results.filter(game => {
      const title = game.name?.toLowerCase() || '';
      const description = (game.deck || game.description || '').toLowerCase();
      
      // DLC/Expansion/Mod keyword'leri
      const dlcKeywords = ['dlc', 'expansion', 'add-on', 'addon', 'pack', 'mod', 'bundle', 'season pass', 'content pack', 'downloadable content'];
      const hasDlcKeyword = dlcKeywords.some(keyword => 
        title.includes(keyword) || description.includes(keyword)
      );
      
      // Demo/Beta filtrelemesi
      const demoKeywords = ['demo', 'beta', 'alpha', 'preview', 'test'];
      const isDemoOrBeta = demoKeywords.some(keyword => 
        title.includes(keyword) || description.includes(keyword)
      );
      
      // Ana oyun olarak kabul et
      return !hasDlcKeyword && !isDemoOrBeta;
    });
    
    return filteredResults.map(normalizeGiantBombGame);
  } catch (error) {
    console.error('❌ Giant Bomb oyun arama hatası:', error);
    throw error;
  }
};

/**
 * Giant Bomb'dan oyun detayı getir
 * @param {number} gameId - Giant Bomb oyun ID'si
 * @returns {Promise<Object>} Oyun detayları
 */
export const getGameDetailsGiantBomb = async (gameId) => {
  try {
    checkRateLimit();
    
    const apiKey = import.meta.env.VITE_GIANT_BOMB_API_KEY;
    const headers = getGiantBombHeaders();
    
    const params = new URLSearchParams({
      api_key: apiKey,
      format: 'json',
      field_list: 'id,name,deck,description,original_release_date,platforms,genres,developers,publishers,image,images,similar_games,franchises,themes,concepts'
    });
    
    const response = await fetch(`${GIANT_BOMB_BASE_URL}/game/${gameId}/?${params}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Giant Bomb API hatası: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error !== 'OK') {
      throw new Error(`Giant Bomb API hatası: ${data.error}`);
    }
    
    return normalizeGiantBombGame(data.results);
  } catch (error) {
    console.error('❌ Giant Bomb oyun detay hatası:', error);
    throw error;
  }
};

/**
 * Giant Bomb verilerini standart formata dönüştür
 * @param {Object} gbGame - Giant Bomb'dan gelen oyun verisi
 * @returns {Object} Normalize edilmiş oyun verisi
 */
const normalizeGiantBombGame = (gbGame) => {
  // Tarih formatını düzelt
  const releaseDate = gbGame.original_release_date ? 
    new Date(gbGame.original_release_date).toISOString().split('T')[0] : null;
  
  // Görselleri düzenle
  const screenshots = [];
  if (gbGame.images) {
    gbGame.images.forEach(image => {
      if (image.tags && image.tags.includes('Screenshots')) {
        screenshots.push(image.super_url || image.screen_large_url || image.medium_url);
      }
    });
  }
  
  return {
    id: `giantbomb_${gbGame.id}`,
    giantBombId: gbGame.id,
    title: gbGame.name,
    description: gbGame.description || gbGame.deck || '',
    genres: gbGame.genres?.map(genre => genre.name) || [],
    platforms: gbGame.platforms?.map(platform => platform.name) || [],
    developers: gbGame.developers?.map(dev => dev.name) || [],
    publishers: gbGame.publishers?.map(pub => pub.name) || [],
    releaseDate: releaseDate,
    rating: null, // Giant Bomb'da rating yok
    ratingCount: 0,
    metacriticScore: null,
    metacriticCount: 0,
    cover: gbGame.image?.super_url || gbGame.image?.screen_large_url || gbGame.image?.medium_url || null,
    image: gbGame.image?.super_url || gbGame.image?.screen_large_url || gbGame.image?.medium_url || null,
    coverImage: gbGame.image?.super_url || gbGame.image?.screen_large_url || gbGame.image?.medium_url || null,
    screenshots: screenshots,
    videos: [], // Giant Bomb'da video API'si ayrı
    websites: {},
    themes: gbGame.themes?.map(theme => theme.name) || [],
    concepts: gbGame.concepts?.map(concept => concept.name) || [],
    franchises: gbGame.franchises?.map(franchise => franchise.name) || [],
    similarGames: gbGame.similar_games?.map(game => ({
      id: `giantbomb_${game.id}`,
      title: game.name,
      cover: game.image?.small_url || null
    })) || [],
    source: 'giantbomb',
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Giant Bomb API durumunu kontrol et
 * @returns {Promise<boolean>} API erişilebilir mi?
 */
export const checkGiantBombStatus = async () => {
  try {
    const apiKey = import.meta.env.VITE_GIANT_BOMB_API_KEY;
    
    if (!apiKey) {
      return false;
    }
    
    const params = new URLSearchParams({
      api_key: apiKey,
      format: 'json',
      limit: '1',
      resources: 'game'
    });
    
    const response = await fetch(`${GIANT_BOMB_BASE_URL}/search/?${params}`);
    return response.ok;
  } catch (error) {
    console.error('❌ Giant Bomb durum kontrolü hatası:', error);
    return false;
  }
};

/**
 * Rate limit bilgilerini getir
 * @returns {Object} Rate limit durumu
 */
export const getGiantBombRateLimit = () => {
  const now = Date.now();
  const timeUntilReset = RATE_LIMIT_WINDOW - (now - lastResetTime);
  
  return {
    requestCount,
    limit: RATE_LIMIT,
    remaining: Math.max(0, RATE_LIMIT - requestCount),
    resetTime: new Date(lastResetTime + RATE_LIMIT_WINDOW),
    timeUntilReset: Math.max(0, timeUntilReset)
  };
};

// Debug fonksiyonları
if (typeof window !== 'undefined') {
  window.giantBombApi = {
    search: searchGamesGiantBomb,
    getDetails: getGameDetailsGiantBomb,
    checkStatus: checkGiantBombStatus,
    getRateLimit: getGiantBombRateLimit
  };
}