import React, { useState, useEffect } from 'react';
import './GameSelectionPrompt.css';

/**
 * GameSelectionPrompt - Modern oyun seçme hatırlatıcı component'i
 * 
 * Özellikler:
 * - Animasyonlu SVG iconlar
 * - Etkileşimli hover efektleri
 * - Responsive tasarım
 * - Glassmorphism efektleri
 * - Pulse animasyonları
 * 
 * @param {Function} onSelectGame - Oyun seçme butonuna tıklandığında çalışacak fonksiyon
 */
function GameSelectionPrompt({ onSelectGame }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  // Animasyon için mount sonrası görünür yap
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Dönen ipuçları
  const gamingTips = [
    "🎮 Favori oyununuzu seçin ve session'ı başlatın",
    "⏱️ Oyun sürenizi takip edin ve performansınızı analiz edin",
    "📸 Önemli anları kaydedin ve paylaşın",
    "📊 Detaylı istatistiklerinizi görüntüleyin",
    "🏆 Başarılarınızı takip edin ve hedeflerinize ulaşın"
  ];

  // İpuçlarını döndür
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % gamingTips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [gamingTips.length]);

  return (
    <div className={`game-selection-prompt ${isVisible ? 'visible' : ''}`}>
      <div className="prompt-container">
        {/* Ana İcon ve Başlık */}
        <div className="prompt-header">
          <div className="game-icon-container">
            <svg className="game-controller-icon" viewBox="0 0 100 100" fill="none">
              {/* Controller Body */}
              <path
                d="M20 35 C15 35, 10 40, 10 45 L10 55 C10 60, 15 65, 20 65 L35 65 L35 75 C35 80, 40 85, 45 85 L55 85 C60 85, 65 80, 65 75 L65 65 L80 65 C85 65, 90 60, 90 55 L90 45 C90 40, 85 35, 80 35 Z"
                fill="url(#controllerGradient)"
                className="controller-body"
              />
              
              {/* D-Pad */}
              <g className="dpad">
                <rect x="25" y="42" width="8" height="3" rx="1" fill="#667eea"/>
                <rect x="27" y="40" width="4" height="7" rx="1" fill="#667eea"/>
              </g>
              
              {/* Action Buttons */}
              <g className="action-buttons">
                <circle cx="70" cy="42" r="3" fill="#f093fb" className="btn-a"/>
                <circle cx="75" cy="47" r="3" fill="#f093fb" className="btn-b"/>
                <circle cx="65" cy="47" r="3" fill="#f093fb" className="btn-x"/>
                <circle cx="70" cy="52" r="3" fill="#f093fb" className="btn-y"/>
              </g>
              
              {/* Analog Sticks */}
              <circle cx="35" cy="55" r="4" fill="#764ba2" className="analog-left"/>
              <circle cx="65" cy="55" r="4" fill="#764ba2" className="analog-right"/>
              
              {/* Gradients */}
              <defs>
                <linearGradient id="controllerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea"/>
                  <stop offset="100%" stopColor="#764ba2"/>
                </linearGradient>
              </defs>
            </svg>
            
            {/* Pulse Rings */}
            <div className="pulse-ring pulse-ring-1"></div>
            <div className="pulse-ring pulse-ring-2"></div>
            <div className="pulse-ring pulse-ring-3"></div>
          </div>
          
          <h2 className="prompt-title">
            <span className="title-gradient">Oyun Seçin</span>
          </h2>
          
          <p className="prompt-subtitle">
            Gaming session'ınızı başlatmak için bir oyun seçin
          </p>
        </div>

        {/* İpuçları Bölümü */}
        <div className="tips-section">
          <div className="tip-container">
            <div className="tip-icon">💡</div>
            <p className="rotating-tip" key={currentTip}>
              {gamingTips[currentTip]}
            </p>
          </div>
        </div>

        {/* Özellikler Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h4>Zaman Takibi</h4>
            <p>Oyun sürenizi detaylı takip edin</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>Performans</h4>
            <p>Sistem performansınızı izleyin</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h4>Medya</h4>
            <p>Anılarınızı kaydedin</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h4>İstatistik</h4>
            <p>Detaylı analiz görün</p>
          </div>
        </div>

        {/* Ana Aksiyon Butonu */}
        <div className="action-section">
          <button 
            className="select-game-btn"
            onClick={onSelectGame}
          >
            <span className="btn-icon">🎮</span>
            <span className="btn-text">Oyun Seç</span>
            <div className="btn-shine"></div>
          </button>
          
          <p className="action-hint">
            Oyun kütüphanenizden seçim yapın
          </p>
        </div>

        {/* Dekoratif Elementler */}
        <div className="decorative-elements">
          <div className="floating-icon floating-icon-1">🎯</div>
          <div className="floating-icon floating-icon-2">🏆</div>
          <div className="floating-icon floating-icon-3">⭐</div>
          <div className="floating-icon floating-icon-4">🎪</div>
        </div>
      </div>
    </div>
  );
}

export default GameSelectionPrompt;