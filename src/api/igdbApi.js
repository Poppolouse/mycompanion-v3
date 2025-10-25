/**
 * IGDB (Internet Game Database) API
 * Backup API olarak RAWG'den sonra kullanılacak
 * Twitch Developer hesabı gerekli
 */

// Development'ta proxy kullan, production'da direkt API
const IGDB_BASE_URL = import.meta.env.DEV ? '/api/igdb' : 'https://api.igdb.com/v4';

/**
 * IGDB API headers'ını oluştur
 * @returns {Object|null} Headers objesi veya null (credentials yoksa)
 */
const getIGDBHeaders = () => {
  const clientId = import.meta.env.VITE_IGDB_CLIENT_ID;
  const accessToken = import.meta.env.VITE_IGDB_ACCESS_TOKEN;
  
  if (!clientId || !accessToken) {
    console.warn('⚠️ IGDB API credentials eksik. VITE_IGDB_CLIENT_ID ve VITE_IGDB_ACCESS_TOKEN tanımlanmalı.');
    return null;
  }
  
  return {
    'Client-ID': clientId,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'text/plain',
    'Accept': 'application/json'
  };
};

/**
 * IGDB'de oyun ara
 * @param {string} query - Arama terimi
 * @param {number} limit - Maksimum sonuç sayısı
 * @returns {Promise<Array|null>} Oyun listesi veya null (credentials yoksa)
 */
export const searchGamesIGDB = async (query, limit = 10) => {
  console.log('🚀 IGDB searchGamesIGDB çağrıldı:', { query, limit });
  
  const headers = getIGDBHeaders();
  if (!headers) {
    console.warn('🚫 IGDB API credentials eksik, arama atlanıyor');
    return [];
  }

  try {
    const requestBody = `
      search "${query}";
      fields name, summary, storyline, genres.name, platforms.name, 
             involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
             first_release_date, rating, rating_count, aggregated_rating, aggregated_rating_count,
             cover.url, screenshots.url, videos.video_id, websites.category, websites.url,
             game_modes.name, themes.name, player_perspectives.name, age_ratings.rating,
             similar_games.name, similar_games.cover.url;
      limit ${limit};
    `.trim();

    const url = `${IGDB_BASE_URL}/games`;

    console.log('🔍 IGDB API Request:', {
      url: url,
      headers: {
        'Content-Type': 'text/plain',
        'Client-ID': headers['Client-ID']?.substring(0, 8) + '...',
        'Authorization': 'Bearer ' + headers['Authorization']?.substring(7, 15) + '...'
      },
      body: requestBody
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: requestBody
    });

    console.log('📡 IGDB API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('IGDB API hatası:', response.status, response.statusText, errorText);
      throw new Error(`IGDB API hatası: ${response.status} ${response.statusText}`);
    }

    const games = await response.json();
    const normalizedGames = games.map(normalizeIGDBGame);

    return normalizedGames;
  } catch (error) {
    console.error('❌ IGDB API hatası:', error);
    return [];
  }
};

/**
 * IGDB'den oyun detaylarını al
 * @param {number} gameId - IGDB oyun ID'si
 * @returns {Promise<Object|null>} Oyun detayları veya null (credentials yoksa)
 */
export const getGameDetailsIGDB = async (gameId) => {
  try {
    const headers = getIGDBHeaders();
    
    // Credentials yoksa null döndür
    if (!headers) {
      console.warn('⚠️ IGDB API credentials eksik, detay alınamıyor');
      return null;
    }
    
    const requestBody = `
      fields name, summary, storyline, rating, rating_count,
             first_release_date, genres.name, platforms.name,
             cover.url, screenshots.url, videos.video_id,
             involved_companies.company.name, involved_companies.developer,
             involved_companies.publisher, websites.url, websites.category,
             aggregated_rating, aggregated_rating_count, game_modes.name,
             themes.name, player_perspectives.name, age_ratings.rating,
             similar_games.name, similar_games.cover.url;
      where id = ${gameId};
    `;
    
    const response = await fetch(`${IGDB_BASE_URL}/games`, {
      method: 'POST',
      headers,
      body: requestBody
    });
    
    if (!response.ok) {
      throw new Error(`IGDB API hatası: ${response.status} - ${response.statusText}`);
    }
    
    const games = await response.json();
    if (games.length === 0) {
      console.warn('⚠️ IGDB\'de oyun bulunamadı:', gameId);
      return null;
    }
    
    return normalizeIGDBGame(games[0]);
  } catch (error) {
    console.error('❌ IGDB oyun detay hatası:', error);
    return null; // Hata durumunda null döndür
  }
};

/**
 * IGDB verilerini standart formata dönüştür
 * @param {Object} igdbGame - IGDB'den gelen oyun verisi
 * @returns {Object} Normalize edilmiş oyun verisi
 */
const normalizeIGDBGame = (igdbGame) => {
  // Geliştirici ve yayıncı bilgilerini ayır
  const developers = igdbGame.involved_companies?.filter(company => company.developer)
    .map(company => company.company.name) || [];
  const publishers = igdbGame.involved_companies?.filter(company => company.publisher)
    .map(company => company.company.name) || [];
  
  // Website linklerini kategorize et
  const websites = {};
  if (igdbGame.websites) {
    igdbGame.websites.forEach(website => {
      switch (website.category) {
        case 1: websites.official = website.url; break;
        case 2: websites.wikia = website.url; break;
        case 3: websites.wikipedia = website.url; break;
        case 4: websites.facebook = website.url; break;
        case 5: websites.twitter = website.url; break;
        case 6: websites.twitch = website.url; break;
        case 8: websites.instagram = website.url; break;
        case 9: websites.youtube = website.url; break;
        case 10: websites.iphone = website.url; break;
        case 11: websites.ipad = website.url; break;
        case 12: websites.android = website.url; break;
        case 13: websites.steam = website.url; break;
        case 14: websites.reddit = website.url; break;
        case 15: websites.itch = website.url; break;
        case 16: websites.epicgames = website.url; break;
        case 17: websites.gog = website.url; break;
        case 18: websites.discord = website.url; break;
      }
    });
  }
  
  // Cover URL'ini düzelt (IGDB'de // ile başlıyor)
  const coverUrl = igdbGame.cover?.url ? 
    `https:${igdbGame.cover.url.replace('t_thumb', 't_cover_big')}` : null;
  
  // Screenshot URL'lerini düzelt
  const screenshots = igdbGame.screenshots?.map(screenshot => 
    `https:${screenshot.url.replace('t_thumb', 't_screenshot_big')}`
  ) || [];
  
  return {
    id: `igdb_${igdbGame.id}`,
    igdbId: igdbGame.id,
    title: igdbGame.name,
    name: igdbGame.name, // GameSelectionScreen için
    description: igdbGame.summary || igdbGame.storyline || '',
    genres: igdbGame.genres?.map(genre => genre.name) || [],
    platforms: igdbGame.platforms?.map(platform => platform.name) || [],
    developers: developers,
    publishers: publishers,
    releaseDate: igdbGame.first_release_date ? 
      new Date(igdbGame.first_release_date * 1000).toISOString().split('T')[0] : null,
    rating: igdbGame.rating ? Math.round(igdbGame.rating) : null,
    ratingCount: igdbGame.rating_count || 0,
    metacriticScore: igdbGame.aggregated_rating ? Math.round(igdbGame.aggregated_rating) : null,
    metacriticCount: igdbGame.aggregated_rating_count || 0,
    cover: coverUrl,
    coverImage: coverUrl, // GameTracker için
    image: coverUrl, // GameSelectionScreen için
    screenshots: screenshots,
    videos: igdbGame.videos?.map(video => ({
      type: 'youtube',
      id: video.video_id,
      url: `https://www.youtube.com/watch?v=${video.video_id}`
    })) || [],
    websites: websites,
    gameModes: igdbGame.game_modes?.map(mode => mode.name) || [],
    themes: igdbGame.themes?.map(theme => theme.name) || [],
    perspectives: igdbGame.player_perspectives?.map(perspective => perspective.name) || [],
    ageRatings: igdbGame.age_ratings?.map(rating => rating.rating) || [],
    similarGames: igdbGame.similar_games?.map(game => ({
      id: `igdb_${game.id}`,
      title: game.name,
      cover: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_small')}` : null
    })) || [],
    source: 'igdb',
    lastUpdated: new Date().toISOString()
  };
};

/**
 * IGDB API durumunu kontrol et
 * @returns {Promise<boolean>} API erişilebilir mi?
 */
export const checkIGDBStatus = async () => {
  try {
    const headers = getIGDBHeaders();
    
    const response = await fetch(`${IGDB_BASE_URL}/games`, {
      method: 'POST',
      headers,
      body: 'fields name; limit 1;'
    });
    
    return response.ok;
  } catch (error) {
    console.error('❌ IGDB durum kontrolü hatası:', error);
    return false;
  }
};

// Debug fonksiyonları
if (typeof window !== 'undefined') {
  window.igdbApi = {
    search: searchGamesIGDB,
    getDetails: getGameDetailsIGDB,
    checkStatus: checkIGDBStatus
  };
}