/**
 * Metacritic Scraper
 * Oyun puanları ve eleştiri verilerini almak için web scraping
 * CORS proxy gerekebilir
 */

const METACRITIC_BASE_URL = 'https://www.metacritic.com';
const METACRITIC_SEARCH_URL = `${METACRITIC_BASE_URL}/search/game`;

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 saniye (Metacritic daha katı)

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
 * Metacritic'te oyun arama
 * @param {string} gameName - Oyun adı
 * @param {string} platform - Platform (pc, ps5, xbox-series-x, switch, vb.)
 * @returns {Promise<Array>} Bulunan oyunlar ve puanları
 */
export const searchMetacritic = async (gameName, platform = 'pc') => {
  try {
    await throttleRequest();
    
    // CORS proxy kullanarak arama yap
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const searchUrl = `${METACRITIC_SEARCH_URL}/${encodeURIComponent(gameName)}/results`;
    
    const response = await fetch(`${proxyUrl}${encodeURIComponent(searchUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Proxy hatası: ${response.status}`);
    }
    
    const data = await response.json();
    const html = data.contents;
    
    // HTML'den oyun verilerini çıkar
    const games = parseMetacriticSearchHTML(html);
    
    // Platform filtrelemesi yap
    const filteredGames = games.filter(game => 
      !platform || game.platform.toLowerCase().includes(platform.toLowerCase())
    );
    
    return filteredGames;
  } catch (error) {
    console.error('❌ Metacritic arama hatası:', error);
    
    // Fallback: Direkt URL deneme
    try {
      return await fallbackMetacriticSearch(gameName, platform);
    } catch (fallbackError) {
      console.error('❌ Metacritic fallback hatası:', fallbackError);
      return [];
    }
  }
};

/**
 * Fallback arama metodu
 * @param {string} gameName - Oyun adı
 * @param {string} platform - Platform
 * @returns {Promise<Array>} Bulunan oyunlar
 */
const fallbackMetacriticSearch = async (gameName, platform) => {
  try {
    await throttleRequest();
    
    // Oyun adını URL-friendly hale getir
    const gameSlug = gameName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    
    // Direkt oyun sayfasını dene
    const gameUrl = `${METACRITIC_BASE_URL}/game/${platform}/${gameSlug}`;
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    
    const response = await fetch(`${proxyUrl}${encodeURIComponent(gameUrl)}`);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const html = data.contents;
    
    // Oyun sayfasından veri çıkar
    const gameData = parseMetacriticGameHTML(html, gameUrl);
    
    return gameData ? [gameData] : [];
  } catch (error) {
    console.error('❌ Metacritic fallback hatası:', error);
    return [];
  }
};

/**
 * Metacritic arama HTML'ini parse et
 * @param {string} html - HTML içeriği
 * @returns {Array} Parse edilmiş oyun verileri
 */
const parseMetacriticSearchHTML = (html) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const games = [];
    const gameElements = doc.querySelectorAll('.result_wrap');
    
    gameElements.forEach((element, index) => {
      try {
        const titleElement = element.querySelector('.product_title a');
        const scoreElement = element.querySelector('.metascore_w');
        const platformElement = element.querySelector('.platform');
        const dateElement = element.querySelector('.release_date');
        const summaryElement = element.querySelector('.product_summary');
        
        if (!titleElement) return;
        
        const title = titleElement.textContent.trim();
        const gameUrl = titleElement.getAttribute('href');
        const score = scoreElement ? parseInt(scoreElement.textContent.trim()) : null;
        const platform = platformElement ? platformElement.textContent.trim() : '';
        const releaseDate = dateElement ? dateElement.textContent.trim() : '';
        const summary = summaryElement ? summaryElement.textContent.trim() : '';
        
        games.push({
          id: `metacritic_${index}_${Date.now()}`,
          title: title,
          gameUrl: gameUrl ? `${METACRITIC_BASE_URL}${gameUrl}` : null,
          metacriticScore: score,
          platform: platform,
          releaseDate: releaseDate,
          summary: summary,
          source: 'metacritic_search',
          lastUpdated: new Date().toISOString()
        });
      } catch (parseError) {
        console.error('❌ Metacritic oyun parse hatası:', parseError);
      }
    });
    
    return games;
  } catch (error) {
    console.error('❌ Metacritic HTML parse hatası:', error);
    return [];
  }
};

/**
 * Metacritic oyun sayfası HTML'ini parse et
 * @param {string} html - HTML içeriği
 * @param {string} gameUrl - Oyun URL'i
 * @returns {Object|null} Parse edilmiş oyun verisi
 */
const parseMetacriticGameHTML = (html, gameUrl) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Başlık
    const titleElement = doc.querySelector('.product_title h1') || 
                        doc.querySelector('h1.product_title') ||
                        doc.querySelector('.c-productHero_title');
    
    if (!titleElement) return null;
    
    const title = titleElement.textContent.trim();
    
    // Metacritic skoru
    const scoreElement = doc.querySelector('.metascore_w.large') ||
                        doc.querySelector('.c-siteReviewScore_background-critic_large') ||
                        doc.querySelector('[data-v-4cdca868]');
    
    const metacriticScore = scoreElement ? 
      parseInt(scoreElement.textContent.trim()) : null;
    
    // Kullanıcı skoru
    const userScoreElement = doc.querySelector('.metascore_w.user') ||
                            doc.querySelector('.c-siteReviewScore_background-user');
    
    const userScore = userScoreElement ? 
      parseFloat(userScoreElement.textContent.trim()) : null;
    
    // Platform
    const platformElement = doc.querySelector('.platform') ||
                           doc.querySelector('.c-gameDetails_Platforms');
    
    const platform = platformElement ? platformElement.textContent.trim() : '';
    
    // Çıkış tarihi
    const releaseDateElement = doc.querySelector('.release_data .data') ||
                              doc.querySelector('.c-gameDetails_ReleaseDate');
    
    const releaseDate = releaseDateElement ? 
      releaseDateElement.textContent.trim() : '';
    
    // Geliştirici
    const developerElement = doc.querySelector('.developer .data') ||
                            doc.querySelector('.c-gameDetails_Developer');
    
    const developer = developerElement ? 
      developerElement.textContent.trim() : '';
    
    // Özet
    const summaryElement = doc.querySelector('.product_summary .data') ||
                          doc.querySelector('.c-productionDetailsGame_description');
    
    const summary = summaryElement ? summaryElement.textContent.trim() : '';
    
    // Eleştiri sayısı
    const criticCountElement = doc.querySelector('.count a') ||
                              doc.querySelector('.c-siteReviewScore_reviewsTotal');
    
    const criticCount = criticCountElement ? 
      parseInt(criticCountElement.textContent.match(/\d+/)?.[0] || '0') : 0;
    
    // Kullanıcı eleştiri sayısı
    const userCountElement = doc.querySelector('.user_reviews .count a') ||
                            doc.querySelector('.c-siteReviewScore_userReviewsTotal');
    
    const userCount = userCountElement ? 
      parseInt(userCountElement.textContent.match(/\d+/)?.[0] || '0') : 0;
    
    // Tür bilgileri
    const genreElements = doc.querySelectorAll('.genre .data span') ||
                         doc.querySelectorAll('.c-gameDetails_Genre span');
    
    const genres = Array.from(genreElements).map(el => el.textContent.trim());
    
    // ESRB rating
    const esrbElement = doc.querySelector('.esrb .data') ||
                       doc.querySelector('.c-gameDetails_Esrb');
    
    const esrbRating = esrbElement ? esrbElement.textContent.trim() : '';
    
    return {
      id: `metacritic_${gameUrl.split('/').pop()}`,
      title: title,
      gameUrl: gameUrl,
      metacriticScore: metacriticScore,
      userScore: userScore,
      platform: platform,
      releaseDate: releaseDate,
      developer: developer,
      summary: summary,
      criticCount: criticCount,
      userCount: userCount,
      genres: genres,
      esrbRating: esrbRating,
      source: 'metacritic_detail',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Metacritic oyun sayfası parse hatası:', error);
    return null;
  }
};

/**
 * Oyun için detaylı Metacritic verisi al
 * @param {string} gameName - Oyun adı
 * @param {string} platform - Platform
 * @returns {Promise<Object|null>} Detaylı oyun verisi
 */
export const getMetacriticDetails = async (gameName, platform = 'pc') => {
  try {
    const searchResults = await searchMetacritic(gameName, platform);
    
    if (searchResults.length === 0) {
      return null;
    }
    
    // En iyi eşleşmeyi bul
    const bestMatch = findBestMetacriticMatch(gameName, searchResults);
    
    if (!bestMatch || !bestMatch.gameUrl) {
      return bestMatch;
    }
    
    // Detaylı sayfa verilerini al
    await throttleRequest();
    
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const response = await fetch(`${proxyUrl}${encodeURIComponent(bestMatch.gameUrl)}`);
    
    if (!response.ok) {
      return bestMatch; // Arama sonucunu döndür
    }
    
    const data = await response.json();
    const html = data.contents;
    
    const detailedData = parseMetacriticGameHTML(html, bestMatch.gameUrl);
    
    return detailedData || bestMatch;
  } catch (error) {
    console.error('❌ Metacritic detay alma hatası:', error);
    return null;
  }
};

/**
 * En iyi Metacritic eşleşmesini bul
 * @param {string} gameName - Aranacak oyun adı
 * @param {Array} results - Arama sonuçları
 * @returns {Object|null} En iyi eşleşme
 */
export const findBestMetacriticMatch = (gameName, results) => {
  if (!results || results.length === 0) return null;
  
  const normalizedSearchName = gameName.toLowerCase().trim();
  
  // Tam eşleşme ara
  const exactMatch = results.find(game => 
    game.title.toLowerCase().trim() === normalizedSearchName
  );
  
  if (exactMatch) return exactMatch;
  
  // En yüksek skorlu oyunu bul (eğer skorlar varsa)
  const gamesWithScores = results.filter(game => game.metacriticScore);
  
  if (gamesWithScores.length > 0) {
    return gamesWithScores.sort((a, b) => b.metacriticScore - a.metacriticScore)[0];
  }
  
  // İlk sonucu döndür
  return results[0];
};

/**
 * Platform adını Metacritic formatına dönüştür
 * @param {string} platform - Platform adı
 * @returns {string} Metacritic platform adı
 */
export const normalizeMetacriticPlatform = (platform) => {
  const platformMap = {
    'windows': 'pc',
    'pc': 'pc',
    'playstation 5': 'ps5',
    'ps5': 'ps5',
    'playstation 4': 'ps4',
    'ps4': 'ps4',
    'xbox series x/s': 'xbox-series-x',
    'xbox series x': 'xbox-series-x',
    'xbox one': 'xbox-one',
    'nintendo switch': 'switch',
    'switch': 'switch',
    'ios': 'ios',
    'android': 'android',
    'mac': 'pc' // Metacritic'te Mac genelde PC ile birlikte
  };
  
  const normalized = platform.toLowerCase().trim();
  return platformMap[normalized] || 'pc';
};

/**
 * Metacritic durumunu kontrol et
 * @returns {Promise<boolean>} Site erişilebilir mi?
 */
export const checkMetacriticStatus = async () => {
  try {
    const response = await fetch(METACRITIC_BASE_URL, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('❌ Metacritic durum kontrolü hatası:', error);
    return false;
  }
};

/**
 * Metacritic puanını renk koduna dönüştür
 * @param {number} score - Metacritic puanı (0-100)
 * @returns {string} Renk kodu
 */
export const getMetacriticScoreColor = (score) => {
  if (score >= 75) return '#6c3'; // Yeşil
  if (score >= 50) return '#fc3'; // Sarı
  return '#f00'; // Kırmızı
};

/**
 * Metacritic puanını kategori olarak döndür
 * @param {number} score - Metacritic puanı (0-100)
 * @returns {string} Kategori
 */
export const getMetacriticScoreCategory = (score) => {
  if (score >= 75) return 'Universal Acclaim';
  if (score >= 50) return 'Mixed or Average Reviews';
  return 'Generally Unfavorable Reviews';
};

// Debug fonksiyonları
if (typeof window !== 'undefined') {
  window.metacriticScraper = {
    search: searchMetacritic,
    getDetails: getMetacriticDetails,
    findBestMatch: findBestMetacriticMatch,
    normalizePlatform: normalizeMetacriticPlatform,
    checkStatus: checkMetacriticStatus,
    getScoreColor: getMetacriticScoreColor,
    getScoreCategory: getMetacriticScoreCategory
  };
}