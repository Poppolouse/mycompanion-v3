/**
 * HowLongToBeat Scraper
 * Oyun tamamlama sürelerini almak için web scraping
 * CORS proxy gerekebilir
 */

const HLTB_BASE_URL = 'https://howlongtobeat.com';
const HLTB_SEARCH_URL = `${HLTB_BASE_URL}/api/search`;

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 saniye

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
 * HowLongToBeat'te oyun arama
 * @param {string} gameName - Oyun adı
 * @returns {Promise<Array>} Bulunan oyunlar ve süreleri
 */
export const searchHowLongToBeat = async (gameName) => {
  try {
    await throttleRequest();
    
    // HowLongToBeat'in yeni API'si POST request kullanıyor
    const searchData = {
      searchType: "games",
      searchTerms: gameName.split(" "),
      searchPage: 1,
      size: 20,
      searchOptions: {
        games: {
          userId: 0,
          platform: "",
          sortCategory: "popular",
          rangeCategory: "main",
          rangeTime: {
            min: 0,
            max: 0
          },
          gameplay: {
            perspective: "",
            flow: "",
            genre: ""
          },
          modifier: ""
        },
        users: {
          sortCategory: "postcount"
        },
        filter: "",
        sort: 0,
        randomizer: 0
      }
    };
    
    const response = await fetch(HLTB_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VaultTracker/1.0',
        'Referer': 'https://howlongtobeat.com/'
      },
      body: JSON.stringify(searchData)
    });
    
    if (!response.ok) {
      throw new Error(`HowLongToBeat API hatası: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return [];
    }
    
    return data.data.map(normalizeHLTBGame);
  } catch (error) {
    console.error('❌ HowLongToBeat arama hatası:', error);
    
    // Fallback: Basit HTML scraping dene
    try {
      return await fallbackHLTBSearch(gameName);
    } catch (fallbackError) {
      console.error('❌ HowLongToBeat fallback hatası:', fallbackError);
      throw error;
    }
  }
};

/**
 * Fallback HTML scraping metodu
 * @param {string} gameName - Oyun adı
 * @returns {Promise<Array>} Bulunan oyunlar
 */
const fallbackHLTBSearch = async (gameName) => {
  try {
    await throttleRequest();
    
    // CORS proxy kullanarak HTML'i al
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const searchUrl = `${HLTB_BASE_URL}/?q=${encodeURIComponent(gameName)}`;
    
    const response = await fetch(`${proxyUrl}${encodeURIComponent(searchUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Proxy hatası: ${response.status}`);
    }
    
    const data = await response.json();
    const html = data.contents;
    
    // HTML'den oyun verilerini çıkar
    return parseHLTBHTML(html);
  } catch (error) {
    console.error('❌ HowLongToBeat HTML scraping hatası:', error);
    return [];
  }
};

/**
 * HTML'den oyun verilerini parse et
 * @param {string} html - HowLongToBeat HTML içeriği
 * @returns {Array} Parse edilmiş oyun verileri
 */
const parseHLTBHTML = (html) => {
  try {
    // DOM parser kullan
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const games = [];
    const gameElements = doc.querySelectorAll('.search_list_details');
    
    gameElements.forEach((element, index) => {
      try {
        const titleElement = element.querySelector('.search_list_details_block h3 a');
        const imageElement = element.querySelector('img');
        const timeElements = element.querySelectorAll('.search_list_tidbit');
        
        if (!titleElement) return;
        
        const title = titleElement.textContent.trim();
        const gameUrl = titleElement.getAttribute('href');
        const gameId = gameUrl ? gameUrl.split('/').pop() : `fallback_${index}`;
        const imageUrl = imageElement ? imageElement.getAttribute('src') : null;
        
        // Süre bilgilerini parse et
        const times = {};
        timeElements.forEach(timeElement => {
          const label = timeElement.querySelector('.search_list_tidbit_short')?.textContent.trim();
          const time = timeElement.querySelector('.search_list_tidbit_long')?.textContent.trim();
          
          if (label && time && time !== '--') {
            const hours = parseTimeToHours(time);
            if (hours > 0) {
              switch (label) {
                case 'Main':
                  times.main = hours;
                  break;
                case 'Main +':
                  times.mainExtra = hours;
                  break;
                case 'Comp':
                  times.completionist = hours;
                  break;
                case 'Co-Op':
                  times.coop = hours;
                  break;
                case 'Vs.':
                  times.versus = hours;
                  break;
              }
            }
          }
        });
        
        if (Object.keys(times).length > 0) {
          games.push({
            id: `hltb_${gameId}`,
            hltbId: gameId,
            title: title,
            imageUrl: imageUrl ? `${HLTB_BASE_URL}${imageUrl}` : null,
            gameUrl: gameUrl ? `${HLTB_BASE_URL}${gameUrl}` : null,
            times: times,
            source: 'hltb_fallback',
            lastUpdated: new Date().toISOString()
          });
        }
      } catch (parseError) {
        console.error('❌ Oyun parse hatası:', parseError);
      }
    });
    
    return games;
  } catch (error) {
    console.error('❌ HTML parse hatası:', error);
    return [];
  }
};

/**
 * Süre stringini saate çevir
 * @param {string} timeStr - Süre string'i (örn: "25½ Hours", "2 Mins")
 * @returns {number} Saat cinsinden süre
 */
const parseTimeToHours = (timeStr) => {
  if (!timeStr || timeStr === '--') return 0;
  
  // "25½ Hours" -> 25.5
  // "2 Mins" -> 0.033
  // "1 Hour 30 Mins" -> 1.5
  
  let hours = 0;
  
  // Saat bilgisini çıkar
  const hourMatch = timeStr.match(/(\d+(?:½|\.5)?)\s*(?:Hour|Hr)/i);
  if (hourMatch) {
    let hourValue = hourMatch[1];
    if (hourValue.includes('½')) {
      hourValue = hourValue.replace('½', '.5');
    }
    hours += parseFloat(hourValue);
  }
  
  // Dakika bilgisini çıkar
  const minMatch = timeStr.match(/(\d+)\s*(?:Min|Minute)/i);
  if (minMatch) {
    hours += parseInt(minMatch[1]) / 60;
  }
  
  // Sadece sayı varsa (varsayılan saat)
  if (!hourMatch && !minMatch) {
    const numMatch = timeStr.match(/(\d+(?:½|\.5)?)/);
    if (numMatch) {
      let value = numMatch[1];
      if (value.includes('½')) {
        value = value.replace('½', '.5');
      }
      hours = parseFloat(value);
    }
  }
  
  return Math.round(hours * 10) / 10; // 1 ondalık basamak
};

/**
 * HowLongToBeat verilerini standart formata dönüştür
 * @param {Object} hltbGame - HowLongToBeat'ten gelen oyun verisi
 * @returns {Object} Normalize edilmiş oyun verisi
 */
const normalizeHLTBGame = (hltbGame) => {
  const times = {};
  
  // API'den gelen süre verilerini dönüştür
  if (hltbGame.comp_main && hltbGame.comp_main > 0) {
    times.main = Math.round(hltbGame.comp_main / 3600 * 10) / 10; // saniyeden saate
  }
  if (hltbGame.comp_plus && hltbGame.comp_plus > 0) {
    times.mainExtra = Math.round(hltbGame.comp_plus / 3600 * 10) / 10;
  }
  if (hltbGame.comp_100 && hltbGame.comp_100 > 0) {
    times.completionist = Math.round(hltbGame.comp_100 / 3600 * 10) / 10;
  }
  if (hltbGame.comp_all && hltbGame.comp_all > 0) {
    times.all = Math.round(hltbGame.comp_all / 3600 * 10) / 10;
  }
  
  return {
    id: `hltb_${hltbGame.game_id}`,
    hltbId: hltbGame.game_id,
    title: hltbGame.game_name,
    imageUrl: hltbGame.game_image ? `${HLTB_BASE_URL}/games/${hltbGame.game_image}` : null,
    gameUrl: `${HLTB_BASE_URL}/game/${hltbGame.game_id}`,
    times: times,
    similarity: hltbGame.similarity || 0,
    searchTerm: hltbGame.search_term || '',
    source: 'hltb',
    lastUpdated: new Date().toISOString()
  };
};

/**
 * En iyi eşleşmeyi bul
 * @param {string} gameName - Aranacak oyun adı
 * @param {Array} results - Arama sonuçları
 * @returns {Object|null} En iyi eşleşme
 */
export const findBestMatch = (gameName, results) => {
  if (!results || results.length === 0) return null;
  
  const normalizedSearchName = gameName.toLowerCase().trim();
  
  // Tam eşleşme ara
  const exactMatch = results.find(game => 
    game.title.toLowerCase().trim() === normalizedSearchName
  );
  
  if (exactMatch) return exactMatch;
  
  // Benzerlik skoruna göre sırala
  const sortedResults = results.sort((a, b) => {
    const aScore = calculateSimilarity(normalizedSearchName, a.title.toLowerCase());
    const bScore = calculateSimilarity(normalizedSearchName, b.title.toLowerCase());
    return bScore - aScore;
  });
  
  return sortedResults[0];
};

/**
 * String benzerliği hesapla (basit)
 * @param {string} str1 - İlk string
 * @param {string} str2 - İkinci string
 * @returns {number} Benzerlik skoru (0-1)
 */
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

/**
 * Levenshtein distance hesapla
 * @param {string} str1 - İlk string
 * @param {string} str2 - İkinci string
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
 * HowLongToBeat durumunu kontrol et
 * @returns {Promise<boolean>} Site erişilebilir mi?
 */
export const checkHLTBStatus = async () => {
  try {
    const response = await fetch(HLTB_BASE_URL, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('❌ HowLongToBeat durum kontrolü hatası:', error);
    return false;
  }
};

// Debug fonksiyonları
if (typeof window !== 'undefined') {
  window.hltbScraper = {
    search: searchHowLongToBeat,
    findBestMatch: findBestMatch,
    checkStatus: checkHLTBStatus,
    parseTime: parseTimeToHours
  };
}