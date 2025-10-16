import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddGame.css';

function AddGame() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    platform: 'PC',
    genre: '',
    developer: '',
    year: '',
    status: 'Not Started',
    progress: 0,
    notes: '',
    type: 'normal' // normal veya strategy
  });

  // Campaign state
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    faction: '',
    difficulty: 'Normal',
    status: 'Not Started',
    progress: 0,
    notes: ''
  });

  // Txt dosyası okuma fonksiyonu
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      setError('Lütfen sadece .txt dosyası seçin');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        
        // Txt dosyasından veri parse etme
        const gameData = {};
        const campaignData = [];
        let currentSection = 'game';
        
        lines.forEach(line => {
          if (line.startsWith('CAMPAIGNS:')) {
            currentSection = 'campaigns';
            return;
          }
          
          if (currentSection === 'game') {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
              const value = valueParts.join(':').trim();
              
              switch (key.toLowerCase()) {
                case 'title':
                case 'başlık':
                  gameData.title = value;
                  break;
                case 'platform':
                  gameData.platform = value;
                  break;
                case 'genre':
                case 'tür':
                  gameData.genre = value;
                  break;
                case 'developer':
                case 'geliştirici':
                  gameData.developer = value;
                  break;
                case 'year':
                case 'yıl':
                  gameData.year = value;
                  break;
                case 'status':
                case 'durum':
                  gameData.status = value;
                  break;
                case 'progress':
                case 'ilerleme':
                  gameData.progress = parseInt(value) || 0;
                  break;
                case 'notes':
                case 'notlar':
                  gameData.notes = value;
                  break;
                case 'type':
                case 'tip':
                  gameData.type = value.toLowerCase() === 'strategy' ? 'strategy' : 'normal';
                  break;
              }
            }
          } else if (currentSection === 'campaigns') {
            if (line.startsWith('- ')) {
              const campaignLine = line.substring(2);
              const parts = campaignLine.split('|').map(p => p.trim());
              
              if (parts.length >= 2) {
                const campaign = {
                  id: Date.now() + Math.random(),
                  name: parts[0] || '',
                  faction: parts[1] || 'Bilinmeyen',
                  difficulty: parts[2] || 'Normal',
                  status: parts[3] || 'Not Started',
                  progress: parseInt(parts[4]) || 0,
                  notes: parts[5] || '',
                  createdDate: new Date().toISOString()
                };
                campaignData.push(campaign);
              }
            }
          }
        });

        // Form verilerini güncelle
        setFormData(prev => ({
          ...prev,
          ...gameData
        }));

        // Campaign'leri güncelle
        if (campaignData.length > 0) {
          setCampaigns(campaignData);
        }

        setError(null);
        console.log('✅ Txt dosyası başarıyla yüklendi');
        
      } catch (err) {
        console.error('❌ Txt dosyası okuma hatası:', err);
        setError('Txt dosyası formatı hatalı. Yardım butonuna tıklayarak doğru formatı öğrenin.');
      }
    };

    reader.readAsText(file, 'UTF-8');
    // Input'u temizle
    event.target.value = '';
  };

  // Form alanlarını güncelle
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Campaign form alanlarını güncelle
  const handleCampaignInputChange = (e) => {
    const { name, value } = e.target;
    setNewCampaign(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Yeni campaign ekle
  const handleAddCampaign = () => {
    if (!newCampaign.name.trim()) {
      setError('Campaign adı gerekli');
      return;
    }

    const campaign = {
      id: Date.now(),
      name: newCampaign.name.trim(),
      faction: newCampaign.faction.trim() || 'Bilinmeyen',
      difficulty: newCampaign.difficulty,
      status: newCampaign.status,
      progress: parseInt(newCampaign.progress) || 0,
      notes: newCampaign.notes.trim(),
      createdDate: new Date().toISOString()
    };

    setCampaigns(prev => [...prev, campaign]);
    
    // Form temizle
    setNewCampaign({
      name: '',
      faction: '',
      difficulty: 'Normal',
      status: 'Not Started',
      progress: 0,
      notes: ''
    });

    setError(null);
    console.log('✅ Campaign eklendi:', campaign.name);
  };

  // Campaign sil
  const handleRemoveCampaign = (campaignId) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    console.log('🗑️ Campaign silindi:', campaignId);
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Form validasyonu
      if (!formData.title.trim()) {
        throw new Error('Oyun başlığı gerekli');
      }

      // Campaign listesi hazırla - eğer boşsa default campaign ekle
      const finalCampaigns = campaigns.length > 0 ? campaigns : [{
        id: Date.now(),
        name: 'Ana Campaign',
        faction: 'Varsayılan',
        difficulty: 'Normal',
        status: formData.status,
        progress: parseInt(formData.progress) || 0,
        notes: '',
        createdDate: new Date().toISOString()
      }];

      // Yeni oyun objesi oluştur
      const newGame = {
        id: Date.now(), // Basit ID oluşturma
        title: formData.title.trim(),
        platform: formData.platform,
        genre: formData.genre.trim() || 'Bilinmeyen',
        developer: formData.developer.trim() || 'Bilinmeyen',
        year: formData.year ? parseInt(formData.year) : null,
        status: formData.status,
        progress: parseInt(formData.progress) || 0,
        type: formData.type,
        notes: formData.notes.trim(),
        addedDate: new Date().toISOString(),
        campaigns: finalCampaigns
      };

      // Mevcut oyunları al
      const existingGames = JSON.parse(localStorage.getItem('gameTracker_games') || '[]');
      
      // Yeni oyunu ekle
      const updatedGames = [...existingGames, newGame];
      
      // localStorage'a kaydet
      localStorage.setItem('gameTracker_games', JSON.stringify(updatedGames));
      
      console.log('✅ Yeni oyun eklendi:', newGame.title);
      setSuccess(true);
      
      // Formu temizle
      setFormData({
        title: '',
        platform: 'PC',
        genre: '',
        developer: '',
        year: '',
        status: 'Not Started',
        progress: 0,
        notes: '',
        type: 'normal'
      });

      // Campaign'leri temizle
      setCampaigns([]);
      setNewCampaign({
        name: '',
        faction: '',
        difficulty: 'Normal',
        status: 'Not Started',
        progress: 0,
        notes: ''
      });

      // 2 saniye sonra GameTracker'a yönlendir
      setTimeout(() => {
        navigate('/game-tracker');
      }, 2000);

    } catch (err) {
      console.error('❌ Oyun ekleme hatası:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Geri dön
  const handleGoBack = () => {
    navigate('/game-tracker');
  };

  return (
    <div className="add-game-container">
      <div className="add-game-header">
        <button className="back-btn" onClick={handleGoBack}>
          ← Geri Dön
        </button>
        <h1>🎮 Yeni Oyun Ekle</h1>
        
        {/* Txt Import ve Yardım Butonları */}
        <div className="header-actions">
          <div className="import-section">
            <label htmlFor="txt-import" className="import-btn">
              📄 Txt'den Yükle
            </label>
            <input
              type="file"
              id="txt-import"
              accept=".txt"
              onChange={handleFileImport}
              style={{ display: 'none' }}
            />
          </div>
          
          <button 
            className="help-btn"
            onClick={() => setShowHelpModal(true)}
            title="Txt dosyası formatı hakkında yardım"
          >
            ❓
          </button>
        </div>
      </div>

      {/* Yardım Modal'ı */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📄 Txt Dosyası Formatı</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowHelpModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <p><strong>Txt dosyanız şu formatta olmalıdır:</strong></p>
              
              <div className="format-example">
                <h4>🎮 Oyun Bilgileri:</h4>
                <pre>{`title: Total War: Warhammer III
platform: PC
genre: Strategy
developer: Creative Assembly
year: 2022
status: In Progress
progress: 75
notes: Harika bir strateji oyunu
type: strategy

CAMPAIGNS:
- Empire Campaign | Empire | Normal | Completed | 100 | İlk campaign tamamlandı
- Chaos Campaign | Chaos Warriors | Hard | In Progress | 60 | Zorlu ama eğlenceli
- Dwarf Campaign | Dwarfs | Normal | Not Started | 0 | Henüz başlamadım`}</pre>
              </div>

              <div className="format-rules">
                <h4>📋 Kurallar:</h4>
                <ul>
                  <li><strong>Oyun bilgileri:</strong> "anahtar: değer" formatında</li>
                  <li><strong>Campaign'ler:</strong> "CAMPAIGNS:" satırından sonra</li>
                  <li><strong>Campaign formatı:</strong> "- İsim | Faction | Zorluk | Durum | İlerleme | Notlar"</li>
                  <li><strong>Türkçe anahtar kelimeler:</strong> başlık, tür, geliştirici, yıl, durum, ilerleme, notlar, tip</li>
                  <li><strong>Platform seçenekleri:</strong> PC, PlayStation, Xbox, Nintendo Switch, Mobile, Multi-platform</li>
                  <li><strong>Durum seçenekleri:</strong> Not Started, In Progress, Completed, On Hold, Dropped</li>
                  <li><strong>Tip seçenekleri:</strong> normal, strategy</li>
                </ul>
              </div>

              <div className="format-tips">
                <h4>💡 İpuçları:</h4>
                <ul>
                  <li>Boş satırlar otomatik olarak atlanır</li>
                  <li>Campaign eklemek zorunlu değil</li>
                  <li>Tüm alanlar opsiyonel (title hariç)</li>
                  <li>Dosya UTF-8 kodlamasında olmalı</li>
                </ul>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="close-btn"
                onClick={() => setShowHelpModal(false)}
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="add-game-content">
        <form onSubmit={handleSubmit} className="add-game-form">
          {/* Başlık */}
          <div className="form-group">
            <label htmlFor="title">Oyun Başlığı *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="örn: Total War: Warhammer III"
              required
            />
          </div>

          {/* Platform */}
          <div className="form-group">
            <label htmlFor="platform">Platform</label>
            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
            >
              <option value="PC">PC</option>
              <option value="PlayStation">PlayStation</option>
              <option value="Xbox">Xbox</option>
              <option value="Nintendo Switch">Nintendo Switch</option>
              <option value="Mobile">Mobile</option>
              <option value="Multi-platform">Multi-platform</option>
            </select>
          </div>

          {/* Genre */}
          <div className="form-group">
            <label htmlFor="genre">Tür</label>
            <input
              type="text"
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              placeholder="örn: Strategy, RPG, Action"
            />
          </div>

          {/* Developer */}
          <div className="form-group">
            <label htmlFor="developer">Geliştirici</label>
            <input
              type="text"
              id="developer"
              name="developer"
              value={formData.developer}
              onChange={handleInputChange}
              placeholder="örn: Creative Assembly"
            />
          </div>

          {/* Yıl */}
          <div className="form-group">
            <label htmlFor="year">Çıkış Yılı</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              placeholder="örn: 2022"
              min="1970"
              max="2030"
            />
          </div>

          {/* Durum */}
          <div className="form-group">
            <label htmlFor="status">Durum</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="Not Started">Başlanmadı</option>
              <option value="In Progress">Devam Ediyor</option>
              <option value="Completed">Tamamlandı</option>
              <option value="On Hold">Beklemede</option>
              <option value="Dropped">Bırakıldı</option>
            </select>
          </div>

          {/* İlerleme */}
          <div className="form-group">
            <label htmlFor="progress">İlerleme (%)</label>
            <input
              type="number"
              id="progress"
              name="progress"
              value={formData.progress}
              onChange={handleInputChange}
              min="0"
              max="100"
            />
          </div>

          {/* Oyun Tipi */}
          <div className="form-group">
            <label htmlFor="type">Oyun Tipi</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="normal">Normal Oyun</option>
              <option value="strategy">Strateji Oyunu</option>
            </select>
          </div>

          {/* Notlar */}
          <div className="form-group">
            <label htmlFor="notes">Notlar</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Oyun hakkında notlarınız..."
              rows="3"
            />
          </div>

          {/* Campaign Bölümü */}
          <div className="campaigns-section">
            <h3>🎯 Campaign'ler</h3>
            <p className="campaigns-info">
              Campaign eklemezseniz otomatik olarak "Ana Campaign" oluşturulur.
            </p>

            {/* Mevcut Campaign'ler */}
            {campaigns.length > 0 && (
              <div className="existing-campaigns">
                <h4>Eklenen Campaign'ler ({campaigns.length})</h4>
                <div className="campaigns-list">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="campaign-item">
                      <div className="campaign-info">
                        <strong>{campaign.name}</strong>
                        {campaign.faction && <span className="faction">({campaign.faction})</span>}
                        <div className="campaign-details">
                          <span className="difficulty">{campaign.difficulty}</span>
                          <span className="status">{campaign.status}</span>
                          <span className="progress">{campaign.progress}%</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="remove-campaign-btn"
                        onClick={() => handleRemoveCampaign(campaign.id)}
                        title="Campaign'i Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Yeni Campaign Ekleme */}
            <div className="add-campaign-section">
              <h4>➕ Yeni Campaign Ekle</h4>
              <div className="campaign-form">
                <div className="campaign-row">
                  <div className="form-group">
                    <label htmlFor="campaignName">Campaign Adı *</label>
                    <input
                      type="text"
                      id="campaignName"
                      name="name"
                      value={newCampaign.name}
                      onChange={handleCampaignInputChange}
                      placeholder="örn: Empire Campaign, Mortal Empires"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="campaignFaction">Faction</label>
                    <input
                      type="text"
                      id="campaignFaction"
                      name="faction"
                      value={newCampaign.faction}
                      onChange={handleCampaignInputChange}
                      placeholder="örn: Empire, Dwarfs, Chaos"
                    />
                  </div>
                </div>

                <div className="campaign-row">
                  <div className="form-group">
                    <label htmlFor="campaignDifficulty">Zorluk</label>
                    <select
                      id="campaignDifficulty"
                      name="difficulty"
                      value={newCampaign.difficulty}
                      onChange={handleCampaignInputChange}
                    >
                      <option value="Easy">Kolay</option>
                      <option value="Normal">Normal</option>
                      <option value="Hard">Zor</option>
                      <option value="Very Hard">Çok Zor</option>
                      <option value="Legendary">Efsanevi</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="campaignStatus">Durum</label>
                    <select
                      id="campaignStatus"
                      name="status"
                      value={newCampaign.status}
                      onChange={handleCampaignInputChange}
                    >
                      <option value="Not Started">Başlanmadı</option>
                      <option value="In Progress">Devam Ediyor</option>
                      <option value="Completed">Tamamlandı</option>
                      <option value="On Hold">Beklemede</option>
                      <option value="Dropped">Bırakıldı</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="campaignProgress">İlerleme (%)</label>
                    <input
                      type="number"
                      id="campaignProgress"
                      name="progress"
                      value={newCampaign.progress}
                      onChange={handleCampaignInputChange}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="campaignNotes">Campaign Notları</label>
                  <textarea
                    id="campaignNotes"
                    name="notes"
                    value={newCampaign.notes}
                    onChange={handleCampaignInputChange}
                    placeholder="Bu campaign hakkında notlarınız..."
                    rows="2"
                  />
                </div>

                <button
                  type="button"
                  className="add-campaign-btn"
                  onClick={handleAddCampaign}
                  disabled={!newCampaign.name.trim()}
                >
                  ➕ Campaign Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Hata mesajı */}
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {/* Başarı mesajı */}
          {success && (
            <div className="success-message">
              ✅ Oyun başarıyla eklendi! GameTracker'a yönlendiriliyorsunuz...
            </div>
          )}

          {/* Submit butonu */}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? '🔄 Ekleniyor...' : '✅ Oyunu Ekle'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddGame;