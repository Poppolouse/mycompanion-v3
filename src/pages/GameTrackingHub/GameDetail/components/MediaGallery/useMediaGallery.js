import { useState, useEffect } from 'react';
import { getGameScreenshots } from '../../../../../utils/imageUtils';

/**
 * useMediaGallery - Medya galerisi state yönetimi hook'u
 * 
 * @param {Object} game - Oyun verisi
 * @returns {Object} Medya state ve handler'ları
 */
function useMediaGallery(game) {
  // State tanımları
  const [activeMediaTab, setActiveMediaTab] = useState('screenshots');
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState(new Set());
  const [localScreenshots, setLocalScreenshots] = useState([]);

  // 📸 Yerel screenshot'ları yükle
  useEffect(() => {
    if (game?.rawgId || game?.id) {
      const gameId = game.rawgId || game.id;
      const screenshots = getGameScreenshots(gameId);
      setLocalScreenshots(screenshots);
      console.log(`📸 ${screenshots.length} screenshot yüklendi:`, game.title);
    }
  }, [game]);

  // Medya verilerini birleştir (yerel öncelikli)
  const mediaData = {
    screenshots: localScreenshots.length > 0 
      ? localScreenshots.map(s => s.url) 
      : (game?.screenshots || []),
    videos: game?.videos || []
  };

  // Medya sayıları
  const mediaCounts = {
    screenshots: mediaData.screenshots.length,
    videos: mediaData.videos.length
  };

  // Tab değiştirme handler'ı
  const handleTabChange = (tabId) => {
    setActiveMediaTab(tabId);
    setSelectedMedia(0); // Yeni tab'da ilk medyayı seç
  };

  // Görsel seçim handler'ı
  const handleImageSelect = (index) => {
    setSelectedMedia(index);
  };

  // Fullscreen handler'ı
  const handleFullscreen = (index = selectedMedia) => {
    setSelectedMedia(index);
    setShowFullscreen(true);
  };

  // Fullscreen kapatma
  const closeFullscreen = () => {
    setShowFullscreen(false);
  };

  // Medya navigasyonu
  const navigateMedia = (direction) => {
    const currentMediaList = mediaData[activeMediaTab];
    const totalMedia = currentMediaList?.length || 0;
    
    if (totalMedia === 0) return;
    
    const newIndex = selectedMedia + direction;
    if (newIndex < 0) {
      setSelectedMedia(totalMedia - 1);
    } else if (newIndex >= totalMedia) {
      setSelectedMedia(0);
    } else {
      setSelectedMedia(newIndex);
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

  // Video oynatma handler'ı
  const handleVideoPlay = (video) => {
    console.log('Video oynatılıyor:', video);
    // Video oynatma logic'i burada olacak
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!showFullscreen) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          navigateMedia(-1);
          break;
        case 'ArrowRight':
          navigateMedia(1);
          break;
        case 'Escape':
          closeFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showFullscreen, selectedMedia, activeMediaTab]);

  // Loading state yönetimi
  const setImageLoading = (loading) => {
    setIsImageLoading(loading);
  };

  return {
    // State
    activeMediaTab,
    selectedMedia,
    showFullscreen,
    isImageLoading,
    mediaData,
    mediaCounts,
    preloadedImages,
    
    // Handlers
    handleTabChange,
    handleImageSelect,
    handleFullscreen,
    closeFullscreen,
    navigateMedia,
    preloadImage,
    handleVideoPlay,
    setImageLoading,
    
    // Utilities
    getCurrentMediaList: () => mediaData[activeMediaTab] || [],
    getCurrentMedia: () => {
      const currentList = mediaData[activeMediaTab] || [];
      return currentList[selectedMedia];
    },
    hasMedia: () => {
      return Object.values(mediaData).some(list => list.length > 0);
    }
  };
}

export default useMediaGallery;