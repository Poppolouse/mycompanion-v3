import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../NotificationSystem';
import './EditGameModal.css';

/**
 * EditGameModal - Oyun düzenleme modal componenti
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal açık mı?
 * @param {Function} props.onClose - Modal kapatma fonksiyonu
 * @param {Object} props.game - Düzenlenecek oyun
 * @param {Function} props.onSave - Kaydetme fonksiyonu
 */
function EditGameModal({ isOpen, onClose, game, onSave }) {
  const { addNotification } = useNotifications();
  const modalRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    platform: '',
    genre: '',
    status: 'Backlog',
    progress: 0,
    rating: 0,
    notes: '',
    purchaseDate: '',
    completionDate: '',
    playtime: 0,
    price: 0,
    dlc: '',
    achievements: '',
    multiplayer: false,
    coop: false,
    tags: ''
  });

  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    status: 'Not Started',
    progress: 0,
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal açıldığında oyun verilerini yükle
  useEffect(() => {
    if (isOpen && game) {
      setFormData({
        title: game.title || game.name || '',
        platform: game.platform || '',
        genre: game.genre || '',
        status: game.status || 'Backlog',
        progress: game.progress || 0,
        rating: game.rating || 0,
        notes: game.notes || '',
        purchaseDate: game.purchaseDate || '',
        completionDate: game.completionDate || '',
        playtime: game.playtime || 0,
        price: game.price || 0,
        dlc: game.dlc || '',
        achievements: game.achievements || '',
        multiplayer: game.multiplayer || false,
        coop: game.coop || false,
        tags: game.tags || ''
      });
      
      setCampaigns(game.campaigns || []);
      setErrors({});
    }
  }, [isOpen, game]);

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Scroll'u engelle
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Modal dışına tıklama ile kapatma
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Form input değişiklikleri
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Hata temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Campaign input değişiklikleri
  const handleCampaignInputChange = (e) => {
    const { name, value } = e.target;
    setNewCampaign(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Yeni campaign ekleme
  const handleAddCampaign = () => {
    if (!newCampaign.name.trim()) {
      addNotification('Campaign adı gerekli!', 'error');
      return;
    }

    setCampaigns(prev => [...prev, { ...newCampaign, id: Date.now() }]);
    setNewCampaign({
      name: '',
      status: 'Not Started',
      progress: 0,
      notes: ''
    });
    addNotification('Campaign eklendi!', 'success');
  };

  // Campaign silme
  const handleRemoveCampaign = (index) => {
    setCampaigns(prev => prev.filter((_, i) => i !== index));
    addNotification('Campaign silindi!', 'info');
  };

  // Form validasyonu
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Oyun adı gerekli';
    }

    if (!formData.platform.trim()) {
      newErrors.platform = 'Platform gerekli';
    }

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'İlerleme 0-100 arasında olmalı';
    }

    if (formData.rating < 0 || formData.rating > 10) {
      newErrors.rating = 'Rating 0-10 arasında olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification('Lütfen form hatalarını düzeltin!', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedGame = {
        ...formData,
        campaigns,
        lastModified: new Date().toISOString()
      };

      await onSave(updatedGame);
      addNotification('Oyun başarıyla güncellendi!', 'success');
      onClose();
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      addNotification('Kaydetme sırasında hata oluştu!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container" ref={modalRef}>
        <div className="modal-header">
          <h2>🎮 Oyun Düzenle</h2>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            {/* Temel Bilgiler */}
            <div className="form-section">
              <h3>📋 Temel Bilgiler</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Oyun Adı *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={errors.title ? 'error' : ''}
                    placeholder="Oyun adını girin"
                  />
                  {errors.title && <span className="error-text">{errors.title}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="platform">Platform *</label>
                  <select
                    id="platform"
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    className={errors.platform ? 'error' : ''}
                  >
                    <option value="">Platform seçin</option>
                    <option value="PC">PC</option>
                    <option value="PlayStation">PlayStation</option>
                    <option value="Xbox">Xbox</option>
                    <option value="Nintendo Switch">Nintendo Switch</option>
                    <option value="Mobile">Mobile</option>
                    <option value="VR">VR</option>
                  </select>
                  {errors.platform && <span className="error-text">{errors.platform}</span>}
                </div>
              </div>

              <div className="form-row">
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

                <div className="form-group">
                  <label htmlFor="status">Durum</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="Currently Playing">Currently Playing</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Dropped">Dropped</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
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
                    className={errors.progress ? 'error' : ''}
                  />
                  {errors.progress && <span className="error-text">{errors.progress}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="rating">Rating (0-10)</label>
                  <input
                    type="number"
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    step="0.1"
                    className={errors.rating ? 'error' : ''}
                  />
                  {errors.rating && <span className="error-text">{errors.rating}</span>}
                </div>
              </div>
            </div>

            {/* Campaigns */}
            <div className="form-section">
              <h3>🎯 Campaigns</h3>
              
              {campaigns.length > 0 && (
                <div className="campaigns-list">
                  {campaigns.map((campaign, index) => (
                    <div key={index} className="campaign-item">
                      <div className="campaign-info">
                        <strong>{campaign.name}</strong>
                        <span>{campaign.status} - {campaign.progress}%</span>
                        {campaign.notes && <span className="campaign-notes">{campaign.notes}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCampaign(index)}
                        className="remove-campaign-btn"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="add-campaign">
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      name="name"
                      value={newCampaign.name}
                      onChange={handleCampaignInputChange}
                      placeholder="Campaign adı"
                    />
                  </div>
                  <div className="form-group">
                    <select
                      name="status"
                      value={newCampaign.status}
                      onChange={handleCampaignInputChange}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddCampaign}
                  className="add-campaign-btn"
                >
                  ➕ Campaign Ekle
                </button>
              </div>
            </div>

            {/* Notlar */}
            <div className="form-section">
              <h3>📝 Notlar</h3>
              <div className="form-group">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Oyun hakkında notlarınız..."
                  rows="4"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={isSubmitting}
            >
              ❌ İptal
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? '💾 Kaydediliyor...' : '💾 Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditGameModal;