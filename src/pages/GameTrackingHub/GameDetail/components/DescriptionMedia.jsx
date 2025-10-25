import React, { useState } from 'react';
import './DescriptionMedia.css';

/**
 * DescriptionMedia - Sadece oyun açıklaması
 * 
 * @param {Object} props
 * @param {Object} props.game - Oyun bilgileri
 */
function DescriptionMedia({ game }) {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <section className="description-media-section">
      <div className="description-media-container">
        
        {/* Sol taraf - Açıklama */}
        <div className="description-content">
          <h2>📖 Oyun Hakkında</h2>
          <div className="game-description">
            <p>{game.description || 'Oyun açıklaması yükleniyor...'}</p>
          </div>
          
          <div className="key-features">
            <h3>✨ Öne Çıkan Özellikler</h3>
            <div className="features-grid">
              <div className="feature-card" data-feature="story">
                <div className="feature-icon">📚</div>
                <div className="feature-content">
                  <h4>Etkileyici Hikaye</h4>
                  <p>Derinlemesine karakter gelişimi</p>
                  <div className="feature-progress">
                    <div className="progress-bar" style={{width: '95%'}}></div>
                    <span className="progress-text">95%</span>
                  </div>
                </div>
                <div className="feature-hover-effect"></div>
              </div>

              <div className="feature-card" data-feature="character">
                <div className="feature-icon">⚔️</div>
                <div className="feature-content">
                  <h4>Karakter Sistemi</h4>
                  <p>Gelişmiş yetenekler ve özelleştirme</p>
                  <div className="feature-progress">
                    <div className="progress-bar" style={{width: '88%'}}></div>
                    <span className="progress-text">88%</span>
                  </div>
                </div>
                <div className="feature-hover-effect"></div>
              </div>

              <div className="feature-card" data-feature="world">
                <div className="feature-icon">🌍</div>
                <div className="feature-content">
                  <h4>Açık Dünya</h4>
                  <p>Sınırsız keşif ve macera</p>
                  <div className="feature-progress">
                    <div className="progress-bar" style={{width: '92%'}}></div>
                    <span className="progress-text">92%</span>
                  </div>
                </div>
                <div className="feature-hover-effect"></div>
              </div>

              <div className="feature-card" data-feature="multiplayer">
                <div className="feature-icon">👥</div>
                <div className="feature-content">
                  <h4>Çok Oyunculu</h4>
                  <p>Arkadaşlarınla birlikte oyna</p>
                  <div className="feature-progress">
                    <div className="progress-bar" style={{width: '76%'}}></div>
                    <span className="progress-text">76%</span>
                  </div>
                </div>
                <div className="feature-hover-effect"></div>
              </div>

              <div className="feature-card" data-feature="graphics">
                <div className="feature-icon">🎨</div>
                <div className="feature-content">
                  <h4>Görsel Kalite</h4>
                  <p>Çarpıcı grafikler ve efektler</p>
                  <div className="feature-progress">
                    <div className="progress-bar" style={{width: '98%'}}></div>
                    <span className="progress-text">98%</span>
                  </div>
                </div>
                <div className="feature-hover-effect"></div>
              </div>

              <div className="feature-card" data-feature="sound">
                <div className="feature-icon">🎵</div>
                <div className="feature-content">
                  <h4>Ses Tasarımı</h4>
                  <p>Atmosferik müzik ve ses efektleri</p>
                  <div className="feature-progress">
                    <div className="progress-bar" style={{width: '91%'}}></div>
                    <span className="progress-text">91%</span>
                  </div>
                </div>
                <div className="feature-hover-effect"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default DescriptionMedia;