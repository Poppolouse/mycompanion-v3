import React, { useState, useEffect } from 'react';
import './ImageViewer.css';

/**
 * ImageViewer - Kompakt görsel showcase ve thumbnail yönetimi
 * 
 * @param {Object} props
 * @param {Array} props.images - Görsel listesi
 * @param {number} props.selectedIndex - Seçili görsel indeksi
 * @param {Function} props.onImageSelect - Görsel seçim handler'ı
 * @param {Function} props.onFullscreen - Fullscreen handler'ı
 * @param {string} props.gameTitle - Oyun başlığı
 */
function ImageViewer({ 
  images = [], 
  selectedIndex = 0, 
  onImageSelect, 
  onFullscreen,
  gameTitle = 'Oyun'
}) {
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState(new Set());

  // Görsel navigasyonu
  const navigateImage = (direction) => {
    if (images.length === 0) return;
    
    const newIndex = selectedIndex + direction;
    if (newIndex < 0) {
      onImageSelect(images.length - 1);
    } else if (newIndex >= images.length) {
      onImageSelect(0);
    } else {
      onImageSelect(newIndex);
    }
  };

  // Görsel ön yükleme
  const preloadImage = (url) => {
    if (preloadedImages.has(url)) return;
    
    const img = new Image();
    img.onload = () => {
      setPreloadedImages(prev => new Set([...prev, url]));
    };
    img.src = url;
  };

  // Komşu görselleri ön yükle
  useEffect(() => {
    if (images.length > 0) {
      const currentImage = images[selectedIndex];
      const nextImage = images[selectedIndex + 1];
      const prevImage = images[selectedIndex - 1];
      
      if (currentImage) preloadImage(currentImage);
      if (nextImage) preloadImage(nextImage);
      if (prevImage) preloadImage(prevImage);
    }
  }, [selectedIndex, images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') navigateImage(-1);
      if (e.key === 'ArrowRight') navigateImage(1);
      if (e.key === 'Escape') onFullscreen && onFullscreen(-1);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedIndex, images.length]);

  if (images.length === 0) {
    return (
      <div className="media-empty-state">
        <div className="empty-icon">📷</div>
        <h3>Henüz ekran görüntüsü yok</h3>
        <p>Bu oyun için henüz ekran görüntüsü eklenmemiş.</p>
      </div>
    );
  }

  return (
    <div className="screenshots-section">
      {/* Ana Görsel */}
      <div className="main-image-container">
        <img 
          src={images[selectedIndex]} 
          alt={`${gameTitle} - Screenshot ${selectedIndex + 1}`}
          className="main-image"
          onLoad={() => setIsImageLoading(false)}
          onLoadStart={() => setIsImageLoading(true)}
          onClick={() => onFullscreen && onFullscreen(selectedIndex)}
        />
        
        <div className="image-overlay">
          <button 
            className="fullscreen-btn"
            onClick={() => onFullscreen && onFullscreen(selectedIndex)}
          >
            <span>🔍</span>
            <span>Tam Ekran</span>
          </button>
          
          <div className="image-counter">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {isImageLoading && (
          <div className="image-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="thumbnails-grid">
          {images.map((image, index) => (
            <div 
              key={index}
              className={`thumbnail-item ${selectedIndex === index ? 'active' : ''}`}
              onClick={() => onImageSelect(index)}
            >
              <img src={image} alt={`Screenshot ${index + 1}`} />
              
              <div className="thumbnail-overlay">
                <div className="thumbnail-number">{index + 1}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageViewer;