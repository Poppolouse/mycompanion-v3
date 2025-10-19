import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EditGame.css';

function EditGame() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
    type: 'normal'
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

  // Oyun verilerini yükle
  useEffect(() => {
    const loadGameData = () => {
      try {
        const savedGames = localStorage.getItem('gameTrackerGames');
        if (savedGames) {
          const games = JSON.parse(savedGames);
          const gameIndex = parseInt(gameId);
          
          if (gameIndex >= 0 && gameIndex < games.length) {
            const game = games[gameIndex];
            setFormData({
              title: game.title || game.name || '',
              platform: game.platform || 'PC',
              genre: game.genre || '',
              developer: game.developer || '',
              year: game.year || '',
              status: game.status || 'Not Started',
              progress: game.progress || 0,
              notes: game.notes || '',
              type: game.type || 'normal'
            });
            
            if (game.campaigns) {
              setCampaigns(game.campaigns);
            }
          } else {
            setError('Oyun bulunamadı');
          }
        }
      } catch (err) {
        console.error('Oyun verileri yüklenirken hata:', err);
        setError('Oyun verileri yüklenirken hata oluştu');
      }
    };

    loadGameData();
  }, [gameId]);

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
  };

  // Campaign sil
  const handleRemoveCampaign = (campaignId) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Oyun adı gerekli');
      }

      // Mevcut oyunları al
      const savedGames = localStorage.getItem('gameTrackerGames');
      const games = savedGames ? JSON.parse(savedGames) : [];
      const gameIndex = parseInt(gameId);

      if (gameIndex < 0 || gameIndex >= games.length) {
        throw new Error('Geçersiz oyun ID');
      }

      // Oyun verisini güncelle
      const updatedGame = {
        ...games[gameIndex],
        title: formData.title.trim(),
        name: formData.title.trim(), // Backward compatibility
        platform: formData.platform,
        genre: formData.genre.trim(),
        developer: formData.developer.trim(),
        year: formData.year,
        status: formData.status,
        progress: parseInt(formData.progress) || 0,
        notes: formData.notes.trim(),
        type: formData.type,
        campaigns: campaigns,
        lastModified: new Date().toISOString()
      };

      // Progress ve status tutarlılığı
      if (updatedGame.status === 'completed') {
        updatedGame.progress = 100;
      } else if (updatedGame.status === 'not-started') {
        updatedGame.progress = 0;
      }

      // Son oynanma tarihi güncelle
      if (updatedGame.status === 'playing') {
        updatedGame.lastPlayed = new Date().toISOString().split('T')[0];
      }

      // Oyunları güncelle
      games[gameIndex] = updatedGame;
      localStorage.setItem('gameTrackerGames', JSON.stringify(games));

      setSuccess(true);
      setTimeout(() => {
        navigate('/game-tracking-hub/game-tracker');
      }, 1500);

    } catch (err) {
      console.error('Oyun güncellenirken hata:', err);
      setError(err.message || 'Oyun güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-game">
      <div className="edit-game-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/game-tracking-hub/game-tracker')}
        >
          ← Geri
        </button>
        <h1>Oyun Düzenle</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          ✅ Oyun başarıyla güncellendi!
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-game-form">
        {/* Temel Bilgiler */}
        <div className="form-section">
          <h2>Temel Bilgiler</h2>
          
          <div className="form-group">
            <label htmlFor="title">Oyun Adı *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Oyun adını girin"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="platform">Platform</label>
              <select
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
              >
                <option value="PC">PC</option>
                <option value="PlayStation 5">PlayStation 5</option>
                <option value="PlayStation 4">PlayStation 4</option>
                <option value="Xbox Series X/S">Xbox Series X/S</option>
                <option value="Xbox One">Xbox One</option>
                <option value="Nintendo Switch">Nintendo Switch</option>
                <option value="Mobile">Mobile</option>
                <option value="VR">VR</option>
                <option value="Retro">Retro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="genre">Tür</label>
              <input
                type="text"
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                placeholder="RPG, Action, Strategy..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="developer">Geliştirici</label>
              <input
                type="text"
                id="developer"
                name="developer"
                value={formData.developer}
                onChange={handleInputChange}
                placeholder="Geliştirici firma"
              />
            </div>

            <div className="form-group">
              <label htmlFor="year">Çıkış Yılı</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="1970"
                max={new Date().getFullYear() + 5}
                placeholder="2024"
              />
            </div>
          </div>
        </div>

        {/* Oyun Durumu */}
        <div className="form-section">
          <h2>Oyun Durumu</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Durum</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="not-started">Başlanmadı</option>
                <option value="playing">Oynuyor</option>
                <option value="completed">Tamamlandı</option>
                <option value="paused">Durduruldu</option>
                <option value="dropped">Bırakıldı</option>
              </select>
            </div>

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
                placeholder="0"
              />
            </div>
          </div>

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
        </div>

        {/* Strategy Game Campaigns */}
        {formData.type === 'strategy' && (
          <div className="form-section">
            <h2>Campaign'ler</h2>
            
            {/* Mevcut Campaign'ler */}
            {campaigns.length > 0 && (
              <div className="campaigns-list">
                <h3>Mevcut Campaign'ler</h3>
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="campaign-item">
                    <div className="campaign-info">
                      <strong>{campaign.name}</strong>
                      <span>Faction: {campaign.faction}</span>
                      <span>Zorluk: {campaign.difficulty}</span>
                      <span>Durum: {campaign.status}</span>
                      <span>İlerleme: {campaign.progress}%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCampaign(campaign.id)}
                      className="remove-campaign-btn"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Yeni Campaign Ekle */}
            <div className="add-campaign">
              <h3>Yeni Campaign Ekle</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="campaignName">Campaign Adı</label>
                  <input
                    type="text"
                    id="campaignName"
                    name="name"
                    value={newCampaign.name}
                    onChange={handleCampaignInputChange}
                    placeholder="Campaign adı"
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
                    placeholder="Faction adı"
                  />
                </div>
              </div>

              <div className="form-row">
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
                    <option value="Failed">Başarısız</option>
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
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="campaignNotes">Notlar</label>
                <textarea
                  id="campaignNotes"
                  name="notes"
                  value={newCampaign.notes}
                  onChange={handleCampaignInputChange}
                  placeholder="Campaign hakkında notlar..."
                  rows="2"
                />
              </div>

              <button
                type="button"
                onClick={handleAddCampaign}
                className="add-campaign-btn"
              >
                Campaign Ekle
              </button>
            </div>
          </div>
        )}

        {/* Notlar */}
        <div className="form-section">
          <h2>Notlar</h2>
          <div className="form-group">
            <label htmlFor="notes">Oyun Hakkında Notlar</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Oyun hakkında notlarınız..."
              rows="4"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/game-tracking-hub/game-tracker')}
            className="cancel-btn"
            disabled={loading}
          >
            İptal
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Güncelleniyor...' : 'Oyunu Güncelle'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditGame;