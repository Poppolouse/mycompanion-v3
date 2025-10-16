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

  // Oyun verilerini yükle
  useEffect(() => {
    loadGameData();
  }, [id]);

  // LocalStorage'dan oyun verilerini yükle
  const loadGameData = () => {
    try {
      setLoading(true);
      
      // Oyun listesini localStorage'dan al
      const savedGames = localStorage.getItem('gameTracker_games');
      if (!savedGames) {
        setError('Oyun listesi bulunamadı. Lütfen önce GameTracker sayfasından Excel dosyası yükleyin.');
        return;
      }

      const games = JSON.parse(savedGames);
      const foundGame = games.find(g => g.id === id);
      
      if (!foundGame) {
        setError('Oyun bulunamadı.');
        return;
      }

      setGame(foundGame);
      setProgress(foundGame.progress || 0);
      setStatus(foundGame.status || 'Başlanmadı');
      
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
    navigate('/game-tracker');
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
          ← Game Tracker'a Dön
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
          ← Game Tracker
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