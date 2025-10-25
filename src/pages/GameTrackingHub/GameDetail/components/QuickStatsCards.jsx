import React, { useState, useEffect } from 'react';
import './QuickStatsCards.css';
import { getAllQuickStatsData } from '../../../../api/quickStatsApi.js';

/**
 * QuickStatsCards - Hızlı bilgiler kartları
 * API'lerle entegre edilmiş 4 ana kart:
 * 1. Metacritic puanı (Critics + progress bar + reviews)
 * 2. Tamamlama süresi (HowLongToBeat API)
 * 3. Yaş sınırı (ESRB rating + content descriptors)
 * 4. Kullanıcı puanları (Metacritic user scores)
 */
function QuickStatsCards({ game }) {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [currentUserReviewIndex, setCurrentUserReviewIndex] = useState(0);



  // API verilerini getir
  useEffect(() => {
    const fetchData = async () => {
      if (!game?.title) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getAllQuickStatsData(game.title, game.platform || 'pc');
        setApiData(data);
      } catch (err) {
        console.error('API veri hatası:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [game?.title, game?.platform]);

  // Metacritic puanı renk hesaplama
  const getMetacriticColor = (score) => {
    if (score >= 75) return 'var(--score-excellent)'; // Yeşil
    if (score >= 50) return 'var(--score-good)'; // Sarı
    return 'var(--score-poor)'; // Kırmızı
  };

  // Yaş sınırı içerik açıklamaları
  const getContentDescriptors = (rating) => {
    const descriptors = {
      'E': ['Mild Cartoon Violence'],
      'E10+': ['Fantasy Violence', 'Mild Language'],
      'T': ['Violence', 'Blood', 'Suggestive Themes', 'Language'],
      'M': ['Violence', 'Blood & Gore', 'Sexual Content', 'Strong Language'],
      'AO': ['Graphic Violence', 'Graphic Sexual Content']
    };
    return descriptors[rating] || ['Content Not Rated'];
  };

  // Tamamlama süreleri (örnek veriler - gerçekte API'den gelecek)
  const completionTimes = {
    main: game.mainStoryHours || 51,
    extras: game.extrasHours || 102,
    complete: game.completionistHours || 173,
    userTime: game.userPlaytime || 0
  };

  // Topluluk puanı hesaplama
  const communityRating = game.communityRating || 4.8;
  const playerCount = game.playerCount || 123000;

  // Puanlama yıldızları
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('⭐');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('⭐');
      } else {
        stars.push('☆');
      }
    }
    return stars.join('');
  };

  // Sayı formatı (123K, 1.2M gibi)
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  // Review navigation fonksiyonları
  const getAvailableReviews = () => {
    const reviews = apiData?.metacritic?.criticReviews || [];
    if (reviews.length === 0) {
      return [
        {
          excerpt: 'Exceptional gameplay with stunning visuals and immersive storytelling that sets new standards.',
          source: 'IGN'
        },
        {
          excerpt: 'A masterpiece that redefines the genre with innovative mechanics and compelling narrative.',
          source: 'GameSpot'
        },
        {
          excerpt: 'Outstanding production values and engaging gameplay make this a must-play experience.',
          source: 'PC Gamer'
        }
      ];
    }
    return reviews;
  };

  const nextReview = () => {
    const reviews = getAvailableReviews();
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    const reviews = getAvailableReviews();
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const getCurrentReview = () => {
    const reviews = getAvailableReviews();
    return reviews[currentReviewIndex] || reviews[0];
  };

  // User Reviews navigation fonksiyonları
  const getAvailableUserReviews = () => {
    const reviews = apiData?.metacritic?.userReviews || [];
    if (reviews.length === 0) {
      return [
        {
          excerpt: 'Amazing game! Highly recommended for all players.',
          author: 'GameFan2024',
          score: 9
        },
        {
          excerpt: 'Great graphics and gameplay, but could use more content.',
          author: 'CasualGamer',
          score: 7
        },
        {
          excerpt: 'Perfect game! Everything I wanted and more.',
          author: 'ProPlayer99',
          score: 10
        }
      ];
    }
    return reviews;
  };

  const nextUserReview = () => {
    const reviews = getAvailableUserReviews();
    setCurrentUserReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevUserReview = () => {
    const reviews = getAvailableUserReviews();
    setCurrentUserReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const getCurrentUserReview = () => {
    const reviews = getAvailableUserReviews();
    return reviews[currentUserReviewIndex] || reviews[0];
  };

  return (
    <>
      <section className="quick-stats-section">
        <div className="stats-container gradient-overlay-design">
          
          {/* Critics Card - Gradient Overlay Design */}
          <div className="gradient-card critics-card">
            <div className="gradient-card-content">
              <div className="gradient-card-icon">⭐</div>
              <div className="gradient-card-value">
                {apiData?.metacritic?.score || game?.metacritic || 85}
              </div>
              <div className="gradient-card-title">Critics Score</div>
            </div>
          </div>

          {/* Users Card - Gradient Overlay Design */}
          <div className="gradient-card users-card">
            <div className="gradient-card-content">
              <div className="gradient-card-icon">👥</div>
              <div className="gradient-card-value">
                {apiData?.metacritic?.userScore || game?.userScore || 7.8}
              </div>
              <div className="gradient-card-title">User Score</div>
            </div>
          </div>

          {/* How Long to Beat Card - Gradient Overlay Design */}
          <div className="gradient-card hltb-card">
            <div className="gradient-card-content">
              <div className="gradient-card-icon">⏱️</div>
              <div className="gradient-card-value">
                {apiData?.hltb?.main || completionTimes.main || 12}h
              </div>
              <div className="gradient-card-title">Playtime</div>
            </div>
          </div>

          {/* ESRB Rating Card - Gradient Overlay Design */}
          <div className="gradient-card esrb-card">
            <div className="gradient-card-content">
              <div className="gradient-card-icon">🛡️</div>
              <div className="gradient-card-value">
                {game?.esrb_rating?.name?.charAt(0) || 'T'}
              </div>
              <div className="gradient-card-title">ESRB Rating</div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

export default QuickStatsCards;