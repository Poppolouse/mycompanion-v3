/**
 * 💾 Oyun Konusu Depolama Sistemi
 * Oyun açıklamalarını yerel veritabanına kaydetme ve okuma
 */

// LocalStorage anahtarları
const STORAGE_KEYS = {
  GAME_DESCRIPTIONS: 'vaulttracker:game_descriptions',
  DESCRIPTION_CACHE: 'vaulttracker:description_cache',
  LAST_UPDATE: 'vaulttracker:descriptions_last_update'
};

/**
 * Oyun açıklamasını kaydet
 * @param {string} gameId - Oyun ID'si
 * @param {string} gameTitle - Oyun başlığı
 * @param {Object} descriptionData - Açıklama verisi
 * @returns {Promise<boolean>}
 */
export async function saveGameDescription(gameId, gameTitle, descriptionData) {
  try {
    const descriptions = getStoredDescriptions();
    
    const descriptionEntry = {
      id: gameId,
      title: gameTitle,
      description: descriptionData.description,
      source: descriptionData.source,
      originalSource: descriptionData.originalSource,
      language: descriptionData.language || 'tr',
      confidence: descriptionData.confidence,
      isTranslated: descriptionData.isTranslated || false,
      translationConfidence: descriptionData.translationConfidence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    descriptions[gameId] = descriptionEntry;
    
    localStorage.setItem(STORAGE_KEYS.GAME_DESCRIPTIONS, JSON.stringify(descriptions));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
    
    console.log(`✅ Oyun açıklaması kaydedildi: ${gameTitle} (${descriptionData.source})`);
    return true;
    
  } catch (error) {
    console.error('Açıklama kaydetme hatası:', error);
    return false;
  }
}

/**
 * Oyun açıklamasını getir
 * @param {string} gameId - Oyun ID'si
 * @returns {Object|null}
 */
export function getGameDescription(gameId) {
  try {
    const descriptions = getStoredDescriptions();
    const description = descriptions[gameId];
    
    if (description) {
      // 30 gün sonra eski açıklamaları güncelle
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (new Date(description.updatedAt) < thirtyDaysAgo) {
        console.log(`⏰ Eski açıklama bulundu: ${description.title} - Güncelleme gerekli`);
        return null; // Yeniden çekilmesini sağla
      }
      
      console.log(`📖 Kaydedilmiş açıklama bulundu: ${description.title}`);
      return description;
    }
    
    return null;
    
  } catch (error) {
    console.error('Açıklama okuma hatası:', error);
    return null;
  }
}

/**
 * Oyun başlığına göre açıklama ara
 * @param {string} gameTitle - Oyun başlığı
 * @returns {Object|null}
 */
export function findDescriptionByTitle(gameTitle) {
  try {
    const descriptions = getStoredDescriptions();
    
    // Tam eşleşme ara
    for (const description of Object.values(descriptions)) {
      if (description.title.toLowerCase() === gameTitle.toLowerCase()) {
        return description;
      }
    }
    
    // Kısmi eşleşme ara
    for (const description of Object.values(descriptions)) {
      if (description.title.toLowerCase().includes(gameTitle.toLowerCase()) ||
          gameTitle.toLowerCase().includes(description.title.toLowerCase())) {
        console.log(`🔍 Benzer açıklama bulundu: ${description.title} -> ${gameTitle}`);
        return description;
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Açıklama arama hatası:', error);
    return null;
  }
}

/**
 * Tüm kaydedilmiş açıklamaları getir
 * @returns {Object}
 */
function getStoredDescriptions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAME_DESCRIPTIONS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Depolama okuma hatası:', error);
    return {};
  }
}

/**
 * Açıklama önbelleğini temizle
 * @param {number} olderThanDays - Kaç günden eski kayıtları sil
 * @returns {number} Silinen kayıt sayısı
 */
export function cleanupOldDescriptions(olderThanDays = 90) {
  try {
    const descriptions = getStoredDescriptions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    let deletedCount = 0;
    
    for (const [gameId, description] of Object.entries(descriptions)) {
      if (new Date(description.updatedAt) < cutoffDate) {
        delete descriptions[gameId];
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      localStorage.setItem(STORAGE_KEYS.GAME_DESCRIPTIONS, JSON.stringify(descriptions));
      console.log(`🧹 ${deletedCount} eski açıklama temizlendi`);
    }
    
    return deletedCount;
    
  } catch (error) {
    console.error('Temizleme hatası:', error);
    return 0;
  }
}

/**
 * Depolama istatistikleri
 * @returns {Object}
 */
export function getStorageStats() {
  try {
    const descriptions = getStoredDescriptions();
    const lastUpdate = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
    
    const stats = {
      totalDescriptions: Object.keys(descriptions).length,
      translatedCount: 0,
      originalCount: 0,
      sources: {},
      lastUpdate: lastUpdate ? new Date(lastUpdate) : null,
      storageSize: 0
    };
    
    for (const description of Object.values(descriptions)) {
      if (description.isTranslated) {
        stats.translatedCount++;
      } else {
        stats.originalCount++;
      }
      
      const source = description.source || 'unknown';
      stats.sources[source] = (stats.sources[source] || 0) + 1;
    }
    
    // Depolama boyutu hesapla (yaklaşık)
    const storageData = localStorage.getItem(STORAGE_KEYS.GAME_DESCRIPTIONS);
    stats.storageSize = storageData ? storageData.length : 0;
    
    return stats;
    
  } catch (error) {
    console.error('İstatistik hesaplama hatası:', error);
    return {
      totalDescriptions: 0,
      translatedCount: 0,
      originalCount: 0,
      sources: {},
      lastUpdate: null,
      storageSize: 0
    };
  }
}

/**
 * Tüm açıklamaları dışa aktar
 * @returns {string} JSON formatında veriler
 */
export function exportDescriptions() {
  try {
    const descriptions = getStoredDescriptions();
    const stats = getStorageStats();
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      stats,
      descriptions
    };
    
    return JSON.stringify(exportData, null, 2);
    
  } catch (error) {
    console.error('Dışa aktarma hatası:', error);
    return null;
  }
}

/**
 * Açıklamaları içe aktar
 * @param {string} jsonData - JSON formatında veriler
 * @returns {boolean}
 */
export function importDescriptions(jsonData) {
  try {
    const importData = JSON.parse(jsonData);
    
    if (!importData.descriptions) {
      throw new Error('Geçersiz veri formatı');
    }
    
    const currentDescriptions = getStoredDescriptions();
    const newDescriptions = { ...currentDescriptions, ...importData.descriptions };
    
    localStorage.setItem(STORAGE_KEYS.GAME_DESCRIPTIONS, JSON.stringify(newDescriptions));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
    
    console.log(`📥 ${Object.keys(importData.descriptions).length} açıklama içe aktarıldı`);
    return true;
    
  } catch (error) {
    console.error('İçe aktarma hatası:', error);
    return false;
  }
}

// Sayfa yüklendiğinde eski kayıtları temizle
if (typeof window !== 'undefined') {
  // 90 günden eski kayıtları temizle
  setTimeout(() => cleanupOldDescriptions(90), 1000);
}

export default {
  saveGameDescription,
  getGameDescription,
  findDescriptionByTitle,
  cleanupOldDescriptions,
  getStorageStats,
  exportDescriptions,
  importDescriptions
};