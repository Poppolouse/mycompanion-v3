import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRoute } from '../../../contexts/RouteContext';
import { useUserGameLibrary } from '../../../contexts/UserGameLibraryContext';
import { searchGames, getGameDetails } from '../../../api/gameApi';
import { addGameToLibrary, cacheGameImages, checkGameExists } from '../../../api/gameLibraryApi';
import { saveGameScreenshots } from '../../../utils/imageUtils';
import GameReportModal from '../../../components/GameReportModal';
import './AddGame.css';

function AddGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshFromLibrary } = useRoute();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Yeni state'ler
  const [existingGame, setExistingGame] = useState(null); // Global kütüphanede bulunan oyun
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false); // Read-only mod
  const [showReportModal, setShowReportModal] = useState(false); // Rapor modal'ı
  const [searchResults, setSearchResults] = useState([]); // Arama sonuçları

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

  // GameSearchModal'dan gelen prefilled data'yı handle et
  useEffect(() => {
    if (location.state?.prefilledData) {
      const prefilledData = location.state.prefilledData;
      
      setFormData(prevData => ({
        ...prevData,
        title: prefilledData.title || prefilledData.name || '',
        platform: prefilledData.platform || 'PC',
        genre: prefilledData.genre || '',
        developer: prefilledData.developer || prefilledData.publisher || '',
        year: prefilledData.year || prefilledData.release_date || '',
        status: 'Not Started', // Varsayılan olarak başlanmamış
        progress: 0,
        notes: prefilledData.description || '',
        type: 'normal'
      }));
      
      // Prefilled data geldiğinde oyunun global kütüphanede olup olmadığını kontrol et
      checkIfGameExists(prefilledData);
    }
  }, [location.state]);

  // Oyunun global kütüphanede olup olmadığını kontrol et
  const checkIfGameExists = async (gameData) => {
    if (!gameData.title) return;
    
    try {
      setLoading(true);
      const existingGameData = await checkGameExists({
        title: gameData.title,
        developer: gameData.developer || gameData.publisher,
        steam_id: gameData.steam_id,
        epic_id: gameData.epic_id
      });
      
      if (existingGameData) {
        console.log('🔍 Oyun global kütüphanede bulundu:', existingGameData.title);
        setExistingGame(existingGameData);
        setIsReadOnlyMode(true);
        
        // Form'u existing game data ile doldur
        setFormData(prev => ({
          ...prev,
          title: existingGameData.title,
          platform: existingGameData.platform || prev.platform,
          genre: existingGameData.genre || prev.genre,
          developer: existingGameData.developer || prev.developer,
          year: existingGameData.year || prev.year
        }));
      } else {
        console.log('🆕 Oyun global kütüphanede bulunamadı, yeni oyun olarak eklenebilir');
        setExistingGame(null);
        setIsReadOnlyMode(false);
      }
    } catch (error) {
      console.error('Oyun kontrol hatası:', error);
      // Hata durumunda normal mod'da devam et
      setIsReadOnlyMode(false);
    } finally {
      setLoading(false);
    }
  };

  // Manuel oyun arama
  const searchForGame = async (query) => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      const results = await searchGlobalGames(query);
      setSearchResults(results);
      
      if (results.length > 0) {
        console.log(`🔍 ${results.length} oyun bulundu:`, results.map(g => g.title));
      } else {
        console.log('🔍 Hiç oyun bulunamadı');
      }
    } catch (error) {
      console.error('Arama hatası:', error);
      setError('Arama sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Arama sonucundan oyun seç
  const selectGameFromSearch = (selectedGame) => {
    setExistingGame(selectedGame);
    setIsReadOnlyMode(true);
    setSearchResults([]);
    
    // Form'u seçilen oyun ile doldur
    setFormData(prev => ({
      ...prev,
      title: selectedGame.title,
      platform: selectedGame.platform || prev.platform,
      genre: selectedGame.genre || prev.genre,
      developer: selectedGame.developer || prev.developer,
      year: selectedGame.year || prev.year
    }));
    
    console.log('✅ Oyun seçildi:', selectedGame.title);
  };

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

      // Temel oyun verisi hazırla
      let gameData = {
        title: formData.title.trim(),
        platform: formData.platform,
        genre: formData.genre.trim() || 'Bilinmeyen',
        developer: formData.developer.trim() || 'Bilinmeyen',
        year: formData.year ? parseInt(formData.year) : null,
        status: formData.status,
        progress: parseInt(formData.progress) || 0,
        type: formData.type,
        notes: formData.notes.trim(),
        campaigns: finalCampaigns
      };

      // 🎮 RAWG API'den oyun verilerini çek ve zenginleştir
      console.log('🌐 RAWG API\'den oyun verileri çekiliyor:', gameData.title);
      
      try {
        // RAWG'den oyun ara
        const searchResults = await searchGames(gameData.title);
        
        if (searchResults && searchResults.length > 0) {
          const rawgGame = searchResults[0]; // En iyi eşleşme
          console.log('✅ RAWG\'den oyun bulundu:', rawgGame.title);
          
          // RAWG verilerini mevcut oyun verisiyle birleştir (mevcut veriler öncelikli)
          gameData = {
            ...gameData,
            // RAWG'den gelen veriler (sadece eksik olanlar doldurulur)
            description: gameData.notes || rawgGame.description || '',
            genres: rawgGame.genre ? rawgGame.genre.split(', ') : [gameData.genre],
            platforms: rawgGame.platform ? rawgGame.platform.split(', ') : [gameData.platform],
            developer: gameData.developer !== 'Bilinmeyen' ? gameData.developer : rawgGame.developer || 'Bilinmeyen',
            publisher: rawgGame.publisher || '',
            releaseDate: rawgGame.release_date || '',
            metacritic: rawgGame.metacritic || null,
            esrbRating: rawgGame.esrb_rating || '',
            playtime: rawgGame.playtime || null,
            rating: rawgGame.rating || 0,
            image: rawgGame.image || '',
            screenshots: rawgGame.screenshots || [],
            tags: rawgGame.tags || [],
            website: rawgGame.website || '',
            redditUrl: rawgGame.reddit_url || '',
            // RAWG metadata
            rawgId: rawgGame.id || rawgGame.rawg_id,
            rawgSlug: rawgGame.rawg_slug,
            rawgUrl: rawgGame.rawg_url,
            // Veri kaynağı bilgisi
            dataSource: 'form+rawg',
            rawgEnriched: true,
            enrichedAt: new Date().toISOString()
          };
          
          console.log('🎯 Oyun RAWG verileri ile zenginleştirildi');
           
           // 📸 Screenshot'ları kaydet (eğer varsa)
           if (rawgGame.screenshots && rawgGame.screenshots.length > 0) {
             try {
               const gameId = gameData.rawgId || Date.now().toString();
               await saveGameScreenshots(gameId, rawgGame.screenshots);
               console.log(`📸 ${rawgGame.screenshots.length} screenshot kaydedildi`);
             } catch (screenshotError) {
               console.warn('⚠️ Screenshot kaydetme hatası:', screenshotError);
               // Screenshot hatası oyun eklemeyi engellemez
             }
           }
           
         } else {
           console.log('❌ RAWG\'de oyun bulunamadı, sadece form verileri kullanılacak');
           gameData.dataSource = 'form';
           gameData.rawgEnriched = false;
         }
       } catch (rawgError) {
         console.warn('⚠️ RAWG API hatası:', rawgError);
         // RAWG hatası oyun eklemeyi engellemez
         gameData.dataSource = 'form';
         gameData.rawgEnriched = false;
         gameData.rawgError = rawgError.message;
       }

      // Prefilled data'dan gelen resim verilerini cache'e kaydet
      if (location.state?.prefilledData) {
        const prefilledData = location.state.prefilledData;
        const imageData = {
          banner: prefilledData.image || prefilledData.background_image,
          background: prefilledData.background_image || prefilledData.image,
          cover: prefilledData.image,
          screenshots: prefilledData.screenshots || []
        };
        
        // Resim verilerini cache'e kaydet
        if (imageData.banner || imageData.background || imageData.cover) {
          try {
            await cacheGameImages(gameData.title, imageData);
            console.log('🖼️ Oyun resimleri cache\'e kaydedildi:', gameData.title);
          } catch (cacheError) {
            console.warn('⚠️ Resim cache\'leme hatası:', cacheError);
            // Cache hatası oyun eklemeyi engellemez
          }
        }
      }

      // Yeni UserGameLibrary sistemi ile oyunu ekle
      await addGameToLibrary(gameData);
      
      // Eski localStorage sistemi ile de uyumluluk için
      const existingGames = JSON.parse(localStorage.getItem('gameTracker_games') || '[]');
      const newGame = {
        id: Date.now(),
        ...gameData,
        addedDate: new Date().toISOString()
      };
      const updatedGames = [...existingGames, newGame];
      localStorage.setItem('gameTracker_games', JSON.stringify(updatedGames));
      
      // RouteContext'i yenile
      refreshFromLibrary();
      
      console.log('✅ Oyun başarıyla kütüphaneye eklendi:', gameData.title);
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
        navigate('/game-tracking-hub/game-tracker');
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
    navigate('/game-tracking-hub/game-tracker');
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
        {/* Read-Only Mode Uyarısı */}
        {isReadOnlyMode && existingGame && (
          <div className="readonly-warning">
            <div className="warning-content">
              <h3>🔒 Bu oyun zaten sistemimizde mevcut</h3>
              <p>
                <strong>{existingGame.title}</strong> oyunu global kütüphanemizde bulunuyor. 
                Oyun bilgileri düzenlenemez, sadece kişisel notlarınızı ve durumunuzu değiştirebilirsiniz.
              </p>
              <div className="warning-actions">
                <button
                  type="button"
                  className="report-btn"
                  onClick={() => setShowReportModal(true)}
                >
                  🚨 Hata Bildir
                </button>
                <button
                  type="button"
                  className="new-game-btn"
                  onClick={() => {
                    setIsReadOnlyMode(false);
                    setExistingGame(null);
                    setFormData(prev => ({ ...prev, title: '', developer: '', genre: '', year: '' }));
                  }}
                >
                  🆕 Yeni Oyun Olarak Ekle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Oyun Arama */}
        {!isReadOnlyMode && (
          <div className="game-search-section">
            <h3>🔍 Önce Aramayı Deneyin</h3>
            <p>Oyununuz zaten sistemimizde olabilir. Aramayı deneyin:</p>
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Oyun adı ile ara..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    searchForGame(e.target.value);
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  searchForGame(input.value);
                }}
                disabled={loading}
              >
                {loading ? '🔄' : '🔍'} Ara
              </button>
            </div>
            
            {/* Arama Sonuçları */}
            {searchResults.length > 0 && (
              <div className="search-results">
                <h4>📋 Bulunan Oyunlar:</h4>
                {searchResults.map((game) => (
                  <div key={game.id} className="search-result-item">
                    <div className="game-info">
                      <strong>{game.title}</strong>
                      <span>{game.developer} • {game.platform}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectGameFromSearch(game)}
                      className="select-game-btn"
                    >
                      ✅ Bu Oyunu Seç
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
              disabled={isReadOnlyMode}
              className={isReadOnlyMode ? 'readonly-input' : ''}
            />
            {isReadOnlyMode && <span className="readonly-label">🔒 Düzenlenemez</span>}
          </div>

          {/* Platform */}
          <div className="form-group">
            <label htmlFor="platform">Platform</label>
            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
              disabled={isReadOnlyMode}
              className={isReadOnlyMode ? 'readonly-input' : ''}
            >
              <option value="PC">PC</option>
              <option value="PlayStation">PlayStation</option>
              <option value="Xbox">Xbox</option>
              <option value="Nintendo Switch">Nintendo Switch</option>
              <option value="Mobile">Mobile</option>
              <option value="Multi-platform">Multi-platform</option>
            </select>
            {isReadOnlyMode && <span className="readonly-label">🔒 Düzenlenemez</span>}
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
              disabled={isReadOnlyMode}
              className={isReadOnlyMode ? 'readonly-input' : ''}
            />
            {isReadOnlyMode && <span className="readonly-label">🔒 Düzenlenemez</span>}
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
              disabled={isReadOnlyMode}
              className={isReadOnlyMode ? 'readonly-input' : ''}
            />
            {isReadOnlyMode && <span className="readonly-label">🔒 Düzenlenemez</span>}
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
              disabled={isReadOnlyMode}
              className={isReadOnlyMode ? 'readonly-input' : ''}
            />
            {isReadOnlyMode && <span className="readonly-label">🔒 Düzenlenemez</span>}
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
              disabled={isReadOnlyMode}
              className={isReadOnlyMode ? 'readonly-input' : ''}
            >
              <option value="normal">Normal Oyun</option>
              <option value="strategy">Strateji Oyunu</option>
            </select>
            {isReadOnlyMode && <span className="readonly-label">🔒 Düzenlenemez</span>}
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
            {loading ? '🔄 Ekleniyor...' : isReadOnlyMode ? '📚 Kütüphaneme Ekle' : '✅ Oyunu Ekle'}
          </button>
        </form>
      </div>

      {/* Game Report Modal */}
      {showReportModal && existingGame && (
        <GameReportModal
          game={existingGame}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}

export default AddGame;