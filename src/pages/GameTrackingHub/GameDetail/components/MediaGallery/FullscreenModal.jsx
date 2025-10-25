import React, { useEffect } from 'react';
import './FullscreenModal.css';

/**
 * FullscreenModal - Kompakt tam ekran görsel görüntüleme
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal açık mı
 * @param {Function} props.onClose - Modal kapatma handler'ı
 * @param {Array} props.images - Görsel listesi
 * @param {number} props.currentIndex - Mevcut görsel indeksi
 * @param {Function} props.onNavigate - Navigasyon handler'ı
 * @param {string} props.gameTitle - Oyun başlığı
 */
function FullscreenModal({ 
  isOpen, 
  onClose, 
  images = [], 
  currentIndex = 0, 
  onNavigate,
  gameTitle = 'Oyun'
}) {
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          onNavigate && onNavigate(-1);
          break;
        case 'ArrowRight':
          onNavigate && onNavigate(1);
          break;
        case 'Escape':
          onClose && onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onNavigate, onClose]);

  // Body scroll'u engelle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <div className="fullscreen-modal" onClick={onClose}>
      <div className="fullscreen-overlay">
        {/* Header */}
        <div className="fullscreen-header">
          <div className="image-counter">
            {currentIndex + 1} / {images.length}
          </div>
          <button 
            className="close-button"
            onClick={onClose}
            title="Kapat (ESC)"
          >
            ✕
          </button>
        </div>

        {/* Main Image */}
        <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
          <div className="image-container">
            <img 
              src={currentImage} 
              alt={`Screenshot ${currentIndex + 1}`}
              className="fullscreen-image"
            />
            
            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button 
                  className="nav-button nav-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate && onNavigate(-1);
                  }}
                  title="Önceki (←)"
                >
                  ‹
                </button>
                
                <button 
                  className="nav-button nav-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate && onNavigate(1);
                  }}
                  title="Sonraki (→)"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="fullscreen-footer">
          <button 
            className="action-button"
            onClick={(e) => {
              e.stopPropagation();
              const link = document.createElement('a');
              link.href = currentImage;
              link.download = `screenshot-${currentIndex + 1}.jpg`;
              link.click();
            }}
            title="İndir"
          >
            ⬇ İndir
          </button>
        </div>
      </div>
    </div>
  );
}

export default FullscreenModal;