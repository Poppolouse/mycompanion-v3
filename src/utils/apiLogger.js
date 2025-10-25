/**
 * 📝 API Logger - API isteklerini ve yanıtlarını loglar
 * 2 haftalık log rotation sistemi ile
 */

// 📊 LOG SEVİYELERİ
export const LOG_LEVELS = {
  INFO: 'info',
  SUCCESS: 'success', 
  WARNING: 'warning',
  ERROR: 'error',
  DEBUG: 'debug'
};

// 📁 LOG DOSYA YÖNETİMİ
class ApiLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Bellekte max 1000 log tut
    this.logRetentionDays = 14; // 2 hafta
    this.initLogger();
  }

  /**
   * Logger'ı başlat
   */
  initLogger() {
    console.log('📝 API Logger başlatıldı');
    this.cleanOldLogs();
    
    // Her gün eski logları temizle
    setInterval(() => {
      this.cleanOldLogs();
    }, 24 * 60 * 60 * 1000); // 24 saat
  }

  /**
   * Log kaydı oluştur
   * @param {string} level - Log seviyesi
   * @param {string} apiName - API adı
   * @param {string} action - Yapılan işlem
   * @param {Object} data - Log verisi
   * @param {Error} error - Hata (varsa)
   */
  log(level, apiName, action, data = {}, error = null) {
    const logEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      apiName,
      action,
      data: this.sanitizeData(data),
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null,
      sessionId: this.getSessionId()
    };

    // Bellekte sakla
    this.logs.unshift(logEntry);
    
    // Max log sayısını aş
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console'a da yazdır (development)
    if (import.meta.env.DEV) {
      this.consoleLog(logEntry);
    }

    // Local storage'a kaydet (production için)
    this.saveToStorage(logEntry);

    return logEntry;
  }

  /**
   * API isteği başladığında log
   * @param {string} apiName - API adı
   * @param {string} endpoint - Endpoint
   * @param {Object} params - İstek parametreleri
   */
  logApiRequest(apiName, endpoint, params = {}) {
    return this.log(LOG_LEVELS.INFO, apiName, 'REQUEST', {
      endpoint,
      params: this.sanitizeParams(params),
      userAgent: navigator.userAgent
    });
  }

  /**
   * API isteği başarılı olduğunda log
   * @param {string} apiName - API adı
   * @param {string} endpoint - Endpoint
   * @param {Object} response - Yanıt verisi
   * @param {number} duration - İstek süresi (ms)
   */
  logApiSuccess(apiName, endpoint, response = {}, duration = 0) {
    return this.log(LOG_LEVELS.SUCCESS, apiName, 'SUCCESS', {
      endpoint,
      responseSize: JSON.stringify(response).length,
      duration,
      resultCount: Array.isArray(response) ? response.length : 
                   response.results ? response.results.length : 1
    });
  }

  /**
   * API isteği hata verdiğinde log
   * @param {string} apiName - API adı
   * @param {string} endpoint - Endpoint
   * @param {Error} error - Hata
   * @param {number} duration - İstek süresi (ms)
   */
  logApiError(apiName, endpoint, error, duration = 0) {
    return this.log(LOG_LEVELS.ERROR, apiName, 'ERROR', {
      endpoint,
      duration,
      statusCode: error.status || error.code,
      isRateLimit: error.message?.includes('rate limit') || error.status === 429,
      isNetworkError: error.message?.includes('network') || error.code === 'NETWORK_ERROR'
    }, error);
  }

  /**
   * Cache hit logla
   * @param {string} apiName - API adı (opsiyonel)
   * @param {string} cacheKey - Cache anahtarı
   */
  logCacheHit(apiName, cacheKey) {
    return this.log(LOG_LEVELS.INFO, apiName || 'cache', 'CACHE_HIT', {
      cacheKey: this.hashString(cacheKey) // Güvenlik için hash'le
    });
  }

  /**
   * Rate limit logla
   * @param {string} apiName - API adı
   * @param {number} resetTime - Reset zamanı
   */
  logRateLimit(apiName, resetTime) {
    return this.log(LOG_LEVELS.WARNING, apiName, 'RATE_LIMITED', {
      resetTime: new Date(resetTime).toISOString(),
      waitTime: Math.max(0, resetTime - Date.now())
    });
  }

  /**
   * Logları getir
   * @param {Object} filters - Filtreler
   * @returns {Array} Filtrelenmiş loglar
   */
  getLogs(filters = {}) {
    let filteredLogs = [...this.logs];

    // API adına göre filtrele
    if (filters.apiName) {
      filteredLogs = filteredLogs.filter(log => 
        log.apiName === filters.apiName
      );
    }

    // Seviyeye göre filtrele
    if (filters.level) {
      filteredLogs = filteredLogs.filter(log => 
        log.level === filters.level
      );
    }

    // Tarih aralığına göre filtrele
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= endDate
      );
    }

    // Limit uygula
    if (filters.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }

    return filteredLogs;
  }

  /**
   * Log istatistiklerini getir
   * @returns {Object} İstatistikler
   */
  getLogStatistics() {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneHourAgo = now - (60 * 60 * 1000);

    const recentLogs = this.logs.filter(log => 
      new Date(log.timestamp).getTime() > oneDayAgo
    );

    const lastHourLogs = this.logs.filter(log => 
      new Date(log.timestamp).getTime() > oneHourAgo
    );

    // API bazında istatistikler
    const apiStats = {};
    recentLogs.forEach(log => {
      if (!apiStats[log.apiName]) {
        apiStats[log.apiName] = {
          total: 0,
          success: 0,
          error: 0,
          warning: 0,
          cacheHits: 0
        };
      }
      
      apiStats[log.apiName].total++;
      
      switch (log.level) {
        case LOG_LEVELS.SUCCESS:
          apiStats[log.apiName].success++;
          break;
        case LOG_LEVELS.ERROR:
          apiStats[log.apiName].error++;
          break;
        case LOG_LEVELS.WARNING:
          apiStats[log.apiName].warning++;
          break;
      }
      
      if (log.action === 'CACHE_HIT') {
        apiStats[log.apiName].cacheHits++;
      }
    });

    return {
      totalLogs: this.logs.length,
      last24Hours: recentLogs.length,
      lastHour: lastHourLogs.length,
      byLevel: {
        info: this.logs.filter(l => l.level === LOG_LEVELS.INFO).length,
        success: this.logs.filter(l => l.level === LOG_LEVELS.SUCCESS).length,
        warning: this.logs.filter(l => l.level === LOG_LEVELS.WARNING).length,
        error: this.logs.filter(l => l.level === LOG_LEVELS.ERROR).length,
        debug: this.logs.filter(l => l.level === LOG_LEVELS.DEBUG).length
      },
      byApi: apiStats,
      oldestLog: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : null,
      newestLog: this.logs.length > 0 ? this.logs[0].timestamp : null
    };
  }

  /**
   * Logları temizle
   * @param {Object} options - Temizleme seçenekleri
   */
  clearLogs(options = {}) {
    if (options.olderThan) {
      const cutoffDate = new Date(options.olderThan);
      this.logs = this.logs.filter(log => 
        new Date(log.timestamp) > cutoffDate
      );
    } else if (options.level) {
      this.logs = this.logs.filter(log => 
        log.level !== options.level
      );
    } else {
      this.logs = [];
    }

    this.saveAllToStorage();
    console.log(`🧹 Loglar temizlendi: ${this.logs.length} log kaldı`);
  }

  /**
   * Logları dışa aktar
   * @param {string} format - Format (json, csv)
   * @returns {string} Dışa aktarılan veri
   */
  exportLogs(format = 'json') {
    if (format === 'csv') {
      return this.exportToCsv();
    }
    
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs
    }, null, 2);
  }

  // 🔧 YARDIMCI FONKSİYONLAR

  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }

  sanitizeData(data) {
    // API anahtarları ve hassas bilgileri temizle
    const sensitiveKeys = ['api_key', 'apikey', 'token', 'password', 'secret'];
    const sanitized = { ...data };
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => 
        key.toLowerCase().includes(sensitive)
      )) {
        sanitized[key] = '***HIDDEN***';
      }
    });
    
    return sanitized;
  }

  sanitizeParams(params) {
    return this.sanitizeData(params);
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit integer'a çevir
    }
    return hash.toString(36);
  }

  consoleLog(logEntry) {
    const emoji = {
      [LOG_LEVELS.INFO]: 'ℹ️',
      [LOG_LEVELS.SUCCESS]: '✅',
      [LOG_LEVELS.WARNING]: '⚠️',
      [LOG_LEVELS.ERROR]: '❌',
      [LOG_LEVELS.DEBUG]: '🐛'
    };

    const style = {
      [LOG_LEVELS.INFO]: 'color: #3b82f6',
      [LOG_LEVELS.SUCCESS]: 'color: #22c55e',
      [LOG_LEVELS.WARNING]: 'color: #f59e0b',
      [LOG_LEVELS.ERROR]: 'color: #ef4444',
      [LOG_LEVELS.DEBUG]: 'color: #8b5cf6'
    };

    console.log(
      `%c${emoji[logEntry.level]} [${logEntry.apiName}] ${logEntry.action}`,
      style[logEntry.level],
      logEntry.data,
      logEntry.error || ''
    );
  }

  saveToStorage(logEntry) {
    try {
      const storageKey = `api_logs_${new Date().toISOString().split('T')[0]}`;
      const existingLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      existingLogs.unshift(logEntry);
      
      // Max 100 log per day in storage
      if (existingLogs.length > 100) {
        existingLogs.splice(100);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(existingLogs));
    } catch (error) {
      console.warn('Log storage hatası:', error);
    }
  }

  saveAllToStorage() {
    try {
      const storageKey = `api_logs_${new Date().toISOString().split('T')[0]}`;
      localStorage.setItem(storageKey, JSON.stringify(this.logs.slice(0, 100)));
    } catch (error) {
      console.warn('Log storage hatası:', error);
    }
  }

  cleanOldLogs() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.logRetentionDays);
    
    // Bellekteki eski logları temizle
    this.logs = this.logs.filter(log => 
      new Date(log.timestamp) > cutoffDate
    );

    // Local storage'daki eski logları temizle
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('api_logs_')) {
          const dateStr = key.replace('api_logs_', '');
          const logDate = new Date(dateStr);
          if (logDate < cutoffDate) {
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      if (keysToRemove.length > 0) {
        console.log(`🧹 ${keysToRemove.length} eski log dosyası temizlendi`);
      }
    } catch (error) {
      console.warn('Eski log temizleme hatası:', error);
    }
  }

  exportToCsv() {
    const headers = ['Timestamp', 'Level', 'API', 'Action', 'Data', 'Error'];
    const rows = this.logs.map(log => [
      log.timestamp,
      log.level,
      log.apiName,
      log.action,
      JSON.stringify(log.data),
      log.error ? log.error.message : ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }
}

// 🌍 GLOBAL LOGGER INSTANCE
export const apiLogger = new ApiLogger();

// 🚀 KOLAY KULLANIM FONKSİYONLARI
export const logApiRequest = (apiName, endpoint, params) => 
  apiLogger.logApiRequest(apiName, endpoint, params);

export const logApiSuccess = (apiName, endpoint, response, duration) => 
  apiLogger.logApiSuccess(apiName, endpoint, response, duration);

export const logApiError = (apiName, endpoint, error, duration) => 
  apiLogger.logApiError(apiName, endpoint, error, duration);

export const logCacheHit = (apiName, cacheKey) => 
  apiLogger.logCacheHit(apiName, cacheKey);

export const logCacheMiss = (apiName, cacheKey) => 
  apiLogger.log(LOG_LEVELS.INFO, apiName, 'cache_miss', { cacheKey });

export const logCacheSave = (apiName, cacheKey, data) => 
  apiLogger.log(LOG_LEVELS.INFO, apiName, 'cache_save', { cacheKey, dataSize: JSON.stringify(data).length });

export const logRateLimit = (apiName, resetTime) => 
  apiLogger.logRateLimit(apiName, resetTime);

export const getApiLogs = (filters) => 
  apiLogger.getLogs(filters);

export const getLogStatistics = () => 
  apiLogger.getLogStatistics();

export const clearApiLogs = (options) => 
  apiLogger.clearLogs(options);

export const exportApiLogs = (format) => 
  apiLogger.exportLogs(format);

export default apiLogger;