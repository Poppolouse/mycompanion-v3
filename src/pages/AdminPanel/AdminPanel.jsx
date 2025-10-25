import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import { getApiStatistics, checkAllApiStatuses } from '../../api/gameApiCoordinator';
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

  // API İstatistikleri state'leri
  const [apiStats, setApiStats] = useState(null);
  const [apiStatuses, setApiStatuses] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ana sayfaya dönüş
  const handleGoHome = () => {
    navigate('/');
  };

  // API istatistiklerini yükle
  const loadApiStats = async () => {
    setLoading(true);
    try {
      const [stats, statuses] = await Promise.all([
        getApiStatistics(),
        checkAllApiStatuses()
      ]);
      setApiStats(stats);
      setApiStatuses(statuses);
    } catch (error) {
      console.error('API istatistikleri yüklenirken hata:', error);
      showNotification('API istatistikleri yüklenemedi', 'hata');
    } finally {
      setLoading(false);
    }
  };

  // Component mount olduğunda API stats sekmesindeyse yükle
  useEffect(() => {
    if (aktifSekme === 'api-stats') {
      loadApiStats();
    }
  }, [aktifSekme]);

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

      case 'api-stats':
        return (
          <div className="admin-section">
            <div className="section-header">
              <h2>📊 API İstatistikleri</h2>
              <p>API kullanım durumu ve performans metrikleri</p>
              <button 
                onClick={loadApiStats}
                className="refresh-btn"
                disabled={loading}
              >
                {loading ? '🔄 Yükleniyor...' : '🔄 Yenile'}
              </button>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner">🔄</div>
                <p>API istatistikleri yükleniyor...</p>
              </div>
            ) : (
              <div className="api-stats-content">
                {/* API Durumları */}
                {apiStatuses && (
                  <div className="api-status-grid">
                    <h3>🚦 API Durumları</h3>
                    <div className="status-cards">
                      {Object.entries(apiStatuses).map(([apiName, status]) => (
                        <div key={apiName} className={`status-card status-${status.status}`}>
                          <div className="status-header">
                            <h4>{apiName.toUpperCase()}</h4>
                            <span className={`status-badge ${status.status}`}>
                              {status.status === 'available' ? '✅ Aktif' : 
                               status.status === 'error' ? '❌ Hata' : 
                               status.status === 'rate_limited' ? '⏰ Limit' : '⚠️ Bilinmiyor'}
                            </span>
                          </div>
                          {status.lastChecked && (
                            <p className="last-checked">
                              Son kontrol: {new Date(status.lastChecked).toLocaleString('tr-TR')}
                            </p>
                          )}
                          {status.error && (
                            <p className="error-message">Hata: {status.error}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* API İstatistikleri */}
                {apiStats && (
                  <div className="api-usage-stats">
                    <h3>📈 Kullanım İstatistikleri</h3>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-value">{apiStats.totalRequests || 0}</div>
                        <div className="stat-label">Toplam İstek</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{apiStats.successfulRequests || 0}</div>
                        <div className="stat-label">Başarılı İstek</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{apiStats.failedRequests || 0}</div>
                        <div className="stat-label">Başarısız İstek</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">
                          {apiStats.totalRequests > 0 
                            ? Math.round((apiStats.successfulRequests / apiStats.totalRequests) * 100) 
                            : 0}%
                        </div>
                        <div className="stat-label">Başarı Oranı</div>
                      </div>
                    </div>

                    {/* API Bazında Detaylar */}
                    {apiStats.byApi && (
                      <div className="api-details">
                        <h4>🔍 API Bazında Detaylar</h4>
                        <div className="api-detail-cards">
                          {Object.entries(apiStats.byApi).map(([apiName, stats]) => (
                            <div key={apiName} className="api-detail-card">
                              <h5>{apiName.toUpperCase()}</h5>
                              <div className="detail-stats">
                                <span>İstek: {stats.requests || 0}</span>
                                <span>Başarılı: {stats.successful || 0}</span>
                                <span>Hata: {stats.errors || 0}</span>
                                <span>Cache Hit: {stats.cacheHits || 0}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Cache İstatistikleri */}
                <div className="cache-stats">
                  <h3>💾 Cache İstatistikleri</h3>
                  <div className="cache-info">
                    <p>Cache sistemi aktif - 10 dakika süreyle sonuçlar saklanıyor</p>
                    <p>Bu sayede API kullanımı önemli ölçüde azaltılıyor</p>
                  </div>
                </div>
              </div>
            )}
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
          <button 
            className={`tab-btn ${aktifSekme === 'api-stats' ? 'active' : ''}`}
            onClick={() => setAktifSekme('api-stats')}
          >
            📊 API İstatistikleri
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