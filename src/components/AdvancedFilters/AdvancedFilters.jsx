import { useState, useEffect } from 'react';
import './AdvancedFilters.css';

/**
 * AdvancedFilters - Gelişmiş filtreleme sistemi
 * Visual tags, preset filters, multi-select özellikleri
 */
function AdvancedFilters({ 
  games = [], 
  onFiltersChange,
  initialFilters = {},
  showPresets = true,
  showStats = true 
}) {
  // State'ler
  const [filters, setFilters] = useState({
    status: [],
    platform: [],
    genre: [],
    developer: [],
    rating: { min: 0, max: 10 },
    progress: { min: 0, max: 100 },
    releaseYear: { min: 1980, max: new Date().getFullYear() },
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [presetFilters, setPresetFilters] = useState([]);
  const [customPresets, setCustomPresets] = useState([]);

  // Component mount olduğunda preset'leri yükle
  useEffect(() => {
    loadPresetFilters();
    loadCustomPresets();
  }, []);

  // Filters değiştiğinde parent'a bildir
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  // Preset filtreleri yükle
  const loadPresetFilters = () => {
    const presets = [
      {
        id: 'currently-playing',
        name: '🎮 Şu An Oynuyor',
        description: 'Aktif olarak oynadığınız oyunlar',
        filters: { status: ['playing'] },
        color: '#10b981'
      },
      {
        id: 'completed',
        name: '✅ Tamamlananlar',
        description: '%100 tamamlanmış oyunlar',
        filters: { status: ['completed'] },
        color: '#667eea'
      },
      {
        id: 'backlog',
        name: '📚 Backlog',
        description: 'Henüz başlanmamış oyunlar',
        filters: { status: ['not-started'] },
        color: '#f59e0b'
      },
      {
        id: 'high-rated',
        name: '⭐ Yüksek Puanlı',
        description: '8+ puan alan oyunlar',
        filters: { rating: { min: 8, max: 10 } },
        color: '#8b5cf6'
      },
      {
        id: 'recent',
        name: '🆕 Son Çıkanlar',
        description: 'Son 2 yılda çıkan oyunlar',
        filters: { releaseYear: { min: new Date().getFullYear() - 2, max: new Date().getFullYear() } },
        color: '#06b6d4'
      },
      {
        id: 'pc-games',
        name: '🖥️ PC Oyunları',
        description: 'PC platformundaki oyunlar',
        filters: { platform: ['PC', 'Steam', 'Epic Games'] },
        color: '#3b82f6'
      },
      {
        id: 'nearly-done',
        name: '🏁 Neredeyse Bitti',
        description: '%80+ ilerleme kaydedilen oyunlar',
        filters: { progress: { min: 80, max: 100 } },
        color: '#10b981'
      }
    ];
    setPresetFilters(presets);
  };

  // Custom preset'leri localStorage'dan yükle
  const loadCustomPresets = () => {
    const saved = localStorage.getItem('gameTracker_customPresets');
    if (saved) {
      try {
        setCustomPresets(JSON.parse(saved));
      } catch (err) {
        console.error('Custom preset\'ler yüklenemedi:', err);
      }
    }
  };

  // Custom preset'leri kaydet
  const saveCustomPresets = (presets) => {
    localStorage.setItem('gameTracker_customPresets', JSON.stringify(presets));
    setCustomPresets(presets);
  };

  // Benzersiz değerleri getir
  const getUniqueValues = (field) => {
    const values = games.map(game => {
      switch(field) {
        case 'status':
          return getGameStatus(game);
        case 'platform':
          return game.platform || game.sistem;
        case 'genre':
          return game.genre || game.tur;
        case 'developer':
          return game.developer || game.gelistirici;
        default:
          return game[field];
      }
    }).filter(Boolean);
    return [...new Set(values)].sort();
  };

  // Oyun durumu belirleme
  const getGameStatus = (game) => {
    if (game.progress >= 100 || game.status === 'completed') return 'completed';
    if (game.status === 'playing' || game.progress > 0) return 'playing';
    if (game.status === 'paused') return 'paused';
    if (game.status === 'dropped') return 'dropped';
    if (game.status === 'planning') return 'planning';
    if (game.status === 'wishlist') return 'wishlist';
    return 'not-started';
  };

  // Durum etiketleri
  const getStatusLabel = (status) => {
    const labels = {
      'playing': '▶️ Oynuyor',
      'completed': '✅ Tamamlandı',
      'paused': '⏸️ Duraklatıldı',
      'dropped': '❌ Bırakıldı',
      'planning': '📋 Planlanıyor',
      'wishlist': '⭐ İstek Listesi',
      'not-started': '⭕ Başlanmadı'
    };
    return labels[status] || status;
  };

  // Multi-select toggle
  const toggleMultiSelect = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  // Range filter güncelle
  const updateRangeFilter = (field, type, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [type]: parseInt(value)
      }
    }));
  };

  // Preset uygula
  const applyPreset = (preset) => {
    setFilters(prev => ({
      ...prev,
      ...preset.filters
    }));
  };

  // Filtreleri temizle
  const clearAllFilters = () => {
    setFilters({
      status: [],
      platform: [],
      genre: [],
      developer: [],
      rating: { min: 0, max: 10 },
      progress: { min: 0, max: 100 },
      releaseYear: { min: 1980, max: new Date().getFullYear() }
    });
  };

  // Custom preset kaydet
  const saveCurrentAsPreset = () => {
    const name = prompt('Preset adı:');
    if (name) {
      const newPreset = {
        id: Date.now().toString(),
        name: `💾 ${name}`,
        description: 'Özel filtre kombinasyonu',
        filters: { ...filters },
        color: 'var(--accent)',
        custom: true
      };
      saveCustomPresets([...customPresets, newPreset]);
    }
  };

  // Custom preset sil
  const deleteCustomPreset = (presetId) => {
    if (window.confirm('Bu preset\'i silmek istediğinizden emin misiniz?')) {
      const updated = customPresets.filter(p => p.id !== presetId);
      saveCustomPresets(updated);
    }
  };

  // Aktif filtre sayısı
  const getActiveFilterCount = () => {
    let count = 0;
    count += filters.status.length;
    count += filters.platform.length;
    count += filters.genre.length;
    count += filters.developer.length;
    if (filters.rating.min > 0 || filters.rating.max < 10) count++;
    if (filters.progress.min > 0 || filters.progress.max < 100) count++;
    if (filters.releaseYear.min > 1980 || filters.releaseYear.max < new Date().getFullYear()) count++;
    return count;
  };

  // Filtrelenmiş oyun sayısı
  const getFilteredGameCount = () => {
    return games.filter(game => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(getGameStatus(game))) {
        return false;
      }
      
      // Platform filter
      if (filters.platform.length > 0) {
        const gamePlatform = game.platform || game.sistem;
        if (!filters.platform.includes(gamePlatform)) return false;
      }
      
      // Genre filter
      if (filters.genre.length > 0) {
        const gameGenre = game.genre || game.tur;
        if (!filters.genre.includes(gameGenre)) return false;
      }
      
      // Developer filter
      if (filters.developer.length > 0) {
        const gameDeveloper = game.developer || game.gelistirici;
        if (!filters.developer.includes(gameDeveloper)) return false;
      }
      
      // Rating filter
      const gameRating = game.rating || 0;
      if (gameRating < filters.rating.min || gameRating > filters.rating.max) {
        return false;
      }
      
      // Progress filter
      const gameProgress = game.progress || 0;
      if (gameProgress < filters.progress.min || gameProgress > filters.progress.max) {
        return false;
      }
      
      // Release year filter
      const gameYear = game.releaseYear || new Date().getFullYear();
      if (gameYear < filters.releaseYear.min || gameYear > filters.releaseYear.max) {
        return false;
      }
      
      return true;
    }).length;
  };

  return (
    <div className="advanced-filters">
      {/* Header */}
      <div className="advanced-filters__header">
        <div className="advanced-filters__title">
          <span className="advanced-filters__icon">🎛️</span>
          <h3>Gelişmiş Filtreler</h3>
          {getActiveFilterCount() > 0 && (
            <span className="advanced-filters__badge">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        
        <div className="advanced-filters__actions">
          <button 
            className="advanced-filters__toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '🔼 Gizle' : '🔽 Göster'}
          </button>
          
          {getActiveFilterCount() > 0 && (
            <button 
              className="advanced-filters__clear"
              onClick={clearAllFilters}
            >
              🗑️ Temizle
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {showStats && (
        <div className="advanced-filters__stats">
          <span className="advanced-filters__stat">
            📊 {getFilteredGameCount()} / {games.length} oyun
          </span>
          <span className="advanced-filters__stat">
            🎯 {getActiveFilterCount()} aktif filtre
          </span>
        </div>
      )}

      {/* Preset Filters */}
      {showPresets && (
        <div className="advanced-filters__presets">
          <h4>⚡ Hızlı Filtreler</h4>
          <div className="advanced-filters__preset-grid">
            {presetFilters.map(preset => (
              <button
                key={preset.id}
                className="advanced-filters__preset"
                onClick={() => applyPreset(preset)}
                style={{ '--preset-color': preset.color }}
                title={preset.description}
              >
                {preset.name}
              </button>
            ))}
          </div>
          
          {/* Custom Presets */}
          {customPresets.length > 0 && (
            <div className="advanced-filters__custom-presets">
              <h5>💾 Özel Filtreler</h5>
              <div className="advanced-filters__preset-grid">
                {customPresets.map(preset => (
                  <div key={preset.id} className="advanced-filters__custom-preset">
                    <button
                      className="advanced-filters__preset"
                      onClick={() => applyPreset(preset)}
                      style={{ '--preset-color': preset.color }}
                    >
                      {preset.name}
                    </button>
                    <button
                      className="advanced-filters__delete-preset"
                      onClick={() => deleteCustomPreset(preset.id)}
                      title="Sil"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {getActiveFilterCount() > 0 && (
            <button 
              className="advanced-filters__save-preset"
              onClick={saveCurrentAsPreset}
            >
              💾 Mevcut Filtreyi Kaydet
            </button>
          )}
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="advanced-filters__content">
          {/* Status Filters */}
          <div className="advanced-filters__section">
            <h4>🎮 Oyun Durumu</h4>
            <div className="advanced-filters__tags">
              {getUniqueValues('status').map(status => (
                <button
                  key={status}
                  className={`advanced-filters__tag ${
                    filters.status.includes(status) ? 'advanced-filters__tag--active' : ''
                  }`}
                  onClick={() => toggleMultiSelect('status', status)}
                >
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Filters */}
          <div className="advanced-filters__section">
            <h4>🖥️ Platform</h4>
            <div className="advanced-filters__tags">
              {getUniqueValues('platform').map(platform => (
                <button
                  key={platform}
                  className={`advanced-filters__tag ${
                    filters.platform.includes(platform) ? 'advanced-filters__tag--active' : ''
                  }`}
                  onClick={() => toggleMultiSelect('platform', platform)}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Genre Filters */}
          <div className="advanced-filters__section">
            <h4>🏷️ Tür</h4>
            <div className="advanced-filters__tags">
              {getUniqueValues('genre').map(genre => (
                <button
                  key={genre}
                  className={`advanced-filters__tag ${
                    filters.genre.includes(genre) ? 'advanced-filters__tag--active' : ''
                  }`}
                  onClick={() => toggleMultiSelect('genre', genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Developer Filters */}
          <div className="advanced-filters__section">
            <h4>👨‍💻 Geliştirici</h4>
            <div className="advanced-filters__tags">
              {getUniqueValues('developer').slice(0, 10).map(developer => (
                <button
                  key={developer}
                  className={`advanced-filters__tag ${
                    filters.developer.includes(developer) ? 'advanced-filters__tag--active' : ''
                  }`}
                  onClick={() => toggleMultiSelect('developer', developer)}
                >
                  {developer}
                </button>
              ))}
            </div>
          </div>

          {/* Range Filters */}
          <div className="advanced-filters__ranges">
            {/* Rating Range */}
            <div className="advanced-filters__range">
              <h4>⭐ Puan ({filters.rating.min} - {filters.rating.max})</h4>
              <div className="advanced-filters__range-inputs">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filters.rating.min}
                  onChange={(e) => updateRangeFilter('rating', 'min', e.target.value)}
                  className="advanced-filters__slider"
                />
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filters.rating.max}
                  onChange={(e) => updateRangeFilter('rating', 'max', e.target.value)}
                  className="advanced-filters__slider"
                />
              </div>
            </div>

            {/* Progress Range */}
            <div className="advanced-filters__range">
              <h4>📈 İlerleme ({filters.progress.min}% - {filters.progress.max}%)</h4>
              <div className="advanced-filters__range-inputs">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.progress.min}
                  onChange={(e) => updateRangeFilter('progress', 'min', e.target.value)}
                  className="advanced-filters__slider"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.progress.max}
                  onChange={(e) => updateRangeFilter('progress', 'max', e.target.value)}
                  className="advanced-filters__slider"
                />
              </div>
            </div>

            {/* Release Year Range */}
            <div className="advanced-filters__range">
              <h4>📅 Çıkış Yılı ({filters.releaseYear.min} - {filters.releaseYear.max})</h4>
              <div className="advanced-filters__range-inputs">
                <input
                  type="range"
                  min="1980"
                  max={new Date().getFullYear()}
                  value={filters.releaseYear.min}
                  onChange={(e) => updateRangeFilter('releaseYear', 'min', e.target.value)}
                  className="advanced-filters__slider"
                />
                <input
                  type="range"
                  min="1980"
                  max={new Date().getFullYear()}
                  value={filters.releaseYear.max}
                  onChange={(e) => updateRangeFilter('releaseYear', 'max', e.target.value)}
                  className="advanced-filters__slider"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedFilters;