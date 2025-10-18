/**
 * 🎮 GAME DATABASE API - RAWG API ENTEGRASYONU
 * 
 * RAWG API: https://rawg.io/apidocs
 * Ücretsiz oyun database API'si - 20,000 request/month limit
 */

const RAWG_API_BASE = 'https://api.rawg.io/api';
const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY || '2bf2ce37dafb4fbea8fc82e308badac7';

/**
 * Arama sonuçları için relevance score hesapla
 * @param {Object} game - Oyun objesi
 * @param {string} searchTerm - Arama terimi
 * @returns {number} Relevance score (0-100)
 */
const calculateRelevanceScore = (game, searchTerm) => {
  let score = 0;
  const searchLower = searchTerm.toLowerCase();
  const gameName = game.name?.toLowerCase() || '';
  
  // Exact match (en yüksek puan)
  if (gameName === searchLower) {
    score += 100;
  }
  // Başlangıç match
  else if (gameName.startsWith(searchLower)) {
    score += 80;
  }
  // İçerik match
  else if (gameName.includes(searchLower)) {
    score += 60;
  }
  
  // Kelime kelime match
  const searchWords = searchLower.split(' ').filter(w => w.length > 0);
  const gameWords = gameName.split(' ').filter(w => w.length > 0);
  
  searchWords.forEach(searchWord => {
    gameWords.forEach(gameWord => {
      if (gameWord === searchWord) {
        score += 20;
      } else if (gameWord.includes(searchWord)) {
        score += 10;
      }
    });
  });
  
  // Rating bonus (popüler oyunlara hafif bonus)
  if (game.rating > 4.0) {
    score += 5;
  }
  
  // Metacritic bonus
  if (game.metacritic > 80) {
    score += 3;
  }
  
  return Math.min(score, 100);
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

    // Arama terimini temizle ve optimize et
    const cleanSearchTerm = searchTerm.trim()
      .replace(/[^\w\s-:]/g, '') // Özel karakterleri temizle
      .replace(/\s+/g, ' '); // Çoklu boşlukları tek boşluk yap
    
    // Çoklu arama stratejisi - hem exact hem fuzzy search
    const searches = [];
    
    // 1. Exact match (en yüksek öncelik)
    const exactUrl = `${RAWG_API_BASE}/games?key=${RAWG_API_KEY}&search_precise=true&search=${encodeURIComponent(cleanSearchTerm)}&page_size=${Math.min(limit, 5)}&ordering=-relevance`;
    searches.push(fetch(exactUrl));
    
    // 2. Fuzzy search (ikinci öncelik)
    const fuzzyUrl = `${RAWG_API_BASE}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(cleanSearchTerm)}&page_size=${limit}&ordering=-relevance,-rating`;
    searches.push(fetch(fuzzyUrl));
    
    console.log('🌐 API URLs:', {
      exact: exactUrl.replace(RAWG_API_KEY, 'API_KEY_HIDDEN'),
      fuzzy: fuzzyUrl.replace(RAWG_API_KEY, 'API_KEY_HIDDEN')
    });
    
    const responses = await Promise.allSettled(searches);
    console.log('📡 API Response Status:', responses.map(r => r.status));
    
    let allResults = [];
    
    // Exact match sonuçlarını işle
    if (responses[0].status === 'fulfilled' && responses[0].value.ok) {
      const exactData = await responses[0].value.json();
      console.log('🎯 Exact Match Results:', exactData.results?.length || 0);
      if (exactData.results) {
        allResults = exactData.results.map(game => ({ ...game, _searchType: 'exact' }));
      }
    }
    
    // Fuzzy search sonuçlarını işle
    if (responses[1].status === 'fulfilled' && responses[1].value.ok) {
      const fuzzyData = await responses[1].value.json();
      console.log('🔍 Fuzzy Search Results:', fuzzyData.results?.length || 0);
      if (fuzzyData.results) {
        // Exact match'te olmayan sonuçları ekle
        const exactIds = new Set(allResults.map(g => g.id));
        const newResults = fuzzyData.results
          .filter(game => !exactIds.has(game.id))
          .map(game => ({ ...game, _searchType: 'fuzzy' }));
        allResults = [...allResults, ...newResults];
      }
    }
    
    // Sonuçları sınırla
    allResults = allResults.slice(0, limit);
    console.log('📦 Combined Results:', allResults.length);
    
    // RAWG API response'unu normalize et
    const normalizedResults = allResults?.map(game => ({
      id: game.id,
      title: game.name,
      name: game.name, // Alternatif isim
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
      // Ek bilgiler
      rawg_id: game.id,
      rawg_slug: game.slug,
      rawg_url: `https://rawg.io/games/${game.slug}`,
      // Arama tipi bilgisi (debugging için)
      _searchType: game._searchType,
      // Relevance score hesapla
      _relevanceScore: calculateRelevanceScore(game, cleanSearchTerm)
    })) || [];
    
    // Relevance score'a göre sırala (yüksekten düşüğe)
    const sortedResults = normalizedResults.sort((a, b) => {
      // Önce search type'a göre (exact > fuzzy)
      if (a._searchType !== b._searchType) {
        return a._searchType === 'exact' ? -1 : 1;
      }
      // Sonra relevance score'a göre
      if (a._relevanceScore !== b._relevanceScore) {
        return b._relevanceScore - a._relevanceScore;
      }
      // Son olarak rating'e göre
      return b.rating - a.rating;
    });
    
    console.log('🎯 Sorted Results:', sortedResults.map(r => ({
      name: r.name,
      searchType: r._searchType,
      relevanceScore: r._relevanceScore,
      rating: r.rating
    })));
    
    return sortedResults;
    
  } catch (error) {
    console.error('🚨 Game search API error:', error);
    throw error;
  }
};

/**
 * Oyun detaylarını getir
 * @param {number} gameId - RAWG game ID
 * @returns {Promise<Object>} Detaylı oyun bilgisi
 */
export const getGameDetails = async (gameId) => {
  try {
    const url = `${RAWG_API_BASE}/games/${gameId}?key=${RAWG_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
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
      rawg_url: `https://rawg.io/games/${game.slug}`
    };
    
  } catch (error) {
    console.error('🚨 Game details API error:', error);
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
 * API durumunu kontrol et
 * @returns {Promise<boolean>} API erişilebilir mi?
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${RAWG_API_BASE}/games?key=${RAWG_API_KEY}&page_size=1`);
    return response.ok;
  } catch (error) {
    console.error('🚨 API health check failed:', error);
    return false;
  }
};

// Export default object
export default {
  searchGames,
  getGameDetails,
  checkApiHealth,
  debounce
};