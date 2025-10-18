import { useState, useRef } from 'react';

/**
 * useMediaUpload - Medya yükleme işlemlerini yönetmek için custom hook
 * Ekran görüntüleri ve video yükleme işlevlerini sağlar
 */
function useMediaUpload() {
  const [screenshots, setScreenshots] = useState([]);
  const [videoClips, setVideoClips] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const screenshotInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Ekran görüntüsü yükle
  const handleScreenshotUpload = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    setIsUploading(true);

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newScreenshot = {
            id: Date.now() + Math.random(),
            url: e.target.result,
            name: file.name,
            size: file.size,
            uploadDate: new Date().toISOString()
          };
          
          setScreenshots(prev => [...prev, newScreenshot]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Simüle edilmiş yükleme süresi
    setTimeout(() => {
      setIsUploading(false);
    }, 1000);

    // Input'u temizle
    if (event.target) {
      event.target.value = '';
    }
  };

  // Video yükle
  const handleVideoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    setIsUploading(true);

    files.forEach(file => {
      if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newVideo = {
            id: Date.now() + Math.random(),
            url: e.target.result,
            name: file.name,
            size: file.size,
            duration: '00:30', // Simüle edilmiş süre
            uploadDate: new Date().toISOString()
          };
          
          setVideoClips(prev => [...prev, newVideo]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Simüle edilmiş yükleme süresi
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);

    // Input'u temizle
    if (event.target) {
      event.target.value = '';
    }
  };

  // Ekran görüntüsü sil
  const deleteScreenshot = (id) => {
    setScreenshots(prev => prev.filter(screenshot => screenshot.id !== id));
  };

  // Video sil
  const deleteVideo = (id) => {
    setVideoClips(prev => prev.filter(video => video.id !== id));
  };

  // Ekran görüntüsü yükleme dialog'unu aç
  const triggerScreenshotUpload = () => {
    if (screenshotInputRef.current) {
      screenshotInputRef.current.click();
    }
  };

  // Video yükleme dialog'unu aç
  const triggerVideoUpload = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  // Dosya boyutunu formatla
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    screenshots,
    videoClips,
    isUploading,
    screenshotInputRef,
    videoInputRef,
    handleScreenshotUpload,
    handleVideoUpload,
    deleteScreenshot,
    deleteVideo,
    triggerScreenshotUpload,
    triggerVideoUpload,
    formatFileSize
  };
}

export default useMediaUpload;