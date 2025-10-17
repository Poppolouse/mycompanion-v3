import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TodoApp.css';

/**
 * Yapılacaklar Listesi Uygulaması
 * Kullanıcıların görevlerini yönetebileceği basit bir todo uygulaması
 */
function TodoApp() {
  const [gorevler, setGorevler] = useState([]);
  const [yeniGorev, setYeniGorev] = useState('');
  const [filtre, setFiltre] = useState('tumunu'); // tumunu, aktif, tamamlanan

  // LocalStorage'dan görevleri yükle
  useEffect(() => {
    const kaydedilmisGorevler = localStorage.getItem('mycompanion-todo-gorevler');
    if (kaydedilmisGorevler) {
      setGorevler(JSON.parse(kaydedilmisGorevler));
    }
  }, []);

  // Görevleri localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('mycompanion-todo-gorevler', JSON.stringify(gorevler));
  }, [gorevler]);

  const gorevEkle = (e) => {
    e.preventDefault();
    if (yeniGorev.trim() === '') return;

    const yeniGorevObj = {
      id: Date.now(),
      metin: yeniGorev.trim(),
      tamamlandi: false,
      olusturulmaTarihi: new Date().toISOString(),
      oncelik: 'normal' // düşük, normal, yüksek
    };

    setGorevler([yeniGorevObj, ...gorevler]);
    setYeniGorev('');
  };

  const gorevDurumDegistir = (id) => {
    setGorevler(gorevler.map(gorev => 
      gorev.id === id 
        ? { ...gorev, tamamlandi: !gorev.tamamlandi }
        : gorev
    ));
  };

  const gorevSil = (id) => {
    setGorevler(gorevler.filter(gorev => gorev.id !== id));
  };

  const oncelikDegistir = (id, yeniOncelik) => {
    setGorevler(gorevler.map(gorev => 
      gorev.id === id 
        ? { ...gorev, oncelik: yeniOncelik }
        : gorev
    ));
  };

  const tumTamamlananlarıSil = () => {
    setGorevler(gorevler.filter(gorev => !gorev.tamamlandi));
  };

  // Filtrelenmiş görevleri getir
  const filtrelenmisGorevler = gorevler.filter(gorev => {
    switch (filtre) {
      case 'aktif':
        return !gorev.tamamlandi;
      case 'tamamlanan':
        return gorev.tamamlandi;
      default:
        return true;
    }
  });

  // İstatistikler
  const toplamGorev = gorevler.length;
  const tamamlananGorev = gorevler.filter(g => g.tamamlandi).length;
  const aktifGorev = toplamGorev - tamamlananGorev;

  const oncelikRenkleri = {
    düşük: 'var(--success-500)',
    normal: 'var(--text-secondary)',
    yüksek: 'var(--error-500)'
  };

  return (
    <div className="todo-app">
      {/* Header */}
      <header className="todo-header">
        <div className="header-ust">
          <Link to="/" className="geri-btn">
            ← Ana Sayfa
          </Link>
          <h1 className="todo-baslik">
            📝 Yapılacaklar Listesi
          </h1>
        </div>
        
        {/* İstatistikler */}
        <div className="istatistikler">
          <div className="istatistik-kart">
            <span className="istatistik-sayi">{toplamGorev}</span>
            <span className="istatistik-etiket">Toplam</span>
          </div>
          <div className="istatistik-kart aktif">
            <span className="istatistik-sayi">{aktifGorev}</span>
            <span className="istatistik-etiket">Aktif</span>
          </div>
          <div className="istatistik-kart tamamlanan">
            <span className="istatistik-sayi">{tamamlananGorev}</span>
            <span className="istatistik-etiket">Tamamlanan</span>
          </div>
        </div>
      </header>

      <main className="todo-main">
        {/* Görev Ekleme Formu */}
        <form className="gorev-form" onSubmit={gorevEkle}>
          <div className="form-grup">
            <input
              type="text"
              value={yeniGorev}
              onChange={(e) => setYeniGorev(e.target.value)}
              placeholder="Yeni bir görev ekleyin..."
              className="gorev-input"
              maxLength={200}
            />
            <button type="submit" className="ekle-btn">
              ➕ Ekle
            </button>
          </div>
        </form>

        {/* Filtreler */}
        <div className="filtreler">
          <button 
            className={`filtre-btn ${filtre === 'tumunu' ? 'aktif' : ''}`}
            onClick={() => setFiltre('tumunu')}
          >
            Tümünü Göster ({toplamGorev})
          </button>
          <button 
            className={`filtre-btn ${filtre === 'aktif' ? 'aktif' : ''}`}
            onClick={() => setFiltre('aktif')}
          >
            Aktif ({aktifGorev})
          </button>
          <button 
            className={`filtre-btn ${filtre === 'tamamlanan' ? 'aktif' : ''}`}
            onClick={() => setFiltre('tamamlanan')}
          >
            Tamamlanan ({tamamlananGorev})
          </button>
          
          {tamamlananGorev > 0 && (
            <button 
              className="temizle-btn"
              onClick={tumTamamlananlarıSil}
            >
              🗑️ Tamamlananları Temizle
            </button>
          )}
        </div>

        {/* Görevler Listesi */}
        <div className="gorevler-container">
          {filtrelenmisGorevler.length === 0 ? (
            <div className="bos-durum">
              <div className="bos-durum-ikon">
                {filtre === 'tamamlanan' ? '🎉' : '📝'}
              </div>
              <h3>
                {filtre === 'tamamlanan' 
                  ? 'Henüz tamamlanmış görev yok' 
                  : filtre === 'aktif'
                  ? 'Tüm görevler tamamlandı! 🎉'
                  : 'Henüz görev eklenmemiş'
                }
              </h3>
              <p>
                {filtre === 'tamamlanan' 
                  ? 'Görevlerinizi tamamladıkça burada görünecekler.' 
                  : filtre === 'aktif'
                  ? 'Harika iş çıkardınız! Yeni görevler ekleyebilirsiniz.'
                  : 'Yukarıdaki forma yeni görevlerinizi ekleyerek başlayın.'
                }
              </p>
            </div>
          ) : (
            <div className="gorevler-listesi">
              {filtrelenmisGorevler.map((gorev) => (
                <div 
                  key={gorev.id} 
                  className={`gorev-kartı ${gorev.tamamlandi ? 'tamamlandi' : ''}`}
                >
                  <div className="gorev-sol">
                    <button
                      className="gorev-checkbox"
                      onClick={() => gorevDurumDegistir(gorev.id)}
                    >
                      {gorev.tamamlandi ? '✅' : '⭕'}
                    </button>
                    
                    <div className="gorev-icerik">
                      <span className="gorev-metin">
                        {gorev.metin}
                      </span>
                      <span className="gorev-tarih">
                        {new Date(gorev.olusturulmaTarihi).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="gorev-sag">
                    <select
                      value={gorev.oncelik}
                      onChange={(e) => oncelikDegistir(gorev.id, e.target.value)}
                      className="oncelik-secici"
                      style={{ borderColor: oncelikRenkleri[gorev.oncelik] }}
                    >
                      <option value="düşük">🟢 Düşük</option>
                      <option value="normal">🟡 Normal</option>
                      <option value="yüksek">🔴 Yüksek</option>
                    </select>
                    
                    <button
                      className="sil-btn"
                      onClick={() => gorevSil(gorev.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default TodoApp;