import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HesapMakinesi.css';

/**
 * Hesap Makinesi Uygulaması
 * Temel matematik işlemlerini yapabilen hesap makinesi
 */
function HesapMakinesi() {
  const [ekran, setEkran] = useState('0');
  const [oncekiDeger, setOncekiDeger] = useState(null);
  const [islem, setIslem] = useState(null);
  const [yeniSayiBekleniyor, setYeniSayiBekleniyor] = useState(false);
  const [gecmis, setGecmis] = useState([]);

  // LocalStorage'dan geçmişi yükle
  useEffect(() => {
    const kaydedilmisGecmis = localStorage.getItem('mycompanion-hesap-gecmis');
    if (kaydedilmisGecmis) {
      setGecmis(JSON.parse(kaydedilmisGecmis));
    }
  }, []);

  // Geçmişi localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('mycompanion-hesap-gecmis', JSON.stringify(gecmis));
  }, [gecmis]);

  // Klavye desteği
  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = e.key;
      
      if (/[0-9]/.test(key)) {
        sayiGir(key);
      } else if (['+', '-', '*', '/'].includes(key)) {
        islemSec(key);
      } else if (key === 'Enter' || key === '=') {
        hesapla();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        temizle();
      } else if (key === 'Backspace') {
        geriSil();
      } else if (key === '.') {
        ondalikEkle();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [ekran, oncekiDeger, islem, yeniSayiBekleniyor]);

  const sayiGir = (sayi) => {
    if (yeniSayiBekleniyor) {
      setEkran(sayi);
      setYeniSayiBekleniyor(false);
    } else {
      setEkran(ekran === '0' ? sayi : ekran + sayi);
    }
  };

  const ondalikEkle = () => {
    if (yeniSayiBekleniyor) {
      setEkran('0.');
      setYeniSayiBekleniyor(false);
    } else if (ekran.indexOf('.') === -1) {
      setEkran(ekran + '.');
    }
  };

  const islemSec = (yeniIslem) => {
    const girilenDeger = parseFloat(ekran);

    if (oncekiDeger === null) {
      setOncekiDeger(girilenDeger);
    } else if (islem) {
      const mevcutDeger = oncekiDeger || 0;
      const sonuc = hesaplamaYap(mevcutDeger, girilenDeger, islem);
      
      setEkran(String(sonuc));
      setOncekiDeger(sonuc);
    }

    setYeniSayiBekleniyor(true);
    setIslem(yeniIslem);
  };

  const hesapla = () => {
    const girilenDeger = parseFloat(ekran);

    if (oncekiDeger !== null && islem) {
      const sonuc = hesaplamaYap(oncekiDeger, girilenDeger, islem);
      
      // Geçmişe ekle
      const hesaplamaMetni = `${oncekiDeger} ${getIslemSembol(islem)} ${girilenDeger} = ${sonuc}`;
      setGecmis(prev => [
        {
          id: Date.now(),
          metin: hesaplamaMetni,
          tarih: new Date().toLocaleTimeString('tr-TR')
        },
        ...prev.slice(0, 19) // Son 20 işlemi tut
      ]);

      setEkran(String(sonuc));
      setOncekiDeger(null);
      setIslem(null);
      setYeniSayiBekleniyor(true);
    }
  };

  const hesaplamaYap = (birinci, ikinci, islem) => {
    switch (islem) {
      case '+':
        return birinci + ikinci;
      case '-':
        return birinci - ikinci;
      case '*':
        return birinci * ikinci;
      case '/':
        return ikinci !== 0 ? birinci / ikinci : 0;
      default:
        return ikinci;
    }
  };

  const getIslemSembol = (islem) => {
    switch (islem) {
      case '+': return '+';
      case '-': return '-';
      case '*': return '×';
      case '/': return '÷';
      default: return '';
    }
  };

  const temizle = () => {
    setEkran('0');
    setOncekiDeger(null);
    setIslem(null);
    setYeniSayiBekleniyor(false);
  };

  const geriSil = () => {
    if (ekran.length > 1) {
      setEkran(ekran.slice(0, -1));
    } else {
      setEkran('0');
    }
  };

  const gecmisiTemizle = () => {
    setGecmis([]);
  };

  const gecmistenKullan = (deger) => {
    // "=" işaretinden sonraki değeri al
    const sonuc = deger.split(' = ')[1];
    if (sonuc) {
      setEkran(sonuc);
      setYeniSayiBekleniyor(true);
    }
  };

  return (
    <div className="hesap-makinesi">
      <div className="hesap-container">
        {/* Header */}
        <header className="hesap-header">
          <Link to="/" className="geri-btn">
            ← Ana Sayfa
          </Link>
          <h1 className="hesap-baslik">
            🧮 Hesap Makinesi
          </h1>
        </header>

        <div className="hesap-icerik">
          {/* Ana Hesap Makinesi */}
          <div className="hesap-main">
            {/* Ekran */}
            <div className="hesap-ekran">
              <div className="islem-gosterge">
                {oncekiDeger !== null && islem && (
                  <span>{oncekiDeger} {getIslemSembol(islem)}</span>
                )}
              </div>
              <div className="ana-ekran">
                {ekran}
              </div>
            </div>

            {/* Tuş Takımı */}
            <div className="tus-takimi">
              {/* İlk Satır */}
              <button className="tus temizle" onClick={temizle}>C</button>
              <button className="tus geri-sil" onClick={geriSil}>⌫</button>
              <button className="tus islem" onClick={() => islemSec('/')} disabled={ekran === '0' && !oncekiDeger}>÷</button>
              <button className="tus islem" onClick={() => islemSec('*')} disabled={ekran === '0' && !oncekiDeger}>×</button>

              {/* İkinci Satır */}
              <button className="tus sayi" onClick={() => sayiGir('7')}>7</button>
              <button className="tus sayi" onClick={() => sayiGir('8')}>8</button>
              <button className="tus sayi" onClick={() => sayiGir('9')}>9</button>
              <button className="tus islem" onClick={() => islemSec('-')} disabled={ekran === '0' && !oncekiDeger}>-</button>

              {/* Üçüncü Satır */}
              <button className="tus sayi" onClick={() => sayiGir('4')}>4</button>
              <button className="tus sayi" onClick={() => sayiGir('5')}>5</button>
              <button className="tus sayi" onClick={() => sayiGir('6')}>6</button>
              <button className="tus islem" onClick={() => islemSec('+')} disabled={ekran === '0' && !oncekiDeger}>+</button>

              {/* Dördüncü Satır */}
              <button className="tus sayi" onClick={() => sayiGir('1')}>1</button>
              <button className="tus sayi" onClick={() => sayiGir('2')}>2</button>
              <button className="tus sayi" onClick={() => sayiGir('3')}>3</button>
              <button className="tus esittir" onClick={hesapla} rowSpan="2" disabled={!oncekiDeger || !islem}>=</button>

              {/* Beşinci Satır */}
              <button className="tus sayi sifir" onClick={() => sayiGir('0')}>0</button>
              <button className="tus ondalik" onClick={ondalikEkle}>.</button>
            </div>

            {/* Klavye Bilgisi */}
            <div className="klavye-bilgi">
              <p>💡 <strong>Klavye Kısayolları:</strong></p>
              <div className="kisayol-listesi">
                <span>0-9: Sayılar</span>
                <span>+, -, *, /: İşlemler</span>
                <span>Enter/=: Hesapla</span>
                <span>C/Esc: Temizle</span>
                <span>Backspace: Geri sil</span>
              </div>
            </div>
          </div>

          {/* Geçmiş */}
          <div className="gecmis-panel">
            <div className="gecmis-header">
              <h3>📊 İşlem Geçmişi</h3>
              {gecmis.length > 0 && (
                <button className="gecmis-temizle" onClick={gecmisiTemizle}>
                  🗑️ Temizle
                </button>
              )}
            </div>

            <div className="gecmis-liste">
              {gecmis.length === 0 ? (
                <div className="gecmis-bos">
                  <div className="bos-ikon">📝</div>
                  <p>Henüz işlem yapılmadı</p>
                  <span>Hesaplamalarınız burada görünecek</span>
                </div>
              ) : (
                gecmis.map((item) => (
                  <div 
                    key={item.id} 
                    className="gecmis-item"
                    onClick={() => gecmistenKullan(item.metin)}
                  >
                    <div className="gecmis-hesaplama">
                      {item.metin}
                    </div>
                    <div className="gecmis-tarih">
                      {item.tarih}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HesapMakinesi;