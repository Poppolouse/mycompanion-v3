import React from 'react';
import './StatsCommunity.css';

/**
 * StatsCommunity - İstatistikler ve topluluk bölümü
 * Wireframe'e göre:
 * - Player stats (oyuncu istatistikleri)
 * - Community activity (topluluk aktivitesi)
 * - Reviews summary (değerlendirme özeti)
 */
function StatsCommunity({ game }) {
  // Örnek istatistikler
  const playerStats = {
    totalPlayers: 2500000,
    activeToday: 45000,
    peakPlayers: 125000,
    averagePlaytime: '42 saat'
  };

  const communityActivity = [
    { type: 'review', count: 15420, label: 'Değerlendirme' },
    { type: 'screenshot', count: 8900, label: 'Ekran Görüntüsü' },
    { type: 'guide', count: 1250, label: 'Rehber' },
    { type: 'artwork', count: 3400, label: 'Sanat Eseri' }
  ];

  const reviewsSummary = {
    overall: 'Çok Olumlu',
    percentage: 89,
    recent: 'Çok Olumlu',
    recentPercentage: 92,
    totalReviews: 15420
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getReviewColor = (percentage) => {
    if (percentage >= 80) return 'positive';
    if (percentage >= 60) return 'mixed';
    return 'negative';
  };

  return (
    <section className="stats-community-section">
      <div className="stats-community-container">
        
        {/* Oyuncu İstatistikleri */}
        <div className="player-stats">
          <h3>📊 Oyuncu İstatistikleri</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-value">{formatNumber(playerStats.totalPlayers)}</span>
                <span className="stat-label">Toplam Oyuncu</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🟢</div>
              <div className="stat-info">
                <span className="stat-value">{formatNumber(playerStats.activeToday)}</span>
                <span className="stat-label">Bugün Aktif</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <span className="stat-value">{formatNumber(playerStats.peakPlayers)}</span>
                <span className="stat-label">En Yüksek</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <span className="stat-value">{playerStats.averagePlaytime}</span>
                <span className="stat-label">Ortalama Süre</span>
              </div>
            </div>
          </div>
        </div>

        {/* Topluluk Aktivitesi */}
        <div className="community-activity">
          <h3>🌟 Topluluk Aktivitesi</h3>
          <div className="activity-grid">
            {communityActivity.map((activity, index) => (
              <div key={index} className="activity-card">
                <div className="activity-count">{formatNumber(activity.count)}</div>
                <div className="activity-label">{activity.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Değerlendirme Özeti */}
        <div className="reviews-summary">
          <h3>⭐ Değerlendirmeler</h3>
          
          <div className="review-overview">
            <div className="review-section">
              <div className="review-header">
                <span className="review-title">Genel Değerlendirmeler:</span>
                <span className={`review-status ${getReviewColor(reviewsSummary.percentage)}`}>
                  {reviewsSummary.overall}
                </span>
              </div>
              <div className="review-bar">
                <div 
                  className={`review-fill ${getReviewColor(reviewsSummary.percentage)}`}
                  style={{ width: `${reviewsSummary.percentage}%` }}
                ></div>
              </div>
              <div className="review-percentage">{reviewsSummary.percentage}% olumlu</div>
            </div>

            <div className="review-section">
              <div className="review-header">
                <span className="review-title">Son Değerlendirmeler:</span>
                <span className={`review-status ${getReviewColor(reviewsSummary.recentPercentage)}`}>
                  {reviewsSummary.recent}
                </span>
              </div>
              <div className="review-bar">
                <div 
                  className={`review-fill ${getReviewColor(reviewsSummary.recentPercentage)}`}
                  style={{ width: `${reviewsSummary.recentPercentage}%` }}
                ></div>
              </div>
              <div className="review-percentage">{reviewsSummary.recentPercentage}% olumlu</div>
            </div>
          </div>

          <div className="total-reviews">
            Toplam {formatNumber(reviewsSummary.totalReviews)} değerlendirme
          </div>
        </div>

      </div>
    </section>
  );
}

export default StatsCommunity;