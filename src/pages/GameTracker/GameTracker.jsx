import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { readExcelFile, parseGameList } from '../../utils/excelUtils';
import './GameTracker.css';

/**
 * 🎮 Game Library - Oyun Kütüphanesi
 * Basit oyun listesi görüntüleme sayfası
 */
function GameTracker() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  // 🔍 Filter states
  const [filters, setFilters] = useState({
    search: '',
    genre: 'all',
    platform: 'all',
    developer: 'all',
    yearFrom: '',
    yearTo: '',
    sortBy: 'name', // name, year, genre, platform
    sortOrder: 'asc' // asc, desc
  });

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

  // Oyun Hub'ına dönüş
  const handleGoToHub = () => {
    navigate('/game-tracking-hub');
  };

  // Excel dosyası yükleme
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📁 Dosya yükleniyor:', file.name);
      const data = await readExcelFile(file);
      const gameList = parseGameList(data);
      
      setGames(gameList);
      saveGamesToStorage(gameList);
      
      console.log('✅ Başarıyla yüklendi:', gameList.length, 'oyun');
    } catch (err) {
      console.error('❌ Dosya yükleme hatası:', err);
      setError('Dosya yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
      // Input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Filtreleme fonksiyonu
  const getFilteredGames = () => {
    let filtered = games.filter(game => {
      const matchesSearch = (game.name || '').toLowerCase().includes(filters.search.toLowerCase());
      const matchesGenre = filters.genre === 'all' || (game.genre || '') === filters.genre;
      const matchesPlatform = filters.platform === 'all' || (game.platform || '') === filters.platform;
      const matchesDeveloper = filters.developer === 'all' || (game.developer || '') === filters.developer;
      
      // Yıl filtreleme
      let matchesYear = true;
      if (filters.yearFrom && game.year) {
        matchesYear = matchesYear && parseInt(game.year) >= parseInt(filters.yearFrom);
      }
      if (filters.yearTo && game.year) {
        matchesYear = matchesYear && parseInt(game.year) <= parseInt(filters.yearTo);
      }
      
      return matchesSearch && matchesGenre && matchesPlatform && matchesDeveloper && matchesYear;
    });

    // Sıralama
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'year':
          aValue = parseInt(a.year) || 0;
          bValue = parseInt(b.year) || 0;
          break;
        case 'genre':
          aValue = a.genre || '';
          bValue = b.genre || '';
          break;
        case 'platform':
          aValue = a.platform || '';
          bValue = b.platform || '';
          break;
        case 'developer':
          aValue = a.developer || '';
          bValue = b.developer || '';
          break;
        default: // name
          aValue = a.name || '';
          bValue = b.name || '';
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (filters.sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    return filtered;
  };

  // Benzersiz türleri al
  const getUniqueGenres = () => {
    const genres = [...new Set(games.map(game => game.genre).filter(Boolean))];
    return genres.sort();
  };

  // Benzersiz platformları al
  const getUniquePlatforms = () => {
    const platforms = [...new Set(games.map(game => game.platform).filter(Boolean))];
    return platforms.sort();
  };

  // Benzersiz geliştiricileri al
  const getUniqueDevelopers = () => {
    const developers = [...new Set(games.map(game => game.developer).filter(Boolean))];
    return developers.sort();
  };

  // Yıl aralığını al
  const getYearRange = () => {
    const years = games.map(game => parseInt(game.year)).filter(year => !isNaN(year));
    if (years.length === 0) return { min: new Date().getFullYear() - 50, max: new Date().getFullYear() };
    return { min: Math.min(...years), max: Math.max(...years) };
  };

  const filteredGames = getFilteredGames();

  return (
    <div className="game-tracker">
      {/* Header */}
      <header className="game-tracker__header">
        <div className="header-content">
          <div className="header-buttons">
            <button 
              className="home-button"
              onClick={handleGoHome}
              title="Ana Sayfaya Dön"
            >
              🏠
            </button>
            <button 
              className="hub-button"
              onClick={handleGoToHub}
              title="Oyun Hub'ına Dön"
            >
              🎮 Hub
            </button>
          </div>
          
          <div className="header-title">
            <h1>🎮 Oyun Kütüphanesi</h1>
            <p>Oyun koleksiyonunuzu görüntüleyin ve yönetin</p>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="game-tracker__main">
        {/* Kontrol Paneli */}
        <div className="control-panel">
          <div className="upload-section">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
            />
            <button 
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              {loading ? '📤 Yükleniyor...' : '📁 Excel Dosyası Yükle'}
            </button>
          </div>

          {/* Filtreler */}
          {games.length > 0 && (
            <div className="filters-section">
              {/* Temel Filtreler */}
              <div className="filter-row">
                <div className="filter-group">
                  <label>🔍 Arama:</label>
                  <input
                    type="text"
                    placeholder="Oyun adı ara..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="search-input"
                  />
                </div>

                <div className="filter-group">
                  <label>🎯 Tür:</label>
                  <select
                    value={filters.genre}
                    onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
                    className="filter-select"
                  >
                    <option value="all">Tümü</option>
                    {getUniqueGenres().map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>🎮 Platform:</label>
                  <select
                    value={filters.platform}
                    onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
                    className="filter-select"
                  >
                    <option value="all">Tümü</option>
                    {getUniquePlatforms().map(platform => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>👨‍💻 Geliştirici:</label>
                  <select
                    value={filters.developer}
                    onChange={(e) => setFilters(prev => ({ ...prev, developer: e.target.value }))}
                    className="filter-select"
                  >
                    <option value="all">Tümü</option>
                    {getUniqueDevelopers().map(developer => (
                      <option key={developer} value={developer}>{developer}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gelişmiş Filtreler */}
              <div className="filter-row advanced-filters">
                <div className="filter-group year-range">
                  <label>📅 Yıl Aralığı:</label>
                  <div className="year-inputs">
                    <input
                      type="number"
                      placeholder={`Min (${getYearRange().min})`}
                      value={filters.yearFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, yearFrom: e.target.value }))}
                      className="year-input"
                      min={getYearRange().min}
                      max={getYearRange().max}
                    />
                    <span className="year-separator">-</span>
                    <input
                      type="number"
                      placeholder={`Max (${getYearRange().max})`}
                      value={filters.yearTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, yearTo: e.target.value }))}
                      className="year-input"
                      min={getYearRange().min}
                      max={getYearRange().max}
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label>📊 Sırala:</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="filter-select"
                  >
                    <option value="name">İsim</option>
                    <option value="year">Yıl</option>
                    <option value="genre">Tür</option>
                    <option value="platform">Platform</option>
                    <option value="developer">Geliştirici</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>🔄 Sıra:</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                    className="filter-select"
                  >
                    <option value="asc">A-Z / Eskiden Yeniye</option>
                    <option value="desc">Z-A / Yeniden Eskiye</option>
                  </select>
                </div>

                <div className="filter-group">
                  <button
                    onClick={() => setFilters({
                      search: '',
                      genre: 'all',
                      platform: 'all',
                      developer: 'all',
                      yearFrom: '',
                      yearTo: '',
                      sortBy: 'name',
                      sortOrder: 'asc'
                    })}
                    className="clear-filters-button"
                  >
                    🗑️ Filtreleri Temizle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        {/* Oyun Listesi */}
        <div className="games-section">
          {games.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>Henüz oyun yüklenmedi</h3>
              <p>Excel dosyası yükleyerek oyun kütüphanenizi oluşturun</p>
            </div>
          ) : (
            <>
              <div className="games-header">
                <h2>📋 Oyun Listesi</h2>
                <div className="games-count">
                  {filteredGames.length} / {games.length} oyun
                </div>
              </div>

              <div className="games-grid">
                {filteredGames.map((game, index) => (
                  <div 
                    key={index} 
                    className="game-card clickable"
                    onClick={() => navigate(`/game-detail/${game.id || index}`)}
                  >
                    <div className="game-info">
                      <h3 className="game-name">{game.name}</h3>
                      {game.genre && (
                        <div className="game-genre">🎯 {game.genre}</div>
                      )}
                      {game.platform && (
                        <div className="game-platform">🎮 {game.platform}</div>
                      )}
                      {game.year && (
                        <div className="game-year">📅 {game.year}</div>
                      )}
                      {game.developer && (
                        <div className="game-developer">👨‍💻 {game.developer}</div>
                      )}
                    </div>
                    <div className="game-card-overlay">
                      <span className="view-details">📋 Detayları Görüntüle</span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredGames.length === 0 && (
                <div className="no-results">
                  <div className="no-results-icon">🔍</div>
                  <h3>Arama sonucu bulunamadı</h3>
                  <p>Farklı filtreler deneyebilirsiniz</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default GameTracker;