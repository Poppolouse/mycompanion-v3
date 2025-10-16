import * as XLSX from 'xlsx';

/**
 * Excel dosyasını okur ve JSON formatına çevirir
 * @param {File} file - Excel dosyası
 * @returns {Promise<Array>} - Oyun listesi
 */
export const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // İlk sheet'i al
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // JSON'a çevir
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Dosya okuma hatası'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Excel verisini oyun listesi formatına çevirir
 * @param {Array} rawData - Ham Excel verisi
 * @returns {Array} - Formatlanmış oyun listesi
 */
export const parseGameList = (rawData) => {
  console.log('📊 Excel parse başlıyor, toplam satır:', rawData.length);
  
  // İlk birkaç satırı debug için göster
  console.log('🔍 İlk 3 satır:', rawData.slice(0, 3));
  
  return rawData.map((row, index) => {
    // Excel'deki sütun isimlerini normalize et
    const normalizedRow = {};
    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().trim();
      normalizedRow[normalizedKey] = row[key];
    });
    
    const game = {
      id: index + 1,
      title: normalizedRow.title || normalizedRow.name || normalizedRow.oyun || 'Bilinmeyen Oyun',
      platform: normalizedRow.platform || normalizedRow.sistem || 'PC',
      genre: normalizedRow.genre || normalizedRow.tur || 'Bilinmeyen',
      status: normalizedRow.status || normalizedRow.durum || 'Not Started',
      progress: parseInt(normalizedRow.progress || normalizedRow.ilerleme || 0),
      type: determineGameType(normalizedRow),
      factions: parseFactions(normalizedRow),
      notes: normalizedRow.notes || normalizedRow.notlar || '',
      addedDate: new Date().toISOString()
    };
    
    return game;
  });
};

/**
 * Oyun tipini belirler (Strategy vs Normal)
 * @param {Object} gameData - Oyun verisi
 * @returns {string} - 'strategy' veya 'normal'
 */
export const determineGameType = (gameData) => {
  const strategyKeywords = [
    'strategy', 'strateji', 'faction', 'fraksiyon', 'empire', 'imparatorluk',
    'civilization', 'medeniyet', 'campaign', 'kampanya', 'total war',
    'crusader kings', 'europa universalis', 'hearts of iron', 'stellaris'
  ];
  
  const gameText = JSON.stringify(gameData).toLowerCase();
  
  return strategyKeywords.some(keyword => gameText.includes(keyword)) 
    ? 'strategy' 
    : 'normal';
};

/**
 * Strateji oyunları için faction bilgilerini parse eder
 * @param {Object} gameData - Oyun verisi
 * @returns {Array} - Faction listesi
 */
export const parseFactions = (gameData) => {
  if (determineGameType(gameData) !== 'strategy') {
    return [];
  }
  
  // Faction sütunlarını ara
  const factionColumns = Object.keys(gameData).filter(key => 
    key.toLowerCase().includes('faction') || 
    key.toLowerCase().includes('fraksiyon') ||
    key.toLowerCase().includes('empire') ||
    key.toLowerCase().includes('civilization')
  );
  
  const factions = [];
  
  factionColumns.forEach(column => {
    const factionData = gameData[column];
    if (factionData && factionData.toString().trim()) {
      // Virgülle ayrılmış faction'ları parse et
      const factionNames = factionData.toString().split(',').map(f => f.trim());
      
      factionNames.forEach(name => {
        if (name) {
          factions.push({
            id: `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
            name: name,
            progress: 0,
            status: 'Not Started',
            difficulty: 'Normal',
            notes: ''
          });
        }
      });
    }
  });
  
  // Eğer faction bulunamazsa, default faction ekle
  if (factions.length === 0) {
    factions.push({
      id: `default_${Date.now()}`,
      name: 'Main Campaign',
      progress: 0,
      status: 'Not Started',
      difficulty: 'Normal',
      notes: ''
    });
  }
  
  return factions;
};

/**
 * Oyun progress'ini localStorage'a kaydeder
 * @param {Array} games - Oyun listesi
 */
export const saveGameProgress = (games) => {
  localStorage.setItem('vaulttracker:games:progress', JSON.stringify(games));
};

/**
 * localStorage'dan oyun progress'ini yükler
 * @returns {Array} - Oyun listesi
 */
export const loadGameProgress = () => {
  const saved = localStorage.getItem('vaulttracker:games:progress');
  return saved ? JSON.parse(saved) : [];
};

/**
 * Belirli bir oyunun progress'ini günceller
 * @param {number} gameId - Oyun ID'si
 * @param {number} progress - Yeni progress değeri (0-100)
 * @param {string} status - Yeni durum
 */
export const updateGameProgress = (gameId, progress, status) => {
  const games = loadGameProgress();
  const gameIndex = games.findIndex(game => game.id === gameId);
  
  if (gameIndex !== -1) {
    games[gameIndex].progress = progress;
    games[gameIndex].status = status;
    games[gameIndex].lastUpdated = new Date().toISOString();
    
    saveGameProgress(games);
  }
};

/**
 * Strateji oyunu faction progress'ini günceller
 * @param {number} gameId - Oyun ID'si
 * @param {string} factionId - Faction ID'si
 * @param {number} progress - Yeni progress değeri
 * @param {string} status - Yeni durum
 */
export const updateFactionProgress = (gameId, factionId, progress, status) => {
  const games = loadGameProgress();
  const gameIndex = games.findIndex(game => game.id === gameId);
  
  if (gameIndex !== -1 && games[gameIndex].factions) {
    const factionIndex = games[gameIndex].factions.findIndex(f => f.id === factionId);
    
    if (factionIndex !== -1) {
      games[gameIndex].factions[factionIndex].progress = progress;
      games[gameIndex].factions[factionIndex].status = status;
      games[gameIndex].factions[factionIndex].lastUpdated = new Date().toISOString();
      
      // Oyunun genel progress'ini faction'ların ortalamasına göre güncelle
      const totalProgress = games[gameIndex].factions.reduce((sum, f) => sum + f.progress, 0);
      games[gameIndex].progress = Math.round(totalProgress / games[gameIndex].factions.length);
      
      saveGameProgress(games);
    }
  }
};