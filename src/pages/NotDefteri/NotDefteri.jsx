import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './NotDefteri.css';

/**
 * Not Defteri Uygulaması
 * Notları oluşturma, düzenleme, silme ve arama özellikleri
 */
function NotDefteri() {
  const [notlar, setNotlar] = useState([]);
  const [aktifNot, setAktifNot] = useState(null);
  const [aramaMetni, setAramaMetni] = useState('');
  const [gorunum, setGorunum] = useState('liste'); // 'liste' veya 'kart'
  const [siralama, setSiralama] = useState('tarih-yeni'); // 'tarih-yeni', 'tarih-eski', 'baslik'
  const [kategoriFiltre, setKategoriFiltre] = useState('tumu');
  const textareaRef = useRef(null);

  // Kategoriler
  const kategoriler = [
    { id: 'tumu', ad: 'Tümü', ikon: '📝', renk: 'var(--text-secondary)' },
    { id: 'kisisel', ad: 'Kişisel', ikon: '👤', renk: 'var(--color-primary-500)' },
    { id: 'is', ad: 'İş', ikon: '💼', renk: 'var(--success-500)' },
    { id: 'fikir', ad: 'Fikirler', ikon: '💡', renk: 'var(--warning-500)' },
    { id: 'gorev', ad: 'Görevler', ikon: '✅', renk: 'var(--error-500)' },
    { id: 'diger', ad: 'Diğer', ikon: '📋', renk: 'var(--color-secondary-500)' }
  ];

  // localStorage'dan notları yükle
  useEffect(() => {
    const kaydedilmisNotlar = localStorage.getItem('vaulttracker:notlar:liste');
    if (kaydedilmisNotlar) {
      const yuklenmiş = JSON.parse(kaydedilmisNotlar);
      setNotlar(yuklenmiş);
      if (yuklenmiş.length > 0) {
        setAktifNot(yuklenmiş[0]);
      }
    }
  }, []);

  // Notları localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('vaulttracker:notlar:liste', JSON.stringify(notlar));
  }, [notlar]);

  // Yeni not oluştur
  const yeniNotOlustur = () => {
    const yeniNot = {
      id: Date.now().toString(),
      baslik: 'Yeni Not',
      icerik: '',
      kategori: 'kisisel',
      olusturmaTarihi: new Date().toISOString(),
      guncellemeTarihi: new Date().toISOString(),
      favori: false,
      etiketler: []
    };
    
    setNotlar(prev => [yeniNot, ...prev]);
    setAktifNot(yeniNot);
    
    // Textarea'ya odaklan
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  // Not güncelle
  const notGuncelle = (alan, deger) => {
    if (!aktifNot) return;
    
    const guncelNot = {
      ...aktifNot,
      [alan]: deger,
      guncellemeTarihi: new Date().toISOString()
    };
    
    setAktifNot(guncelNot);
    setNotlar(prev => prev.map(not => 
      not.id === aktifNot.id ? guncelNot : not
    ));
  };

  // Not sil
  const notSil = (notId) => {
    if (window.confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      setNotlar(prev => prev.filter(not => not.id !== notId));
      
      if (aktifNot && aktifNot.id === notId) {
        const kalanNotlar = notlar.filter(not => not.id !== notId);
        setAktifNot(kalanNotlar.length > 0 ? kalanNotlar[0] : null);
      }
    }
  };

  // Favori durumunu değiştir
  const favoriDegistir = (notId) => {
    setNotlar(prev => prev.map(not => 
      not.id === notId ? { ...not, favori: !not.favori } : not
    ));
    
    if (aktifNot && aktifNot.id === notId) {
      setAktifNot(prev => ({ ...prev, favori: !prev.favori }));
    }
  };

  // Notları filtrele ve sırala
  const filtrelenmisNotlar = notlar
    .filter(not => {
      // Kategori filtresi
      if (kategoriFiltre !== 'tumu' && not.kategori !== kategoriFiltre) {
        return false;
      }
      
      // Arama filtresi
      if (aramaMetni) {
        const arama = aramaMetni.toLowerCase();
        return not.baslik.toLowerCase().includes(arama) || 
               not.icerik.toLowerCase().includes(arama);
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (siralama) {
        case 'tarih-eski':
          return new Date(a.olusturmaTarihi) - new Date(b.olusturmaTarihi);
        case 'baslik':
          return a.baslik.localeCompare(b.baslik, 'tr');
        case 'tarih-yeni':
        default:
          return new Date(b.guncellemeTarihi) - new Date(a.guncellemeTarihi);
      }
    });

  // Tarih formatla
  const tarihFormatla = (tarihStr) => {
    const tarih = new Date(tarihStr);
    const simdi = new Date();
    const fark = simdi - tarih;
    const dakika = Math.floor(fark / 60000);
    const saat = Math.floor(fark / 3600000);
    const gun = Math.floor(fark / 86400000);
    
    if (dakika < 1) return 'Az önce';
    if (dakika < 60) return `${dakika} dakika önce`;
    if (saat < 24) return `${saat} saat önce`;
    if (gun < 7) return `${gun} gün önce`;
    
    return tarih.toLocaleDateString('tr-TR');
  };

  // Kategori bul
  const kategoriBul = (kategoriId) => {
    return kategoriler.find(k => k.id === kategoriId) || kategoriler[0];
  };

  return (
    <div className="not-defteri">
      <div className="not-container">
        {/* Header */}
        <header className="not-header">
          <Link to="/" className="geri-btn">
            ← Ana Sayfa
          </Link>
          <h1 className="not-baslik">📝 Not Defteri</h1>
          <button onClick={yeniNotOlustur} className="yeni-not-btn">
            ➕ Yeni Not
          </button>
        </header>

        <div className="not-icerik">
          {/* Sidebar */}
          <aside className="not-sidebar">
            {/* Arama */}
            <div className="arama-bolumu">
              <div className="arama-kutusu">
                <span className="arama-ikon">🔍</span>
                <input
                  type="text"
                  placeholder="Notlarda ara..."
                  value={aramaMetni}
                  onChange={(e) => setAramaMetni(e.target.value)}
                  className="arama-input"
                />
                {aramaMetni && (
                  <button 
                    onClick={() => setAramaMetni('')}
                    className="arama-temizle"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filtreler */}
            <div className="filtre-bolumu">
              <h3>📂 Kategoriler</h3>
              <div className="kategori-liste">
                {kategoriler.map(kategori => (
                  <button
                    key={kategori.id}
                    onClick={() => setKategoriFiltre(kategori.id)}
                    className={`kategori-btn ${kategoriFiltre === kategori.id ? 'aktif' : ''}`}
                    style={{ '--kategori-renk': kategori.renk }}
                  >
                    <span className="kategori-ikon">{kategori.ikon}</span>
                    <span className="kategori-ad">{kategori.ad}</span>
                    <span className="kategori-sayi">
                      {kategori.id === 'tumu' 
                        ? notlar.length 
                        : notlar.filter(n => n.kategori === kategori.id).length
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Görünüm ve Sıralama */}
            <div className="kontrol-bolumu">
              <div className="gorunum-kontrol">
                <button
                  onClick={() => setGorunum('liste')}
                  className={`gorunum-btn ${gorunum === 'liste' ? 'aktif' : ''}`}
                >
                  📋
                </button>
                <button
                  onClick={() => setGorunum('kart')}
                  className={`gorunum-btn ${gorunum === 'kart' ? 'aktif' : ''}`}
                >
                  🗃️
                </button>
              </div>
              
              <select
                value={siralama}
                onChange={(e) => setSiralama(e.target.value)}
                className="siralama-select"
              >
                <option value="tarih-yeni">Yeni → Eski</option>
                <option value="tarih-eski">Eski → Yeni</option>
                <option value="baslik">Başlık A-Z</option>
              </select>
            </div>

            {/* Not Listesi */}
            <div className="not-listesi">
              <div className="liste-header">
                <h3>📄 Notlar ({filtrelenmisNotlar.length})</h3>
              </div>
              
              {filtrelenmisNotlar.length === 0 ? (
                <div className="bos-liste">
                  <span className="bos-ikon">📝</span>
                  <p>Henüz not yok</p>
                  <button onClick={yeniNotOlustur} className="bos-yeni-btn">
                    İlk notunu oluştur
                  </button>
                </div>
              ) : (
                <div className={`notlar ${gorunum}`}>
                  {filtrelenmisNotlar.map(not => {
                    const kategori = kategoriBul(not.kategori);
                    return (
                      <div
                        key={not.id}
                        onClick={() => setAktifNot(not)}
                        className={`not-item ${aktifNot?.id === not.id ? 'aktif' : ''}`}
                      >
                        <div className="not-item-header">
                          <div className="not-kategori" style={{ color: kategori.renk }}>
                            {kategori.ikon}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              favoriDegistir(not.id);
                            }}
                            className="favori-btn"
                          >
                            {not.favori ? '⭐' : '☆'}
                          </button>
                        </div>
                        
                        <h4 className="not-item-baslik">{not.baslik}</h4>
                        <p className="not-item-ozet">
                          {not.icerik.substring(0, 100)}
                          {not.icerik.length > 100 ? '...' : ''}
                        </p>
                        
                        <div className="not-item-footer">
                          <span className="not-tarih">
                            {tarihFormatla(not.guncellemeTarihi)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              notSil(not.id);
                            }}
                            className="sil-btn"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Ana Editör */}
          <main className="not-editor">
            {aktifNot ? (
              <>
                <div className="editor-header">
                  <input
                    type="text"
                    value={aktifNot.baslik}
                    onChange={(e) => notGuncelle('baslik', e.target.value)}
                    className="baslik-input"
                    placeholder="Not başlığı..."
                  />
                  
                  <div className="editor-kontroller">
                    <select
                      value={aktifNot.kategori}
                      onChange={(e) => notGuncelle('kategori', e.target.value)}
                      className="kategori-select"
                    >
                      {kategoriler.slice(1).map(kategori => (
                        <option key={kategori.id} value={kategori.id}>
                          {kategori.ikon} {kategori.ad}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => favoriDegistir(aktifNot.id)}
                      className="editor-favori-btn"
                    >
                      {aktifNot.favori ? '⭐' : '☆'}
                    </button>
                    
                    <button
                      onClick={() => notSil(aktifNot.id)}
                      className="editor-sil-btn"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="editor-icerik">
                  <textarea
                    ref={textareaRef}
                    value={aktifNot.icerik}
                    onChange={(e) => notGuncelle('icerik', e.target.value)}
                    placeholder="Notunuzu buraya yazın..."
                    className="icerik-textarea"
                  />
                </div>
                
                <div className="editor-footer">
                  <div className="not-istatistik">
                    <span>📊 {aktifNot.icerik.length} karakter</span>
                    <span>📝 {aktifNot.icerik.split('\n').length} satır</span>
                    <span>📅 {tarihFormatla(aktifNot.guncellemeTarihi)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="bos-editor">
                <div className="bos-editor-ikon">📝</div>
                <h2>Not Defteri</h2>
                <p>Düşüncelerinizi, fikirlerinizi ve önemli bilgilerinizi kaydedin</p>
                <button onClick={yeniNotOlustur} className="bos-editor-btn">
                  ➕ İlk Notunu Oluştur
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default NotDefteri;