import React, { useState, useMemo } from 'react';
import './MediaGallery.css';

/**
 * MediaGallery - Kompakt ve işlevsel medya galerisi
 * Sadece screenshot ve video desteği
 */
function MediaGallery({ game }) {
  const [activeTab, setActiveTab] = useState('screenshots');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Medya verilerini hazırla
  const mediaData = useMemo(() => {
    if (!game) return { screenshots: [], videos: [] };

    const screenshots = [
      // Mock data - gerçek API'den gelecek
      { id: 1, url: 'https://via.placeholder.com/800x450/667eea/ffffff?text=Screenshot+1', alt: 'Oyun Ekran Görüntüsü 1' },
      { id: 2, url: 'https://via.placeholder.com/800x450/764ba2/ffffff?text=Screenshot+2', alt: 'Oyun Ekran Görüntüsü 2' },
      { id: 3, url: 'https://via.placeholder.com/800x450/667eea/ffffff?text=Screenshot+3', alt: 'Oyun Ekran Görüntüsü 3' },
      { id: 4, url: 'https://via.placeholder.com/800x450/764ba2/ffffff?text=Screenshot+4', alt: 'Oyun Ekran Görüntüsü 4' },
    ];

    const videos = [
      // Mock data - gerçek API'den gelecek
      { id: 1, title: 'Oynanış Videosu', thumbnail: 'https://via.placeholder.com/400x225/667eea/ffffff?text=Video+1', duration: '2:34' },
      { id: 2, title: 'Fragman', thumbnail: 'https://via.placeholder.com/400x225/764ba2/ffffff?text=Video+2', duration: '1:45' },
    ];

    return { screenshots, videos };
  }, [game]);

  // Tab değiştirme
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedImageIndex(0);
  };

  // Resim seçimi
  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
  };

  // Fullscreen açma
  const handleFullscreen = () => {
    setShowFullscreen(true);
  };

  // Fullscreen kapatma
  const closeFullscreen = () => {
    setShowFullscreen(false);
  };

  // Fullscreen navigasyon
  const navigateFullscreen = (direction) => {
    const maxIndex = mediaData.screenshots.length - 1;
    if (direction === 'next') {
      setSelectedImageIndex(prev => prev >= maxIndex ? 0 : prev + 1);
    } else {
      setSelectedImageIndex(prev => prev <= 0 ? maxIndex : prev - 1);
    }
  };

  if (!game || (!mediaData.screenshots.length && !mediaData.videos.length)) {
    return (
      <section className="media-gallery-section">
        <div className="media-gallery-container">
          <div className="media-empty-state">
            <div className="empty-icon">📷</div>
            <h3>Medya Bulunamadı</h3>
            <p>Bu oyun için henüz medya içeriği yüklenmemiş.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="media-gallery-section">
      <div className="media-gallery-container">
        {/* Header */}
        <div className="media-header">
          <h2 className="media-title">
            <span className="title-icon">🎮</span>
            Medya Galerisi
          </h2>
          <div className="media-stats">
            <span className="stat-item">
              <span className="stat-number">{mediaData.screenshots.length}</span>
              <span className="stat-label">Ekran Görüntüsü</span>
            </span>
            <span className="stat-item">
              <span className="stat-number">{mediaData.videos.length}</span>
              <span className="stat-label">Video</span>
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="media-tabs">
          <button 
            className={`media-tab ${activeTab === 'screenshots' ? 'active' : ''}`}
            onClick={() => handleTabChange('screenshots')}
            disabled={!mediaData.screenshots.length}
          >
            <span className="tab-icon">📸</span>
            <span className="tab-text">Ekran Görüntüleri</span>
            <span className="tab-count">({mediaData.screenshots.length})</span>
          </button>
          <button 
            className={`media-tab ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => handleTabChange('videos')}
            disabled={!mediaData.videos.length}
          >
            <span className="tab-icon">🎬</span>
            <span className="tab-text">Videolar</span>
            <span className="tab-count">({mediaData.videos.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="media-content">
          {/* Screenshots */}
          {activeTab === 'screenshots' && mediaData.screenshots.length > 0 && (
            <div className="screenshots-section">
              {/* Ana görsel */}
              <div className="main-image-container">
                <img 
                  src={mediaData.screenshots[selectedImageIndex]?.url} 
                  alt={mediaData.screenshots[selectedImageIndex]?.alt}
                  className="main-image"
                  onClick={handleFullscreen}
                />
                <div className="image-overlay">
                  <button className="fullscreen-btn" onClick={handleFullscreen}>
                    <span className="btn-icon">🔍</span>
                    <span className="btn-text">Tam Ekran</span>
                  </button>
                  <div className="image-counter">
                    {selectedImageIndex + 1} / {mediaData.screenshots.length}
                  </div>
                </div>
              </div>

              {/* Thumbnail grid */}
              <div className="thumbnails-grid">
                {mediaData.screenshots.map((screenshot, index) => (
                  <div 
                    key={screenshot.id}
                    className={`thumbnail-item ${index === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => handleImageSelect(index)}
                  >
                    <img src={screenshot.url} alt={screenshot.alt} />
                    <div className="thumbnail-overlay">
                      <span className="thumbnail-number">{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {activeTab === 'videos' && mediaData.videos.length > 0 && (
            <div className="videos-section">
              <div className="videos-grid">
                {mediaData.videos.map((video) => (
                  <div key={video.id} className="video-card">
                    <div className="video-thumbnail-container">
                      <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                      <div className="video-overlay">
                        <button className="play-button">
                          <span className="play-icon">▶️</span>
                        </button>
                        <div className="video-duration">{video.duration}</div>
                      </div>
                    </div>
                    <div className="video-info">
                      <h4 className="video-title">{video.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Modal */}
        {showFullscreen && (
          <div className="fullscreen-modal" onClick={closeFullscreen}>
            <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={closeFullscreen}>✕</button>
              <button className="nav-btn prev-btn" onClick={() => navigateFullscreen('prev')}>‹</button>
              <img 
                src={mediaData.screenshots[selectedImageIndex]?.url} 
                alt={mediaData.screenshots[selectedImageIndex]?.alt}
                className="fullscreen-image"
              />
              <button className="nav-btn next-btn" onClick={() => navigateFullscreen('next')}>›</button>
              <div className="fullscreen-counter">
                {selectedImageIndex + 1} / {mediaData.screenshots.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default MediaGallery;