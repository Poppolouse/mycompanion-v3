/**
 * CheapShark API
 * Oyun fiyat karşılaştırması ve indirim takibi için
 * API key gerektirmiyor, ücretsiz
 */

const CHEAPSHARK_BASE_URL = 'https://www.cheapshark.com/api/1.0';

// Rate limiting (önerilen: saniyede 2 request)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 500; // 500ms = saniyede 2 request

const throttleRequest = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
};

/**
 * CheapShark'ta oyun arama
 * @param {string} title - Oyun adı
 * @param {number} limit - Sonuç limiti (varsayılan: 10)
 * @returns {Promise<Array>} Bulunan oyunlar ve fiyatları
 */
export const searchGamesCheapShark = async (title, limit = 10) => {
  try {
    await throttleRequest();
    
    const params = new URLSearchParams({
      title: title,
      limit: limit.toString(),
      exact: '0' // Fuzzy search
    });
    
    const response = await fetch(`${CHEAPSHARK_BASE_URL}/games?${params}`);
    
    if (!response.ok) {
      throw new Error(`CheapShark API hatası: ${response.status} - ${response.statusText}`);
    }
    
    const games = await response.json();
    return games.map(normalizeCheapSharkGame);
  } catch (error) {
    console.error('❌ CheapShark oyun arama hatası:', error);
    throw error;
  }
};

/**
 * Oyun için mevcut fiyatları getir
 * @param {string} gameId - CheapShark Game ID
 * @returns {Promise<Array>} Mağaza fiyatları
 */
export const getGameDeals = async (gameId) => {
  try {
    await throttleRequest();
    
    const params = new URLSearchParams({
      id: gameId
    });
    
    const response = await fetch(`${CHEAPSHARK_BASE_URL}/games?${params}`);
    
    if (!response.ok) {
      throw new Error(`CheapShark API hatası: ${response.status} - ${response.statusText}`);
    }
    
    const gameData = await response.json();
    
    if (!gameData.deals || gameData.deals.length === 0) {
      return [];
    }
    
    // Mağaza bilgilerini al
    const stores = await getStores();
    const storeMap = stores.reduce((map, store) => {
      map[store.storeID] = store;
      return map;
    }, {});
    
    return gameData.deals.map(deal => ({
      storeId: deal.storeID,
      storeName: storeMap[deal.storeID]?.storeName || 'Bilinmeyen Mağaza',
      storeImage: storeMap[deal.storeID]?.images?.logo || null,
      dealId: deal.dealID,
      price: parseFloat(deal.price),
      retailPrice: parseFloat(deal.retailPrice),
      savings: parseFloat(deal.savings),
      savingsFormatted: `${Math.round(parseFloat(deal.savings))}%`,
      isOnSale: parseFloat(deal.savings) > 0,
      dealUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
      lastUpdated: new Date().toISOString()
    }));
  } catch (error) {
    console.error('❌ CheapShark fiyat getirme hatası:', error);
    throw error;
  }
};

/**
 * En iyi indirimleri getir
 * @param {Object} options - Filtreleme seçenekleri
 * @returns {Promise<Array>} En iyi indirimler
 */
export const getBestDeals = async (options = {}) => {
  try {
    await throttleRequest();
    
    const params = new URLSearchParams({
      storeID: options.storeId || '', // Belirli mağaza
      pageNumber: (options.page || 0).toString(),
      pageSize: (options.limit || 20).toString(),
      sortBy: options.sortBy || 'Savings', // Deal Rating, Title, Savings, Price, Recent
      desc: options.desc !== false ? '1' : '0',
      lowerPrice: options.minPrice || '0',
      upperPrice: options.maxPrice || '50',
      metacritic: options.minMetacritic || '70',
      steamRating: options.minSteamRating || '0',
      steamAppID: options.steamAppId || '',
      title: options.title || '',
      exact: options.exact ? '1' : '0',
      AAA: options.aaa ? '1' : '0',
      steamworks: options.steamworks ? '1' : '0',
      onSale: options.onSale ? '1' : '0'
    });
    
    const response = await fetch(`${CHEAPSHARK_BASE_URL}/deals?${params}`);
    
    if (!response.ok) {
      throw new Error(`CheapShark API hatası: ${response.status} - ${response.statusText}`);
    }
    
    const deals = await response.json();
    
    // Mağaza bilgilerini al
    const stores = await getStores();
    const storeMap = stores.reduce((map, store) => {
      map[store.storeID] = store;
      return map;
    }, {});
    
    return deals.map(deal => ({
      gameId: deal.gameID,
      title: deal.title,
      storeId: deal.storeID,
      storeName: storeMap[deal.storeID]?.storeName || 'Bilinmeyen Mağaza',
      storeImage: storeMap[deal.storeID]?.images?.logo || null,
      dealId: deal.dealID,
      price: parseFloat(deal.salePrice),
      normalPrice: parseFloat(deal.normalPrice),
      savings: parseFloat(deal.savings),
      savingsFormatted: `${Math.round(parseFloat(deal.savings))}%`,
      isOnSale: parseFloat(deal.savings) > 0,
      dealRating: parseFloat(deal.dealRating),
      thumb: deal.thumb,
      steamAppId: deal.steamAppID || null,
      steamRatingText: deal.steamRatingText || null,
      steamRatingPercent: deal.steamRatingPercent ? parseInt(deal.steamRatingPercent) : null,
      steamRatingCount: deal.steamRatingCount ? parseInt(deal.steamRatingCount) : null,
      metacriticScore: deal.metacriticScore ? parseInt(deal.metacriticScore) : null,
      metacriticLink: deal.metacriticLink || null,
      releaseDate: deal.releaseDate ? new Date(deal.releaseDate * 1000) : null,
      dealUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
      lastChange: deal.lastChange ? new Date(deal.lastChange * 1000) : null,
      dealAdded: deal.dealAdded ? new Date(deal.dealAdded * 1000) : null
    }));
  } catch (error) {
    console.error('❌ CheapShark en iyi indirimler hatası:', error);
    throw error;
  }
};

/**
 * Mağaza listesini getir
 * @returns {Promise<Array>} Mağaza listesi
 */
export const getStores = async () => {
  try {
    await throttleRequest();
    
    const response = await fetch(`${CHEAPSHARK_BASE_URL}/stores`);
    
    if (!response.ok) {
      throw new Error(`CheapShark API hatası: ${response.status} - ${response.statusText}`);
    }
    
    const stores = await response.json();
    
    return stores.map(store => ({
      storeID: store.storeID,
      storeName: store.storeName,
      isActive: store.isActive === 1,
      images: {
        banner: store.images.banner,
        logo: store.images.logo,
        icon: store.images.icon
      }
    }));
  } catch (error) {
    console.error('❌ CheapShark mağaza listesi hatası:', error);
    throw error;
  }
};

/**
 * Fiyat geçmişini getir
 * @param {string} gameId - CheapShark Game ID
 * @returns {Promise<Array>} Fiyat geçmişi
 */
export const getPriceHistory = async (gameId) => {
  try {
    await throttleRequest();
    
    const params = new URLSearchParams({
      id: gameId
    });
    
    const response = await fetch(`${CHEAPSHARK_BASE_URL}/games?${params}`);
    
    if (!response.ok) {
      throw new Error(`CheapShark API hatası: ${response.status} - ${response.statusText}`);
    }
    
    const gameData = await response.json();
    
    if (!gameData.cheapestPriceEver) {
      return [];
    }
    
    return [{
      price: parseFloat(gameData.cheapestPriceEver.price),
      date: new Date(gameData.cheapestPriceEver.date * 1000),
      storeId: gameData.cheapestPriceEver.storeID
    }];
  } catch (error) {
    console.error('❌ CheapShark fiyat geçmişi hatası:', error);
    throw error;
  }
};

/**
 * CheapShark verilerini standart formata dönüştür
 * @param {Object} csGame - CheapShark'tan gelen oyun verisi
 * @returns {Object} Normalize edilmiş oyun verisi
 */
const normalizeCheapSharkGame = (csGame) => {
  return {
    id: `cheapshark_${csGame.gameID}`,
    cheapSharkId: csGame.gameID,
    title: csGame.external,
    steamAppId: csGame.steamAppID || null,
    cheapest: csGame.cheapest ? parseFloat(csGame.cheapest) : null,
    thumb: csGame.thumb || null,
    source: 'cheapshark',
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Steam App ID'den CheapShark Game ID'si bul
 * @param {string} steamAppId - Steam App ID
 * @returns {Promise<string|null>} CheapShark Game ID
 */
export const findGameBySteamId = async (steamAppId) => {
  try {
    await throttleRequest();
    
    const params = new URLSearchParams({
      steamAppID: steamAppId
    });
    
    const response = await fetch(`${CHEAPSHARK_BASE_URL}/games?${params}`);
    
    if (!response.ok) {
      throw new Error(`CheapShark API hatası: ${response.status} - ${response.statusText}`);
    }
    
    const games = await response.json();
    
    if (games.length > 0) {
      return games[0].gameID;
    }
    
    return null;
  } catch (error) {
    console.error('❌ CheapShark Steam ID arama hatası:', error);
    return null;
  }
};

/**
 * CheapShark API durumunu kontrol et
 * @returns {Promise<boolean>} API erişilebilir mi?
 */
export const checkCheapSharkStatus = async () => {
  try {
    const response = await fetch(`${CHEAPSHARK_BASE_URL}/stores`);
    return response.ok;
  } catch (error) {
    console.error('❌ CheapShark durum kontrolü hatası:', error);
    return false;
  }
};

// Debug fonksiyonları
if (typeof window !== 'undefined') {
  window.cheapSharkApi = {
    search: searchGamesCheapShark,
    getDeals: getGameDeals,
    getBestDeals: getBestDeals,
    getStores: getStores,
    getPriceHistory: getPriceHistory,
    findBySteamId: findGameBySteamId,
    checkStatus: checkCheapSharkStatus
  };
}