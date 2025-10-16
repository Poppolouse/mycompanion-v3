import { useState } from 'react';
import './KullaniciSorusu.css';

/**
 * Kullanıcıya soru soran ve cevabına göre öneriler sunan komponent
 * 
 * @param {Object} props
 * @param {Function} props.onCevapVer - Kullanıcı cevap verdiğinde çağrılacak fonksiyon
 */
function KullaniciSorusu({ onCevapVer }) {
  const [secilenCevap, setSecilenCevap] = useState('');
  const [cevapVerildi, setCevapVerildi] = useState(false);

  const sorular = [
    {
      id: 'amaç',
      soru: '🤔 Bugün hangi konuda yardıma ihtiyacınız var?',
      cevaplar: [
        {
          id: 'verimlilik',
          metin: '📈 Verimlilik ve organizasyon',
          aciklama: 'Görevlerimi organize etmek ve daha verimli çalışmak istiyorum',
          onerilenKategoriler: ['Verimlilik']
        },
        {
          id: 'hesaplama',
          metin: '🧮 Hesaplama ve matematik',
          aciklama: 'Matematik işlemleri yapmak ve hesaplamalar yapmak istiyorum',
          onerilenKategoriler: ['Araçlar']
        },
        {
          id: 'bilgi',
          metin: '📊 Bilgi ve araştırma',
          aciklama: 'Güncel bilgilere ulaşmak ve araştırma yapmak istiyorum',
          onerilenKategoriler: ['Bilgi']
        },
        {
          id: 'genel',
          metin: '🌟 Genel kullanım',
          aciklama: 'Farklı araçları keşfetmek ve denemek istiyorum',
          onerilenKategoriler: ['Tümü']
        }
      ]
    }
  ];

  const handleCevapSec = (cevap) => {
    setSecilenCevap(cevap);
    setCevapVerildi(true);
    
    // Kısa bir gecikme ile cevabı parent komponente gönder
    setTimeout(() => {
      onCevapVer(cevap);
    }, 500);
  };

  const handleTekrarSor = () => {
    setSecilenCevap('');
    setCevapVerildi(false);
  };

  return (
    <div className="kullanici-sorusu">
      <div className="soru-container">
        <div className="soru-header">
          <h2 className="soru-baslik">
            {sorular[0].soru}
          </h2>
          <p className="soru-alt-baslik">
            Size en uygun araçları önerebilmem için lütfen bir seçenek belirleyin
          </p>
        </div>

        {!cevapVerildi ? (
          <div className="cevaplar-grid">
            {sorular[0].cevaplar.map((cevap) => (
              <button
                key={cevap.id}
                className="cevap-kartı"
                onClick={() => handleCevapSec(cevap)}
              >
                <div className="cevap-ikon">
                  {cevap.metin.split(' ')[0]}
                </div>
                <div className="cevap-icerik">
                  <h3 className="cevap-baslik">
                    {cevap.metin.substring(cevap.metin.indexOf(' ') + 1)}
                  </h3>
                  <p className="cevap-aciklama">
                    {cevap.aciklama}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="cevap-onay">
            <div className="onay-ikon">✅</div>
            <h3 className="onay-baslik">Harika seçim!</h3>
            <p className="onay-mesaj">
              <strong>{secilenCevap.metin}</strong> kategorisine uygun araçları size gösteriyorum...
            </p>
            <button 
              className="tekrar-sor-btn"
              onClick={handleTekrarSor}
            >
              🔄 Farklı bir seçenek dene
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default KullaniciSorusu;