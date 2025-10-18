import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import './AdminPanel.css';

/**
 * 🛠️ Admin Panel - Sistem Yönetim Merkezi
 * API Keys, kullanıcı yönetimi ve sistem ayarları
 */
function AdminPanel() {
  const navigate = useNavigate();
  const [aktifSekme, setAktifSekme] = useState('api-keys');
  const [bildirim, setBildirim] = useState(null);

  // API Keys state'leri - Sadece RAWG API
  const [apiKeys, setApiKeys] = useState({
    rawg: import.meta.env.VITE_RAWG_API_KEY || ''
  });
  const [editingKey, setEditingKey] = useState(null);
  const [tempKeyValue, setTempKeyValue] = useState('');

  // Ana sayfaya dönüş
  const handleGoHome = () => {
    navigate('/');
  };

  // Bildirim gösterme
  const showNotification = (mesaj, tip = 'bilgi') => {
    setBildirim({ mesaj, tip });
    setTimeout(() => setBildirim(null), 3000);
  };

  // API Key düzenleme
  const handleEditKey = (keyName) => {
    setEditingKey(keyName);
    setTempKeyValue(apiKeys[keyName]);
  };

  const handleSaveKey = () => {
    setApiKeys(prev => ({
      ...prev,
      [editingKey]: tempKeyValue
    }));
    setEditingKey(null);
    setTempKeyValue('');
    showNotification('API anahtarı başarıyla güncellendi!', 'basari');
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setTempKeyValue('');
  };

  // API Key görüntüleme (açık metin)
  const apiKeyGoruntule = (key) => {
    if (!key) return 'Ayarlanmamış';
    return key; // Artık maskeleme yok, tam metin göster
  };

  // Sekme içeriği render
  const renderTabContent = () => {
    switch (aktifSekme) {
      case 'api-keys':
        return (
          <div className="admin-section">
            <div className="section-header">
              <h2>🔑 API Anahtarları</h2>
              <p>RAWG API anahtarını yönetin</p>
            </div>

            <div className="api-keys-grid">
              {Object.entries(apiKeys).map(([keyName, keyValue]) => (
                <div key={keyName} className="api-key-card">
                  <div className="api-key-header">
                    <h3>{keyName.toUpperCase()}</h3>
                    <span className={`status ${keyValue ? 'active' : 'inactive'}`}>
                      {keyValue ? '✅ Aktif' : '❌ Pasif'}
                    </span>
                  </div>

                  {editingKey === keyName ? (
                    <div className="api-key-edit">
                      <input
                        type="text"
                        value={tempKeyValue}
                        onChange={(e) => setTempKeyValue(e.target.value)}
                        placeholder="API anahtarını girin..."
                        className="api-key-input"
                      />
                      <div className="edit-actions">
                        <button onClick={handleSaveKey} className="save-btn">
                          💾 Kaydet
                        </button>
                        <button onClick={handleCancelEdit} className="cancel-btn">
                          ❌ İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="api-key-display">
                      <span className="api-key-value">
                        {apiKeyGoruntule(keyValue)}
                      </span>
                      <button 
                        onClick={() => handleEditKey(keyName)}
                        className="edit-btn"
                      >
                        ✏️ Düzenle
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="admin-section">
            <div className="section-header">
              <h2>👥 Kullanıcı Yönetimi</h2>
              <p>Sistem kullanıcılarını yönetin</p>
            </div>
            <div className="coming-soon">
              <h3>🚧 Yakında Gelecek</h3>
              <p>Kullanıcı yönetimi özellikleri geliştiriliyor...</p>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="admin-section">
            <div className="section-header">
              <h2>⚙️ Sistem Ayarları</h2>
              <p>Uygulama ayarlarını yapılandırın</p>
            </div>
            <div className="coming-soon">
              <h3>🚧 Yakında Gelecek</h3>
              <p>Sistem ayarları özellikleri geliştiriliyor...</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-panel-page">
      {/* Standart Header */}
      <header className="tracker-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🛠️ Admin Panel</h1>
            <p>Sistem yönetimi ve yapılandırma merkezi</p>
          </div>
          <div className="header-controls">
            <div className="navigation-buttons">
              <button 
                className="nav-btn home-btn"
                onClick={handleGoHome}
                title="Ana Sayfaya Dön"
              >
                🏠 Ana Sayfa
              </button>
            </div>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="admin-main">
        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${aktifSekme === 'api-keys' ? 'active' : ''}`}
            onClick={() => setAktifSekme('api-keys')}
          >
            🔑 API Keys
          </button>
          <button 
            className={`tab-btn ${aktifSekme === 'users' ? 'active' : ''}`}
            onClick={() => setAktifSekme('users')}
          >
            👥 Kullanıcılar
          </button>
          <button 
            className={`tab-btn ${aktifSekme === 'system' ? 'active' : ''}`}
            onClick={() => setAktifSekme('system')}
          >
            ⚙️ Sistem
          </button>
        </div>

        {/* Tab Content */}
        <div className="admin-content">
          {renderTabContent()}
        </div>
      </main>

      {/* Bildirim */}
      {bildirim && (
        <div className={`bildirim bildirim--${bildirim.tip}`}>
          {bildirim.mesaj}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;