/**
 * Oyun Hata Raporu Modal
 * Kullanıcıların global kütüphanedeki oyun bilgilerinde hata bildirmesi için
 */

import React, { useState } from 'react';
import { reportGameIssue } from '../../api/gameLibraryApi';
import { useAuth } from '../../contexts/AuthContext';
import './GameReportModal.css';

function GameReportModal({ isOpen, onClose, gameData }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportData, setReportData] = useState({
    issue_type: 'incorrect_info',
    description: '',
    suggested_fix: ''
  });

  const issueTypes = [
    { value: 'incorrect_info', label: 'Yanlış Bilgi' },
    { value: 'missing_info', label: 'Eksik Bilgi' },
    { value: 'wrong_image', label: 'Yanlış Görsel' },
    { value: 'wrong_price', label: 'Yanlış Fiyat' },
    { value: 'wrong_requirements', label: 'Yanlış Sistem Gereksinimleri' },
    { value: 'other', label: 'Diğer' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportData.description.trim()) {
      alert('Lütfen sorunu açıklayın');
      return;
    }

    setIsSubmitting(true);

    try {
      await reportGameIssue(gameData.id, user.id, reportData);
      
      alert('Raporunuz başarıyla gönderildi. Teşekkür ederiz!');
      onClose();
      
      // Form'u temizle
      setReportData({
        issue_type: 'incorrect_info',
        description: '',
        suggested_fix: ''
      });
    } catch (error) {
      console.error('Rapor gönderme hatası:', error);
      alert('Rapor gönderilirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="game-report-modal-overlay" onClick={onClose}>
      <div className="game-report-modal" onClick={e => e.stopPropagation()}>
        <div className="game-report-modal-header">
          <h3>🚨 Oyun Bilgisi Hatası Bildir</h3>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <div className="game-report-modal-content">
          <div className="game-info-summary">
            <h4>📋 Rapor Edilen Oyun:</h4>
            <p><strong>{gameData?.title}</strong></p>
            <p>Geliştirici: {gameData?.developer}</p>
            <p>Platform: {gameData?.platform}</p>
          </div>

          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-group">
              <label htmlFor="issue_type">🏷️ Sorun Türü:</label>
              <select
                id="issue_type"
                name="issue_type"
                value={reportData.issue_type}
                onChange={handleInputChange}
                required
              >
                {issueTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">📝 Sorun Açıklaması: *</label>
              <textarea
                id="description"
                name="description"
                value={reportData.description}
                onChange={handleInputChange}
                placeholder="Lütfen sorunu detaylı bir şekilde açıklayın..."
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="suggested_fix">💡 Önerilen Düzeltme:</label>
              <textarea
                id="suggested_fix"
                name="suggested_fix"
                value={reportData.suggested_fix}
                onChange={handleInputChange}
                placeholder="Doğru bilgiyi biliyorsanız buraya yazabilirsiniz (opsiyonel)"
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="cancel-button"
                disabled={isSubmitting}
              >
                İptal
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? '📤 Gönderiliyor...' : '📤 Rapor Gönder'}
              </button>
            </div>
          </form>

          <div className="report-info">
            <p>ℹ️ <strong>Not:</strong> Raporunuz incelendikten sonra oyun bilgileri güncellenecektir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameReportModal;