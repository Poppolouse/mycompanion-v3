import React from 'react';
import './ComingSoonBanner.css';

/**
 * ComingSoonBanner - Henüz çalışmayan özellikler için "Çok Yakında" bandı
 */
function ComingSoonBanner({ 
  children, 
  message = "Çok Yakında", 
  icon = "🚀",
  className = "",
  disabled = true 
}) {
  return (
    <div className={`coming-soon-wrapper ${className} ${disabled ? 'disabled' : ''}`}>
      {children}
      <div className="coming-soon-banner">
        <div className="banner-content">
          <span className="banner-icon">{icon}</span>
          <span className="banner-text">{message}</span>
        </div>
      </div>
    </div>
  );
}

export default ComingSoonBanner;