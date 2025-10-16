import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Statistics.css';

// Platform ikonları
const getPlatformIcon = (platform) => {
  const icons = {
    'PC': '💻',
    'PlayStation': '🎮',
    'PS5': '🎮',
    'PS4': '🎮',
    'Xbox': '🎯',
    'Nintendo Switch': '🎮',
    'Switch': '🎮',
    'Mobile': '📱',
    'Steam': '💨',
    'Epic Games': '🎪',
    'Origin': '🌟',
    'Uplay': '🎭'
  };
  return icons[platform] || '🎮';
};

// Tür ikonları
const getGenreIcon = (genre) => {
  const icons = {
    'RPG': '⚔️',
    'Strategy': '🏰',
    'FPS': '🔫',
    'Action': '💥',
    'Adventure': '🗺️',
    'Simulation': '🏗️',
    'Racing': '🏎️',
    'Sports': '⚽',
    'Puzzle': '🧩',
    'Horror': '👻',
    'Indie': '🎨',
    'MMO': '🌐',
    'MOBA': '⚡',
    'Battle Royale': '🏆',
    'Platformer': '🦘',
    'Fighting': '👊'
  };
  return icons[genre] || '🎮';
};

// Fraksiyon ikonları
const getFactionIcon = (faction) => {
  const icons = {
    'Alliance': '🛡️',
    'Horde': '⚔️',
    'Empire': '👑',
    'Rebels': '🔥',
    'Federation': '🌟',
    'Klingon': '⚡',
    'Jedi': '✨',
    'Sith': '🔴',
    'Brotherhood': '🤝',
    'Legion': '🏛️',
    'Order': '📜',
    'Chaos': '💀',
    'Republic': '🏛️',
    'Imperial': '👑',
    'Covenant': '🔮',
    'UNSC': '🚀',
    'Terran': '🌍',
    'Protoss': '⚡',
    'Zerg': '👾'
  };
  
  // Eğer tam eşleşme yoksa, anahtar kelime ara
  const factionLower = faction.toLowerCase();
  for (const [key, icon] of Object.entries(icons)) {
    if (factionLower.includes(key.toLowerCase())) {
      return icon;
    }
  }
  
  return '⚔️'; // Varsayılan fraksiyon ikonu
};

/**
 * 📊 Statistics Dashboard - Phase 4
 * GameTracker için kapsamlı istatistik sayfası
 */
function Statistics() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    playing: 0,
    backlog: 0,
    dropped: 0,
    avgProgress: 0,
    platforms: {},
    genres: {},
    factions: {}
  });
  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde oyun verilerini yükle
  useEffect(() => {
    loadGameData();
  }, []);

  // LocalStorage'dan oyun verilerini yükle
  const loadGameData = () => {
    try {
      const savedGames = localStorage.getItem('gameTracker_games');
      if (savedGames) {
        const gameList = JSON.parse(savedGames);
        setGames(gameList);
        calculateStats(gameList);
        console.log('📊 İstatistikler hesaplandı:', gameList.length, 'oyun');
      }
    } catch (err) {
      console.error('❌ Veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri hesapla
  const calculateStats = (gameList) => {
    const newStats = {
      total: gameList.length,
      completed: 0,
      playing: 0,
      backlog: 0,
      dropped: 0,
      avgProgress: 0,
      platforms: {},
      genres: {},
      factions: {},
      timeStats: {
        thisMonth: 0,
        thisYear: 0,
        lastMonth: 0,
        lastYear: 0,
        monthlyData: {},
        yearlyData: {}
      }
    };

    let totalProgress = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    gameList.forEach(game => {
      // Status istatistikleri
      const status = game.status?.toLowerCase() || 'backlog';
      if (status.includes('completed') || status.includes('tamamla')) {
        newStats.completed++;
      } else if (status.includes('playing') || status.includes('oynuyor')) {
        newStats.playing++;
      } else if (status.includes('dropped') || status.includes('bırak')) {
        newStats.dropped++;
      } else {
        newStats.backlog++;
      }

      // Progress ortalaması
      const progress = parseInt(game.progress) || 0;
      totalProgress += progress;

      // Zaman bazlı istatistikler (lastUpdated tarihine göre)
      if (game.lastUpdated) {
        const gameDate = new Date(game.lastUpdated);
        const gameMonth = gameDate.getMonth();
        const gameYear = gameDate.getFullYear();
        
        // Bu ay ve bu yıl
        if (gameYear === currentYear && gameMonth === currentMonth) {
          newStats.timeStats.thisMonth++;
        }
        if (gameYear === currentYear) {
          newStats.timeStats.thisYear++;
        }
        
        // Geçen ay ve geçen yıl
        if (gameYear === lastMonthYear && gameMonth === lastMonth) {
          newStats.timeStats.lastMonth++;
        }
        if (gameYear === currentYear - 1) {
          newStats.timeStats.lastYear++;
        }
        
        // Aylık veri
        const monthKey = `${gameYear}-${String(gameMonth + 1).padStart(2, '0')}`;
        newStats.timeStats.monthlyData[monthKey] = (newStats.timeStats.monthlyData[monthKey] || 0) + 1;
        
        // Yıllık veri
        newStats.timeStats.yearlyData[gameYear] = (newStats.timeStats.yearlyData[gameYear] || 0) + 1;
      }

      // Platform istatistikleri
      const platform = game.platform || 'Bilinmiyor';
      newStats.platforms[platform] = (newStats.platforms[platform] || 0) + 1;

      // Tür istatistikleri
      const genre = game.type || 'Bilinmiyor';
      newStats.genres[genre] = (newStats.genres[genre] || 0) + 1;

      // Fraksiyon istatistikleri
      if (game.factions && Array.isArray(game.factions)) {
        game.factions.forEach(faction => {
          // Faction bir object ise name property'sini kullan, string ise direkt kullan
          const factionName = typeof faction === 'object' ? faction.name : faction.toString().trim();
          if (factionName) {
            newStats.factions[factionName] = (newStats.factions[factionName] || 0) + 1;
          }
        });
      }
    });

    // Ortalama progress hesapla
    newStats.avgProgress = gameList.length > 0 ? Math.round(totalProgress / gameList.length) : 0;

    setStats(newStats);
  };

  // Ana sayfaya dönüş
  const handleGoBack = () => {
    navigate('/game-tracker');
  };

  // Ana sayfaya dönüş
  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="statistics-page">
        <div className="statistics-loading">
          <div className="loading-spinner"></div>
          <p>📊 İstatistikler hesaplanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      {/* Header */}
      <div className="statistics-header">
        <div className="header-actions">
          <button onClick={handleGoHome} className="btn-home">
            🏠 Ana Sayfa
          </button>
          <button onClick={handleGoBack} className="btn-back">
            ← GameTracker
          </button>
        </div>
        <h1 className="statistics-title">📊 Oyun İstatistikleri</h1>
        <p className="statistics-subtitle">
          Kütüphanenizin detaylı analizi
        </p>
      </div>

      {/* Ana İstatistikler */}
      <div className="stats-overview">
        <div className="stat-card total">
          <div className="stat-icon">🎮</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Toplam Oyun</div>
          </div>
        </div>

        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Tamamlanan</div>
          </div>
        </div>

        <div className="stat-card playing">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-number">{stats.playing}</div>
            <div className="stat-label">Oynuyor</div>
          </div>
        </div>

        <div className="stat-card backlog">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-number">{stats.backlog}</div>
            <div className="stat-label">Backlog</div>
          </div>
        </div>

        <div className="stat-card dropped">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-number">{stats.dropped}</div>
            <div className="stat-label">Bırakılan</div>
          </div>
        </div>

        <div className="stat-card progress">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-number">{stats.avgProgress}%</div>
            <div className="stat-label">Ort. İlerleme</div>
          </div>
        </div>
      </div>

      {/* Detaylı Analizler */}
      <div className="stats-details">
        {/* Platform Dağılımı */}
        <div className="stats-section">
          <h3 className="section-title">🎮 Platform Dağılımı</h3>
          <div className="chart-container">
            {Object.entries(stats.platforms)
              .sort(([,a], [,b]) => b - a) // En çok kullanılan platform önce
              .map(([platform, count]) => {
                const percentage = ((count / stats.total) * 100).toFixed(1);
                const platformIcon = getPlatformIcon(platform);
                return (
                  <div key={platform} className="chart-bar">
                    <div className="bar-label">
                      <span className="platform-name">
                        <span className="platform-icon">{platformIcon}</span>
                        {platform}
                      </span>
                      <span className="platform-count">{count} oyun ({percentage}%)</span>
                    </div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill platform-bar" 
                        style={{ 
                          width: `${percentage}%`,
                          animationDelay: `${Object.keys(stats.platforms).indexOf(platform) * 0.1}s`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Tür Dağılımı */}
        <div className="stats-section">
          <h3 className="section-title">🎯 Tür Dağılımı</h3>
          <div className="chart-container">
            {Object.entries(stats.genres)
              .sort(([,a], [,b]) => b - a) // En popüler tür önce
              .map(([genre, count]) => {
                const percentage = ((count / stats.total) * 100).toFixed(1);
                const genreIcon = getGenreIcon(genre);
                return (
                  <div key={genre} className="chart-bar">
                    <div className="bar-label">
                      <span className="genre-name">
                        <span className="genre-icon">{genreIcon}</span>
                        {genre}
                      </span>
                      <span className="genre-count">{count} oyun ({percentage}%)</span>
                    </div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill genre-bar" 
                        style={{ 
                          width: `${percentage}%`,
                          animationDelay: `${Object.keys(stats.genres).indexOf(genre) * 0.1}s`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Fraksiyonlar */}
        {Object.keys(stats.factions).length > 0 && (
          <div className="stats-section">
            <h3 className="section-title">⚔️ Fraksiyonlar</h3>
            <div className="chart-container">
              {Object.entries(stats.factions)
                .sort(([,a], [,b]) => b - a) // En popüler fraksiyon önce
                .slice(0, 10) // İlk 10 fraksiyon
                .map(([faction, count]) => {
                  const percentage = ((count / stats.total) * 100).toFixed(1);
                  const factionIcon = getFactionIcon(faction);
                  return (
                    <div key={faction} className="chart-bar">
                      <div className="bar-label">
                        <span className="faction-name">
                          <span className="faction-icon">{factionIcon}</span>
                          {faction}
                        </span>
                        <span className="faction-count">{count} oyun ({percentage}%)</span>
                      </div>
                      <div className="bar-track">
                        <div 
                          className="bar-fill faction-bar" 
                          style={{ 
                            width: `${percentage}%`,
                            animationDelay: `${Object.keys(stats.factions).indexOf(faction) * 0.1}s`
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
            {Object.keys(stats.factions).length > 10 && (
              <div className="more-info">
                <span>+{Object.keys(stats.factions).length - 10} daha fazla fraksiyon</span>
              </div>
            )}
          </div>
        )}

        {/* Zaman Bazlı İstatistikler */}
        <div className="stats-section">
          <h3 className="section-title">📅 Zaman Bazlı İstatistikler</h3>
          
          {/* Dönemsel Karşılaştırma */}
          <div className="time-comparison">
            <div className="time-card">
              <div className="time-period">Bu Ay</div>
              <div className="time-count">{stats.timeStats.thisMonth}</div>
              <div className="time-label">güncellenen oyun</div>
            </div>
            <div className="time-card">
              <div className="time-period">Geçen Ay</div>
              <div className="time-count">{stats.timeStats.lastMonth}</div>
              <div className="time-label">güncellenen oyun</div>
            </div>
            <div className="time-card">
              <div className="time-period">Bu Yıl</div>
              <div className="time-count">{stats.timeStats.thisYear}</div>
              <div className="time-label">güncellenen oyun</div>
            </div>
            <div className="time-card">
              <div className="time-period">Geçen Yıl</div>
              <div className="time-count">{stats.timeStats.lastYear}</div>
              <div className="time-label">güncellenen oyun</div>
            </div>
          </div>

          {/* Aylık Aktivite */}
          {Object.keys(stats.timeStats.monthlyData).length > 0 && (
            <div className="monthly-activity">
              <h4 className="subsection-title">📊 Aylık Aktivite</h4>
              <div className="chart-container">
                {Object.entries(stats.timeStats.monthlyData)
                  .sort(([a], [b]) => b.localeCompare(a)) // En yeni ay önce
                  .slice(0, 12) // Son 12 ay
                  .map(([month, count]) => {
                    const maxCount = Math.max(...Object.values(stats.timeStats.monthlyData));
                    const percentage = maxCount > 0 ? ((count / maxCount) * 100).toFixed(1) : 0;
                    const [year, monthNum] = month.split('-');
                    const monthName = new Date(year, monthNum - 1).toLocaleDateString('tr-TR', { 
                      month: 'long', 
                      year: 'numeric' 
                    });
                    
                    return (
                      <div key={month} className="chart-bar">
                        <div className="bar-label">
                          <span className="month-name">📅 {monthName}</span>
                          <span className="month-count">{count} güncelleme</span>
                        </div>
                        <div className="bar-track">
                          <div 
                            className="bar-fill time-bar" 
                            style={{ 
                              width: `${percentage}%`,
                              animationDelay: `${Object.keys(stats.timeStats.monthlyData).indexOf(month) * 0.1}s`
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Fraksiyon Popülerliği */}
        {Object.keys(stats.factions).length > 0 && (
          <div className="stats-section">
            <h2 className="section-title">🏛️ Popüler Fraksiyonlar</h2>
            <div className="chart-container">
              {Object.entries(stats.factions)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10) // Top 10
                .map(([faction, count]) => {
                  const maxCount = Math.max(...Object.values(stats.factions));
                  const percentage = Math.round((count / maxCount) * 100);
                  return (
                    <div key={faction} className="chart-bar">
                      <div className="bar-label">
                        <span className="faction-name">{faction}</span>
                        <span className="faction-count">{count} oyun</span>
                      </div>
                      <div className="bar-track">
                        <div 
                          className="bar-fill faction-bar" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Veri Yok Durumu */}
      {stats.total === 0 && (
        <div className="no-data">
          <div className="no-data-icon">📊</div>
          <h3>Henüz oyun verisi yok</h3>
          <p>İstatistikleri görmek için önce GameTracker'a oyun ekleyin.</p>
          <button onClick={handleGoBack} className="btn-primary">
            GameTracker'a Git
          </button>
        </div>
      )}
    </div>
  );
}

export default Statistics;