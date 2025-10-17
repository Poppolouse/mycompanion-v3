import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GameDetail.css';

/**
 * 🎮 Game Detail - Phase 3: Oyun Detay Sayfası
 * Seçilen oyunun detaylı bilgilerini gösterir
 */
function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State yönetimi
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Başlanmadı');
  
  // Campaign sistemi state'leri
  const [campaigns, setCampaigns] = useState([]);
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    progress: 0,
    status: 'Başlanmadı',
    startDate: '',
    endDate: '',
    notes: ''
  });

  // Oyun verilerini yükle
  useEffect(() => {
    loadGameData();
  }, [id]);

  // LocalStorage'dan oyun verilerini yükle
  const loadGameData = () => {
    try {
      setLoading(true);
      
      // Oyun listesini localStorage'dan al
      let savedGames = localStorage.getItem('gameTracker_games');
      
      // Eğer hiç oyun yoksa, test verileri ekle
      if (!savedGames) {
        const testGames = [
          {
            id: '1',
            title: 'The Witcher 3: Wild Hunt',
            platform: 'PC',
            genre: 'RPG',
            progress: 75,
            status: 'Oynuyor',
            phase: 'Ana Hikaye',
            factions: ['Temeria', 'Nilfgaard', 'Skellige'],
            addedDate: new Date().toISOString(),
            campaigns: [
              {
                id: 'campaign_1',
                name: 'Ana Hikaye',
                description: 'Ciri\'yi bulma yolculuğu',
                progress: 75,
                status: 'Oynuyor',
                startDate: '2024-01-15',
                endDate: '',
                notes: 'Novigrad\'da Triss ile buluştum'
              },
              {
                id: 'campaign_2',
                name: 'Blood and Wine',
                description: 'Toussaint\'ta vampir avı',
                progress: 0,
                status: 'Başlanmadı',
                startDate: '',
                endDate: '',
                notes: ''
              }
            ]
          },
          {
            id: '2',
            title: 'Distant Worlds 2',
            platform: 'PC',
            genre: 'Strategy',
            progress: 60,
            status: 'Oynuyor',
            phase: 'Galactic Empire',
            factions: ['Humans', 'Zenox', 'Ackdarians'],
            addedDate: new Date().toISOString(),
            campaigns: [
              {
                id: 'campaign_1',
                name: 'Humans - Rise of the Empire',
                description: 'İnsanlığın galaktik imparatorluk kurma hikayesi',
                progress: 85,
                status: 'Tamamlandı',
                startDate: '2024-01-10',
                endDate: '2024-01-25',
                notes: 'Tüm sektörleri ele geçirdim, ekonomi güçlü'
              },
              {
                id: 'campaign_2',
                name: 'Zenox - Ancient Guardians',
                description: 'Eski koruyucuların geri dönüşü',
                progress: 45,
                status: 'Oynuyor',
                startDate: '2024-01-26',
                endDate: '',
                notes: 'Teknoloji ağacında ilerledim, askeri güç yetersiz'
              },
              {
                id: 'campaign_3',
                name: 'Ackdarians - Merchants of Space',
                description: 'Galaktik ticaret imparatorluğu',
                progress: 0,
                status: 'Başlanmadı',
                startDate: '',
                endDate: '',
                notes: ''
              }
            ]
          },
          {
            id: '3',
            title: 'Red Dead Redemption 2',
            platform: 'PC',
            genre: 'Action Adventure',
            progress: 100,
            status: 'Tamamlandı',
            phase: 'Epilogue',
            factions: ['Van der Linde Gang'],
            addedDate: new Date().toISOString(),
            campaigns: [
              {
                id: 'campaign_1',
                name: 'Arthur\'s Story',
                description: 'Arthur Morgan\'ın hikayesi',
                progress: 100,
                status: 'Tamamlandı',
                startDate: '2023-12-01',
                endDate: '2024-01-05',
                notes: 'Muhteşem bir hikaye, çok etkileyiciydi'
              },
              {
                id: 'campaign_2',
                name: 'John\'s Epilogue',
                description: 'John Marston\'ın yeni hayatı',
                progress: 100,
                status: 'Tamamlandı',
                startDate: '2024-01-05',
                endDate: '2024-01-08',
                notes: 'Güzel bir son, hikayeyi tamamladı'
              }
            ]
          }
        ];
        
        localStorage.setItem('gameTracker_games', JSON.stringify(testGames));
        savedGames = JSON.stringify(testGames);
      }

      const games = JSON.parse(savedGames);
      // ID'yi hem string hem number olarak kontrol et
      const foundGame = games.find(g => g.id === id || g.id === parseInt(id) || g.id.toString() === id);
      
      if (!foundGame) {
        console.log('🔍 Aranan ID:', id, 'Type:', typeof id);
        console.log('📋 Mevcut oyunlar:', games.map(g => ({ id: g.id, title: g.title, idType: typeof g.id })));
        setError(`Oyun bulunamadı (ID: ${id}). Mevcut oyunlar: ${games.map(g => `${g.title} (ID: ${g.id})`).join(', ')}`);
        return;
      }

      setGame(foundGame);
      setProgress(foundGame.progress || 0);
      setStatus(foundGame.status || 'Başlanmadı');
      
      // Campaign verilerini yükle
      setCampaigns(foundGame.campaigns || []);
      
      // Oyuna özel notları yükle
      const savedNotes = localStorage.getItem(`gameTracker_notes_${id}`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
      
    } catch (err) {
      console.error('❌ Oyun verisi yükleme hatası:', err);
      setError('Oyun verisi yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Geri dönüş
  const handleGoBack = () => {
    navigate('/game-tracking-hub');
  };

  // İlerleme güncelleme
  const handleProgressChange = (newProgress) => {
    setProgress(newProgress);
    updateGameData({ progress: newProgress });
  };

  // Durum güncelleme
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    updateGameData({ status: newStatus });
  };

  // Oyun verilerini güncelle
  const updateGameData = (updates) => {
    try {
      const savedGames = localStorage.getItem('gameTracker_games');
      if (!savedGames) return;

      const games = JSON.parse(savedGames);
      const gameIndex = games.findIndex(g => g.id === id);
      
      if (gameIndex !== -1) {
        games[gameIndex] = { ...games[gameIndex], ...updates };
        localStorage.setItem('gameTracker_games', JSON.stringify(games));
        setGame(games[gameIndex]);
      }
    } catch (err) {
      console.error('❌ Oyun güncelleme hatası:', err);
    }
  };

  // Campaign ekleme
  const handleAddCampaign = () => {
    if (!newCampaign.name.trim()) return;

    const campaign = {
      id: `campaign_${Date.now()}`,
      name: newCampaign.name.trim(),
      description: newCampaign.description.trim(),
      progress: parseInt(newCampaign.progress) || 0,
      status: newCampaign.status,
      startDate: newCampaign.startDate,
      endDate: newCampaign.endDate,
      notes: newCampaign.notes.trim()
    };

    const updatedCampaigns = [...campaigns, campaign];
    setCampaigns(updatedCampaigns);
    
    // Oyun verisini güncelle
    updateGameData({ campaigns: updatedCampaigns });
    
    // Form'u temizle
    setNewCampaign({
      name: '',
      description: '',
      progress: 0,
      status: 'Başlanmadı',
      startDate: '',
      endDate: '',
      notes: ''
    });
    setShowAddCampaign(false);
  };

  // Campaign güncelleme
  const handleUpdateCampaign = (campaignId, updates) => {
    const updatedCampaigns = campaigns.map(campaign =>
      campaign.id === campaignId ? { ...campaign, ...updates } : campaign
    );
    setCampaigns(updatedCampaigns);
    updateGameData({ campaigns: updatedCampaigns });
  };

  // Campaign silme
  const handleDeleteCampaign = (campaignId) => {
    if (!confirm('Bu campaign\'i silmek istediğinizden emin misiniz?')) return;
    
    const updatedCampaigns = campaigns.filter(campaign => campaign.id !== campaignId);
    setCampaigns(updatedCampaigns);
    updateGameData({ campaigns: updatedCampaigns });
  };

  // Not ekleme
  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note = {
      id: Date.now(),
      text: newNote.trim(),
      date: new Date().toLocaleDateString('tr-TR'),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    setNewNote('');
    
    // LocalStorage'a kaydet
    localStorage.setItem(`gameTracker_notes_${id}`, JSON.stringify(updatedNotes));
  };

  // Not silme
  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem(`gameTracker_notes_${id}`, JSON.stringify(updatedNotes));
  };

  // Loading durumu
  if (loading) {
    return (
      <div className="game-detail-page">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <h2>Oyun yükleniyor...</h2>
        </div>
      </div>
    );
  }

  // Error durumu
  if (error) {
    return (
      <div className="game-detail-page">
        <button className="back-button" onClick={handleGoBack}>
          ← Oyun Takibi Hub'a Dön
        </button>
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h2>Hata Oluştu</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Ana render
  return (
    <div className="game-detail-page">
      {/* Header */}
      <div className="detail-header">
        <button className="back-button" onClick={handleGoBack}>
          ← Oyun Takibi Hub
        </button>
        <h1>{game.title || 'İsimsiz Oyun'}</h1>
      </div>

      {/* Ana İçerik */}
      <div className="detail-content">
        {/* Sol Panel - Oyun Bilgileri */}
        <div className="game-info-panel">
          {/* Kapak Görseli Alanı */}
          <div className="game-cover">
            <div className="cover-placeholder">
              🎮
            </div>
          </div>

          {/* Temel Bilgiler */}
          <div className="basic-info">
            <div className="info-item">
              <span className="label">Platform:</span>
              <span className="value">{game.platform || 'Belirtilmemiş'}</span>
            </div>
            
            <div className="info-item">
              <span className="label">Tür:</span>
              <span className="value">{game.type || 'Bilinmiyor'}</span>
            </div>
            
            <div className="info-item">
              <span className="label">Durum:</span>
              <select 
                className="status-select"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="Başlanmadı">Başlanmadı</option>
                <option value="Oynuyor">Oynuyor</option>
                <option value="Tamamlandı">Tamamlandı</option>
                <option value="Bırakıldı">Bırakıldı</option>
                <option value="Beklemede">Beklemede</option>
              </select>
            </div>
            
            <div className="info-item">
              <span className="label">İlerleme:</span>
              <div className="progress-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                  className="progress-slider"
                />
                <span className="progress-value">{progress}%</span>
              </div>
            </div>
          </div>

          {/* Fraksiyonlar */}
          {game.factions && game.factions.length > 0 && (
            <div className="factions-section">
              <h3>Fraksiyonlar</h3>
              <div className="factions-grid">
                {game.factions.map((faction, index) => (
                  <div key={index} className="faction-card">
                    <span className="faction-name">{faction.name}</span>
                    <span className="faction-progress">{faction.progress || 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campaign'ler */}
          <div className="campaigns-section">
            <div className="campaigns-header">
              <h3>🎯 Campaign'ler</h3>
              <button 
                className="add-campaign-button"
                onClick={() => setShowAddCampaign(!showAddCampaign)}
              >
                {showAddCampaign ? '❌ İptal' : '➕ Campaign Ekle'}
              </button>
            </div>

            {/* Campaign Ekleme Formu */}
            {showAddCampaign && (
              <div className="add-campaign-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Campaign adı"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    className="campaign-input"
                  />
                </div>
                
                <div className="form-row">
                  <textarea
                    placeholder="Açıklama"
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                    className="campaign-textarea"
                    rows="2"
                  />
                </div>

                <div className="form-row">
                  <select
                    value={newCampaign.status}
                    onChange={(e) => setNewCampaign({...newCampaign, status: e.target.value})}
                    className="campaign-select"
                  >
                    <option value="Başlanmadı">Başlanmadı</option>
                    <option value="Oynuyor">Oynuyor</option>
                    <option value="Tamamlandı">Tamamlandı</option>
                    <option value="Bırakıldı">Bırakıldı</option>
                  </select>
                  
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="İlerleme %"
                    value={newCampaign.progress}
                    onChange={(e) => setNewCampaign({...newCampaign, progress: e.target.value})}
                    className="campaign-progress-input"
                  />
                </div>

                <div className="form-row">
                  <input
                    type="date"
                    placeholder="Başlangıç tarihi"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                    className="campaign-date"
                  />
                  
                  <input
                    type="date"
                    placeholder="Bitiş tarihi"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                    className="campaign-date"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    onClick={handleAddCampaign}
                    className="save-campaign-button"
                    disabled={!newCampaign.name.trim()}
                  >
                    💾 Kaydet
                  </button>
                </div>
              </div>
            )}

            {/* Campaign Listesi */}
            <div className="campaigns-list">
              {campaigns.length === 0 ? (
                <div className="no-campaigns">
                  <p>Henüz campaign eklenmemiş</p>
                  <small>Bu oyun için farklı campaign'ler ekleyebilirsiniz</small>
                </div>
              ) : (
                campaigns.map(campaign => (
                  <div key={campaign.id} className="campaign-card">
                    <div className="campaign-header">
                      <h4 className="campaign-name">{campaign.name}</h4>
                      <div className="campaign-actions">
                        <button 
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="delete-campaign-button"
                          title="Campaign'i sil"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {campaign.description && (
                      <p className="campaign-description">{campaign.description}</p>
                    )}
                    
                    <div className="campaign-info">
                      <div className="campaign-status">
                        <span className={`status-badge ${campaign.status.toLowerCase().replace(' ', '-')}`}>
                          {campaign.status}
                        </span>
                        <span className="campaign-progress">{campaign.progress}%</span>
                      </div>
                      
                      <div className="campaign-progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${campaign.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {(campaign.startDate || campaign.endDate) && (
                      <div className="campaign-dates">
                        {campaign.startDate && (
                          <span className="start-date">📅 {campaign.startDate}</span>
                        )}
                        {campaign.endDate && (
                          <span className="end-date">🏁 {campaign.endDate}</span>
                        )}
                      </div>
                    )}

                    {campaign.notes && (
                      <div className="campaign-notes">
                        <small>📝 {campaign.notes}</small>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sağ Panel - Notlar */}
        <div className="notes-panel">
          <h3>Notlarım</h3>
          
          {/* Not Ekleme */}
          <div className="add-note">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Oyun hakkında notlarınızı yazın..."
              className="note-input"
              rows="3"
            />
            <button 
              onClick={handleAddNote}
              className="add-note-button"
              disabled={!newNote.trim()}
            >
              📝 Not Ekle
            </button>
          </div>

          {/* Notlar Listesi */}
          <div className="notes-list">
            {notes.length === 0 ? (
              <div className="no-notes">
                <p>Henüz not eklenmemiş</p>
              </div>
            ) : (
              notes.map(note => (
                <div key={note.id} className="note-item">
                  <div className="note-header">
                    <span className="note-date">{note.date} - {note.time}</span>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="delete-note"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="note-text">{note.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="detail-footer">
        <span className="phase-badge">Phase 3: Oyun Detayları</span>
        <span className="status-badge">✨ Yeni</span>
      </div>
    </div>
  );
}

export default GameDetail;