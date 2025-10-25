/**
 * 🖼️ Oyun Resim Yönetimi Utilities
 * Dinamik resim yükleme, fallback ve placeholder sistemi
 * Cache-first yaklaşım ile performans optimizasyonu
 */

import { getCachedGameImages, cacheGameImages } from '../api/gameLibraryApi';

// 🎨 Varsayılan placeholder resimleri (SVG format - proje kuralı)
export const DEFAULT_IMAGES = {
  // Oyun banner'ı için gradient placeholder
  GAME_BANNER: `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#gameGradient)"/>
      <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="48" font-family="Arial">GAME</text>
    </svg>
  `)}`,

  // Oyun arka planı için koyu gradient
  GAME_BACKGROUND: `data:image/svg+xml;base64,${btoa(`
    <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#16213e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f3460;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>
      <circle cx="960" cy="540" r="100" fill="rgba(255,255,255,0.1)"/>
      <text x="50%" y="55%" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="72" font-family="Arial">GAME</text>
    </svg>
  `)}`,

  // Oyun kapağı için kare placeholder
  GAME_COVER: `data:image/svg+xml;base64,${btoa(`
    <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="coverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#coverGradient)"/>
      <rect x="50" y="50" width="200" height="300" fill="rgba(255,255,255,0.2)" rx="10"/>
      <text x="50%" y="55%" text-anchor="middle" fill="white" font-size="36" font-family="Arial">GAME</text>
    </svg>
  `)}`
};

/**
 * 🎯 Oyun için en uygun resmi getir (Cache-First yaklaşım)
 * @param {Object} game - Oyun objesi
 * @param {string} type - Resim tipi ('banner', 'background', 'cover', 'image')
 * @param {Object} options - Seçenekler
 * @returns {string} Resim URL'i
 */
export const getGameImage = (game, type = 'banner', options = {}) => {
  if (!game) return DEFAULT_IMAGES[type.toUpperCase()] || DEFAULT_IMAGES.BANNER;
  
  const { fallbackToPlaceholder = true, generateDynamic = true, useCache = true } = options;
  
  // 1️⃣ Önce cache'e bak (eğer game.id varsa)
  if (useCache && game.id) {
    const cachedImages = getCachedGameImages(game.id);
    if (cachedImages) {
      let cachedImageUrl = null;
      
      switch (type) {
        case 'banner':
          cachedImageUrl = cachedImages.banner || cachedImages.background || cachedImages.backgroundImage || cachedImages.coverImage || cachedImages.image;
          break;
        case 'background':
          cachedImageUrl = cachedImages.background || cachedImages.backgroundImage || cachedImages.banner || cachedImages.image;
          break;
        case 'cover':
          cachedImageUrl = cachedImages.coverImage || cachedImages.image || cachedImages.banner || cachedImages.background;
          break;
        case 'image':
        default:
          cachedImageUrl = cachedImages.image || cachedImages.coverImage || cachedImages.banner || cachedImages.background;
          break;
      }
      
      if (cachedImageUrl) {
        console.log(`💾 Cache'den resim alındı (${type}):`, game.title);
        return cachedImageUrl;
      }
    }
  }
  
  // 2️⃣ Cache'de yoksa game objesinden al
  let imageUrl = null;
  
  switch (type) {
    case 'banner':
      imageUrl = game.banner || game.background || game.backgroundImage || game.coverImage || game.image;
      break;
    case 'background':
      imageUrl = game.background || game.backgroundImage || game.banner || game.image;
      break;
    case 'cover':
      imageUrl = game.coverImage || game.image || game.banner || game.background;
      break;
    case 'image':
    default:
      imageUrl = game.image || game.coverImage || game.banner || game.background;
      break;
  }
  
  // 3️⃣ Eğer resim varsa cache'e kaydet ve döndür
  if (imageUrl && useCache && game.id) {
    const imageData = {
      banner: game.banner,
      background: game.background || game.backgroundImage,
      backgroundImage: game.backgroundImage,
      coverImage: game.coverImage,
      image: game.image,
      screenshots: game.screenshots || []
    };
    
    // Cache'e kaydet (async olarak, blocking olmadan)
    setTimeout(() => {
      cacheGameImages(game.id, imageData);
    }, 0);
  }
  
  if (imageUrl) {
    return imageUrl;
  }
  
  // 4️⃣ Fallback stratejisi
  if (fallbackToPlaceholder) {
    if (generateDynamic) {
      // Dinamik placeholder oluştur
      return generateGamePlaceholder(game, type);
    } else {
      // Statik placeholder döndür
      return DEFAULT_IMAGES[type.toUpperCase()] || DEFAULT_IMAGES.BANNER;
    }
  }
  
  return null;
};

/**
 * 🔍 Resmin yüklenip yüklenmediğini kontrol et
 * @param {string} imageUrl - Kontrol edilecek resim URL'i
 * @returns {Promise<boolean>} Resim yüklenebilir mi?
 */
export const checkImageExists = (imageUrl) => {
  return new Promise((resolve) => {
    if (!imageUrl || imageUrl.startsWith('data:')) {
      resolve(true); // SVG placeholder'lar her zaman çalışır
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
  });
};

/**
 * 🎨 Oyun türüne göre dinamik renk paleti getir
 * @param {Object} game - Oyun objesi
 * @returns {Object} Renk paleti
 */
export const getGameColorPalette = (game) => {
  const genre = (game.genre || game.tür || '').toLowerCase();
  
  // Oyun türüne göre renk paleti
  if (genre.includes('rpg') || genre.includes('role')) {
    return {
      primary: '#8B5CF6', // Mor
      secondary: '#A78BFA',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)'
    };
  } else if (genre.includes('action') || genre.includes('aksiyon')) {
    return {
      primary: '#EF4444', // Kırmızı
      secondary: '#F87171',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)'
    };
  } else if (genre.includes('strategy') || genre.includes('strateji')) {
    return {
      primary: '#10B981', // Yeşil
      secondary: '#34D399',
      gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
    };
  } else if (genre.includes('indie') || genre.includes('story')) {
    return {
      primary: '#F59E0B', // Turuncu
      secondary: '#FBBF24',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)'
    };
  }
  
  // Varsayılan (mavi)
  return {
    primary: '#667eea',
    secondary: '#764ba2',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
};

/**
 * 🖼️ Dinamik placeholder SVG oluştur
 * @param {Object} game - Oyun objesi
 * @param {string} type - Placeholder tipi
 * @param {number} width - Genişlik
 * @param {number} height - Yükseklik
 * @returns {string} SVG data URL
 */
export const generateGamePlaceholder = (game, type = 'banner', width = 400, height = 600) => {
  const colors = getGameColorPalette(game);
  const gameTitle = game.title || game.name || 'Game';
  const gameIcon = 'GAME'; // Emoji yerine text kullan
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dynamicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#dynamicGradient)"/>
      <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="${Math.min(width/8, 48)}" font-family="Arial">${gameIcon}</text>
      <text x="50%" y="65%" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="${Math.min(width/20, 16)}" font-family="Arial">${gameTitle.substring(0, 20)}</text>
    </svg>
  `;
  
  try {
    // Türkçe karakterler için güvenli encoding
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  } catch (error) {
    console.warn('SVG encoding hatası:', error);
    // Fallback: URL encoding kullan
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
};

/**
 * 🎮 Oyun türüne göre ikon getir
 * @param {Object} game - Oyun objesi
 * @returns {string} Text ikon
 */
export const getGameIcon = (game) => {
  const genre = (game.genre || game.tür || '').toLowerCase();
  
  if (genre.includes('rpg')) return 'RPG';
  if (genre.includes('action')) return 'ACT';
  if (genre.includes('strategy')) return 'STR';
  if (genre.includes('racing')) return 'RAC';
  if (genre.includes('sports')) return 'SPT';
  if (genre.includes('puzzle')) return 'PUZ';
  if (genre.includes('horror')) return 'HOR';
  if (genre.includes('adventure')) return 'ADV';
  if (genre.includes('simulation')) return 'SIM';
  if (genre.includes('indie')) return 'IND';
  
  return 'GAME'; // Varsayılan
};

/**
 * 📱 Responsive resim boyutları getir
 * @param {string} type - Resim tipi
 * @param {string} breakpoint - Ekran boyutu: 'mobile', 'tablet', 'desktop'
 * @returns {Object} Boyut bilgileri
 */
export const getResponsiveImageSize = (type, breakpoint = 'desktop') => {
  const sizes = {
    banner: {
      mobile: { width: 300, height: 450 },
      tablet: { width: 350, height: 525 },
      desktop: { width: 400, height: 600 }
    },
    background: {
      mobile: { width: 768, height: 432 },
      tablet: { width: 1024, height: 576 },
      desktop: { width: 1920, height: 1080 }
    },
    cover: {
      mobile: { width: 200, height: 267 },
      tablet: { width: 250, height: 333 },
      desktop: { width: 300, height: 400 }
    }
  };
  
  return sizes[type]?.[breakpoint] || sizes.banner.desktop;
};

/**
 * 📸 RAWG'den gelen screenshot'ları localStorage'a kaydet
 * @param {string} gameId - Oyun ID'si
 * @param {Array} screenshots - RAWG screenshot array'i
 * @returns {Promise<Array>} Kaydedilen screenshot URL'leri
 */
export const saveGameScreenshots = async (gameId, screenshots = []) => {
  if (!gameId || !screenshots || screenshots.length === 0) {
    console.log('📸 Screenshot kaydetme atlandı: Geçersiz veri');
    return [];
  }

  try {
    console.log(`📸 ${screenshots.length} screenshot kaydediliyor...`);
    
    // Screenshot'ları localStorage'a kaydet
    const screenshotKey = `game_screenshots_${gameId}`;
    const screenshotData = {
      gameId,
      screenshots: screenshots.map((screenshot, index) => ({
        id: `${gameId}_screenshot_${index}`,
        url: screenshot.image || screenshot.url || screenshot,
        thumbnail: screenshot.thumbnail || screenshot.image || screenshot.url || screenshot,
        width: screenshot.width || null,
        height: screenshot.height || null,
        savedAt: new Date().toISOString()
      })),
      totalCount: screenshots.length,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(screenshotKey, JSON.stringify(screenshotData));
    
    console.log(`✅ ${screenshots.length} screenshot başarıyla kaydedildi`);
    return screenshotData.screenshots;
    
  } catch (error) {
    console.error('❌ Screenshot kaydetme hatası:', error);
    return [];
  }
};

/**
 * 📸 Oyun screenshot'larını localStorage'dan getir
 * @param {string} gameId - Oyun ID'si
 * @returns {Array} Screenshot array'i
 */
export const getGameScreenshots = (gameId) => {
  if (!gameId) return [];
  
  try {
    const screenshotKey = `game_screenshots_${gameId}`;
    const screenshotData = localStorage.getItem(screenshotKey);
    
    if (screenshotData) {
      const parsed = JSON.parse(screenshotData);
      console.log(`📸 ${parsed.screenshots.length} screenshot cache'den alındı`);
      return parsed.screenshots || [];
    }
    
    return [];
  } catch (error) {
    console.error('❌ Screenshot okuma hatası:', error);
    return [];
  }
};