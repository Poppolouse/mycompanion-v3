import { useState, useEffect, useRef } from 'react';
import './SmartSearch.css';

/**
 * SmartSearch - Gelişmiş arama componenti
 * Fuzzy search, AI suggestions, multi-field search özellikleri
 */
function SmartSearch({ 
  games = [], 
  onSearch, 
  placeholder = "Oyun ara...",
  showSuggestions = true,
  showFilters = true 
}) {
  // State'ler
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  // Refs
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Component mount olduğunda localStorage'dan geçmiş aramaları yükle
  useEffect(() => {
    const savedSearches = localStorage.getItem('gameTracker_searchHistory');
    if (savedSearches) {
      try {
        setSearchHistory(JSON.parse(savedSearches));
      } catch (err) {
        console.error('Arama geçmişi yüklenemedi:', err);
      }
    }
  }, []);

  // Arama terimi değiştiğinde suggestions güncelle
  useEffect(() => {
    if (searchTerm.length > 0) {
      generateSuggestions(searchTerm);
      setShowSuggestionsList(true);
    } else {
      setSuggestions([]);
      setShowSuggestionsList(false);
    }
    setSelectedSuggestionIndex(-1);
  }, [searchTerm, games]);

  // Fuzzy search algoritması
  const fuzzySearch = (text, pattern) => {
    const textLower = text.toLowerCase();
    const patternLower = pattern.toLowerCase();
    
    // Exact match
    if (textLower.includes(patternLower)) {
      return { score: 100, type: 'exact' };
    }
    
    // Fuzzy match
    let score = 0;
    let textIndex = 0;
    
    for (let i = 0; i < patternLower.length; i++) {
      const char = patternLower[i];
      const foundIndex = textLower.indexOf(char, textIndex);
      
      if (foundIndex === -1) {
        return { score: 0, type: 'no-match' };
      }
      
      // Yakın karakterler daha yüksek puan
      const distance = foundIndex - textIndex;
      score += Math.max(0, 10 - distance);
      textIndex = foundIndex + 1;
    }
    
    // Uzunluk farkı cezası
    const lengthPenalty = Math.abs(text.length - pattern.length) * 0.5;
    score = Math.max(0, score - lengthPenalty);
    
    return { score, type: 'fuzzy' };
  };

  // AI-powered suggestions oluştur
  const generateSuggestions = (term) => {
    if (!term || term.length < 1) {
      setSuggestions([]);
      return;
    }

    const allSuggestions = [];

    // 1. Oyun isimleri
    games.forEach(game => {
      const title = game.title || game.name || '';
      const match = fuzzySearch(title, term);
      
      if (match.score > 20) {
        allSuggestions.push({
          type: 'game',
          text: title,
          score: match.score,
          matchType: match.type,
          game: game,
          icon: '🎮',
          category: 'Oyunlar'
        });
      }
    });

    // 2. Platform önerileri
    const platforms = [...new Set(games.map(g => g.platform || g.sistem).filter(Boolean))];
    platforms.forEach(platform => {
      const match = fuzzySearch(platform, term);
      if (match.score > 30) {
        allSuggestions.push({
          type: 'platform',
          text: platform,
          score: match.score + 10, // Platform'lara bonus
          matchType: match.type,
          icon: '🖥️',
          category: 'Platformlar'
        });
      }
    });

    // 3. Tür önerileri
    const genres = [...new Set(games.map(g => g.genre || g.tur).filter(Boolean))];
    genres.forEach(genre => {
      const match = fuzzySearch(genre, term);
      if (match.score > 30) {
        allSuggestions.push({
          type: 'genre',
          text: genre,
          score: match.score + 5,
          matchType: match.type,
          icon: '🏷️',
          category: 'Türler'
        });
      }
    });

    // 4. Geliştirici önerileri
    const developers = [...new Set(games.map(g => g.developer || g.gelistirici).filter(Boolean))];
    developers.forEach(developer => {
      const match = fuzzySearch(developer, term);
      if (match.score > 30) {
        allSuggestions.push({
          type: 'developer',
          text: developer,
          score: match.score,
          matchType: match.type,
          icon: '👨‍💻',
          category: 'Geliştiriciler'
        });
      }
    });

    // 5. Durum önerileri
    const statusMap = {
      'oynuyor': 'playing',
      'playing': 'playing',
      'tamamlandı': 'completed',
      'completed': 'completed',
      'durduruldu': 'paused',
      'paused': 'paused',
      'başlanmadı': 'not-started',
      'not-started': 'not-started'
    };

    Object.keys(statusMap).forEach(statusText => {
      const match = fuzzySearch(statusText, term);
      if (match.score > 40) {
        allSuggestions.push({
          type: 'status',
          text: statusText,
          score: match.score + 15,
          matchType: match.type,
          value: statusMap[statusText],
          icon: getStatusIcon(statusMap[statusText]),
          category: 'Durumlar'
        });
      }
    });

    // 6. Arama geçmişi
    searchHistory.forEach(historyItem => {
      const match = fuzzySearch(historyItem, term);
      if (match.score > 50) {
        allSuggestions.push({
          type: 'history',
          text: historyItem,
          score: match.score - 20, // Geçmiş aramalar daha düşük öncelik
          matchType: match.type,
          icon: '🕒',
          category: 'Geçmiş Aramalar'
        });
      }
    });

    // Skorlara göre sırala ve en iyi 8'ini al
    const sortedSuggestions = allSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    setSuggestions(sortedSuggestions);
  };

  // Durum ikonu getir
  const getStatusIcon = (status) => {
    switch (status) {
      case 'playing': return '▶️';
      case 'completed': return '✅';
      case 'paused': return '⏸️';
      case 'not-started': return '⭕';
      default: return '🎮';
    }
  };

  // Arama işlemi
  const handleSearch = (term = searchTerm) => {
    if (term.trim()) {
      // Arama geçmişine ekle
      const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('gameTracker_searchHistory', JSON.stringify(newHistory));
      
      // Parent component'e bildir
      onSearch(term);
      setShowSuggestionsList(false);
    }
  };

  // Suggestion seçimi
  const handleSuggestionSelect = (suggestion) => {
    let searchValue = '';
    
    switch (suggestion.type) {
      case 'game':
        searchValue = suggestion.text;
        break;
      case 'platform':
        searchValue = `platform:${suggestion.text}`;
        break;
      case 'genre':
        searchValue = `genre:${suggestion.text}`;
        break;
      case 'developer':
        searchValue = `developer:${suggestion.text}`;
        break;
      case 'status':
        searchValue = `status:${suggestion.value}`;
        break;
      case 'history':
        searchValue = suggestion.text;
        break;
      default:
        searchValue = suggestion.text;
    }
    
    setSearchTerm(searchValue);
    handleSearch(searchValue);
  };

  // Klavye navigasyonu
  const handleKeyDown = (e) => {
    if (!showSuggestionsList || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      
      case 'Escape':
        setShowSuggestionsList(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Dışarı tıklama ile suggestions'ı kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Arama temizle
  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
    setShowSuggestionsList(false);
    searchInputRef.current?.focus();
  };

  return (
    <div className="smart-search" ref={suggestionsRef}>
      <div className="smart-search__input-container">
        <div className="smart-search__input-wrapper">
          <span className="smart-search__icon">🔍</span>
          <input
            ref={searchInputRef}
            type="text"
            className="smart-search__input"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => searchTerm && setShowSuggestionsList(true)}
          />
          {searchTerm && (
            <button 
              className="smart-search__clear"
              onClick={clearSearch}
              title="Temizle"
            >
              ✕
            </button>
          )}
        </div>
        
        <button 
          className="smart-search__submit"
          onClick={() => handleSearch()}
          title="Ara"
        >
          Ara
        </button>
      </div>

      {/* AI Suggestions */}
      {showSuggestionsList && suggestions.length > 0 && (
        <div className="smart-search__suggestions">
          <div className="smart-search__suggestions-header">
            <span>💡 Akıllı Öneriler</span>
            <span className="smart-search__suggestions-count">
              {suggestions.length} öneri
            </span>
          </div>
          
          <div className="smart-search__suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${index}`}
                className={`smart-search__suggestion ${
                  index === selectedSuggestionIndex ? 'smart-search__suggestion--selected' : ''
                } smart-search__suggestion--${suggestion.matchType}`}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <span className="smart-search__suggestion-icon">
                  {suggestion.icon}
                </span>
                <div className="smart-search__suggestion-content">
                  <span className="smart-search__suggestion-text">
                    {suggestion.text}
                  </span>
                  <span className="smart-search__suggestion-category">
                    {suggestion.category}
                  </span>
                </div>
                <span className="smart-search__suggestion-score">
                  {Math.round(suggestion.score)}%
                </span>
              </div>
            ))}
          </div>
          
          <div className="smart-search__suggestions-footer">
            <span>↑↓ Gezin • Enter Seç • Esc Kapat</span>
          </div>
        </div>
      )}

      {/* Quick Filters */}
      {showFilters && (
        <div className="smart-search__quick-filters">
          <span className="smart-search__filters-label">Hızlı Filtreler:</span>
          <button 
            className="smart-search__filter-btn"
            onClick={() => handleSearch('status:playing')}
          >
            ▶️ Oynuyor
          </button>
          <button 
            className="smart-search__filter-btn"
            onClick={() => handleSearch('status:completed')}
          >
            ✅ Tamamlandı
          </button>
          <button 
            className="smart-search__filter-btn"
            onClick={() => handleSearch('platform:PC')}
          >
            🖥️ PC
          </button>
          <button 
            className="smart-search__filter-btn"
            onClick={() => handleSearch('genre:RPG')}
          >
            🏷️ RPG
          </button>
        </div>
      )}
    </div>
  );
}

export default SmartSearch;