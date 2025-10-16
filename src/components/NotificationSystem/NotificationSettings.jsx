import React, { useState } from 'react';
import { useNotifications } from './NotificationSystem';
import './NotificationSettings.css';

function NotificationSettings({ isOpen, onClose }) {
  const { settings, updateSettings, showSuccess, NOTIFICATION_TYPES } = useNotifications();
  const [tempSettings, setTempSettings] = useState(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings(tempSettings);
    showSuccess('Bildirim ayarları kaydedildi');
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = {
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
    setTempSettings(defaultSettings);
  };

  const updateTempSetting = (key, value) => {
    setTempSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNotificationType = (type, enabled) => {
    setTempSettings(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: enabled
      }
    }));
  };

  const notificationTypeLabels = {
    [NOTIFICATION_TYPES.SUCCESS]: { label: 'Başarı Bildirimleri', icon: '✅', desc: 'İşlem başarıyla tamamlandığında' },
    [NOTIFICATION_TYPES.ERROR]: { label: 'Hata Bildirimleri', icon: '❌', desc: 'Bir hata oluştuğunda' },
    [NOTIFICATION_TYPES.WARNING]: { label: 'Uyarı Bildirimleri', icon: '⚠️', desc: 'Dikkat edilmesi gereken durumlar' },
    [NOTIFICATION_TYPES.INFO]: { label: 'Bilgi Bildirimleri', icon: 'ℹ️', desc: 'Genel bilgilendirmeler' },
    [NOTIFICATION_TYPES.ACHIEVEMENT]: { label: 'Başarım Bildirimleri', icon: '🏆', desc: 'Yeni başarımlar kazandığında' },
    [NOTIFICATION_TYPES.GAME_UPDATE]: { label: 'Oyun Güncellemeleri', icon: '🎮', desc: 'Oyun durumu değişikliklerinde' },
    [NOTIFICATION_TYPES.REMINDER]: { label: 'Hatırlatmalar', icon: '⏰', desc: 'Zamanlanmış hatırlatmalar' }
  };

  const positionOptions = [
    { value: 'top-right', label: 'Sağ Üst' },
    { value: 'top-left', label: 'Sol Üst' },
    { value: 'bottom-right', label: 'Sağ Alt' },
    { value: 'bottom-left', label: 'Sol Alt' },
    { value: 'top-center', label: 'Üst Merkez' },
    { value: 'bottom-center', label: 'Alt Merkez' }
  ];

  return (
    <div className="notification-settings-overlay" onClick={onClose}>
      <div className="notification-settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>🔔 Bildirim Ayarları</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          {/* Genel Ayarlar */}
          <div className="settings-section">
            <h3>Genel Ayarlar</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>Bildirimleri Etkinleştir</label>
                <span className="setting-desc">Tüm bildirimleri aç/kapat</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={tempSettings.enabled}
                  onChange={(e) => updateTempSetting('enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Ses Efektleri</label>
                <span className="setting-desc">Bildirim seslerini çal</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={tempSettings.sound}
                  onChange={(e) => updateTempSetting('sound', e.target.checked)}
                  disabled={!tempSettings.enabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Otomatik Kapatma</label>
                <span className="setting-desc">Bildirimleri otomatik olarak kapat</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={tempSettings.autoClose}
                  onChange={(e) => updateTempSetting('autoClose', e.target.checked)}
                  disabled={!tempSettings.enabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Konum</label>
                <span className="setting-desc">Bildirimlerin görüneceği yer</span>
              </div>
              <select
                value={tempSettings.position}
                onChange={(e) => updateTempSetting('position', e.target.value)}
                disabled={!tempSettings.enabled}
                className="setting-select"
              >
                {positionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Maksimum Görünür Bildirim</label>
                <span className="setting-desc">Aynı anda gösterilecek bildirim sayısı</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={tempSettings.maxVisible}
                onChange={(e) => updateTempSetting('maxVisible', parseInt(e.target.value))}
                disabled={!tempSettings.enabled}
                className="setting-range"
              />
              <span className="range-value">{tempSettings.maxVisible}</span>
            </div>
          </div>

          {/* Bildirim Türleri */}
          <div className="settings-section">
            <h3>Bildirim Türleri</h3>
            
            {Object.entries(notificationTypeLabels).map(([type, config]) => (
              <div key={type} className="setting-item notification-type-item">
                <div className="setting-info">
                  <label>
                    <span className="type-icon">{config.icon}</span>
                    {config.label}
                  </label>
                  <span className="setting-desc">{config.desc}</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={tempSettings.types[type]}
                    onChange={(e) => updateNotificationType(type, e.target.checked)}
                    disabled={!tempSettings.enabled}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            ))}
          </div>

          {/* Test Bildirimleri */}
          <div className="settings-section">
            <h3>Test Bildirimleri</h3>
            <div className="test-buttons">
              <button 
                className="test-btn success"
                onClick={() => showSuccess('Bu bir test başarı bildirimidir')}
                disabled={!tempSettings.enabled}
              >
                ✅ Başarı Testi
              </button>
              <button 
                className="test-btn error"
                onClick={() => showError('Bu bir test hata bildirimidir')}
                disabled={!tempSettings.enabled}
              >
                ❌ Hata Testi
              </button>
              <button 
                className="test-btn achievement"
                onClick={() => showAchievement('Test Başarımı', 'Ayarları test ettin!')}
                disabled={!tempSettings.enabled}
              >
                🏆 Başarım Testi
              </button>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn-secondary" onClick={handleReset}>
            Varsayılana Sıfırla
          </button>
          <div className="footer-actions">
            <button className="btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationSettings;