/**
 * Steam Web API
 * Steam oyun verileri, kullanıcı bilgileri ve market fiyatları için
 * Steam API key gerekli (ücretsiz)
 */

// Development'ta proxy kullan, production'da direkt API
const STEAM_BASE_URL = import.meta.env.DEV ? '/api/steam' : 'https://api.steampowered.com';
const STEAM_STORE_URL = import.meta.env.DEV ? '/api/steamstore' : 'https://store.steampowered.com/api';

// Rate limiting: 100 requests per minute
let requestCount = 0;
let lastResetTime = Date.now();
const RATE_LIMIT = 100;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 dakika

const checkRateLimit = () => {
  const now = Date.now();
  if (now - lastResetTime > RATE_LIMIT_WINDOW) {
    requestCount = 0;
    lastResetTime = now;
  }
  
  if (requestCount >= RATE_LIMIT) {
    throw new Error('Steam API rate limit aşıldı. 1 dakika bekleyin.');
  }
  
  requestCount++;
};

const getSteamApiKey = () => {
  const apiKey = import.meta.env.VITE_STEAM_API_KEY;
  
  if (!apiKey) {
    throw new Error('Steam API key eksik. .env dosyasında VITE_STEAM_API_KEY tanımlanmalı.');
  }
  
  return apiKey;
};

/**
 * Steam'de oyun arama (Steam Store API kullanarak)
 * @param {string} query - Arama terimi
 * @param {number} limit - Sonuç limiti (varsayılan: 10)
 * @returns {Promise<Array>} Bulunan oyunlar
 */
export const searchGamesSteam = async (query, limit = 10) => {
  try {
    checkRateLimit();
    
    // Steam'de direkt arama API'si yok, app listesini alıp filtreliyoruz
    const response = await fetch(`${STEAM_BASE_URL}/ISteamApps/GetAppList/v2/`);
    
    if (!response.ok) {
      throw new Error(`Steam API hatası: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    const apps = data.applist.apps;
    
    // Arama terimini içeren oyunları filtrele
    const filteredApps = apps
      .filter(app => app.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
    
    // Her oyun için detay bilgilerini al
    const gameDetails = await Promise.allSettled(
      filteredApps.map(app => getSteamGameDetails(app.appid))
    );
    
    return gameDetails
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value)
      .slice(0, limit);
  } catch (error) {
    console.error('❌ Steam oyun arama hatası:', error);
    throw error;
  }
};

/**
 * Steam'den oyun detayı getir
 * @param {number} appId - Steam App ID
 * @returns {Promise<Object>} Oyun detayları
 */
export const getSteamGameDetails = async (appId) => {
  try {
    checkRateLimit();
    
    const response = await fetch(`${STEAM_STORE_URL}/appdetails?appids=${appId}&l=english`);
    
    if (!response.ok) {
      throw new Error(`Steam Store API hatası: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    const gameData = data[appId];
    
    if (!gameData || !gameData.success || !gameData.data) {
      return null;
    }
    
    return normalizeSteamGame(gameData.data);
  } catch (error) {
    console.error(`❌ Steam oyun detay hatası (${appId}):`, error);
    return null;
  }
};

/**
 * Steam kullanıcısının oyun kütüphanesini getir
 * @param {string} steamId - Steam ID (64-bit)
 * @returns {Promise<Array>} Kullanıcının oyunları
 */
export const getSteamUserGames = async (steamId) => {
  try {
    checkRateLimit();
    
    const apiKey = getSteamApiKey();
    
    const response = await fetch(
      `${STEAM_BASE_URL}/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`
    );
    
    if (!response.ok) {
      throw new Error(`Steam API hatası: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.response || !data.response.games) {
      return [];
    }
    
    return data.response.games.map(game => ({
      appId: game.appid,
      title: game.name,
      playtimeForever: game.playtime_forever, // dakika cinsinden
      playtime2Weeks: game.playtime_2weeks || 0,
      iconUrl: game.img_icon_url ? 
        `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg` : null,
      logoUrl: game.img_logo_url ? 
        `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_logo_url}.jpg` : null,
      lastPlayed: game.rtime_last_played ? new Date(game.rtime_last_played * 1000) : null,
      source: 'steam'
    }));
  } catch (error) {
    console.error('❌ Steam kullanıcı oyunları hatası:', error);
    throw error;
  }
};

/**
 * Steam kullanıcı profilini getir
 * @param {string} steamId - Steam ID (64-bit)
 * @returns {Promise<Object>} Kullanıcı profili
 */
export const getSteamUserProfile = async (steamId) => {
  try {
    checkRateLimit();
    
    const apiKey = getSteamApiKey();
    
    const response = await fetch(
      `${STEAM_BASE_URL}/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`
    );
    
    if (!response.ok) {
      throw new Error(`Steam API hatası: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.response || !data.response.players || data.response.players.length === 0) {
      throw new Error('Steam kullanıcısı bulunamadı');
    }
    
    const player = data.response.players[0];
    
    return {
      steamId: player.steamid,
      username: player.personaname,
      profileUrl: player.profileurl,
      avatar: player.avatarfull,
      realName: player.realname || null,
      countryCode: player.loccountrycode || null,
      stateCode: player.locstatecode || null,
      cityId: player.loccityid || null,
      personaState: player.personastate, // 0=Offline, 1=Online, 2=Busy, 3=Away, 4=Snooze, 5=Looking to trade, 6=Looking to play
      communityVisibilityState: player.communityvisibilitystate, // 1=Private, 3=Public
      profileState: player.profilestate, // 1=Configured
      lastLogoff: player.lastlogoff ? new Date(player.lastlogoff * 1000) : null,
      commentPermission: player.commentpermission || null,
      timeCreated: player.timecreated ? new Date(player.timecreated * 1000) : null
    };
  } catch (error) {
    console.error('❌ Steam kullanıcı profil hatası:', error);
    throw error;
  }
};

/**
 * Steam verilerini standart formata dönüştür
 * @param {Object} steamGame - Steam'den gelen oyun verisi
 * @returns {Object} Normalize edilmiş oyun verisi
 */
const normalizeSteamGame = (steamGame) => {
  // Fiyat bilgilerini düzenle
  const price = steamGame.price_overview ? {
    currency: steamGame.price_overview.currency,
    initial: steamGame.price_overview.initial / 100,
    final: steamGame.price_overview.final / 100,
    discountPercent: steamGame.price_overview.discount_percent,
    initialFormatted: steamGame.price_overview.initial_formatted,
    finalFormatted: steamGame.price_overview.final_formatted
  } : null;
  
  // Platform bilgilerini düzenle
  const platforms = [];
  if (steamGame.platforms) {
    if (steamGame.platforms.windows) platforms.push('Windows');
    if (steamGame.platforms.mac) platforms.push('Mac');
    if (steamGame.platforms.linux) platforms.push('Linux');
  }
  
  // Screenshot'ları düzenle
  const screenshots = steamGame.screenshots?.map(screenshot => screenshot.path_full) || [];
  
  // Video'ları düzenle
  const videos = steamGame.movies?.map(movie => ({
    type: 'mp4',
    id: movie.id,
    name: movie.name,
    thumbnail: movie.thumbnail,
    url: movie.mp4?.max || movie.mp4?.['480'] || movie.webm?.max || movie.webm?.['480']
  })) || [];
  
  return {
    id: `steam_${steamGame.steam_appid}`,
    steamAppId: steamGame.steam_appid,
    title: steamGame.name,
    description: steamGame.detailed_description || steamGame.short_description || '',
    genres: steamGame.genres?.map(genre => genre.description) || [],
    platforms: platforms,
    developers: steamGame.developers || [],
    publishers: steamGame.publishers || [],
    releaseDate: steamGame.release_date?.date || null,
    rating: null, // Steam'de rating yok
    ratingCount: 0,
    metacriticScore: steamGame.metacritic?.score || null,
    metacriticUrl: steamGame.metacritic?.url || null,
    cover: steamGame.header_image,
    image: steamGame.header_image,
    coverImage: steamGame.header_image,
    screenshots: screenshots,
    videos: videos,
    websites: {
      steam: `https://store.steampowered.com/app/${steamGame.steam_appid}/`
    },
    price: price,
    isFree: steamGame.is_free || false,
    dlc: steamGame.dlc || [],
    achievements: steamGame.achievements ? {
      total: steamGame.achievements.total,
      highlighted: steamGame.achievements.highlighted
    } : null,
    categories: steamGame.categories?.map(cat => cat.description) || [],
    languages: steamGame.supported_languages || '',
    requirements: {
      windows: steamGame.pc_requirements || null,
      mac: steamGame.mac_requirements || null,
      linux: steamGame.linux_requirements || null
    },
    legalNotice: steamGame.legal_notice || null,
    contentDescriptors: steamGame.content_descriptors || null,
    source: 'steam',
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Steam ID'yi farklı formatlar arasında dönüştür
 * @param {string} steamId - Steam ID (herhangi bir format)
 * @returns {Object} Farklı formatlarda Steam ID'ler
 */
export const convertSteamId = async (steamId) => {
  try {
    checkRateLimit();
    
    const apiKey = getSteamApiKey();
    
    const response = await fetch(
      `${STEAM_BASE_URL}/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${steamId}`
    );
    
    if (!response.ok) {
      throw new Error(`Steam API hatası: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.response.success === 1) {
      return {
        steamId64: data.response.steamid,
        customUrl: steamId
      };
    } else {
      // Zaten 64-bit ID olabilir
      return {
        steamId64: steamId,
        customUrl: null
      };
    }
  } catch (error) {
    console.error('❌ Steam ID dönüştürme hatası:', error);
    throw error;
  }
};

/**
 * Steam API durumunu kontrol et
 * @returns {Promise<boolean>} API erişilebilir mi?
 */
export const checkSteamStatus = async () => {
  try {
    const response = await fetch(`${STEAM_BASE_URL}/ISteamApps/GetAppList/v2/`);
    return response.ok;
  } catch (error) {
    console.error('❌ Steam durum kontrolü hatası:', error);
    return false;
  }
};

/**
 * Rate limit bilgilerini getir
 * @returns {Object} Rate limit durumu
 */
export const getSteamRateLimit = () => {
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
  window.steamApi = {
    search: searchGamesSteam,
    getDetails: getSteamGameDetails,
    getUserGames: getSteamUserGames,
    getUserProfile: getSteamUserProfile,
    convertId: convertSteamId,
    checkStatus: checkSteamStatus,
    getRateLimit: getSteamRateLimit
  };
}