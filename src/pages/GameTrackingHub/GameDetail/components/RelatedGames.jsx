import React from 'react';
import './RelatedGames.css';

/**
 * RelatedGames - İlgili oyunlar bölümü
 * Wireframe'e göre:
 * - Similar games (benzer oyunlar)
 * - Same developer games (aynı geliştirici)
 * - Recommended games (önerilen oyunlar)
 */
function RelatedGames({ game }) {
  // Örnek ilgili oyunlar
  const similarGames = [
    {
      id: 1,
      title: 'The Elder Scrolls V: Skyrim',
      image: '/api/placeholder/300/400',
      rating: 94,
      price: '₺89.99',
      discount: 50
    },
    {
      id: 2,
      title: 'Cyberpunk 2077',
      image: '/api/placeholder/300/400',
      rating: 86,
      price: '₺199.99',
      discount: 25
    },
    {
      id: 3,
      title: 'Red Dead Redemption 2',
      image: '/api/placeholder/300/400',
      rating: 97,
      price: '₺249.99',
      discount: 0
    },
    {
      id: 4,
      title: 'Grand Theft Auto V',
      image: '/api/placeholder/300/400',
      rating: 96,
      price: '₺99.99',
      discount: 30
    }
  ];

  const developerGames = [
    {
      id: 5,
      title: 'Fallout 4',
      image: '/api/placeholder/300/400',
      rating: 87,
      price: '₺79.99',
      discount: 40
    },
    {
      id: 6,
      title: 'Fallout: New Vegas',
      image: '/api/placeholder/300/400',
      rating: 84,
      price: '₺39.99',
      discount: 60
    }
  ];

  const getMetacriticColor = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'mixed';
    return 'poor';
  };

  const calculateDiscountedPrice = (price, discount) => {
    if (discount === 0) return price;
    const numericPrice = parseFloat(price.replace('₺', ''));
    const discountedPrice = numericPrice * (1 - discount / 100);
    return `₺${discountedPrice.toFixed(2)}`;
  };

  const GameCard = ({ gameItem }) => (
    <div className="related-game-card">
      <div className="game-image-container">
        <img src={gameItem.image} alt={gameItem.title} className="game-image" />
        {gameItem.discount > 0 && (
          <div className="discount-badge">-{gameItem.discount}%</div>
        )}
        <div className="game-overlay">
          <button className="view-game-btn">Görüntüle</button>
        </div>
      </div>
      
      <div className="game-info">
        <h4 className="game-title">{gameItem.title}</h4>
        
        <div className="game-rating">
          <span className={`metacritic-score ${getMetacriticColor(gameItem.rating)}`}>
            {gameItem.rating}
          </span>
        </div>
        
        <div className="game-price">
          {gameItem.discount > 0 ? (
            <>
              <span className="original-price">{gameItem.price}</span>
              <span className="discounted-price">
                {calculateDiscountedPrice(gameItem.price, gameItem.discount)}
              </span>
            </>
          ) : (
            <span className="current-price">{gameItem.price}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section className="related-games-section">
      <div className="related-games-container">
        
        {/* Benzer Oyunlar */}
        <div className="games-category">
          <h3>🎮 Benzer Oyunlar</h3>
          <div className="games-grid">
            {similarGames.map((gameItem) => (
              <GameCard key={gameItem.id} gameItem={gameItem} />
            ))}
          </div>
        </div>

        {/* Aynı Geliştirici */}
        <div className="games-category">
          <h3>🏢 Aynı Geliştirici</h3>
          <div className="games-grid">
            {developerGames.map((gameItem) => (
              <GameCard key={gameItem.id} gameItem={gameItem} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default RelatedGames;