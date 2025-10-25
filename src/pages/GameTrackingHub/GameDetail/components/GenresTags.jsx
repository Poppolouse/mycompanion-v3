import React from 'react';
import './GenresTags.css';

/**
 * GenresTags - Türler ve etiketler bölümü
 * Wireframe'e göre:
 * - Primary genres (ana türler)
 * - Community tags (topluluk etiketleri)
 */
function GenresTags({ game }) {
  // Genre verilerini normalize et - hem tekil hem çoğul destekle
  const getGenres = () => {
    // Önce game.genres (çoğul) kontrol et
    if (game.genres && Array.isArray(game.genres) && game.genres.length > 0) {
      return game.genres;
    }
    
    // Sonra game.genre (tekil) kontrol et
    if (game.genre && game.genre !== 'Bilinmeyen') {
      // Eğer virgülle ayrılmış string ise böl
      if (typeof game.genre === 'string' && game.genre.includes(',')) {
        return game.genre.split(',').map(g => g.trim()).filter(g => g && g !== 'Bilinmeyen');
      }
      return [game.genre];
    }
    
    // Fallback türler
    return ['Action', 'Adventure', 'RPG'];
  };

  const primaryGenres = getGenres();
  const communityTags = game.tags || [
    'Open World', 'Story Rich', 'Fantasy', 'Character Customization',
    'Exploration', 'Magic', 'Dragons', 'Medieval', 'Choices Matter',
    'Multiple Endings', 'Side Quests', 'Crafting'
  ];

  return (
    <section className="genres-tags-section">
      <div className="genres-tags-container">
        
        {/* Ana türler */}
        <div className="primary-genres">
          <h3>🎮 Ana Türler</h3>
          <div className="genres-grid">
            {primaryGenres.map((genre, index) => (
              <div key={index} className="genre-card">
                <span className="genre-icon">🎯</span>
                <span className="genre-name">{genre}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Topluluk etiketleri */}
        <div className="community-tags">
          <h3>🏷️ Topluluk Etiketleri</h3>
          <div className="tags-cloud">
            {communityTags.map((tag, index) => (
              <span key={index} className="tag-item">
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default GenresTags;