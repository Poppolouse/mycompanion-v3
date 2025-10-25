import * as XLSX from 'xlsx';
import { searchGames, getGameDetails } from '../api/gameApi';

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
 * Excel verisini oyun listesi formatına çevirir (Temel versiyon - RAWG entegrasyonu olmadan)
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
      title: normalizedRow.title || normalizedRow.name || normalizedRow.oyun || normalizedRow.başlık || 'Bilinmeyen Oyun',
      platform: normalizedRow.platform || normalizedRow.sistem || 'PC',
      genre: normalizedRow.genre || normalizedRow.tur || normalizedRow.tür || 'Bilinmeyen',
      developer: normalizedRow.developer || normalizedRow.gelistirici || normalizedRow.geliştirici || normalizedRow.yapimci || normalizedRow.yapımcı || null,
      releaseDate: normalizedRow.releasedate || normalizedRow['release date'] || normalizedRow.yil || normalizedRow.yıl || normalizedRow.tarih || null,
      year: normalizedRow.year || normalizedRow.yil || normalizedRow.yıl || null,
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
 * Excel verisini RAWG API ile zenginleştirerek oyun listesi formatına çevirir
 * @param {Array} rawData - Ham Excel verisi
 * @param {Function} onProgress - Progress callback (current, total, gameName)
 * @returns {Promise<Array>} - RAWG verisi ile zenginleştirilmiş oyun listesi
 */
export const parseGameListWithRAWG = async (rawData, onProgress = null) => {
  console.log('🎮 RAWG entegrasyonu ile Excel parse başlıyor, toplam satır:', rawData.length);
  
  const enrichedGames = [];
  
  for (let index = 0; index < rawData.length; index++) {
    const row = rawData[index];
    
    // Excel'deki sütun isimlerini normalize et
    const normalizedRow = {};
    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().trim();
      normalizedRow[normalizedKey] = row[key];
    });
    
    // Temel oyun verisi
    const baseGame = {
      id: index + 1,
      title: normalizedRow.title || normalizedRow.name || normalizedRow.oyun || normalizedRow.başlık || 'Bilinmeyen Oyun',
      platform: normalizedRow.platform || normalizedRow.sistem || 'PC',
      genre: normalizedRow.genre || normalizedRow.tur || normalizedRow.tür || 'Bilinmeyen',
      developer: normalizedRow.developer || normalizedRow.gelistirici || normalizedRow.geliştirici || normalizedRow.yapimci || normalizedRow.yapımcı || null,
      releaseDate: normalizedRow.releasedate || normalizedRow['release date'] || normalizedRow.yil || normalizedRow.yıl || normalizedRow.tarih || null,
      year: normalizedRow.year || normalizedRow.yil || normalizedRow.yıl || null,
      status: normalizedRow.status || normalizedRow.durum || 'Not Started',
      progress: parseInt(normalizedRow.progress || normalizedRow.ilerleme || 0),
      type: determineGameType(normalizedRow),
      factions: parseFactions(normalizedRow),
      notes: normalizedRow.notes || normalizedRow.notlar || '',
      addedDate: new Date().toISOString()
    };
    
    // Progress callback çağır
    if (onProgress) {
      onProgress(index + 1, rawData.length, baseGame.title);
    }
    
    try {
      // RAWG'den oyun ara
      console.log(`🔍 RAWG'de arıyor: ${baseGame.title}`);
      const searchResults = await searchGames(baseGame.title, 1);
      
      if (searchResults && searchResults.length > 0) {
        const rawgGame = searchResults[0];
        console.log(`✅ RAWG'de bulundu: ${rawgGame.title}`);
        
        // RAWG verisi ile zenginleştir
        const enrichedGame = {
          ...baseGame,
          // RAWG'den gelen veriler (Excel verisi varsa Excel'i tercih et)
          developer: baseGame.developer || rawgGame.developer || 'Bilinmeyen Geliştirici',
          publisher: rawgGame.publisher || 'Bilinmeyen Yayıncı',
          genre: baseGame.genre !== 'Bilinmeyen' ? baseGame.genre : (rawgGame.genre || 'Bilinmeyen'),
          platform: baseGame.platform || rawgGame.platform || 'PC',
          year: baseGame.year || rawgGame.year || null,
          releaseDate: baseGame.releaseDate || rawgGame.release_date || null,
          rating: rawgGame.rating || 0,
          metacritic: rawgGame.metacritic || null,
          description: rawgGame.description || '',
          image: rawgGame.image || '',
          tags: rawgGame.tags || [],
          esrb_rating: rawgGame.esrb_rating || '',
          playtime: rawgGame.playtime || 0,
          // RAWG metadata
          rawg_id: rawgGame.rawg_id || rawgGame.id,
          rawg_slug: rawgGame.rawg_slug,
          rawg_url: rawgGame.rawg_url,
          // Veri kaynağı bilgisi
          dataSource: 'excel+rawg',
          rawgEnriched: true
        };
        
        enrichedGames.push(enrichedGame);
      } else {
        console.log(`❌ RAWG'de bulunamadı: ${baseGame.title}`);
        // RAWG'de bulunamadı, sadece Excel verisi ile ekle
        enrichedGames.push({
          ...baseGame,
          dataSource: 'excel',
          rawgEnriched: false
        });
      }
    } catch (error) {
      console.error(`🚨 RAWG API hatası (${baseGame.title}):`, error);
      // Hata durumunda sadece Excel verisi ile ekle
      enrichedGames.push({
        ...baseGame,
        dataSource: 'excel',
        rawgEnriched: false,
        rawgError: error.message
      });
    }
    
    // API rate limiting için kısa bekleme
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`🎯 RAWG zenginleştirme tamamlandı: ${enrichedGames.filter(g => g.rawgEnriched).length}/${enrichedGames.length} oyun zenginleştirildi`);
  
  return enrichedGames;
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