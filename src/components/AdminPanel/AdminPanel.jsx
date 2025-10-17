import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApps } from '../../hooks/useWebApps';
import { 
  uygulamaKategorileri, 
  uygulamaDurumlari, 
  oncelikSeviyeleri,
  konfigurasyonDogrula 
} from '../../config/appConfig';
import { 
  tumUygulamaVerileriniTemizle,
  uygulamaVerileriniDisaAktar,
  uygulamaVerileriniIceAktar,
  getUygulamaIstatistikleri,
  getPerformansMetrikleri 
} from '../../utils/appUtils';
import './AdminPanel.css';

/**
 * Uygulama yönetimi için admin paneli
 */
function AdminPanel() {
  const navigate = useNavigate();
  const { 
    tumUygulamalar, 
    konfigurasyonYoneticisi, 
    istatistikler 
  } = useWebApps();
  
  const [aktifSekme, setAktifSekme] = useState('uygulamalar');
  const [seciliUygulama, setSeciliUygulama] = useState(null);
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [yeniUygulama, setYeniUygulama] = useState({
    id: '',
    baslik: '',
    aciklama: '',
    ikon: '',
    renk: 'var(--color-primary-500)',
    kategori: 'genel',
    durum: 'aktif',
    oncelik: 'orta',
    yol: '',
    component: '',
    ozellikler: [],
    etiketler: []
  });
  const [performansVerileri, setPerformansVerileri] = useState({});
  const [bildirim, setBildirim] = useState(null);

  // Performans verilerini yükle
  useEffect(() => {
    setPerformansVerileri(getPerformansMetrikleri());
  }, []);

  // Bildirim göster
  const bildirimGoster = (mesaj, tip = 'bilgi') => {
    setBildirim({ mesaj, tip });
    setTimeout(() => setBildirim(null), 3000);
  };

  // Uygulama kaydet
  const uygulamaKaydet = () => {
    try {
      const dogrulama = konfigurasyonDogrula(yeniUygulama);
      
      if (!dogrulama.gecerli) {
        bildirimGoster(`Hata: ${dogrulama.hatalar.join(', ')}`, 'hata');
        return;
      }

      if (duzenlemeModu) {
        konfigurasyonYoneticisi.uygulamaGuncelle(yeniUygulama.id, yeniUygulama);
        bildirimGoster('Uygulama başarıyla güncellendi!', 'basari');
      } else {
        konfigurasyonYoneticisi.uygulamaEkle(yeniUygulama);
        bildirimGoster('Uygulama başarıyla eklendi!', 'basari');
      }
      
      setDuzenlemeModu(false);
      setYeniUygulama({
        id: '',
        baslik: '',
        aciklama: '',
        ikon: '',
        renk: 'var(--color-primary-500)',
        kategori: 'genel',
        durum: 'aktif',
        oncelik: 'orta',
        yol: '',
        component: '',
        ozellikler: [],
        etiketler: []
      });
    } catch (error) {
      bildirimGoster(`Hata: ${error.message}`, 'hata');
    }
  };

  // Uygulama sil
  const uygulamaSil = (id) => {
    if (window.confirm('Bu uygulamayı silmek istediğinizden emin misiniz?')) {
      try {
        konfigurasyonYoneticisi.uygulamaSil(id);
        bildirimGoster('Uygulama başarıyla silindi!', 'basari');
      } catch (error) {
        bildirimGoster(`Hata: ${error.message}`, 'hata');
      }
    }
  };

  // Uygulama düzenle
  const uygulamaDuzenle = (uygulama) => {
    setYeniUygulama(uygulama);
    setDuzenlemeModu(true);
    setAktifSekme('yeni-uygulama');
  };

  // Verileri dışa aktar
  const verileriDisaAktar = () => {
    try {
      const veriler = uygulamaVerileriniDisaAktar();
      const blob = new Blob([veriler], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vault-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      bildirimGoster('Veriler başarıyla dışa aktarıldı!', 'basari');
    } catch (error) {
      bildirimGoster(`Hata: ${error.message}`, 'hata');
    }
  };

  // Verileri içe aktar
  const verileriIceAktar = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const basarili = uygulamaVerileriniIceAktar(e.target.result);
        if (basarili) {
          bildirimGoster('Veriler başarıyla içe aktarıldı!', 'basari');
          window.location.reload();
        } else {
          bildirimGoster('Veri içe aktarma başarısız!', 'hata');
        }
      } catch (error) {
        bildirimGoster(`Hata: ${error.message}`, 'hata');
      }
    };
    reader.readAsText(file);
  };

  // Tüm verileri temizle
  const tumVerileriTemizle = () => {
    if (window.confirm('TÜM VERİLER SİLİNECEK! Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?')) {
      tumUygulamaVerileriniTemizle();
      bildirimGoster('Tüm veriler temizlendi!', 'basari');
      window.location.reload();
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <button 
          className="geri-button"
          onClick={() => navigate('/')}
        >
          ← Ana Sayfaya Dön
        </button>
        <h1>🔧 Admin Paneli</h1>
        <div className="admin-stats">
          <span>Toplam Uygulama: {tumUygulamalar.length}</span>
          <span>Toplam Kullanım: {istatistikler?.toplamKullanim || 0}</span>
        </div>
      </div>

      {bildirim && (
        <div className={`bildirim bildirim--${bildirim.tip}`}>
          {bildirim.mesaj}
        </div>
      )}

      <div className="admin-content">
        <div className="admin-sidebar">
          <nav className="admin-nav">
            <button 
              className={`nav-item ${aktifSekme === 'uygulamalar' ? 'active' : ''}`}
              onClick={() => setAktifSekme('uygulamalar')}
            >
              📱 Uygulamalar
            </button>
            <button 
              className={`nav-item ${aktifSekme === 'yeni-uygulama' ? 'active' : ''}`}
              onClick={() => setAktifSekme('yeni-uygulama')}
            >
              ➕ Yeni Uygulama
            </button>
            <button 
              className={`nav-item ${aktifSekme === 'istatistikler' ? 'active' : ''}`}
              onClick={() => setAktifSekme('istatistikler')}
            >
              📊 İstatistikler
            </button>
            <button 
              className={`nav-item ${aktifSekme === 'ayarlar' ? 'active' : ''}`}
              onClick={() => setAktifSekme('ayarlar')}
            >
              ⚙️ Ayarlar
            </button>
          </nav>
        </div>

        <div className="admin-main">
          {aktifSekme === 'uygulamalar' && (
            <div className="uygulamalar-tab">
              <h2>Uygulama Yönetimi</h2>
              <div className="uygulamalar-grid">
                {tumUygulamalar.map(uygulama => (
                  <div key={uygulama.id} className="uygulama-card">
                    <div className="uygulama-header">
                      <span className="uygulama-ikon">{uygulama.ikon}</span>
                      <div className="uygulama-info">
                        <h3>{uygulama.baslik}</h3>
                        <p>{uygulama.aciklama}</p>
                      </div>
                      <div className={`durum-badge durum--${uygulama.durum}`}>
                        {uygulama.durum}
                      </div>
                    </div>
                    <div className="uygulama-details">
                      <span>Kategori: {uygulamaKategorileri[uygulama.kategori]?.baslik}</span>
                      <span>Öncelik: {uygulama.oncelik}</span>
                      <span>Route: {uygulama.yol}</span>
                    </div>
                    <div className="uygulama-actions">
                      <button 
                        className="edit-button"
                        onClick={() => uygulamaDuzenle(uygulama)}
                      >
                        ✏️ Düzenle
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => uygulamaSil(uygulama.id)}
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aktifSekme === 'yeni-uygulama' && (
            <div className="yeni-uygulama-tab">
              <h2>{duzenlemeModu ? 'Uygulama Düzenle' : 'Yeni Uygulama Ekle'}</h2>
              <form className="uygulama-form" onSubmit={(e) => { e.preventDefault(); uygulamaKaydet(); }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>ID</label>
                    <input
                      type="text"
                      value={yeniUygulama.id}
                      onChange={(e) => setYeniUygulama({...yeniUygulama, id: e.target.value})}
                      disabled={duzenlemeModu}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Başlık</label>
                    <input
                      type="text"
                      value={yeniUygulama.baslik}
                      onChange={(e) => setYeniUygulama({...yeniUygulama, baslik: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Açıklama</label>
                  <textarea
                    value={yeniUygulama.aciklama}
                    onChange={(e) => setYeniUygulama({...yeniUygulama, aciklama: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>İkon (Emoji)</label>
                    <input
                      type="text"
                      value={yeniUygulama.ikon}
                      onChange={(e) => setYeniUygulama({...yeniUygulama, ikon: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Renk</label>
                    <input
                      type="color"
                      value={yeniUygulama.renk}
                      onChange={(e) => setYeniUygulama({...yeniUygulama, renk: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Kategori</label>
                    <select
                      value={yeniUygulama.kategori}
                      onChange={(e) => setYeniUygulama({...yeniUygulama, kategori: e.target.value})}
                      required
                    >
                      {Object.entries(uygulamaKategorileri).map(([id, kategori]) => (
                        <option key={id} value={id}>{kategori.baslik}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Durum</label>
                    <select
                      value={yeniUygulama.durum}
                      onChange={(e) => setYeniUygulama({...yeniUygulama, durum: e.target.value})}
                      required
                    >
                      {Object.values(uygulamaDurumlari).map(durum => (
                        <option key={durum} value={durum}>{durum}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Öncelik</label>
                    <select
                      value={yeniUygulama.oncelik}
                      onChange={(e) => setYeniUygulama({...yeniUygulama, oncelik: e.target.value})}
                      required
                    >
                      {Object.values(oncelikSeviyeleri).map(oncelik => (
                        <option key={oncelik} value={oncelik}>{oncelik}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Route Yolu</label>
                    <input
                      type="text"
                      value={yeniUygulama.yol}
                      onChange={(e) => setYeniUygulama({...yeniUygulama, yol: e.target.value})}
                      placeholder="/uygulama-adi"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Component Adı</label>
                    <input
                      type="text"
                      value={yeniUygulama.component}
                      onChange={(e) => setYeniUygulama({...yeniUygulama, component: e.target.value})}
                      placeholder="UygulamaAdi"
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button">
                    {duzenlemeModu ? '💾 Güncelle' : '➕ Ekle'}
                  </button>
                  {duzenlemeModu && (
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => {
                        setDuzenlemeModu(false);
                        setYeniUygulama({
                          id: '',
                          baslik: '',
                          aciklama: '',
                          ikon: '',
                          renk: 'var(--color-primary-500)',
                          kategori: 'genel',
                          durum: 'aktif',
                          oncelik: 'orta',
                          yol: '',
                          component: '',
                          ozellikler: [],
                          etiketler: []
                        });
                      }}
                    >
                      ❌ İptal
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {aktifSekme === 'istatistikler' && (
            <div className="istatistikler-tab">
              <h2>Kullanım İstatistikleri</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>📊 Genel İstatistikler</h3>
                  <div className="stat-item">
                    <span>Toplam Uygulama:</span>
                    <span>{tumUygulamalar.length}</span>
                  </div>
                  <div className="stat-item">
                    <span>Aktif Uygulama:</span>
                    <span>{tumUygulamalar.filter(u => u.durum === 'aktif').length}</span>
                  </div>
                  <div className="stat-item">
                    <span>Toplam Kullanım:</span>
                    <span>{istatistikler?.toplamKullanim || 0}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <h3>🏆 En Popüler Uygulama</h3>
                  {istatistikler?.enCokKullanilanId && (
                    <div className="popular-app">
                      {(() => {
                        const uygulama = tumUygulamalar.find(u => u.id === istatistikler.enCokKullanilanId);
                        return uygulama ? (
                          <>
                            <span className="app-icon">{uygulama.ikon}</span>
                            <span className="app-name">{uygulama.baslik}</span>
                            <span className="usage-count">
                              {istatistikler.kullanımVerileri[istatistikler.enCokKullanilanId]} kullanım
                            </span>
                          </>
                        ) : 'Veri bulunamadı';
                      })()}
                    </div>
                  )}
                </div>

                <div className="stat-card">
                  <h3>📈 Kategori Dağılımı</h3>
                  {Object.entries(uygulamaKategorileri).map(([id, kategori]) => {
                    const count = tumUygulamalar.filter(u => u.kategori === id).length;
                    return (
                      <div key={id} className="stat-item">
                        <span>{kategori.ikon} {kategori.baslik}:</span>
                        <span>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {aktifSekme === 'ayarlar' && (
            <div className="ayarlar-tab">
              <h2>Sistem Ayarları</h2>
              <div className="settings-grid">
                <div className="setting-card">
                  <h3>📤 Veri Yönetimi</h3>
                  <div className="setting-actions">
                    <button 
                      className="export-button"
                      onClick={verileriDisaAktar}
                    >
                      📥 Verileri Dışa Aktar
                    </button>
                    <label className="import-button">
                      📤 Verileri İçe Aktar
                      <input
                        type="file"
                        accept=".json"
                        onChange={verileriIceAktar}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <button 
                      className="clear-button"
                      onClick={tumVerileriTemizle}
                    >
                      🗑️ Tüm Verileri Temizle
                    </button>
                  </div>
                </div>

                <div className="setting-card">
                  <h3>🔧 Sistem Bilgileri</h3>
                  <div className="system-info">
                    <div className="info-item">
                      <span>Sürüm:</span>
                      <span>1.0.0</span>
                    </div>
                    <div className="info-item">
                      <span>Son Güncelleme:</span>
                      <span>{new Date().toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="info-item">
                      <span>Tarayıcı:</span>
                      <span>{navigator.userAgent.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;