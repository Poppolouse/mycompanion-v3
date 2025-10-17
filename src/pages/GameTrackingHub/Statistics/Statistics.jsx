import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../../../components/ProfileDropdown';
import './Statistics.css';

function Statistics() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // all, week, month, year

  // Oyunları localStorage'dan yükle
  useEffect(() => {
    const savedGames = localStorage.getItem('gameTracker_games');
    if (savedGames) {
      try {
        const gameList = JSON.parse(savedGames);
        setGames(gameList);
      } catch (err) {
        console.error('❌ LocalStorage yükleme hatası:', err);
      }
    }
  }, []);

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

  // Tarih filtresi uygula
  const getFilteredSessions = () => {
    const now = new Date();
    let startDate = new Date(0); // Başlangıç tarihi (tüm zamanlar)
    
    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }
    
    return games.flatMap(game => 
      (game.sessions || [])
        .filter(session => new Date(session.startTime) >= startDate)
        .map(session => ({ ...session, gameTitle: game.title, gameId: game.id }))
    );
  };

  // Genel istatistikler hesapla
  const calculateGeneralStats = () => {
    const filteredSessions = getFilteredSessions();
    const totalPlayTime = filteredSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalSessions = filteredSessions.length;
    const uniqueGames = new Set(filteredSessions.map(s => s.gameId)).size;
    const avgSessionTime = totalSessions > 0 ? totalPlayTime / totalSessions : 0;
    
    // Status istatistikleri
    const statusStats = games.reduce((acc, game) => {
      const status = game.status || 'Not Started';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    // Priority istatistikleri
    const priorityStats = games.reduce((acc, game) => {
      const priority = game.priority || 'Medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalPlayTime,
      totalSessions,
      uniqueGames,
      avgSessionTime,
      totalGames: games.length,
      statusStats,
      priorityStats
    };
  };

  // En çok oynanan oyunlar
  const getTopGames = (limit = 5) => {
    return games
      .filter(game => game.totalPlayTime > 0)
      .sort((a, b) => (b.totalPlayTime || 0) - (a.totalPlayTime || 0))
      .slice(0, limit)
      .map(game => ({
        ...game,
        sessionCount: (game.sessions || []).length
      }));
  };

  // Günlük aktivite (son 7 gün)
  const getDailyActivity = () => {
    const last7Days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const daysSessions = games.flatMap(game => 
        (game.sessions || []).filter(session => 
          session.date === dateStr
        )
      );
      
      const totalTime = daysSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      
      last7Days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
        totalTime,
        sessionCount: daysSessions.length
      });
    }
    
    return last7Days;
  };

  // Platform istatistikleri
  const getPlatformStats = () => {
    const platformStats = games.reduce((acc, game) => {
      const platform = game.platform || 'Bilinmiyor';
      if (!acc[platform]) {
        acc[platform] = { count: 0, totalTime: 0 };
      }
      acc[platform].count++;
      acc[platform].totalTime += game.totalPlayTime || 0;
      return acc;
    }, {});
    
    return Object.entries(platformStats)
      .map(([platform, stats]) => ({ platform, ...stats }))
      .sort((a, b) => b.totalTime - a.totalTime);
  };

  const stats = calculateGeneralStats();
  const topGames = getTopGames();
  const dailyActivity = getDailyActivity();
  const platformStats = getPlatformStats();

  return (
    <div className="statistics-page">
      {/* Header */}
      <header className="tracker-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📊 Oyun İstatistikleri</h1>
            <p>Oyun verilerinizi analiz edin ve ilerlemenizi takip edin</p>
          </div>
          
          <div className="header-controls">
            {/* Navigation Buttons */}
            <div className="navigation-buttons">
              <button 
                className="nav-btn home-btn"
                onClick={() => navigate('/')}
                title="Ana Sayfaya Dön"
              >
                🏠 Ana Sayfa
              </button>
              <button 
                className="nav-btn hub-btn"
                onClick={() => navigate('/game-tracking-hub')}
                title="Oyun Hub'ına Dön"
              >
                🎮 Oyun Hub
              </button>
            </div>

            {/* Period Selector */}
            <div className="period-selector">
              <button 
                className={selectedPeriod === 'all' ? 'active' : ''}
                onClick={() => setSelectedPeriod('all')}
              >
                Tüm Zamanlar
              </button>
              <button 
                className={selectedPeriod === 'week' ? 'active' : ''}
                onClick={() => setSelectedPeriod('week')}
              >
                Son 7 Gün
              </button>
              <button 
                className={selectedPeriod === 'month' ? 'active' : ''}
                onClick={() => setSelectedPeriod('month')}
              >
                Son 30 Gün
              </button>
              <button 
                className={selectedPeriod === 'year' ? 'active' : ''}
                onClick={() => setSelectedPeriod('year')}
              >
                Son 1 Yıl
              </button>
            </div>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        {/* Genel İstatistikler */}
        <div className="stats-card overview-card">
          <h2>🎯 Genel Bakış</h2>
          <div className="stats-overview">
            <div className="stat-item">
              <span className="stat-value">{stats.totalGames}</span>
              <span className="stat-label">Toplam Oyun</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatTime(stats.totalPlayTime)}</span>
              <span className="stat-label">Toplam Süre</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.totalSessions}</span>
              <span className="stat-label">Toplam Session</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.uniqueGames}</span>
              <span className="stat-label">Oynanan Oyun</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatTime(stats.avgSessionTime)}</span>
              <span className="stat-label">Ortalama Session</span>
            </div>
          </div>
        </div>

        {/* Status Dağılımı */}
        <div className="stats-card">
          <h2>📊 Durum Dağılımı</h2>
          <div className="status-distribution">
            {Object.entries(stats.statusStats).map(([status, count]) => (
              <div key={status} className="status-item">
                <span className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>
                  {status}
                </span>
                <span className="status-count">{count} oyun</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Dağılımı */}
        <div className="stats-card">
          <h2>⭐ Öncelik Dağılımı</h2>
          <div className="priority-distribution">
            {Object.entries(stats.priorityStats).map(([priority, count]) => (
              <div key={priority} className="priority-item">
                <span className={`priority-badge ${priority.toLowerCase()}`}>
                  {priority}
                </span>
                <span className="priority-count">{count} oyun</span>
              </div>
            ))}
          </div>
        </div>

        {/* En Çok Oynanan Oyunlar */}
        <div className="stats-card top-games-card">
          <h2>🏆 En Çok Oynanan Oyunlar</h2>
          <div className="top-games-list">
            {topGames.map((game, index) => (
              <div key={game.id} className="top-game-item">
                <span className="game-rank">#{index + 1}</span>
                <div className="game-info">
                  <span className="game-title">{game.title}</span>
                  <span className="game-stats">
                    ⏱️ {formatTime(game.totalPlayTime)} • 
                    📊 {game.sessionCount} session • 
                    🎯 {game.progress || 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Günlük Aktivite */}
        <div className="stats-card daily-activity-card">
          <h2>📅 Son 7 Gün Aktivitesi</h2>
          <div className="daily-activity">
            {dailyActivity.map((day, index) => (
              <div key={index} className="day-item">
                <span className="day-name">{day.dayName}</span>
                <div className="day-bar">
                  <div 
                    className="day-fill"
                    style={{ 
                      height: `${Math.max(5, (day.totalTime / Math.max(...dailyActivity.map(d => d.totalTime))) * 100)}%` 
                    }}
                  />
                </div>
                <span className="day-time">{formatTime(day.totalTime)}</span>
                <span className="day-sessions">{day.sessionCount} session</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform İstatistikleri */}
        <div className="stats-card platform-stats-card">
          <h2>🎮 Platform Dağılımı</h2>
          <div className="platform-stats">
            {platformStats.map((platform, index) => (
              <div key={index} className="platform-item">
                <div className="platform-info">
                  <span className="platform-name">{platform.platform}</span>
                  <span className="platform-count">{platform.count} oyun</span>
                </div>
                <div className="platform-time">
                  <span className="time-value">{formatTime(platform.totalTime)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;