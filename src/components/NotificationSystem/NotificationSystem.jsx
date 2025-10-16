import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import './NotificationSystem.css';

// Notification Context
const NotificationContext = createContext(null);

// Notification türleri
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  ACHIEVEMENT: 'achievement',
  GAME_UPDATE: 'game_update',
  REMINDER: 'reminder'
};

// Notification süresi (ms)
const NOTIFICATION_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
  PERSISTENT: 0 // Manuel kapatılana kadar
};

// Notification Provider Component
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('vaulttracker:notifications:settings');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      sound: true,
      position: 'top-right',
      maxVisible: 5,
      autoClose: true,
      types: {
        [NOTIFICATION_TYPES.SUCCESS]: true,
        [NOTIFICATION_TYPES.ERROR]: true,
        [NOTIFICATION_TYPES.WARNING]: true,
        [NOTIFICATION_TYPES.INFO]: true,
        [NOTIFICATION_TYPES.ACHIEVEMENT]: true,
        [NOTIFICATION_TYPES.GAME_UPDATE]: true,
        [NOTIFICATION_TYPES.REMINDER]: true
      }
    };
  });

  // Ayarları localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('vaulttracker:notifications:settings', JSON.stringify(settings));
  }, [settings]);

  // Bildirim ekle
  const addNotification = useCallback((notification) => {
    if (!settings.enabled || !settings.types[notification.type]) {
      return;
    }

    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: Date.now(),
      duration: notification.duration || NOTIFICATION_DURATION.MEDIUM,
      ...notification
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Maksimum görünür bildirim sayısını kontrol et
      return updated.slice(0, settings.maxVisible);
    });

    // Ses çal (eğer aktifse)
    if (settings.sound && notification.type !== NOTIFICATION_TYPES.INFO) {
      playNotificationSound(notification.type);
    }

    // Otomatik kapatma
    if (settings.autoClose && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, [settings]);

  // Bildirim kaldır
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Tüm bildirimleri temizle
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Ayarları güncelle
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Context-aware bildirimler için helper fonksiyonlar
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title: options.title || '✅ Başarılı',
      message,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title: options.title || '❌ Hata',
      message,
      duration: NOTIFICATION_DURATION.LONG,
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title: options.title || '⚠️ Uyarı',
      message,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title: options.title || 'ℹ️ Bilgi',
      message,
      duration: NOTIFICATION_DURATION.SHORT,
      ...options
    });
  }, [addNotification]);

  const showAchievement = useCallback((title, description, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ACHIEVEMENT,
      title: `🏆 ${title}`,
      message: description,
      duration: NOTIFICATION_DURATION.LONG,
      ...options
    });
  }, [addNotification]);

  const showGameUpdate = useCallback((gameName, action, options = {}) => {
    const actionEmojis = {
      completed: '🎉',
      started: '🎮',
      updated: '📝',
      added: '➕'
    };

    return addNotification({
      type: NOTIFICATION_TYPES.GAME_UPDATE,
      title: `${actionEmojis[action] || '🎮'} ${gameName}`,
      message: getGameUpdateMessage(action),
      ...options
    });
  }, [addNotification]);

  const showReminder = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.REMINDER,
      title: options.title || '⏰ Hatırlatma',
      message,
      duration: NOTIFICATION_DURATION.PERSISTENT,
      ...options
    });
  }, [addNotification]);

  const value = {
    notifications,
    settings,
    addNotification,
    removeNotification,
    clearAllNotifications,
    updateSettings,
    // Helper methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAchievement,
    showGameUpdate,
    showReminder,
    // Constants
    NOTIFICATION_TYPES,
    NOTIFICATION_DURATION
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

// Notification Container Component
function NotificationContainer() {
  const { notifications, settings, removeNotification } = useNotifications();

  if (!settings.enabled || notifications.length === 0) {
    return null;
  }

  return (
    <div className={`notification-container ${settings.position}`}>
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          index={index}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

// Individual Notification Item
function NotificationItem({ notification, index, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Giriş animasyonu
    const timer = setTimeout(() => setIsVisible(true), 50 + index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Animasyon süresi
  };

  const getNotificationIcon = (type) => {
    const icons = {
      [NOTIFICATION_TYPES.SUCCESS]: '✅',
      [NOTIFICATION_TYPES.ERROR]: '❌',
      [NOTIFICATION_TYPES.WARNING]: '⚠️',
      [NOTIFICATION_TYPES.INFO]: 'ℹ️',
      [NOTIFICATION_TYPES.ACHIEVEMENT]: '🏆',
      [NOTIFICATION_TYPES.GAME_UPDATE]: '🎮',
      [NOTIFICATION_TYPES.REMINDER]: '⏰'
    };
    return icons[type] || 'ℹ️';
  };

  return (
    <div 
      className={`notification-item ${notification.type} ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}
      style={{ '--animation-delay': `${index * 100}ms` }}
    >
      <div className="notification-icon">
        {getNotificationIcon(notification.type)}
      </div>
      
      <div className="notification-content">
        {notification.title && (
          <div className="notification-title">{notification.title}</div>
        )}
        <div className="notification-message">{notification.message}</div>
        {notification.action && (
          <button 
            className="notification-action"
            onClick={notification.action.onClick}
          >
            {notification.action.label}
          </button>
        )}
      </div>

      <button className="notification-close" onClick={handleClose}>
        ×
      </button>

      {notification.duration > 0 && (
        <div 
          className="notification-progress"
          style={{ '--duration': `${notification.duration}ms` }}
        />
      )}
    </div>
  );
}

// Hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// Utility functions
function playNotificationSound(type) {
  // Web Audio API ile basit ses efektleri
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Bildirim türüne göre farklı tonlar
    const frequencies = {
      [NOTIFICATION_TYPES.SUCCESS]: 800,
      [NOTIFICATION_TYPES.ERROR]: 300,
      [NOTIFICATION_TYPES.WARNING]: 600,
      [NOTIFICATION_TYPES.ACHIEVEMENT]: 1000,
      [NOTIFICATION_TYPES.GAME_UPDATE]: 700,
      [NOTIFICATION_TYPES.REMINDER]: 500
    };

    oscillator.frequency.setValueAtTime(frequencies[type] || 600, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.warn('Notification sound failed:', error);
  }
}

function getGameUpdateMessage(action) {
  const messages = {
    completed: 'Oyunu tamamladın! 🎉',
    started: 'Oyuna başladın',
    updated: 'Oyun bilgileri güncellendi',
    added: 'Kütüphaneye eklendi'
  };
  return messages[action] || 'Oyun güncellendi';
}

// Ana NotificationSystem component'i (NotificationProvider ile aynı)
const NotificationSystem = NotificationProvider;

export default NotificationSystem;