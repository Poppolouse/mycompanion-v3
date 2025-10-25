import React from 'react';
import './TranslationDisclaimer.css';

/**
 * TranslationDisclaimer - Çeviri yapıldığını belirten uyarı komponenti
 * 
 * @param {Object} props
 * @param {string} props.source - Orijinal kaynak (örn: "steam_english", "rawg_english")
 * @param {string} props.size - Boyut ("small", "medium", "large")
 * @param {string} props.position - Pozisyon ("top", "bottom", "inline")
 */
function TranslationDisclaimer({ source, size = 'small', position = 'bottom' }) {
  // Kaynak isimlerini Türkçe'ye çevir
  const getSourceName = (source) => {
    const sourceNames = {
      'steam_english': 'Steam',
      'rawg_english': 'RAWG',
      'igdb_english': 'IGDB',
      'giantbomb_english': 'Giant Bomb',
      'wikipedia_english': 'Wikipedia'
    };
    
    const baseName = source.replace('_translated', '').replace('_english', '');
    return sourceNames[`${baseName}_english`] || baseName.toUpperCase();
  };

  const sourceName = getSourceName(source);

  return (
    <div className={`translation-disclaimer ${size} ${position}`}>
      <div className="disclaimer-content">
        <span className="disclaimer-icon">🌐</span>
        <span className="disclaimer-text">
          Bu açıklama {sourceName} kaynağından otomatik çevrilmiştir
        </span>
        <span className="disclaimer-badge">Çeviri</span>
      </div>
    </div>
  );
}

export default TranslationDisclaimer;