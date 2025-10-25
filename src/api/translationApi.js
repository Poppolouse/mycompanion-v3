/**
 * 🌍 Çeviri API Servisi
 * Google Translate API entegrasyonu
 */

// Google Translate API endpoint'i
const TRANSLATE_API_URL = 'https://translate.googleapis.com/translate_a/single';

/**
 * Metni İngilizce'den Türkçe'ye çevir
 * @param {string} text - Çevrilecek metin
 * @returns {Promise<{translatedText: string, confidence: number}>}
 */
export async function translateToTurkish(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Geçerli bir metin gerekli');
  }

  // Metin zaten Türkçe karakterler içeriyorsa çevirme
  const turkishChars = /[çğıöşüÇĞIİÖŞÜ]/;
  if (turkishChars.test(text)) {
    return {
      translatedText: text,
      confidence: 1.0,
      isAlreadyTurkish: true
    };
  }

  try {
    // Google Translate API'ye istek gönder
    const params = new URLSearchParams({
      client: 'gtx',
      sl: 'en',      // Source language: English
      tl: 'tr',      // Target language: Turkish
      dt: 't',       // Return translation
      q: text
    });

    const response = await fetch(`${TRANSLATE_API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Çeviri API hatası: ${response.status}`);
    }

    const data = await response.json();
    
    // Google Translate response formatı: [[[translated_text, original_text, confidence, ...]]]
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      const translatedText = data[0][0][0];
      const confidence = data[0][0][2] || 0.8; // Default confidence
      
      return {
        translatedText: translatedText.trim(),
        confidence: Math.min(confidence, 0.95), // Max %95 güven
        isTranslated: true
      };
    }

    throw new Error('Çeviri yanıtı işlenemedi');

  } catch (error) {
    console.error('Çeviri hatası:', error);
    
    // Fallback: Basit kelime çevirisi
    const fallbackTranslation = await fallbackTranslate(text);
    if (fallbackTranslation) {
      return {
        translatedText: fallbackTranslation,
        confidence: 0.6,
        isTranslated: true,
        isFallback: true
      };
    }

    throw new Error(`Çeviri başarısız: ${error.message}`);
  }
}

/**
 * Basit fallback çeviri sistemi
 * @param {string} text 
 * @returns {string|null}
 */
async function fallbackTranslate(text) {
  // Basit kelime çevirileri
  const translations = {
    'action': 'aksiyon',
    'adventure': 'macera',
    'strategy': 'strateji',
    'simulation': 'simülasyon',
    'sports': 'spor',
    'racing': 'yarış',
    'puzzle': 'bulmaca',
    'platform': 'platform',
    'shooter': 'nişancı',
    'rpg': 'rol yapma',
    'mmorpg': 'çok oyunculu rol yapma',
    'fighting': 'dövüş',
    'horror': 'korku',
    'survival': 'hayatta kalma',
    'sandbox': 'sandbox',
    'indie': 'bağımsız',
    'multiplayer': 'çok oyunculu',
    'singleplayer': 'tek oyunculu',
    'open world': 'açık dünya',
    'first person': 'birinci şahıs',
    'third person': 'üçüncü şahıs',
    'medieval': 'ortaçağ',
    'fantasy': 'fantastik',
    'sci-fi': 'bilim kurgu',
    'post-apocalyptic': 'kıyamet sonrası',
    'stealth': 'gizlilik',
    'tactical': 'taktiksel'
  };

  let translatedText = text.toLowerCase();
  
  // Basit kelime değiştirme
  for (const [english, turkish] of Object.entries(translations)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translatedText = translatedText.replace(regex, turkish);
  }

  // Eğer değişiklik olduysa döndür
  if (translatedText !== text.toLowerCase()) {
    return translatedText.charAt(0).toUpperCase() + translatedText.slice(1);
  }

  return null;
}

/**
 * Çeviri kalitesini değerlendir
 * @param {string} originalText 
 * @param {string} translatedText 
 * @returns {number} 0-1 arası kalite skoru
 */
export function evaluateTranslationQuality(originalText, translatedText) {
  if (!originalText || !translatedText) return 0;

  // Uzunluk karşılaştırması
  const lengthRatio = translatedText.length / originalText.length;
  if (lengthRatio < 0.3 || lengthRatio > 3) return 0.3; // Çok kısa/uzun

  // Türkçe karakter varlığı
  const turkishChars = /[çğıöşüÇĞIİÖŞÜ]/;
  const hasTurkishChars = turkishChars.test(translatedText);
  
  // Tekrar eden kelimeler (çeviri hatası işareti)
  const words = translatedText.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const repetitionRatio = uniqueWords.size / words.length;

  let quality = 0.7; // Base quality
  
  if (hasTurkishChars) quality += 0.2;
  if (repetitionRatio > 0.8) quality += 0.1;
  if (lengthRatio > 0.7 && lengthRatio < 1.5) quality += 0.1;

  return Math.min(quality, 1.0);
}

/**
 * Çeviri önbelleği
 */
const translationCache = new Map();

/**
 * Önbellekli çeviri
 * @param {string} text 
 * @returns {Promise<Object>}
 */
export async function translateWithCache(text) {
  const cacheKey = `tr_${text.substring(0, 100)}`;
  
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const result = await translateToTurkish(text);
  
  // Sadece başarılı çevirileri önbelleğe al
  if (result.confidence > 0.5) {
    translationCache.set(cacheKey, result);
  }

  return result;
}

export default {
  translateToTurkish,
  translateWithCache,
  evaluateTranslationQuality
};