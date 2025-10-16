import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { readExcelFile, parseGameList } from '../../utils/excelUtils';
import './GameTracker.css';

/**
 * 🎮 Game Tracker - Phase 2: Progress Sistemi
 * Bağımsız oyun takip sayfası + Progress tracking
 */
function GameTracker() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingGame, setEditingGame] = useState(null);
  const fileInputRef = useRef(null);
  
  // 🔍 AŞAMA 3: Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });
  
  // ⏱️ AŞAMA 4: Time tracking states
  const [activeSession, setActiveSession] = useState(null); // { gameId, startTime, sessionId }
  const [sessionTimer, setSessionTimer] = useState(0); // Saniye cinsinden
  const [timerInterval, setTimerInterval] = useState(null);

  // Sayfa yüklendiğinde localStorage'dan oyunları yükle
  useEffect(() => {
    const savedGames = localStorage.getItem('gameTracker_games');
    if (savedGames) {
      try {
        const gameList = JSON.parse(savedGames);
        setGames(gameList);
        console.log('📊 LocalStorage\'dan yüklendi:', gameList.length, 'oyun');
      } catch (err) {
        console.error('❌ LocalStorage yükleme hatası:', err);
        localStorage.removeItem('gameTracker_games');
      }
    }
  }, []);

  // Oyunları localStorage'a kaydet
  const saveGamesToStorage = (gameList) => {
    localStorage.setItem('gameTracker_games', JSON.stringify(gameList));
  };

  // Ana sayfaya dönüş
  const handleGoHome = () => {
    navigate('/');
  };

  // Excel dosyası seçme
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Excel dosyası yükleme
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Excel dosyasını oku
      const rawData = await readExcelFile(file);
      
      // Oyun listesi formatına çevir
      const gameList = parseGameList(rawData);
      
      // State'i güncelle
      setGames(gameList);
      
      // LocalStorage'a kaydet
      localStorage.setItem('gameTracker_games', JSON.stringify(gameList));
      
      console.log('📊 Excel yüklendi:', gameList.length, 'oyun');
    } catch (err) {
      console.error('❌ Excel yükleme hatası:', err);
      setError('Excel dosyası yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Oyun detayına git (eski fonksiyon - şimdilik kaldırıldı)
  // const handleGameClick = (gameId) => {
  //   navigate(`/game-tracker/game/${gameId}`);
  // };

  // 🎯 AŞAMA 3: Progress, Status ve Priority güncelleme fonksiyonu
  const handleProgressUpdate = (gameId, newProgress, newStatus, newPriority) => {
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        const updatedGame = {
          ...game,
          progress: Math.max(0, Math.min(100, parseInt(newProgress) || 0)),
          status: newStatus || game.status,
          priority: newPriority || game.priority || 'Medium',
          lastUpdated: new Date().toISOString()
        };
        
        // Progress'e göre otomatik status güncelleme
        if (updatedGame.progress === 0) {
          updatedGame.status = 'Not Started';
        } else if (updatedGame.progress === 100) {
          updatedGame.status = 'Completed';
        } else if (updatedGame.progress > 0 && updatedGame.status === 'Not Started') {
          updatedGame.status = 'In Progress';
        }
        
        return updatedGame;
      }
      return game;
    });
    
    setGames(updatedGames);
    saveGamesToStorage(updatedGames);
    setEditingGame(null);
    
    console.log('✅ Progress güncellendi:', gameId, newProgress + '%');
  };

  // 🏰 AŞAMA 2: Faction progress güncelleme
  const handleFactionUpdate = (gameId, factionIndex, newProgress, newStatus) => {
    const updatedGames = games.map(game => {
      if (game.id === gameId && game.factions && game.factions[factionIndex]) {
        const updatedGame = { ...game };
        updatedGame.factions = [...game.factions];
        
        // Faction güncelle
        updatedGame.factions[factionIndex] = {
          ...updatedGame.factions[factionIndex],
          progress: Math.max(0, Math.min(100, parseInt(newProgress) || 0)),
          status: newStatus || updatedGame.factions[factionIndex].status,
          lastUpdated: new Date().toISOString()
        };
        
        // Oyunun genel progress'ini faction'ların ortalamasına göre hesapla
        const totalProgress = updatedGame.factions.reduce((sum, f) => sum + (f.progress || 0), 0);
        updatedGame.progress = Math.round(totalProgress / updatedGame.factions.length);
        
        // Genel status güncelle
        const completedFactions = updatedGame.factions.filter(f => f.progress === 100).length;
        if (completedFactions === updatedGame.factions.length) {
          updatedGame.status = 'Completed';
        } else if (completedFactions > 0 || updatedGame.progress > 0) {
          updatedGame.status = 'In Progress';
        } else {
          updatedGame.status = 'Not Started';
        }
        
        updatedGame.lastUpdated = new Date().toISOString();
        return updatedGame;
      }
      return game;
    });
    
    setGames(updatedGames);
    saveGamesToStorage(updatedGames);
    
    console.log('🏰 Faction güncellendi:', gameId, factionIndex, newProgress + '%');
  };

  // Oyun kartına tıklama - progress edit moduna geç
  const handleGameClick = (gameId) => {
    setEditingGame(gameId);
  };

  // 🔍 AŞAMA 3: Oyunları filtrele
  const getFilteredGames = () => {
    return games.filter(game => {
      // Status filtresi
      if (filters.status !== 'all') {
        const gameStatus = (game.status || 'Not Started').toLowerCase();
        const filterStatus = filters.status.toLowerCase();
        
        if (filterStatus === 'completed' && !gameStatus.includes('completed') && !gameStatus.includes('tamamla')) {
          return false;
        }
        if (filterStatus === 'playing' && !gameStatus.includes('playing') && !gameStatus.includes('oynuyor') && !gameStatus.includes('progress')) {
          return false;
        }
        if (filterStatus === 'backlog' && (gameStatus.includes('completed') || gameStatus.includes('playing') || gameStatus.includes('dropped'))) {
          return false;
        }
        if (filterStatus === 'dropped' && !gameStatus.includes('dropped') && !gameStatus.includes('bırak')) {
          return false;
        }
      }
      
      // Priority filtresi
      if (filters.priority !== 'all') {
        const gamePriority = (game.priority || 'Medium').toLowerCase();
        if (!gamePriority.includes(filters.priority.toLowerCase())) {
          return false;
        }
      }
      
      // Arama filtresi
      if (filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase();
        const gameTitle = (game.title || '').toLowerCase();
        const gameType = (game.type || '').toLowerCase();
        const gamePlatform = (game.platform || '').toLowerCase();
        
        if (!gameTitle.includes(searchTerm) && 
            !gameType.includes(searchTerm) && 
            !gamePlatform.includes(searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Progress edit modundan çık
  const handleCancelEdit = () => {
    setEditingGame(null);
  };

  // ⏱️ AŞAMA 4: Time tracking functions
  
  // Oyun session'ını başlat
  const startGameSession = (gameId) => {
    // Eğer başka bir session aktifse onu durdur
    if (activeSession) {
      stopGameSession();
    }
    
    const sessionId = Date.now().toString();
    const startTime = new Date();
    
    const newSession = {
      gameId,
      startTime,
      sessionId
    };
    
    setActiveSession(newSession);
    setSessionTimer(0);
    
    // Timer'ı başlat
    const interval = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
    
    console.log('🎮 Session başlatıldı:', gameId);
  };
  
  // Oyun session'ını durdur
  const stopGameSession = () => {
    if (!activeSession) return;
    
    const endTime = new Date();
    const duration = Math.floor((endTime - activeSession.startTime) / 1000); // Saniye
    
    // Session'ı oyunun geçmişine kaydet
    const sessionData = {
      sessionId: activeSession.sessionId,
      startTime: activeSession.startTime,
      endTime: endTime,
      duration: duration,
      date: endTime.toISOString().split('T')[0] // YYYY-MM-DD
    };
    
    // Oyunu güncelle
    setGames(prevGames => {
      const updatedGames = prevGames.map(game => {
        if (game.id === activeSession.gameId) {
          const sessions = game.sessions || [];
          const totalPlayTime = (game.totalPlayTime || 0) + duration;
          
          return {
            ...game,
            sessions: [...sessions, sessionData],
            totalPlayTime: totalPlayTime,
            lastPlayed: endTime.toISOString()
          };
        }
        return game;
      });
      
      saveGamesToStorage(updatedGames);
      return updatedGames;
    });
    
    // Timer'ı temizle
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    setActiveSession(null);
    setSessionTimer(0);
    
    console.log('⏹️ Session durduruldu. Süre:', formatTime(duration));
  };
  
  // Zaman formatla (saniye -> HH:MM:SS)
  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // 💾 AŞAMA 5: Export/Import Fonksiyonları
  
  // Verileri JSON olarak export et
  const exportData = () => {
    try {
      const exportData = {
        games: games,
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalGames: games.length,
        metadata: {
          appName: 'GameTracker',
          description: 'Oyun koleksiyonu ve ilerleme takibi verileri'
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `gametracker_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Veriler başarıyla export edildi');
      alert('🎉 Veriler başarıyla yedeklendi!');
    } catch (err) {
      console.error('❌ Export hatası:', err);
      alert('❌ Veri yedekleme sırasında hata oluştu!');
    }
  };

  // JSON dosyasından verileri import et
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Veri formatını kontrol et
        if (!importedData.games || !Array.isArray(importedData.games)) {
          throw new Error('Geçersiz veri formatı');
        }

        // Kullanıcıya onay sor
        const confirmMessage = `
📦 Import Bilgileri:
• ${importedData.totalGames || importedData.games.length} oyun
• Export tarihi: ${importedData.exportDate ? new Date(importedData.exportDate).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
• Versiyon: ${importedData.version || 'Bilinmiyor'}

⚠️ Mevcut veriler silinecek ve yerine import edilen veriler gelecek!

Devam etmek istiyor musunuz?`;

        if (confirm(confirmMessage)) {
          setGames(importedData.games);
          localStorage.setItem('gameTracker_games', JSON.stringify(importedData.games));
          
          console.log('✅ Veriler başarıyla import edildi:', importedData.games.length, 'oyun');
          alert('🎉 Veriler başarıyla geri yüklendi!');
        }
      } catch (err) {
        console.error('❌ Import hatası:', err);
        alert('❌ Veri geri yükleme sırasında hata oluştu! Dosya formatını kontrol edin.');
      }
    };
    
    reader.readAsText(file);
    // Input'u temizle (aynı dosyayı tekrar seçebilmek için)
    event.target.value = '';
  };
  
  // Component unmount'ta timer'ı temizle
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Progress bar rengi belirleme
  const getProgressColor = (progress, status) => {
    if (status === 'Completed') return '#10b981'; // Yeşil
    if (progress === 0) return '#6b7280'; // Gri
    if (progress < 30) return '#ef4444'; // Kırmızı
    if (progress < 70) return '#f59e0b'; // Sarı
    return '#3b82f6'; // Mavi
  };

  // Status badge rengi
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'In Progress': return '#3b82f6';
      case 'Not Started': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="game-tracker-page">
      {/* Üst Navigasyon */}
      <div className="top-navigation">
        <button className="home-button" onClick={handleGoHome}>
          🏠 Ana Sayfa
        </button>
        <button className="stats-button" onClick={() => navigate('/statistics')}>
          📊 İstatistikler
        </button>
        
        {/* ⏱️ AŞAMA 4: Global Timer */}
        {activeSession && (
          <div className="global-timer">
            <div className="timer-info">
              <span className="playing-game">
                🎮 {games.find(g => g.id === activeSession.gameId)?.title || 'Bilinmeyen Oyun'}
              </span>
              <span className="timer-time">{formatTime(sessionTimer)}</span>
            </div>
            <button 
              className="global-stop-btn"
              onClick={stopGameSession}
              title="Oyunu durdur"
            >
              ⏹️
            </button>
          </div>
        )}
      </div>

      {/* Sayfa Başlığı */}
      <div className="page-header">
        <h1>🎮 Game Tracker</h1>
        <p>Oyun koleksiyonunu takip et</p>
      </div>

      {/* Ana İçerik */}
      <div className="main-content">
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        
        {/* 💾 AŞAMA 5: Hidden import input */}
        <input
          id="import-input"
          type="file"
          accept=".json"
          onChange={importData}
          style={{ display: 'none' }}
        />

        {/* Error mesajı */}
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {/* Empty state - oyun yoksa göster */}
        {games.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h2>Henüz oyun listesi yüklenmemiş</h2>
            <p>Excel dosyanızı seçerek oyun takibine başlayın</p>
            <button 
              className="import-button"
              onClick={handleFileSelect}
              disabled={loading}
            >
              {loading ? '⏳ Yükleniyor...' : '📁 Excel Dosyası Seç'}
            </button>
          </div>
        )}

        {/* Oyun listesi - oyunlar varsa göster */}
        {games.length > 0 && (
          <div className="games-list">
            <div className="games-header">
              <h2>Oyun Listesi ({games.length} oyun)</h2>
              <div className="header-actions">
                <button 
                  className="import-button small"
                  onClick={handleFileSelect}
                  disabled={loading}
                >
                  {loading ? '⏳ Yükleniyor...' : '🔄 Yeni Excel Yükle'}
                </button>
                
                {/* 💾 AŞAMA 5: Export/Import Buttons */}
                <button 
                  className="export-button small"
                  onClick={exportData}
                  disabled={games.length === 0}
                  title="Verileri JSON olarak yedekle"
                >
                  💾 Yedekle
                </button>
                
                <button 
                  className="import-button small"
                  onClick={() => document.getElementById('import-input').click()}
                  title="JSON yedek dosyasından geri yükle"
                >
                  📂 Geri Yükle
                </button>
              </div>
            </div>
            
            {/* 🔍 AŞAMA 3: Filter Bar */}
            <div className="filter-bar">
              <div className="filter-section">
                <label>🔍 Ara:</label>
                <input
                  type="text"
                  placeholder="Oyun adı, tür, platform..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="search-input"
                />
              </div>
              
              <div className="filter-section">
                <label>📊 Durum:</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="filter-select"
                >
                  <option value="all">Tümü</option>
                  <option value="playing">Oynuyor</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="backlog">Backlog</option>
                  <option value="dropped">Bırakıldı</option>
                </select>
              </div>
              
              <div className="filter-section">
                <label>⭐ Öncelik:</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="filter-select"
                >
                  <option value="all">Tümü</option>
                  <option value="high">Yüksek</option>
                  <option value="medium">Orta</option>
                  <option value="low">Düşük</option>
                </select>
              </div>
              
              <div className="filter-stats">
                <span className="game-count">
                  {getFilteredGames().length} / {games.length} oyun
                </span>
              </div>
            </div>
            
            <div className="games-grid">
              {getFilteredGames().map(game => (
                <div 
                  key={game.id} 
                  className={`game-card ${editingGame === game.id ? 'editing' : 'clickable'}`}
                  onClick={() => editingGame !== game.id && handleGameClick(game.id)}
                >
                  <div className="game-header">
                    <div className="game-title-section">
                      <h3 className="game-title" onClick={() => handleGameClick(game.id)}>
                        {game.title || 'İsimsiz Oyun'}
                      </h3>
                      {/* 🎮 AŞAMA 3: Status ve Priority Badges */}
                      <div className="game-badges">
                        <StatusBadge status={game.status} />
                        <PriorityBadge priority={game.priority} />
                        <span className="game-type">{game.type || 'normal'}</span>
                      </div>
                    </div>
                    <div className="game-actions">
                      {/* ⏱️ AŞAMA 4: Timer Buttons */}
                      {activeSession?.gameId === game.id ? (
                        <div className="timer-section">
                          <span className="timer-display">{formatTime(sessionTimer)}</span>
                          <button 
                            className="timer-btn stop-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              stopGameSession();
                            }}
                            title="Oyunu durdur"
                          >
                            ⏹️
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="timer-btn play-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            startGameSession(game.id);
                          }}
                          title="Oyunu başlat"
                        >
                          ▶️
                        </button>
                      )}
                      
                      <button 
                        className="edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGame(editingGame === game.id ? null : game.id);
                        }}
                        title="İlerleme düzenle"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                  
                  {/* 🎯 AŞAMA 2: Progress Bar */}
                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="progress-label">İlerleme</span>
                      <span className="progress-value">{game.progress || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${game.progress || 0}%`,
                          backgroundColor: getProgressColor(game.progress || 0, game.status)
                        }}
                      />
                    </div>
                  </div>

                  {/* 🎯 AŞAMA 2: Progress Edit Modu */}
                  {editingGame === game.id ? (
                    <ProgressEditor 
                      game={game}
                      onUpdate={handleProgressUpdate}
                      onCancel={handleCancelEdit}
                    />
                  ) : (
                    <div className="game-info">
                      <div className="info-row">
                        <span className="label">Platform:</span>
                        <span className="value">{game.platform || 'Belirtilmemiş'}</span>
                      </div>
                      
                      <div className="info-row">
                        <span className="label">Tür:</span>
                        <span className="value">{game.genre || 'Bilinmiyor'}</span>
                      </div>
                      
                      {/* ⏱️ AŞAMA 4: Time tracking info */}
                      <div className="info-row">
                        <span className="label">⏱️ Toplam Süre:</span>
                        <span className="value time-value">
                          {game.totalPlayTime ? formatTime(game.totalPlayTime) : '0:00'}
                        </span>
                      </div>
                      
                      {game.lastPlayed && (
                        <div className="info-row">
                          <span className="label">🎮 Son Oynama:</span>
                          <span className="value">
                            {new Date(game.lastPlayed).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      )}
                      
                      {game.sessions && game.sessions.length > 0 && (
                        <div className="info-row">
                          <span className="label">📊 Session Sayısı:</span>
                          <span className="value">{game.sessions.length} oturum</span>
                        </div>
                      )}
                      
                      {game.lastUpdated && (
                        <div className="info-row">
                          <span className="label">Son Güncelleme:</span>
                          <span className="value">
                            {new Date(game.lastUpdated).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* 🏰 AŞAMA 2: Faction Progress Sistemi */}
                  {game.factions && game.factions.length > 0 && (
                    <div className="game-factions">
                      <div className="factions-header">
                        <span className="factions-label">
                          🏰 Fraksiyonlar ({game.factions.length})
                        </span>
                        <span className="factions-summary">
                          {game.factions.filter(f => f.progress === 100).length} / {game.factions.length} tamamlandı
                        </span>
                      </div>
                      
                      <div className="factions-progress-list">
                        {game.factions.map((faction, index) => (
                          <FactionProgressCard
                            key={index}
                            faction={faction}
                            factionIndex={index}
                            gameId={game.id}
                            onUpdate={handleFactionUpdate}
                            isEditing={editingGame === game.id}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Phase Bilgisi */}
      <div className="phase-info">
        <span className="phase-badge">Phase 2: Progress Sistemi</span>
        <span className="status-badge">✨ Aktif</span>
      </div>
    </div>
  );
}

/**
 * 🎮 AŞAMA 3: Status Badge Component
 * Oyun durumunu gösteren badge
 */
function StatusBadge({ status }) {
  const getStatusConfig = (status) => {
    const normalizedStatus = (status || 'Not Started').toLowerCase();
    
    if (normalizedStatus.includes('completed') || normalizedStatus.includes('tamamla')) {
      return { color: '#10b981', icon: '✅', text: 'Tamamlandı' };
    }
    if (normalizedStatus.includes('playing') || normalizedStatus.includes('oynuyor') || normalizedStatus.includes('progress')) {
      return { color: '#3b82f6', icon: '🎮', text: 'Oynuyor' };
    }
    if (normalizedStatus.includes('hold') || normalizedStatus.includes('bekle')) {
      return { color: '#f59e0b', icon: '⏸️', text: 'Beklemede' };
    }
    if (normalizedStatus.includes('dropped') || normalizedStatus.includes('bırak')) {
      return { color: '#ef4444', icon: '❌', text: 'Bırakıldı' };
    }
    // Default: Not Started / Backlog
    return { color: '#6b7280', icon: '📋', text: 'Planlanan' };
  };

  const config = getStatusConfig(status);

  return (
    <span 
      className="status-badge"
      style={{ backgroundColor: config.color }}
      title={`Durum: ${config.text}`}
    >
      {config.icon} {config.text}
    </span>
  );
}

/**
 * ⭐ AŞAMA 3: Priority Badge Component
 * Oyun önceliğini gösteren badge
 */
function PriorityBadge({ priority }) {
  const getPriorityConfig = (priority) => {
    const normalizedPriority = (priority || 'Medium').toLowerCase();
    
    if (normalizedPriority.includes('high') || normalizedPriority.includes('yüksek')) {
      return { color: '#ef4444', icon: '🔥', text: 'Yüksek' };
    }
    if (normalizedPriority.includes('low') || normalizedPriority.includes('düşük')) {
      return { color: '#6b7280', icon: '📝', text: 'Düşük' };
    }
    // Default: Medium
    return { color: '#f59e0b', icon: '⚡', text: 'Orta' };
  };

  const config = getPriorityConfig(priority);

  return (
    <span 
      className="priority-badge"
      style={{ backgroundColor: config.color }}
      title={`Öncelik: ${config.text}`}
    >
      {config.icon} {config.text}
    </span>
  );
}

/**
 * 🏰 AŞAMA 2: Faction Progress Card Component
 * Faction progress'ini gösteren ve düzenleyen kart
 */
function FactionProgressCard({ faction, factionIndex, gameId, onUpdate, isEditing }) {
  const [editMode, setEditMode] = useState(false);
  const [progress, setProgress] = useState(faction.progress || 0);
  const [status, setStatus] = useState(faction.status || 'Not Started');

  const handleSave = () => {
    onUpdate(gameId, factionIndex, progress, status);
    setEditMode(false);
  };

  const handleCancel = () => {
    setProgress(faction.progress || 0);
    setStatus(faction.status || 'Not Started');
    setEditMode(false);
  };

  const getProgressColor = (progress, status) => {
    if (status === 'Completed') return '#10b981';
    if (progress === 0) return '#6b7280';
    if (progress < 30) return '#ef4444';
    if (progress < 70) return '#f59e0b';
    return '#3b82f6';
  };

  return (
    <div className={`faction-progress-card ${editMode ? 'editing' : ''}`}>
      <div className="faction-header">
        <div className="faction-info">
          <span className="faction-name">{faction.name}</span>
          <span 
            className="faction-status"
            style={{ backgroundColor: getProgressColor(faction.progress || 0, faction.status) }}
          >
            {faction.status || 'Not Started'}
          </span>
        </div>
        
        {!editMode && (
          <button 
            className="edit-faction-btn"
            onClick={() => setEditMode(true)}
            disabled={!isEditing}
          >
            ✏️
          </button>
        )}
      </div>

      <div className="faction-progress">
        <div className="progress-header">
          <span className="progress-label">İlerleme</span>
          <span className="progress-value">{faction.progress || 0}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${faction.progress || 0}%`,
              backgroundColor: getProgressColor(faction.progress || 0, faction.status)
            }}
          />
        </div>
      </div>

      {editMode && (
        <div className="faction-editor">
          <div className="editor-row">
            <label>İlerleme (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
              className="progress-input"
            />
          </div>
          
          <div className="editor-row">
            <label>Durum</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="status-select"
            >
              <option value="Not Started">Başlanmadı</option>
              <option value="In Progress">Devam Ediyor</option>
              <option value="Completed">Tamamlandı</option>
              <option value="On Hold">Beklemede</option>
              <option value="Dropped">Bırakıldı</option>
            </select>
          </div>
          
          <div className="editor-actions">
            <button onClick={handleSave} className="save-btn">
              ✅ Kaydet
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              ❌ İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 🎯 AŞAMA 2: Progress Editor Component
 * Oyun progress'ini düzenlemek için inline editor
 */
function ProgressEditor({ game, onUpdate, onCancel }) {
  const [progress, setProgress] = useState(game.progress || 0);
  const [status, setStatus] = useState(game.status || 'Not Started');
  const [priority, setPriority] = useState(game.priority || 'Medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(game.id, progress, status, priority);
  };

  const handleProgressChange = (e) => {
    const newProgress = parseInt(e.target.value) || 0;
    setProgress(newProgress);
    
    // Progress'e göre otomatik status önerisi
    if (newProgress === 0) {
      setStatus('Not Started');
    } else if (newProgress === 100) {
      setStatus('Completed');
    } else if (newProgress > 0 && status === 'Not Started') {
      setStatus('In Progress');
    }
  };

  return (
    <div className="progress-editor">
      <form onSubmit={handleSubmit}>
        <div className="editor-row">
          <label>İlerleme (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className="progress-input"
            autoFocus
          />
        </div>
        
        <div className="editor-row">
          <label>Durum</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="status-select"
          >
            <option value="Not Started">Başlanmadı</option>
            <option value="In Progress">Devam Ediyor</option>
            <option value="Completed">Tamamlandı</option>
            <option value="On Hold">Beklemede</option>
            <option value="Dropped">Bırakıldı</option>
          </select>
        </div>
        
        {/* ⭐ AŞAMA 3: Priority Selection */}
        <div className="editor-row">
          <label>Öncelik</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="priority-select"
          >
            <option value="High">🔥 Yüksek</option>
            <option value="Medium">⚡ Orta</option>
            <option value="Low">📝 Düşük</option>
          </select>
        </div>
        
        <div className="editor-actions">
          <button type="submit" className="save-btn">
            ✅ Kaydet
          </button>
          <button type="button" onClick={onCancel} className="cancel-btn">
            ❌ İptal
          </button>
        </div>
      </form>
    </div>
  );
}

export default GameTracker;