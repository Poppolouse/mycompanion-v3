/**
 * Mevcut localStorage verilerini organize eden browser script
 */

/**
 * Oyun listesini organize et - aynı oyunları birleştir ve campaign'leri topla
 */
function organizeGameList(games) {
  if (!games || games.length === 0) {
    return [];
  }

  const gameMap = new Map();

  games.forEach(game => {
    const normalizedTitle = normalizeGameTitle(game.title);
    
    if (gameMap.has(normalizedTitle)) {
      // Mevcut oyunu al
      const existingGame = gameMap.get(normalizedTitle);
      
      // Campaign'leri birleştir
      if (game.campaigns && game.campaigns.length > 0) {
        if (!existingGame.campaigns) {
          existingGame.campaigns = [];
        }
        
        // Yeni campaign'leri ekle
        game.campaigns.forEach(newCampaign => {
          // Aynı isimde campaign var mı kontrol et
          const existingCampaign = existingGame.campaigns.find(
            c => c.name.toLowerCase() === newCampaign.name.toLowerCase()
          );
          
          if (!existingCampaign) {
            existingGame.campaigns.push({
              ...newCampaign,
              id: `${existingGame.id}_campaign_${existingGame.campaigns.length + 1}`
            });
          }
        });
      }
      
      // Diğer bilgileri güncelle (en son eklenen oyunun bilgilerini kullan)
      if (game.year && (!existingGame.year || game.year > existingGame.year)) {
        existingGame.year = game.year;
      }
      if (game.genre && !existingGame.genre) {
        existingGame.genre = game.genre;
      }
      if (game.platform && !existingGame.platform) {
        existingGame.platform = game.platform;
      }
      if (game.developer && !existingGame.developer) {
        existingGame.developer = game.developer;
      }
      
    } else {
      // Yeni oyun ekle
      const newGame = {
        ...game,
        campaigns: game.campaigns || []
      };
      gameMap.set(normalizedTitle, newGame);
    }
  });

  return Array.from(gameMap.values());
}

/**
 * Mevcut localStorage verilerini analiz et ve organize et
 */
export async function organizeCurrentData() {
  console.log('🔍 Mevcut localStorage verileri kontrol ediliyor...');
  
  // Mevcut verileri oku
  const existingData = localStorage.getItem('gameTracker_games');
  
  if (!existingData) {
    console.log('❌ localStorage\'da gameTracker_games verisi bulunamadı');
    return null;
  }
  
  let games;
  try {
    games = JSON.parse(existingData);
    console.log(`📊 Toplam ${games.length} oyun bulundu`);
  } catch (error) {
    console.error('❌ Veri parse edilemedi:', error);
    return null;
  }
  
  if (games.length === 0) {
    console.log('ℹ️ Organize edilecek oyun bulunamadı');
    return [];
  }
  
  // Mevcut oyunları listele
  console.log('\n📋 Mevcut oyunlar:');
  games.forEach((game, index) => {
    const campaignCount = game.campaigns?.length || 0;
    console.log(`  ${index + 1}. ${game.title} (${game.status}) - ${campaignCount} campaign`);
    
    if (game.campaigns && game.campaigns.length > 0) {
      game.campaigns.forEach((campaign, cIndex) => {
        console.log(`    └─ ${campaign.name} (${campaign.status})`);
      });
    }
  });
  
  // Tekrarlanan oyunları tespit et
  const duplicateGroups = {};
  games.forEach(game => {
    const normalizedTitle = normalizeGameTitle(game.title);
    
    if (!duplicateGroups[normalizedTitle]) {
      duplicateGroups[normalizedTitle] = [];
    }
    duplicateGroups[normalizedTitle].push(game);
  });
  
  const duplicates = Object.entries(duplicateGroups).filter(([key, group]) => group.length > 1);
  
  if (duplicates.length > 0) {
    console.log('\n🔍 Tespit edilen tekrarlanan oyun grupları:');
    duplicates.forEach(([key, group]) => {
      console.log(`  📁 ${key}:`);
      group.forEach(game => {
        console.log(`    - ${game.title} (${game.campaigns?.length || 0} campaign)`);
      });
    });
  } else {
    console.log('\n✅ Tekrarlanan oyun bulunamadı, organize etmeye gerek yok');
    return games;
  }
  
  // Organize et
  console.log('\n🔄 Oyunlar organize ediliyor...');
  
  try {
    const organizedGames = organizeGameList(games);
    
    console.log(`✅ ${organizedGames.length} oyun organize edildi (${games.length - organizedGames.length} oyun birleştirildi)`);
    
    // Organize edilmiş verileri göster
    console.log('\n📋 Organize edilmiş oyunlar:');
    organizedGames.forEach((game, index) => {
      const campaignCount = game.campaigns?.length || 0;
      console.log(`  ${index + 1}. ${game.title} (${game.status}) - ${campaignCount} campaign`);
      
      if (game.campaigns && game.campaigns.length > 0) {
        game.campaigns.forEach((campaign, cIndex) => {
          console.log(`    └─ ${campaign.name} (${campaign.status} - ${campaign.progress}%)`);
        });
      }
    });
    
    // localStorage'a kalıcı olarak kaydet
    localStorage.setItem('gameTracker_games', JSON.stringify(organizedGames));
    console.log('\n💾 Organize edilmiş veriler localStorage\'a kalıcı olarak kaydedildi');
    
    return organizedGames;
    
  } catch (error) {
    console.error('❌ Organize işlemi başarısız:', error);
    return games;
  }
}

/**
 * Oyun başlığını normalize et
 */
function normalizeGameTitle(title) {
  return title.toLowerCase()
    .replace(/[:\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')[0]; // İlk kelimeyi al
}

/**
 * Mevcut verileri göster
 */
export function showCurrentGames() {
  const games = JSON.parse(localStorage.getItem('gameTracker_games') || '[]');
  
  console.log(`📊 Toplam ${games.length} oyun:`);
  games.forEach((game, index) => {
    const campaignCount = game.campaigns?.length || 0;
    console.log(`  ${index + 1}. ${game.title} (${game.status}) - ${campaignCount} campaign`);
  });
  
  return games;
}

/**
 * localStorage'ı temizle
 */
export function clearGameData() {
  localStorage.removeItem('gameTracker_games');
  console.log('🗑️ gameTracker_games verisi temizlendi');
}

// Browser console'da kullanım için global olarak ekle
if (typeof window !== 'undefined') {
  window.organizeCurrentData = organizeCurrentData;
  window.showCurrentGames = showCurrentGames;
  window.clearGameData = clearGameData;
  
  console.log('🔧 Organize fonksiyonları yüklendi:');
  console.log('  - organizeCurrentData(): Mevcut verileri organize et');
  console.log('  - showCurrentGames(): Mevcut oyunları göster');
  console.log('  - clearGameData(): Verileri temizle');
}