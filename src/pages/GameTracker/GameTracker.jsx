import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { readExcelFile, parseGameList } from '../../utils/excelUtils';
import { organizeCurrentData } from '../../utils/organizeCurrentData';
import { useRoute } from '../../contexts/RouteContext';
import SmartSearch from '../../components/SmartSearch';
import AdvancedFilters from '../../components/AdvancedFilters';
import GameListItem from '../../components/GameListItem';
import EditGameModal from '../../components/EditGameModal';
import { useNotifications } from '../../components/NotificationSystem';
import './GameTracker.css';
import './GameTracker_FORCE_FIX.css';
import './GameTracker_NUCLEAR.css';

/**
 * GameTracker - Ana oyun takip sayfası
 * Excel dosyası yükleme, oyun listesi görüntüleme ve cycle yönetimi
 */
function GameTracker() {
  // Router ve navigation
  const navigate = useNavigate();
  const { routeState, updateCycleGame, removeCycleGame, resetCycleGameStatus, createNewCycle, deleteCycle } = useRoute();
  
  // Notifications
  const { showSuccess, showError, showWarning, showGameUpdate, showAchievement } = useNotifications();

  // Ana state'ler
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('library'); // 'library' veya 'cycles'
  
  // Görünüm modları
  const [viewMode, setViewMode] = useState('list'); // 'list' veya 'grid'
  const [showColorLegend, setShowColorLegend] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  // Akıllı filtreler
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  
  // Toplu işlemler (List View için)
  const [selectedGames, setSelectedGames] = useState(new Set());

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);

  // Cycle Edit State
  const [isEditingCycle, setIsEditingCycle] = useState(false);
  const [editingCycleNumber, setEditingCycleNumber] = useState(null);
  const [showGameSelectionModal, setShowGameSelectionModal] = useState(false);
  const [selectedGameSlot, setSelectedGameSlot] = useState(null); // {cycleNumber, gameIndex, gameType}
  const [editingGameIndex, setEditingGameIndex] = useState(null);
  const [modalSearchTerm, setModalSearchTerm] = useState(''); // Modal için arama
  
  // Bulk Selection State
  const [selectedCycles, setSelectedCycles] = useState(new Set());
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  
  // Cycle Floating Panel State
  const [showCycleKeyboardHelp, setShowCycleKeyboardHelp] = useState(false);

  // Refs
  const fileInputRef = useRef(null);

  // Component mount olduğunda localStorage'dan veri yükle
  useEffect(() => {
    const savedGames = localStorage.getItem('gameTrackerGames');
    if (savedGames) {
      try {
        const parsedGames = JSON.parse(savedGames);
        setGames(parsedGames);
      } catch (err) {
        console.error('localStorage verisi parse edilemedi:', err);
      }
    }
  }, []);

  // Klavye kısayolları
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+F - Arama çubuğuna odaklan
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('.smart-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Ctrl+A - Tüm oyunları seç (List View'da)
      if (e.ctrlKey && e.key === 'a' && viewMode === 'list') {
        e.preventDefault();
        setSelectedGames(new Set(getSmartFilteredGames().map((_, i) => i)));
      }
      
      // Delete - Seçili oyunları sil
      if (e.key === 'Delete' && selectedGames.size > 0) {
        e.preventDefault();
        handleBulkDelete();
      }
      
      // Escape - Seçimleri ve filtreleri temizle
      if (e.key === 'Escape') {
        if (currentView === 'cycles') {
          setSelectedCycles(new Set());
          setIsBulkSelectMode(false);
        } else {
          setSelectedGames(new Set());
          clearAllFilters();
        }
      }
      
      // Cycle görünümü için özel kısayollar
      if (currentView === 'cycles') {
        // Ctrl+N - Yeni cycle oluştur
        if (e.ctrlKey && e.key === 'n') {
          e.preventDefault();
          handleCreateCycle();
        }
        
        // B - Toplu seçim modunu aç/kapat
        if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          toggleBulkSelectMode();
        }
        
        // Ctrl+A - Tüm cycle'ları seç (bulk mode'da)
        if (e.ctrlKey && e.key === 'a' && isBulkSelectMode) {
          e.preventDefault();
          selectAllCycles();
        }
        
        // Delete - Seçili cycle'ları sil
        if (e.key === 'Delete' && selectedCycles.size > 0) {
          e.preventDefault();
          handleBulkDeleteCycles();
        }
      }
      
      // Enter - İlk arama sonucunu aç
      if (e.key === 'Enter' && searchTerm) {
        const filteredGames = getSmartFilteredGames();
        if (filteredGames.length > 0) {
          navigate(`/game-tracker/game/${filteredGames[0].id || 0}`);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedGames, selectedCycles, searchTerm, navigate, currentView, isBulkSelectMode]);

  // Oyun durumu belirleme fonksiyonu
  const getGameStatus = (game) => {
    if (game.progress >= 100 || game.status === 'completed') return 'completed';
    if (game.status === 'playing' || game.progress > 0) return 'playing';
    if (game.status === 'paused') return 'paused';
    return 'not-started';
  };

  // Son oynanan oyunları getir
  const getRecentlyPlayedGames = () => {
    return games
      .filter(game => game.lastPlayed)
      .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
      .slice(0, 10);
  };

  // Benzersiz değerleri getir (filtreler için)
  const getUniqueValues = (field) => {
    const values = games.map(game => {
      switch(field) {
        case 'platform': return game.platform || game.sistem;
        case 'genre': return game.genre || game.tur;
        default: return game[field];
      }
    }).filter(Boolean);
    return [...new Set(values)].sort();
  };

  // Akıllı filtreleme fonksiyonu
  const getSmartFilteredGames = () => {
    return games.filter(game => {
      // Arama terimi kontrolü
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const title = (game.title || game.name || '').toLowerCase();
        const platform = (game.platform || game.sistem || '').toLowerCase();
        const genre = (game.genre || game.tur || '').toLowerCase();
        const developer = (game.developer || game.gelistirici || '').toLowerCase();
        
        if (!title.includes(searchLower) && 
            !platform.includes(searchLower) && 
            !genre.includes(searchLower) && 
            !developer.includes(searchLower)) {
          return false;
        }
      }
      
      // Durum filtresi
      if (statusFilter !== 'all') {
        const gameStatus = getGameStatus(game);
        if (gameStatus !== statusFilter) return false;
      }
      
      // Platform filtresi
      if (platformFilter !== 'all') {
        const gamePlatform = game.platform || game.sistem;
        if (gamePlatform !== platformFilter) return false;
      }
      
      // Tür filtresi
      if (genreFilter !== 'all') {
        const gameGenre = game.genre || game.tur;
        if (gameGenre !== genreFilter) return false;
      }
      
      return true;
    });
  };

  // Filtreleri temizle
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPlatformFilter('all');
    setGenreFilter('all');
  };

  // Smart Search handler
  const handleSmartSearch = (searchValue) => {
    // Özel arama komutlarını parse et
    if (searchValue.includes(':')) {
      const [command, value] = searchValue.split(':');
      
      switch (command.toLowerCase()) {
        case 'status':
          setStatusFilter(value);
          setSearchTerm('');
          break;
        case 'platform':
          setPlatformFilter(value);
          setSearchTerm('');
          break;
        case 'genre':
          setGenreFilter(value);
          setSearchTerm('');
          break;
        case 'developer':
          // Developer için özel arama
          setSearchTerm(value);
          break;
        default:
          setSearchTerm(searchValue);
      }
    } else {
      setSearchTerm(searchValue);
    }
  };

  // Toplu işlemler
  const handleBulkDelete = () => {
    if (window.confirm(`${selectedGames.size} oyunu silmek istediğinizden emin misiniz?`)) {
      const filteredGames = getSmartFilteredGames();
      const gamesToDelete = Array.from(selectedGames).map(index => filteredGames[index]);
      const updatedGames = games.filter(game => !gamesToDelete.includes(game));
      setGames(updatedGames);
      localStorage.setItem('gameTrackerGames', JSON.stringify(updatedGames));
      setSelectedGames(new Set());
      
      // Toplu silme bildirimi
      showSuccess(`${gamesToDelete.length} oyun başarıyla silindi`, {
        title: '🗑️ Toplu Silme'
      });
    }
  };

  const handleBulkStatusChange = (newStatus) => {
    const filteredGames = getSmartFilteredGames();
    const updatedGames = games.map(game => {
      const gameIndex = filteredGames.findIndex(fg => fg === game);
      if (selectedGames.has(gameIndex)) {
        return {
          ...game,
          status: newStatus,
          progress: newStatus === 'completed' ? 100 : game.progress || 0,
          lastPlayed: newStatus === 'playing' ? new Date().toISOString() : game.lastPlayed
        };
      }
      return game;
    });
    
    setGames(updatedGames);
    localStorage.setItem('gameTrackerGames', JSON.stringify(updatedGames));
    setSelectedGames(new Set());
    
    // Toplu durum değişikliği bildirimi
    const statusLabels = {
      'playing': 'Oynuyor',
      'completed': 'Tamamlandı',
      'paused': 'Duraklatıldı',
      'dropped': 'Bırakıldı',
      'planning': 'Planlanıyor'
    };
    
    showSuccess(`${selectedGames.size} oyunun durumu "${statusLabels[newStatus] || newStatus}" olarak güncellendi`, {
      title: '📝 Toplu Güncelleme'
    });
    
    // Tamamlanan oyunlar için özel bildirim
    if (newStatus === 'completed') {
      showAchievement('Toplu Tamamlama!', `${selectedGames.size} oyunu birden tamamladın! 🎉`);
    }
  };

  const handleBulkExport = () => {
    const filteredGames = getSmartFilteredGames();
    const selectedGameData = Array.from(selectedGames).map(index => filteredGames[index]);
    
    const dataStr = JSON.stringify(selectedGameData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `selected-games-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  // Excel dosyası yükleme
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const data = await readExcelFile(file);
      const gameList = parseGameList(data);
      
      if (gameList.length === 0) {
        throw new Error('Excel dosyasında geçerli oyun verisi bulunamadı');
      }

      setGames(gameList);
      localStorage.setItem('gameTrackerGames', JSON.stringify(gameList));
      
      // Başarı bildirimi
      showSuccess(`${gameList.length} oyun başarıyla yüklendi!`, {
        title: '📁 Dosya Yüklendi'
      });
      
    } catch (err) {
      const errorMessage = err.message || 'Dosya yüklenirken bir hata oluştu';
      setError(errorMessage);
      showError(errorMessage, {
        title: '📁 Dosya Yükleme Hatası'
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Oyun düzenleme - Modal açma
  const handleEditGame = (game) => {
    // Oyunun index'ini bul
    const gameIndex = games.findIndex(g => 
      (g.title || g.name) === (game.title || game.name)
    );
    
    setEditingGame(game);
    setEditingGameIndex(gameIndex);
    setIsEditModalOpen(true);
  };

  // Modal kapatma
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingGame(null);
    setEditingGameIndex(null);
  };

  // Oyun kaydetme (Modal'dan)
  const handleSaveGame = (updatedGameData) => {
    if (editingGameIndex !== null) {
      const updatedGames = [...games];
      updatedGames[editingGameIndex] = {
        ...updatedGames[editingGameIndex],
        ...updatedGameData
      };
      
      setGames(updatedGames);
      localStorage.setItem('gameTrackerGames', JSON.stringify(updatedGames));
      
      showSuccess(`"${updatedGameData.title}" başarıyla güncellendi!`);
    }
  };

  // Cycle Edit Functions
  const handleEditCycle = (cycleNumber) => {
    setEditingCycleNumber(cycleNumber);
    setIsEditingCycle(true);
  };

  const handleStopEditingCycle = () => {
    setIsEditingCycle(false);
    setEditingCycleNumber(null);
  };

  // Cycle Management Functions
  const handleCreateCycle = () => {
    try {
      const success = createNewCycle();
      if (success) {
        showSuccess('Yeni cycle oluşturuldu!');
      } else {
        showError('Maksimum cycle sayısına ulaşıldı (50)');
      }
    } catch (error) {
      showError('Cycle oluşturulurken hata oluştu');
    }
  };

  const handleDeleteCycle = (cycleNumber) => {
    try {
      const success = deleteCycle(cycleNumber);
      if (success) {
        showSuccess(`Cycle ${cycleNumber} silindi`);
      } else {
        showError('Cycle silinirken hata oluştu');
      }
    } catch (error) {
      showError('Cycle silinirken hata oluştu');
    }
  };

  // Toplu seçme fonksiyonları
  const toggleBulkSelectMode = () => {
    setIsBulkSelectMode(!isBulkSelectMode);
    setSelectedCycles(new Set());
  };

  const toggleCycleSelection = (cycleNumber) => {
    const newSelected = new Set(selectedCycles);
    if (newSelected.has(cycleNumber)) {
      newSelected.delete(cycleNumber);
    } else {
      newSelected.add(cycleNumber);
    }
    setSelectedCycles(newSelected);
  };

  const selectAllCycles = () => {
    const allCycleNumbers = cycles.map(cycle => cycle.cycleNumber);
    setSelectedCycles(new Set(allCycleNumbers));
  };

  const deselectAllCycles = () => {
    setSelectedCycles(new Set());
  };

  const handleBulkDeleteCycles = () => {
    if (selectedCycles.size === 0) {
      showError('Silinecek cycle seçilmedi');
      return;
    }

    const confirmMessage = `${selectedCycles.size} cycle silinecek. Emin misiniz?`;
    if (window.confirm(confirmMessage)) {
      try {
        let deletedCount = 0;
        selectedCycles.forEach(cycleNumber => {
          const success = deleteCycle(cycleNumber);
          if (success) deletedCount++;
        });
        
        if (deletedCount > 0) {
          showSuccess(`${deletedCount} cycle başarıyla silindi`);
          setSelectedCycles(new Set());
          setIsBulkSelectMode(false);
        } else {
          showError('Hiçbir cycle silinemedi');
        }
      } catch (error) {
        showError('Toplu silme işlemi sırasında hata oluştu');
      }
    }
  };

  const handleSelectGameForSlot = (cycleNumber, gameIndex, gameType) => {
    setSelectedGameSlot({ cycleNumber, gameIndex, gameType });
    setModalSearchTerm(''); // Arama kutusunu temizle
    setShowGameSelectionModal(true);
  };

  const handleRemoveGameFromSlot = (cycleNumber, gamePosition) => {
    console.log(`Removing game from cycle ${cycleNumber}, position ${gamePosition}`);
    const success = removeCycleGame(cycleNumber, gamePosition);
    if (success) {
      showSuccess('Oyun cycle\'dan kaldırıldı');
    } else {
      showError('Oyun kaldırılırken hata oluştu');
    }
  };

  const handleGameSelection = (gameId) => {
    console.log(`Selected game ${gameId} for cycle ${editingCycleNumber}, position ${selectedGameSlot.position}`);
    const success = updateCycleGame(editingCycleNumber, selectedGameSlot.position, gameId);
    if (success) {
      setShowGameSelectionModal(false);
      setSelectedGameSlot(null);
      showSuccess('Oyun cycle\'a eklendi');
    } else {
      showError('Oyun eklenirken hata oluştu');
    }
  };

  // Oyun silme
  const handleDeleteGame = (gameIndex) => {
    const game = games[gameIndex];
    const gameName = game.title || game.name || 'Bilinmeyen Oyun';
    
    if (window.confirm(`"${gameName}" oyununu silmek istediğinizden emin misiniz?`)) {
      const updatedGames = games.filter((_, index) => index !== gameIndex);
      setGames(updatedGames);
      localStorage.setItem('gameTrackerGames', JSON.stringify(updatedGames));
      
      // Seçili oyunları güncelle
      const newSelected = new Set();
      selectedGames.forEach(index => {
        if (index < gameIndex) {
          newSelected.add(index);
        } else if (index > gameIndex) {
          newSelected.add(index - 1);
        }
      });
      setSelectedGames(newSelected);
      
      showSuccess(`"${gameName}" oyunu başarıyla silindi!`, {
        title: '🗑️ Oyun Silindi'
      });
    }
  };

  // Cycle'lara dağıtma
  const handleDistributeGamesToCycles = async () => {
    if (games.length === 0) {
      const errorMessage = 'Önce oyun listesi yüklemelisiniz';
      setError(errorMessage);
      showWarning(errorMessage, {
        title: '⚠️ Eksik Veri'
      });
      return;
    }

    setLoading(true);
    try {
      const organizedData = await organizeCurrentData(games);
      updateRouteState({ cycles: organizedData.cycles });
      setCurrentView('cycles');
      
      // Başarı bildirimi
      showSuccess(`${games.length} oyun ${organizedData.cycles.length} cycle'a dağıtıldı!`, {
        title: '🔄 Cycle Organizasyonu'
      });
      
    } catch (err) {
      const errorMessage = err.message || 'Cycle organizasyonu sırasında hata oluştu';
      setError(errorMessage);
      showError(errorMessage, {
        title: '🔄 Cycle Hatası'
      });
    } finally {
      setLoading(false);
    }
  };

  // Örnek veri yükleme fonksiyonu
  const handleLoadSampleData = async () => {
    setLoading(true);
    setError('');

    try {
      // Vault_Game_List_campaigns_final.xlsx dosyasını fetch ile yükle
      const response = await fetch('/Vault_Game_List_campaigns_final.xlsx');
      if (!response.ok) {
        throw new Error('Örnek veri dosyası bulunamadı');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const data = await readExcelFile(new File([arrayBuffer], 'Vault_Game_List_campaigns_final.xlsx'));
      const gameList = parseGameList(data);
      
      if (gameList.length === 0) {
        throw new Error('Örnek veri dosyasında geçerli oyun verisi bulunamadı');
      }
      
      setGames(gameList);
      localStorage.setItem('gameTrackerGames', JSON.stringify(gameList));
      
      // Başarı bildirimi
      showSuccess(`${gameList.length} örnek oyun başarıyla yüklendi!`, {
        title: '🎮 Örnek Veri Yüklendi'
      });
      
    } catch (err) {
      const errorMessage = err.message || 'Örnek veri yüklenirken bir hata oluştu';
      setError(errorMessage);
      showError(errorMessage, {
        title: '🎮 Örnek Veri Hatası'
      });
    } finally {
      setLoading(false);
    }
  };

  // Debug fonksiyonu
  const handleDebugTotalWar = () => {
    const debugData = {
      games: games.length,
      localStorage: {
        gameTrackerGames: localStorage.getItem('gameTrackerGames') ? 'Var' : 'Yok',
        routeState: localStorage.getItem('routeState') ? 'Var' : 'Yok'
      },
      routeState: routeState
    };
    
    console.log('🔍 Debug Bilgileri:', debugData);
    alert(`Debug Bilgileri:\n\nOyun Sayısı: ${debugData.games}\nLocalStorage: ${JSON.stringify(debugData.localStorage, null, 2)}\n\nDetaylar console'da`);
  };

  return (
    <div className="game-tracker-page" style={{
      background: 'linear-gradient(135deg, var(--bg-gradient-1) 0%, var(--bg-gradient-2) 25%, var(--bg-gradient-3) 50%, var(--bg-gradient-4) 100%)',
      minHeight: '100vh',
      width: '100vw'
    }}>
      <div className="game-tracker">
      {/* Header */}
      <header className="tracker-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🎮 Game Tracker</h1>
            <p>Oyun kütüphanenizi yönetin ve cycle'lara organize edin</p>
          </div>
          
          <div className="header-controls">
            {/* Navigation Buttons */}
            <div className="navigation-buttons">
              <button 
                className="nav-btn home-btn"
                onClick={() => navigate('/')}
                title="Ana Sayfaya Dön"
              >
                🏠 Ana Sayfa
              </button>
              <button 
                className="nav-btn hub-btn"
                onClick={() => navigate('/game-tracking-hub')}
                title="Oyun Hub'ına Dön"
              >
                🎮 Oyun Hub
              </button>
              <button 
                className="nav-btn add-game-btn"
                onClick={() => navigate('/add-game')}
                title="Yeni Oyun Ekle"
              >
                ➕ Oyun Ekle
              </button>
            </div>

            {/* View Switcher */}
            <div className="view-switcher">
              <button 
                className={`view-btn ${currentView === 'library' ? 'active' : ''}`}
                onClick={() => setCurrentView('library')}
              >
                📚 Kütüphane
              </button>
              <button 
                className={`view-btn ${currentView === 'cycles' ? 'active' : ''}`}
                onClick={() => setCurrentView('cycles')}
              >
                🔄 Cycle'lar
              </button>
            </div>

            {/* Color Legend Toggle - Sadece kütüphane görünümünde göster */}
            {currentView === 'library' && games.length > 0 && (
              <button 
                className="legend-toggle-btn"
                onClick={() => setShowColorLegend(!showColorLegend)}
                title="Renk açıklamasını göster/gizle"
              >
                🎨 Renkler
              </button>
            )}

            {/* Keyboard Help Toggle - Sadece kütüphane görünümünde göster */}
            {currentView === 'library' && games.length > 0 && (
              <button 
                className="legend-toggle-btn"
                onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                title="Klavye kısayollarını göster/gizle"
              >
                ⌨️ Kısayollar
              </button>
            )}


          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="tracker-main" style={{
        background: 'transparent',
        backdropFilter: 'none'
      }}>
        {/* Controls */}
        <div className="tracker-controls">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
          />
          
          <div className="control-buttons">
            <button 
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              {loading ? '📤 Yükleniyor...' : '📁 Excel Dosyası Yükle'}
            </button>
            
            <button 
              className="sample-data-btn"
              onClick={handleLoadSampleData}
              disabled={loading}
              title="Örnek oyun verilerini yükle"
            >
              {loading ? '🎮 Yükleniyor...' : '🎮 Örnek Veri Yükle'}
            </button>
            
            {games.length > 0 && (
              <>
                <button 
                  className="distribute-btn"
                  onClick={handleDistributeGamesToCycles}
                  disabled={loading}
                >
                  {loading ? '🔄 Dağıtılıyor...' : '🎯 Cycle\'lara Böl'}
                </button>
                <button 
                  className="debug-btn"
                  onClick={handleDebugTotalWar}
                  title="localStorage verilerini kontrol et"
                >
                  🔍 Debug
                </button>
              </>
            )}
          </div>

          {/* Akıllı Filtreler */}
          {currentView === 'library' && games.length > 0 && (
            <div className="smart-filters-section">
              {/* Smart Search */}
              <SmartSearch
                games={games}
                onSearch={handleSmartSearch}
                placeholder="🔍 Oyun adı, tür, platform veya geliştirici ara..."
                showSuggestions={true}
                showFilters={true}
              />

              {/* Gelişmiş Filtreler */}
              <AdvancedFilters
                games={games}
                filters={{
                  searchTerm,
                  statusFilter,
                  platformFilter,
                  genreFilter
                }}
                onFiltersChange={({
                  searchTerm: newSearchTerm,
                  statusFilter: newStatusFilter,
                  platformFilter: newPlatformFilter,
                  genreFilter: newGenreFilter
                }) => {
                  if (newSearchTerm !== undefined) setSearchTerm(newSearchTerm);
                  if (newStatusFilter !== undefined) setStatusFilter(newStatusFilter);
                  if (newPlatformFilter !== undefined) setPlatformFilter(newPlatformFilter);
                  if (newGenreFilter !== undefined) setGenreFilter(newGenreFilter);
                }}
                onClearAll={clearAllFilters}
              />
            </div>
          )}
        </div>

        {/* Content based on current view */}
        {currentView === 'library' ? (
          /* Oyun Kütüphanesi */
          <div className="games-section" style={{
            background: 'rgba(20, 25, 40, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            {/* Color Legend */}
            {showColorLegend && (
              <div className="color-legend">
                <h3>🎨 Oyun Durumu Renk Açıklaması</h3>
                <div className="legend-items">
                  <div className="legend-item">
                    <div className="legend-color completed"></div>
                    <span>🟢 Tamamlandı</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color playing"></div>
                    <span>🟡 Devam Ediyor</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color paused"></div>
                    <span>🔵 Beklemede</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color not-started"></div>
                    <span>🔴 Başlanmadı</span>
                  </div>
                </div>
              </div>
            )}

            {/* Klavye Kısayolları Yardımı */}
            {showKeyboardHelp && (
              <div className="keyboard-help">
                <h3>⌨️ Klavye Kısayolları</h3>
                <div className="keyboard-shortcuts">
                  <div className="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>F</kbd>
                    <span>Arama çubuğuna odaklan</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>A</kbd>
                    <span>Tüm oyunları seç (List View)</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Delete</kbd>
                    <span>Seçili oyunları sil</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Enter</kbd>
                    <span>İlk arama sonucunu aç</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Esc</kbd>
                    <span>Seçimleri ve filtreleri temizle</span>
                  </div>
                </div>
              </div>
            )}

            {/* Son Oynananlar */}
            {games.length > 0 && getRecentlyPlayedGames().length > 0 && (
              <div className="recent-games-section">
                <h3>⏰ Son Oynananlar (Son 10)</h3>
                <div className="recent-games-list">
                  {getRecentlyPlayedGames().map((game, index) => (
                    <div 
                      key={`recent-${index}`} 
                      className="recent-game-item"
                      onClick={() => navigate(`/game-tracker/game/${game.id || index}`)}
                    >
                      <div className="recent-game-info">
                        <span className="recent-game-name">{game.title || game.name}</span>
                        <span className="recent-game-date">
                          {new Date(game.lastPlayed).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <div className={`recent-game-status ${getGameStatus(game)}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hata Mesajı */}
            {error && (
              <div className="error-message">
                <span>❌ {error}</span>
              </div>
            )}

            {games.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>Henüz oyun yüklenmedi</h3>
                <p>Excel dosyası yükleyerek oyun kütüphanenizi oluşturun veya örnek veri ile başlayın</p>
              </div>
            ) : (
              <>
                <div className="games-header">
                  <h2>📋 Oyun Listesi</h2>
                  <div className="games-count">
                    {getSmartFilteredGames().length} / {games.length} oyun
                  </div>
                </div>

                {/* Toplu İşlemler */}
                {selectedGames.size > 0 && (
                  <div className="bulk-operations">
                    <div className="bulk-info">
                      <span className="selected-count">{selectedGames.size} oyun seçildi</span>
                    </div>
                    <div className="bulk-actions">
                      <button 
                        className="bulk-btn status-btn"
                        onClick={() => handleBulkStatusChange('playing')}
                        title="Seçili oyunları 'Oynuyor' yap"
                      >
                        🎮 Oynuyor Yap
                      </button>
                      <button 
                        className="bulk-btn status-btn"
                        onClick={() => handleBulkStatusChange('completed')}
                        title="Seçili oyunları 'Tamamlandı' yap"
                      >
                        ✅ Tamamlandı Yap
                      </button>
                      <button 
                        className="bulk-btn delete-btn"
                        onClick={handleBulkDelete}
                        title="Seçili oyunları sil"
                      >
                        🗑️ Sil ({selectedGames.size})
                      </button>
                    </div>
                  </div>
                )}

                {/* Oyun Listesi - List View */}
                <div className="games-list-view ultra-compact-list">
                  <div className="list-header">
                    <div className="list-header-item checkbox-col">
                      <input 
                        type="checkbox" 
                        checked={selectedGames.size === getSmartFilteredGames().length && getSmartFilteredGames().length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGames(new Set(getSmartFilteredGames().map((_, index) => index)));
                          } else {
                            setSelectedGames(new Set());
                          }
                        }}
                      />
                    </div>
                    <div className="list-header-item">📷</div>
                    <div className="list-header-item name-col">Oyun Adı</div>
                    <div className="list-header-item">Platform</div>
                    <div className="list-header-item">Tür</div>
                    <div className="list-header-item">Durum</div>
                    <div className="list-header-item">İlerleme</div>
                    <div className="list-header-item">Son Oynanma</div>
                    <div className="list-header-item">⚙️</div>
                  </div>
                  
                  {getSmartFilteredGames().map((game, index) => (
                    <GameListItem 
                      key={index}
                      game={game}
                      index={index}
                      isSelected={selectedGames.has(index)}
                      onSelect={(selected) => {
                        const newSelected = new Set(selectedGames);
                        if (selected) {
                          newSelected.add(index);
                        } else {
                          newSelected.delete(index);
                        }
                        setSelectedGames(newSelected);
                      }}
                      onEdit={() => handleEditGame(game)}
                      onDelete={() => handleDeleteGame(index)}
                      onStatusChange={(newStatus) => {
                        const updatedGames = [...games];
                        const gameIndex = games.findIndex(g => 
                          (g.title || g.name) === (game.title || game.name)
                        );
                        
                        if (gameIndex !== -1) {
                          const oldStatus = updatedGames[gameIndex].status;
                          updatedGames[gameIndex].status = newStatus;
                          
                          // Progress güncelleme
                          if (newStatus === 'completed') {
                            updatedGames[gameIndex].progress = 100;
                          } else if (newStatus === 'not-started') {
                            updatedGames[gameIndex].progress = 0;
                          }
                          
                          // Son oynanma tarihi güncelleme
                          if (newStatus === 'playing') {
                            updatedGames[gameIndex].lastPlayed = new Date().toISOString().split('T')[0];
                          }
                          
                          // State ve localStorage güncelleme
                          game.status = newStatus;
                          setGames(updatedGames);
                          localStorage.setItem('gameTrackerGames', JSON.stringify(updatedGames));
                          
                          // Oyun güncelleme bildirimi
                          const gameName = game.title || game.name || 'Oyun';
                          showGameUpdate(gameName, 'updated', {
                            message: `Durum: ${oldStatus || 'Belirsiz'} → ${newStatus}`
                          });
                          
                          // Özel durumlar için ek bildirimler
                          if (newStatus === 'completed' && oldStatus !== 'completed') {
                            showAchievement('Oyun Tamamlandı!', `${gameName} oyununu bitirdin! 🎉`);
                          }
                        }
                      }}
                      showExpandedInfo={true}
                    />
                  ))}
                </div>

                {getSmartFilteredGames().length === 0 && (
                  <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <h3>Arama sonucu bulunamadı</h3>
                    <p>Farklı filtreler deneyebilirsiniz</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Cycle Viewer */
          <div className="cycles-section" style={{
            background: 'rgba(20, 25, 40, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="cycles-header">
              <div className="cycles-title-section">
                <h2>🔄 Cycle Görüntüleyici</h2>
                <p>Oyunlarınızın cycle'lara nasıl dağıtıldığını görün</p>
              </div>
              <div className="cycles-header-actions">
                {/* Toplu seçme butonları */}
                {isBulkSelectMode && (
                  <div className="bulk-select-controls">
                    <button 
                      className="bulk-control-btn select-all"
                      onClick={selectAllCycles}
                      title="Tümünü Seç"
                    >
                      ☑️ Tümünü Seç
                    </button>
                    <button 
                      className="bulk-control-btn deselect-all"
                      onClick={deselectAllCycles}
                      title="Seçimi Temizle"
                    >
                      ⬜ Temizle
                    </button>
                    <button 
                      className="bulk-control-btn bulk-delete"
                      onClick={handleBulkDeleteCycles}
                      disabled={selectedCycles.size === 0}
                      title={`${selectedCycles.size} Cycle'ı Sil`}
                    >
                      🗑️ Sil ({selectedCycles.size})
                    </button>
                  </div>
                )}
                
                <button 
                  className={`bulk-select-toggle ${isBulkSelectMode ? 'active' : ''}`}
                  onClick={toggleBulkSelectMode}
                  title={isBulkSelectMode ? 'Toplu Seçimi Kapat' : 'Toplu Seçimi Aç'}
                >
                  {isBulkSelectMode ? '❌ Toplu Seçimi Kapat' : '☑️ Toplu Seç'}
                </button>
                
                <button 
                  className="create-cycle-btn"
                  onClick={handleCreateCycle}
                  title="Yeni Cycle Oluştur"
                >
                  <span className="icon">➕</span>
                  Yeni Cycle
                </button>
              </div>
            </div>

            {!routeState?.cycles || routeState.cycles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔄</div>
                <h3>Henüz cycle oluşturulmamış</h3>
                <p>Önce oyun listesi yükleyin ve "Cycle'lara Böl" butonuna tıklayın</p>
              </div>
            ) : (
              <div className="cycles-grid">
                {routeState.cycles.map((cycle, cycleIndex) => (
                  <div key={cycle.cycleNumber || cycleIndex} className={`cycle-card ${isBulkSelectMode ? 'bulk-select-mode' : ''} ${selectedCycles.has(cycle.cycleNumber) ? 'selected' : ''}`}>
                    {/* Toplu seçim checkbox */}
                    {isBulkSelectMode && (
                      <div className="cycle-checkbox">
                        <input 
                          type="checkbox"
                          checked={selectedCycles.has(cycle.cycleNumber)}
                          onChange={() => toggleCycleSelection(cycle.cycleNumber)}
                        />
                      </div>
                    )}
                    
                    <div className="cycle-header">
                      <div className="cycle-title-section">
                        <h3>🔥 Cycle {cycle.cycleNumber}</h3>
                        <div className={`cycle-status ${cycle.status}`}>
                          {cycle.status === 'active' && '🟢 Aktif'}
                          {cycle.status === 'pending' && '🟡 Beklemede'}
                          {cycle.status === 'locked' && '🔒 Kilitli'}
                          {cycle.status === 'completed' && '✅ Tamamlandı'}
                        </div>
                      </div>
                      <div className="cycle-actions">
                        {isEditingCycle && editingCycleNumber === cycle.cycleNumber ? (
                          <button 
                            className="cycle-action-btn stop-edit-btn"
                            onClick={handleStopEditingCycle}
                            title="Düzenlemeyi Bitir"
                          >
                            ✅ Bitir
                          </button>
                        ) : (
                          <button 
                            className="cycle-action-btn edit-btn"
                            onClick={() => handleEditCycle(cycle.cycleNumber)}
                            title="Cycle'ı Düzenle"
                          >
                            ⚙️ Düzenle
                          </button>
                        )}
                        {/* Silme butonu - tüm cycle'lar için */}
                        <button 
                          className="cycle-action-btn delete-btn"
                          onClick={() => handleDeleteCycle(cycle.cycleNumber)}
                          title="Cycle'ı Sil"
                        >
                          🗑️ Sil
                        </button>
                      </div>
                    </div>
                    
                    <div className="cycle-games">
                      {cycle.games?.map((game, gameIndex) => (
                        <div key={game.position || gameIndex} className={`cycle-game ${isEditingCycle && editingCycleNumber === cycle.cycleNumber ? 'editing' : ''}`}>
                          <div className="game-info">
                            <div className="game-type-badge">
                              {game.type === 'RPG' && '⚔️ RPG'}
                              {game.type === 'Story/Indie' && '📖 Story/Indie'}
                              {game.type === 'Strategy/Sim' && '🧠 Strategy/Sim'}
                            </div>
                            <div className="game-name">
                              {game.name || 'Oyun Seçilmemiş'}
                            </div>
                            <div className="game-hours">
                              ⏱️ {game.estimatedHours}h
                            </div>
                            <div className={`game-status ${game.status}`}>
                              {game.status === 'empty' && '⚪ Boş'}
                              {game.status === 'selected' && '🟡 Seçildi'}
                              {game.status === 'active' && '🟢 Aktif'}
                              {game.status === 'completed' && '✅ Tamamlandı'}
                            </div>
                          </div>
                          
                          {/* Düzenleme Butonları */}
                          {isEditingCycle && editingCycleNumber === cycle.cycleNumber && (
                            <div className="game-edit-actions">
                              <button 
                                className="game-edit-btn add-btn"
                                onClick={() => handleSelectGameForSlot(cycle.cycleNumber, gameIndex, game.type)}
                                title="Oyun Seç/Değiştir"
                              >
                                {game.name ? '🔄 Değiştir' : '➕ Ekle'}
                              </button>
                              {game.name && (
                                <button 
                                  className="game-edit-btn remove-btn"
                                  onClick={() => handleRemoveGameFromSlot(cycle.cycleNumber, gameIndex)}
                                  title="Oyunu Kaldır"
                                >
                                  🗑️ Kaldır
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="cycle-stats">
                      <div className="stat">
                        <span>📊 Toplam Süre:</span>
                        <span>{cycle.estimatedHours || 0}h</span>
                      </div>
                      <div className="stat">
                        <span>🎮 Oyun Sayısı:</span>
                        <span>{cycle.games?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Floating Panels - Cycle görünümünde */}
        {currentView === 'cycles' && (
          <>
            {/* Floating Cycle Keyboard Help */}
            {showCycleKeyboardHelp && (
              <div className="floating-panel cycle-keyboard-help-floating">
                <div className="floating-panel-header">
                  <h3>⌨️ Cycle Klavye Kısayolları</h3>
                  <button 
                    className="floating-close-btn"
                    onClick={() => setShowCycleKeyboardHelp(false)}
                    title="Kapat"
                  >
                    ×
                  </button>
                </div>
                <div className="keyboard-shortcuts">
                  <div className="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>N</kbd>
                    <span>Yeni cycle oluştur</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>A</kbd>
                    <span>Tüm cycle'ları seç (Bulk Mode)</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Delete</kbd>
                    <span>Seçili cycle'ları sil</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>B</kbd>
                    <span>Toplu seçim modunu aç/kapat</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Esc</kbd>
                    <span>Seçimleri temizle</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Floating Color Legend */}
            {showColorLegend && (
              <div className="floating-panel color-legend-floating">
                <div className="floating-panel-header">
                  <h3>🎨 Cycle Durumu Renk Açıklaması</h3>
                  <button 
                    className="floating-close-btn"
                    onClick={() => setShowColorLegend(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="legend-items">
                  <div className="legend-item">
                    <div className="legend-color cycle-active"></div>
                    <span>🟢 Aktif</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color cycle-pending"></div>
                    <span>🟡 Beklemede</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color cycle-locked"></div>
                    <span>🔒 Kilitli</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color cycle-completed"></div>
                    <span>✅ Tamamlandı</span>
                  </div>
                </div>
              </div>
            )}


          </>
        )}
      </main>

      {/* Edit Game Modal */}
      <EditGameModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        game={editingGame}
        onSave={handleSaveGame}
      />

      {/* Game Selection Modal */}
      {showGameSelectionModal && selectedGameSlot && (
        <div className="modal-overlay" onClick={() => setShowGameSelectionModal(false)}>
          <div className="modal game-selection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎮 Oyun Seç - {selectedGameSlot.gameType}</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setShowGameSelectionModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="game-selection-info">
                <p>Cycle {selectedGameSlot.cycleNumber} - {selectedGameSlot.gameType} türü için oyun seçin:</p>
              </div>
              
              {/* Modal Arama */}
              <div className="modal-search">
                <input
                  type="text"
                  placeholder="Oyun ara..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  className="modal-search-input"
                />
              </div>
              
              <div className="available-games-list">
                {(routeState?.library || [])
                  .filter(game => {
                    // Arama filtresi
                    const searchLower = modalSearchTerm.toLowerCase();
                    const gameTitle = (game.title || game.name || '').toLowerCase();
                    const gameType = (game.type || game.genre || '').toLowerCase();
                    
                    const matchesSearch = !modalSearchTerm || 
                                        gameTitle.includes(searchLower) ||
                                        gameType.includes(searchLower);
                    
                    if (!matchesSearch) return false;
                    
                    // Oyun türüne göre filtrele
                    if (selectedGameSlot.gameType === 'RPG') {
                      return gameType.includes('rpg') || 
                             gameType.includes('role') ||
                             gameTitle.includes('rpg');
                    } else if (selectedGameSlot.gameType === 'Story/Indie') {
                      return gameType.includes('story') || 
                             gameType.includes('indie') ||
                             gameType.includes('adventure') ||
                             gameType.includes('narrative') ||
                             gameType.includes('visual novel') ||
                             gameTitle.includes('story') ||
                             gameTitle.includes('indie');
                    } else if (selectedGameSlot.gameType === 'Strategy/Sim') {
                      return gameType.includes('strategy') || 
                             gameType.includes('sim') ||
                             gameType.includes('management') ||
                             gameType.includes('building') ||
                             gameType.includes('tactical') ||
                             gameTitle.includes('sim') ||
                             gameTitle.includes('strategy');
                    }
                    return true; // Eğer tür belirlenemiyorsa tüm oyunları göster
                  })
                  .slice(0, 20) // İlk 20 oyunu göster
                  .map((game, index) => (
                    <div 
                      key={game.id || index} 
                      className="selectable-game-item"
                      onClick={() => handleGameSelection(game)}
                    >
                      <div className="game-title">{game.title || game.name}</div>
                      <div className="game-details">
                        <span className="game-type">{game.type || game.genre}</span>
                        <span className="game-status">{game.status || 'Oynanmadı'}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
              
              {(!routeState?.library || routeState.library.length === 0) && (
                <div className="no-games-message">
                  <p>Henüz oyun kütüphanesi yüklenmemiş. Önce Excel dosyası yükleyin veya route başlatın.</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowGameSelectionModal(false)}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Keyboard Help Button - Cycle'a özel - Window'a bağlı */}
      {currentView === 'cycles' && (
        <button 
          className="floating-keyboard-btn"
          onClick={() => setShowCycleKeyboardHelp(!showCycleKeyboardHelp)}
          title="Klavye kısayollarını göster/gizle"
        >
          ⌨️
        </button>
      )}
      </div>
    </div>
  );
}

export default GameTracker;