import React, { useState, useEffect } from 'react';
import './VideoPlayer.css';

/**
 * VideoPlayer - Kompakt video galerisi
 * 
 * @param {Object} props
 * @param {Array} props.videos - Video listesi
 * @param {Function} props.onVideoPlay - Video oynatma handler'ı
 * @param {string} props.gameTitle - Oyun başlığı
 */
function VideoPlayer({ videos = [], onVideoPlay, gameTitle = 'Oyun' }) {
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Varsayılan video verileri
  const defaultVideos = [
    {
      id: 1,
      title: 'Gameplay Trailer',
      thumbnail: '/placeholder-video.jpg',
      duration: '3:42',
      url: '#'
    },
    {
      id: 2,
      title: 'Hikaye Fragmanı',
      thumbnail: '/placeholder-video.jpg',
      duration: '2:15',
      url: '#'
    }
  ];

  const videoList = videos.length > 0 ? videos : defaultVideos;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedVideo && e.key === 'Escape') {
        setSelectedVideo(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedVideo]);

  const handleVideoPlay = (video) => {
    setSelectedVideo(video);
    if (onVideoPlay) {
      onVideoPlay(video);
    }
  };

  if (videoList.length === 0) {
    return (
      <div className="videos-empty">
        <div className="empty-icon">🎬</div>
        <p>Henüz video bulunmuyor</p>
      </div>
    );
  }

  return (
    <div className="videos-section">
      <div className="videos-grid">
        {videoList.map((video, index) => (
          <div 
            key={video.id || index} 
            className="video-card"
            onClick={() => handleVideoPlay(video)}
          >
            <div className="video-thumbnail">
              <img 
                src={video.thumbnail || '/placeholder-video.jpg'} 
                alt={video.title || `Video ${index + 1}`}
                loading="lazy"
              />
              <div className="video-overlay">
                <div className="play-button">
                  <span>▶</span>
                </div>
              </div>
              <div className="video-duration">
                {video.duration || '0:00'}
              </div>
            </div>
            <div className="video-info">
              <h4 className="video-title">
                {video.title || `Video ${index + 1}`}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="video-modal" onClick={() => setSelectedVideo(null)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <h3>{selectedVideo.title}</h3>
              <button 
                className="close-button"
                onClick={() => setSelectedVideo(null)}
                aria-label="Kapat"
              >
                ✕
              </button>
            </div>
            <div className="video-modal-body">
              <div className="video-placeholder">
                <div className="placeholder-icon">🎬</div>
                <p>Video oynatıcı burada olacak</p>
                <small>{selectedVideo.title}</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;