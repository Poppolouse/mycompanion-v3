import React from 'react';
import './PlatformTech.css';

/**
 * PlatformTech - Platform ve teknik bilgiler bölümü
 * Wireframe'e göre:
 * - Platforms (platformlar)
 * - System requirements (sistem gereksinimleri)
 * - Features (özellikler)
 */
function PlatformTech({ game }) {
  // Örnek platform ve teknik bilgiler
  const platforms = game.platforms || ['PC', 'PlayStation 5', 'Xbox Series X/S', 'Nintendo Switch'];
  
  const systemRequirements = {
    minimum: {
      os: 'Windows 10 64-bit',
      processor: 'Intel Core i5-8400 / AMD Ryzen 5 2600',
      memory: '8 GB RAM',
      graphics: 'NVIDIA GTX 1060 / AMD RX 580',
      storage: '50 GB available space'
    },
    recommended: {
      os: 'Windows 11 64-bit',
      processor: 'Intel Core i7-10700K / AMD Ryzen 7 3700X',
      memory: '16 GB RAM',
      graphics: 'NVIDIA RTX 3070 / AMD RX 6700 XT',
      storage: '50 GB SSD space'
    }
  };

  const features = [
    { icon: '🎵', name: 'Ses', value: 'Tam Dublaj + Altyazı' },
    { icon: '🌐', name: 'Çevrimiçi', value: 'Co-op Multiplayer' },
    { icon: '🔧', name: 'Modlar', value: 'Steam Workshop' },
    { icon: '♿', name: 'Erişilebilirlik', value: 'Tam Destek' },
    { icon: '☁️', name: 'Bulut Kayıt', value: 'Steam Cloud' },
    { icon: '🎮', name: 'Kontrolcü', value: 'Tam Destek' }
  ];

  const getPlatformIcon = (platform) => {
    const icons = {
      'PC': '💻',
      'PlayStation 5': '🎮',
      'Xbox Series X/S': '🎮',
      'Nintendo Switch': '🎮',
      'Steam': '🚂',
      'Epic Games': '🎯'
    };
    return icons[platform] || '🎮';
  };

  return (
    <section className="platform-tech-section">
      <div className="platform-tech-container">
        
        {/* Platformlar */}
        <div className="platforms-info">
          <h3>🎮 Platformlar</h3>
          <div className="platforms-grid">
            {platforms.map((platform, index) => (
              <div key={index} className="platform-card">
                <span className="platform-icon">{getPlatformIcon(platform)}</span>
                <span className="platform-name">{platform}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sistem Gereksinimleri */}
        <div className="system-requirements">
          <h3>⚙️ Sistem Gereksinimleri</h3>
          
          <div className="requirements-tabs">
            <div className="requirement-section">
              <h4>Minimum</h4>
              <div className="requirement-list">
                <div className="requirement-item">
                  <span className="req-label">İşletim Sistemi:</span>
                  <span className="req-value">{systemRequirements.minimum.os}</span>
                </div>
                <div className="requirement-item">
                  <span className="req-label">İşlemci:</span>
                  <span className="req-value">{systemRequirements.minimum.processor}</span>
                </div>
                <div className="requirement-item">
                  <span className="req-label">Bellek:</span>
                  <span className="req-value">{systemRequirements.minimum.memory}</span>
                </div>
                <div className="requirement-item">
                  <span className="req-label">Grafik:</span>
                  <span className="req-value">{systemRequirements.minimum.graphics}</span>
                </div>
                <div className="requirement-item">
                  <span className="req-label">Depolama:</span>
                  <span className="req-value">{systemRequirements.minimum.storage}</span>
                </div>
              </div>
            </div>

            <div className="requirement-section">
              <h4>Önerilen</h4>
              <div className="requirement-list">
                <div className="requirement-item">
                  <span className="req-label">İşletim Sistemi:</span>
                  <span className="req-value">{systemRequirements.recommended.os}</span>
                </div>
                <div className="requirement-item">
                  <span className="req-label">İşlemci:</span>
                  <span className="req-value">{systemRequirements.recommended.processor}</span>
                </div>
                <div className="requirement-item">
                  <span className="req-label">Bellek:</span>
                  <span className="req-value">{systemRequirements.recommended.memory}</span>
                </div>
                <div className="requirement-item">
                  <span className="req-label">Grafik:</span>
                  <span className="req-value">{systemRequirements.recommended.graphics}</span>
                </div>
                <div className="requirement-item">
                  <span className="req-label">Depolama:</span>
                  <span className="req-value">{systemRequirements.recommended.storage}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Özellikler */}
        <div className="game-features">
          <h3>✨ Özellikler</h3>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <span className="feature-icon">{feature.icon}</span>
                <div className="feature-info">
                  <span className="feature-name">{feature.name}</span>
                  <span className="feature-value">{feature.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default PlatformTech;