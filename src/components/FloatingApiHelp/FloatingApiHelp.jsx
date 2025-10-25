import React, { useState } from 'react';
import styles from './FloatingApiHelp.module.css';

/**
 * FloatingApiHelp - Modal dışında hoverlayan API yardım kutucuğu
 * 
 * @param {Object} props
 * @param {boolean} props.isVisible - Kutucuğun görünür olup olmadığı
 */
function FloatingApiHelp({ isVisible = true }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!isVisible) return null;

  return (
    <div 
      className={`${styles.floatingContainer} ${isExpanded ? styles.expanded : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsExpanded(false);
      }}
    >
      {/* Trigger Button */}
      <div 
        className={styles.triggerButton}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={styles.triggerIcon}>🔗</span>
        <span className={styles.triggerText}>API</span>
      </div>

      {/* Expanded Content */}
      {(isExpanded || isHovered) && (
        <div className={styles.helpContent}>
          <div className={styles.helpHeader}>
            <div className={styles.helpIcon}>🔗</div>
            <h4>Oyununuzu Bulamıyor Musunuz?</h4>
          </div>
          
          <p className={styles.helpDescription}>
            API sitelerinden direkt link alıp arama çubuğuna yapıştırabilirsiniz:
          </p>
          
          <div className={styles.apiLinks}>
            <a 
              href="https://rawg.io/games" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.apiLink}
            >
              <span className={styles.apiIcon}>🎮</span>
              <span>RAWG.io</span>
            </a>
            
            <a 
              href="https://www.igdb.com/games" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.apiLink}
            >
              <span className={styles.apiIcon}>📊</span>
              <span>IGDB</span>
            </a>
            
            <a 
              href="https://store.steampowered.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.apiLink}
            >
              <span className={styles.apiIcon}>🎯</span>
              <span>Steam</span>
            </a>
            
            <a 
              href="https://www.giantbomb.com/games" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.apiLink}
            >
              <span className={styles.apiIcon}>💣</span>
              <span>Giant Bomb</span>
            </a>
          </div>
          
          <div className={styles.helpNote}>
            💡 Oyun sayfasının URL'ini kopyalayıp arama çubuğuna yapıştırın
          </div>
        </div>
      )}
    </div>
  );
}

export default FloatingApiHelp;