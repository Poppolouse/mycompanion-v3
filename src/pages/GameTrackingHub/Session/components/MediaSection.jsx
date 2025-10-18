import React from 'react';

/**
 * MediaSection - Screenshot ve video yönetimi component'i
 * Medya dosyalarını yükleme ve görüntüleme işlevlerini içerir
 */
function MediaSection({ 
  screenshots, 
  videoClips, 
  isUploading,
  screenshotInputRef, 
  videoInputRef, 
  handleScreenshotUpload, 
  handleVideoUpload,
  triggerScreenshotUpload,
  triggerVideoUpload,
  deleteScreenshot,
  deleteVideo,
  formatFileSize
}) {
  return (
    <div className="content-grid">
      {/* Screenshots Section */}
      <section className="media-section screenshots-section">
        <div className="media-header">
          <h3>📸 Screenshots</h3>
          <button 
            className="upload-btn screenshot"
            onClick={() => screenshotInputRef.current?.click()}
          >
            📸 Ekle
          </button>
        </div>
        
        <input
          ref={screenshotInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleScreenshotUpload}
          style={{ display: 'none' }}
        />

        <div className="media-gallery horizontal-scroll">
          {screenshots.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📸</div>
              <p>Henüz screenshot yok</p>
              <span>İlk screenshot'ınızı ekleyin!</span>
            </div>
          ) : (
            screenshots.map(screenshot => (
              <div key={screenshot.id} className="media-item screenshot">
                <img src={screenshot.url} alt="Screenshot" />
                <div className="media-info">
                  <span>{screenshot.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Video Clips Section */}
      <section className="media-section video-clips-section">
        <div className="media-header">
          <h3>🎬 Video Clips</h3>
          <button 
            className="upload-btn video"
            onClick={() => videoInputRef.current?.click()}
          >
            🎬 Ekle
          </button>
        </div>
        
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleVideoUpload}
          style={{ display: 'none' }}
        />

        <div className="media-gallery horizontal-scroll">
          {videoClips.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎬</div>
              <p>Henüz video yok</p>
              <span>İlk video klibinizi ekleyin!</span>
            </div>
          ) : (
            videoClips.map(video => (
              <div key={video.id} className="media-item video">
                <video src={video.url} controls />
                <div className="media-info">
                  <span>{video.timestamp}</span>
                  <span>{video.size}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default MediaSection;