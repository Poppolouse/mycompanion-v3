import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Session.css';

/**
 * Session - Aktif oyun session yönetim sayfası
 * Modern tasarım ile oyun deneyimini takip etme merkezi
 */
function Session() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioRef = useRef(null);

  // Session State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentView, setCurrentView] = useState('session'); // 'session' or 'history'
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [currentGame, setCurrentGame] = useState({
    title: "The Witcher 3: Wild Hunt",
    platform: "PC - Steam",
    genre: "RPG",
    progress: 67,
    coverImage: "https://via.placeholder.com/400x600/667eea/ffffff?text=Game+Cover",
    totalPlayTime: "45h 23m"
  });

  // Media State
  const [screenshots, setScreenshots] = useState([]);
  const [videos, setVideos] = useState([]);
  const [notes, setNotes] = useState('');
  const [currentMood, setCurrentMood] = useState('😊');
  const [sessionRating, setSessionRating] = useState(0);

  // Performance State
  const [performanceData, setPerformanceData] = useState({
    fps: 60,
    cpuUsage: 45,
    gpuUsage: 78,
    ramUsage: 12.5
  });

  // Performance Chart State
  const [performanceTimeRange, setPerformanceTimeRange] = useState('15m'); // '15m', '1h', 'session'
  const [performanceHistory, setPerformanceHistory] = useState({
    '15m': {
      fps: [58, 60, 59, 61, 60, 62, 60],
      cpu: [42, 45, 43, 47, 45, 44, 45],
      gpu: [75, 78, 76, 80, 78, 77, 78],
      ram: [12.2, 12.5, 12.3, 12.7, 12.5, 12.4, 12.5]
    },
    '1h': {
      fps: [59, 60, 58, 61, 60, 59, 62, 60, 61, 59, 60, 60],
      cpu: [43, 45, 44, 46, 45, 43, 47, 45, 44, 43, 45, 45],
      gpu: [76, 78, 77, 79, 78, 76, 80, 78, 79, 77, 78, 78],
      ram: [12.1, 12.5, 12.3, 12.6, 12.5, 12.2, 12.7, 12.5, 12.4, 12.3, 12.5, 12.5]
    },
    'session': {
      fps: [55, 58, 60, 59, 61, 60, 62, 60, 61, 59, 60, 60, 59, 61, 60],
      cpu: [40, 43, 45, 44, 46, 45, 43, 47, 45, 44, 43, 45, 45, 44, 45],
      gpu: [70, 76, 78, 77, 79, 78, 76, 80, 78, 79, 77, 78, 78, 77, 78],
      ram: [11.8, 12.1, 12.5, 12.3, 12.6, 12.5, 12.2, 12.7, 12.5, 12.4, 12.3, 12.5, 12.5, 12.4, 12.5]
    }
  });

  // Audio State
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("Epic Gaming Playlist");

  // View Mode State
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'history'

  // Timer Effect
  useEffect(() => {
    let interval;
    if (isSessionActive && sessionStartTime) {
      interval = setInterval(() => {
        setSessionTime(Date.now() - sessionStartTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, sessionStartTime]);

  // Performance Monitoring Effect
  useEffect(() => {
    const performanceInterval = setInterval(() => {
      setPerformanceData({
        fps: Math.floor(Math.random() * 20) + 50,
        cpuUsage: Math.floor(Math.random() * 30) + 30,
        gpuUsage: Math.floor(Math.random() * 40) + 60,
        ramUsage: Math.random() * 5 + 10
      });
    }, 2000);

    return () => clearInterval(performanceInterval);
  }, []);

  // Session Controls
  const startSession = () => {
    setIsSessionActive(true);
    setSessionStartTime(Date.now());
  };

  const pauseSession = () => {
    setIsSessionActive(false);
  };

  const stopSession = () => {
    setIsSessionActive(false);
    setSessionTime(0);
    setSessionStartTime(null);
  };

  // Media Handlers
  const handleScreenshotUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenshots(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: event.target.result,
          timestamp: new Date().toLocaleString(),
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setVideos(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: event.target.result,
          timestamp: new Date().toLocaleString(),
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Audio Controls
  const toggleAudio = () => {
    if (isAudioPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsAudioPlaying(!isAudioPlaying);
  };

  const shareSession = () => {
    const sessionData = {
      game: currentGame.title,
      time: formatTime(sessionTime),
      mood: currentMood,
      rating: sessionRating
    };
    console.log('Sharing session:', sessionData);
    // Social sharing logic here
  };

  // Utility Functions
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  // Mini Chart Component
  const MiniChart = ({ data, color, max }) => {
    const maxValue = max || Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    
    return (
      <div className="mini-chart">
        <svg width="100%" height="40" viewBox="0 0 100 40">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
              <stop offset="100%" stopColor={color} stopOpacity="0.2"/>
            </linearGradient>
          </defs>
          <path
            d={`M 0,${40 - ((data[0] - minValue) / range) * 35} ${data.map((value, index) => 
              `L ${(index / (data.length - 1)) * 100},${40 - ((value - minValue) / range) * 35}`
            ).join(' ')}`}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d={`M 0,40 L 0,${40 - ((data[0] - minValue) / range) * 35} ${data.map((value, index) => 
              `L ${(index / (data.length - 1)) * 100},${40 - ((value - minValue) / range) * 35}`
            ).join(' ')} L 100,40 Z`}
            fill={`url(#gradient-${color})`}
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="session-page">
      <div className="session-container">
        {/* Header */}
        <header className="page-header">
          <div className="tracker-header">
            <div className="header-content">
              <div className="header-left">
                <h1>🎯 Gaming Session</h1>
                <p>Aktif oyun deneyiminizi takip edin ve kaydedin</p>
              </div>
              
              <div className="header-controls">
                {/* View Switcher */}
                <div className="view-switcher">
                  <button 
                    className={`view-btn ${viewMode === 'active' ? 'active' : ''}`}
                    onClick={() => setViewMode('active')}
                  >
                    🎯 Aktif Session
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'history' ? 'active' : ''}`}
                    onClick={() => setViewMode('history')}
                  >
                    📚 Session History
                  </button>
                </div>

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
              </div>
            </div>
          </div>
        </header>

        {/* Ana İçerik */}
        <main className="session-main">
          {/* Active Session View */}
          {viewMode === 'active' && (
            <div>
              {/* Büyük Game Banner */}
              <section className="hero-game-banner">
                <div className="hero-banner-content">
                  {/* Session Status - Banner'ın sağ üstü */}
                  <div className="banner-session-status">
                    <div className={`status-indicator-small ${isSessionActive ? 'active' : 'paused'}`}></div>
                    <span className="status-text">{isSessionActive ? 'Recording' : 'Paused'}</span>
                  </div>
                  
                  <div className="game-cover-large">
                    <img src={currentGame.coverImage} alt={currentGame.title} />
                  </div>
                  <div className="game-info-overlay">
                    <div className="game-details">
                      <h2 className="game-title">{currentGame.title}</h2>
                      <p className="game-meta">{currentGame.platform} • {currentGame.genre}</p>
                      <div className="progress-section">
                        <div className="progress-bar-large">
                          <div 
                            className="progress-fill-large" 
                            style={{ width: `${currentGame.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text-large">{currentGame.progress}% Tamamlandı</span>
                      </div>
                    </div>
                    
                    {/* Banner Action Buttons */}
                    <div className="banner-actions">
                      <button className="banner-action-btn start-btn" onClick={startSession}>
                        ▶️ BAŞLAT
                      </button>
                      <button className="banner-action-btn finish-btn" onClick={stopSession}>
                        🏁 BITIR
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Session Card */}
              <section className="session-card-large">
                <div className="session-card-content">
                  <div className="session-header">
                     <div className="session-title-group">
                       <h3>🎮 Active Gaming Session</h3>
                     </div>
                     <button className="share-btn" onClick={shareSession}>
                       📤 PAYLAŞ
                     </button>
                   </div>
                  
                  {/* Session Timer & Analytics Mini Cards */}
                   <div className="session-mini-cards-grid">
                       <div className={`mini-card timer-mini-card ${isSessionActive ? 'active' : 'paused'}`}>
                         <div className="mini-card-header">
                           <div className="mini-icon">⏱️</div>
                           <button 
                             className={`pause-btn-mini ${isSessionActive ? 'active' : 'paused'}`}
                             onClick={pauseSession}
                           >
                             {isSessionActive ? '⏸️' : '▶️'}
                           </button>
                         </div>
                         <div className="mini-card-content">
                           <h5>Session Time</h5>
                           <div className="timer-display-mini">{formatTime(sessionTime)}</div>
                           <div className={`timer-status-mini ${isSessionActive ? 'recording' : 'paused'}`}>
                             {isSessionActive ? 'Recording...' : 'Paused'}
                           </div>
                           
                           {/* Detaylı İstatistikler */}
                           <div className="timer-stats">
                             <div className="stat-row">
                               <span className="stat-label">🎯 Günlük Hedef:</span>
                               <span className="stat-value">2h 30m</span>
                             </div>
                             <div className="progress-bar">
                               <div className="progress-fill" style={{width: '67%'}}></div>
                             </div>
                             <div className="stat-row">
                               <span className="stat-label">📊 Ortalama Süre:</span>
                               <span className="stat-value">1h 45m</span>
                             </div>
                             <div className="stat-row">
                               <span className="stat-label">🔥 Streak:</span>
                               <span className="stat-value">7 gün</span>
                             </div>
                             <div className="stat-row">
                               <span className="stat-label">⏰ Başlama Saati:</span>
                               <span className="stat-value">19:30</span>
                             </div>
                             <div className="stat-row">
                               <span className="stat-label">🎮 Bu Hafta:</span>
                               <span className="stat-value">12h 15m</span>
                             </div>
                           </div>
                         </div>
                       </div>
                   
                       <div className="mini-card coming-soon-card">
                         <div className="mini-card-header">
                           <div className="mini-icon">🚀</div>
                           <span className="mini-title">Çok Yakında</span>
                         </div>
                         <div className="mini-card-content">
                           <div className="coming-soon-content">
                             <div className="coming-soon-icon">⏳</div>
                             <h6>Yeni Özellikler</h6>
                             <p>Bu bölümde yakında harika yeni özellikler olacak!</p>
                             <div className="feature-list">
                               <div className="feature-item">🎯 Gelişmiş İstatistikler</div>
                               <div className="feature-item">🏆 Başarım Sistemi</div>
                               <div className="feature-item">📊 Detaylı Analitik</div>
                             </div>
                           </div>
                         </div>
                       </div>

                       <div className="mini-card coming-soon-card">
                         <div className="mini-card-header">
                           <div className="mini-icon">🔮</div>
                           <span className="mini-title">Çok Yakında</span>
                         </div>
                         <div className="mini-card-content">
                           <div className="coming-soon-content">
                             <div className="coming-soon-icon">🎮</div>
                             <h6>Oyun Analizi</h6>
                             <p>Oyun performansınızı detaylı analiz edecek araçlar geliyor!</p>
                             <div className="feature-list">
                               <div className="feature-item">📈 Performans Grafikleri</div>
                               <div className="feature-item">🎯 Hedef Takibi</div>
                               <div className="feature-item">🏅 Skor Karşılaştırma</div>
                             </div>
                           </div>
                         </div>
                       </div>
                   </div>

                  {/* Performance Section */}
                  <div className="performance-section">
                    <div className="performance-header">
                      <h3>📊 System Performance</h3>
                      <div className="time-range-selector">
                        <button 
                          className={`time-btn ${performanceTimeRange === '15m' ? 'active' : ''}`}
                          onClick={() => setPerformanceTimeRange('15m')}
                        >
                          15dk
                        </button>
                        <button 
                          className={`time-btn ${performanceTimeRange === '1h' ? 'active' : ''}`}
                          onClick={() => setPerformanceTimeRange('1h')}
                        >
                          1sa
                        </button>
                        <button 
                          className={`time-btn ${performanceTimeRange === 'session' ? 'active' : ''}`}
                          onClick={() => setPerformanceTimeRange('session')}
                        >
                          Session
                        </button>
                      </div>
                    </div>
                    <div className="performance-grid-large">
                      <div className="perf-card-large fps-card">
                        <div className="perf-card-header">
                          <div className="perf-icon">🎮</div>
                          <div className="perf-trend">
                            <span className="trend-indicator positive">↗️ +2</span>
                          </div>
                        </div>
                        <div className="perf-content">
                          <h4>FPS</h4>
                          <div className="perf-value-large">{performanceData.fps}</div>
                          <div className="perf-status">Frames per Second</div>
                          <MiniChart 
                            data={performanceHistory[performanceTimeRange].fps} 
                            color="#22c55e"
                            max={120}
                          />
                        </div>
                      </div>
                      <div className="perf-card-large cpu-card">
                        <div className="perf-card-header">
                          <div className="perf-icon">🔧</div>
                          <div className="perf-trend">
                            <span className="trend-indicator neutral">→ 0</span>
                          </div>
                        </div>
                        <div className="perf-content">
                          <h4>CPU Usage</h4>
                          <div className="perf-value-large">{performanceData.cpuUsage}%</div>
                          <div className="perf-status">Processor Load</div>
                          <MiniChart 
                            data={performanceHistory[performanceTimeRange].cpu} 
                            color="#3b82f6"
                            max={100}
                          />
                        </div>
                      </div>
                      <div className="perf-card-large gpu-card">
                        <div className="perf-card-header">
                          <div className="perf-icon">🎨</div>
                          <div className="perf-trend">
                            <span className="trend-indicator negative">↘️ -3</span>
                          </div>
                        </div>
                        <div className="perf-content">
                          <h4>GPU Usage</h4>
                          <div className="perf-value-large">{performanceData.gpuUsage}%</div>
                          <div className="perf-status">Graphics Load</div>
                          <MiniChart 
                            data={performanceHistory[performanceTimeRange].gpu} 
                            color="#8b5cf6"
                            max={100}
                          />
                        </div>
                      </div>
                      <div className="perf-card-large ram-card">
                        <div className="perf-card-header">
                          <div className="perf-icon">💾</div>
                          <div className="perf-trend">
                            <span className="trend-indicator positive">↗️ +0.2</span>
                          </div>
                        </div>
                        <div className="perf-content">
                          <h4>RAM Usage</h4>
                          <div className="perf-value-large">{performanceData.ramUsage.toFixed(1)}GB</div>
                          <div className="perf-status">Memory Usage</div>
                          <MiniChart 
                            data={performanceHistory[performanceTimeRange].ram} 
                            color="#f59e0b"
                            max={32}
                          />
                        </div>
                      </div>
                    </div>
                   </div>

                   {/* Content Grid */}
                   <div className="content-grid">
                     {/* Screenshots Section */}
                     <section className="media-section screenshots-section">
                       <div className="media-header">
                         <h3>📸 Screenshots</h3>
                         <button 
                           className="upload-btn screenshot"
                           onClick={() => fileInputRef.current?.click()}
                         >
                           📸 Ekle
                         </button>
                       </div>
                       
                       <input
                         ref={fileInputRef}
                         type="file"
                         accept="image/*"
                         multiple
                         onChange={handleScreenshotUpload}
                         style={{ display: 'none' }}
                       />

                       <div className="media-gallery horizontal-scroll">
                         {screenshots.length === 0 ? (
                           <div className="empty-state">
                             <div className="empty-icon">📸</div>
                             <p>Henüz screenshot yok</p>
                             <span>İlk screenshot'ınızı ekleyin!</span>
                           </div>
                         ) : (
                           screenshots.map(screenshot => (
                             <div key={screenshot.id} className="media-item screenshot">
                               <img src={screenshot.url} alt="Screenshot" />
                               <div className="media-info">
                                 <span>{screenshot.timestamp}</span>
                               </div>
                             </div>
                           ))
                         )}
                       </div>
                     </section>

                     {/* Video Clips Section */}
                     <section className="media-section video-clips-section">
                       <div className="media-header">
                         <h3>🎬 Video Clips</h3>
                         <button 
                           className="upload-btn video"
                           onClick={() => videoInputRef.current?.click()}
                         >
                           🎬 Ekle
                         </button>
                       </div>
                       
                       <input
                         ref={videoInputRef}
                         type="file"
                         accept="video/*"
                         multiple
                         onChange={handleVideoUpload}
                         style={{ display: 'none' }}
                       />

                       <div className="media-gallery horizontal-scroll">
                         {videos.length === 0 ? (
                           <div className="empty-state">
                             <div className="empty-icon">🎬</div>
                             <p>Henüz video yok</p>
                             <span>İlk video klibinizi ekleyin!</span>
                           </div>
                         ) : (
                           videos.map(video => (
                             <div key={video.id} className="media-item video">
                               <video src={video.url} controls />
                               <div className="media-info">
                                 <span>{video.timestamp}</span>
                                 <span>{video.size}</span>
                               </div>
                             </div>
                           ))
                         )}
                       </div>
                     </section>
                   </div>
                 </div>
               </section>
             </div>
           )}
          
          {/* History View */}
          {viewMode === 'history' && (
            <div className="history-view">
              <div className="history-header">
                <h2>📊 Session History</h2>
                <div className="history-stats">
                  <div className="stat-item">
                    <span className="stat-value">47</span>
                    <span className="stat-label">Total Sessions</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">156h</span>
                    <span className="stat-label">Total Time</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">4.2</span>
                    <span className="stat-label">Avg Rating</span>
                  </div>
                </div>
              </div>

              <div className="history-filters">
                <button className="filter-btn active">All Games</button>
                <button className="filter-btn">This Week</button>
                <button className="filter-btn">This Month</button>
                <button className="filter-btn">Top Rated</button>
              </div>

              <div className="history-grid">
                {[
                  {
                    id: 1,
                    game: 'Cyberpunk 2077',
                    date: '2024-01-15',
                    duration: '2h 45m',
                    rating: 5,
                    mood: '😍',
                    screenshots: 12,
                    notes: 'Amazing graphics and storyline!'
                  },
                  {
                    id: 2,
                    game: 'The Witcher 3',
                    date: '2024-01-14',
                    duration: '4h 20m',
                    rating: 4,
                    mood: '😊',
                    screenshots: 8,
                    notes: 'Great RPG experience, loved the quests.'
                  },
                  {
                    id: 3,
                    game: 'Red Dead Redemption 2',
                    date: '2024-01-13',
                    duration: '3h 15m',
                    rating: 5,
                    mood: '😍',
                    screenshots: 15,
                    notes: 'Incredible open world, spent hours just exploring.'
                  },
                  {
                    id: 4,
                    game: 'Elden Ring',
                    date: '2024-01-12',
                    duration: '1h 30m',
                    rating: 3,
                    mood: '😤',
                    screenshots: 3,
                    notes: 'Challenging boss fights, died many times.'
                  }
                ].map(session => (
                  <div key={session.id} className="history-card">
                    <div className="history-card-header">
                      <h3>{session.game}</h3>
                      <div className="session-mood">{session.mood}</div>
                    </div>
                    
                    <div className="history-card-info">
                      <div className="info-row">
                        <span>📅 {session.date}</span>
                        <span>⏱️ {session.duration}</span>
                      </div>
                      
                      <div className="info-row">
                        <div className="rating-display">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < session.rating ? 'star filled' : 'star'}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span>📸 {session.screenshots}</span>
                      </div>
                      
                      {session.notes && (
                        <div className="session-notes-preview">
                          <p>"{session.notes}"</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="history-card-actions">
                      <button className="action-btn">View Details</button>
                      <button className="action-btn">Export</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} loop>
          <source src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" type="audio/wav" />
        </audio>
      </div>
    </div>
  );
}

export default Session;