import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { readExcelFile, parseGameList } from '../../utils/excelUtils';
import { organizeCurrentData } from '../../utils/organizeCurrentData';
import { useRoute } from '../../contexts/RouteContext';
import SmartSearch from '../SmartSearch';
import AdvancedFilters from '../AdvancedFilters';
import GameListItem from '../GameListItem';
import EditGameModal from '../EditGameModal';
import GameSearchModal from '../GameSearchModal';
import LibraryCycleItem from '../LibraryCycleItem';
import GameList from './GameList';
import styles from './GameTracker.module.css';
import { useNotifications } from '../NotificationSystem';
import ProfileDropdown from '../ProfileDropdown';

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

  // Game Search Modal State
  const [isGameSearchModalOpen, setIsGameSearchModalOpen] = useState(false);

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
  
  // Expandable Cycles State
  const [expandedCycles, setExpandedCycles] = useState(new Set());
  
  // Cycle Floating Panel State
  const [showCycleKeyboardHelp, setShowCycleKeyboardHelp] = useState(false);

  // Refs
  const fileInputRef = useRef(null);

  // Component mount olduğunda localStorage'dan veri yükle
  useEffect(() => {
    const savedGames = localStorage.getItem('gameTracker_games');
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
          navigate(`/game-tracking-hub/game-tracker/game/${filteredGames[0].id || 0}`);
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

  // Son oynanan oyunları getir - useMemo ile optimize edildi
  const recentlyPlayedGames = useMemo(() => {
    return games
      .filter(game => game.lastPlayed)
      .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
      .slice(0, 10);
  }, [games]);

  const getRecentlyPlayedGames = useCallback(() => recentlyPlayedGames, [recentlyPlayedGames]);

  // Benzersiz değerleri getir (filtreler için) - useMemo ile optimize edildi
  const uniqueValues = useMemo(() => {
    const platforms = [...new Set(games.map(game => game.platform || game.sistem).filter(Boolean))].sort();
    const genres = [...new Set(games.map(game => game.genre || game.tur).filter(Boolean))].sort();
    
    return {
      platform: platforms,
      genre: genres
    };
  }, [games]);

  const getUniqueValues = useCallback((field) => {
    return uniqueValues[field] || [];
  }, [uniqueValues]);

  // Akıllı filtreleme fonksiyonu - useMemo ile optimize edildi
  const filteredGames = useMemo(() => {
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
  }, [games, searchTerm, statusFilter, platformFilter, genreFilter]);

  // Geriye uyumluluk için wrapper fonksiyon
  const getSmartFilteredGames = useCallback(() => filteredGames, [filteredGames]);

  // Filtreleri temizle - useCallback ile optimize edildi
  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setPlatformFilter('all');
    setGenreFilter('all');
  }, []);

  // Smart Search handler - useCallback ile optimize edildi
  const handleSmartSearch = useCallback((searchValue) => {
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
  }, []);

  // Toplu işlemler
  const handleBulkDelete = () => {
    if (window.confirm(`${selectedGames.size} oyunu silmek istediğinizden emin misiniz?`)) {
      const filteredGames = getSmartFilteredGames();
      const gamesToDelete = Array.from(selectedGames).map(index => filteredGames[index]);
      const updatedGames = games.filter(game => !gamesToDelete.includes(game));
      setGames(updatedGames);
      localStorage.setItem('gameTracker_games', JSON.stringify(updatedGames));
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
    localStorage.setItem('gameTracker_games', JSON.stringify(updatedGames));
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
      localStorage.setItem('gameTracker_games', JSON.stringify(gameList));
      
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
      localStorage.setItem('gameTracker_games', JSON.stringify(updatedGames));
      
      showSuccess(`"${updatedGameData.title}" başarıyla güncellendi!`);
    }
  };

  // Game Search Modal Handlers
  const handleGameSearchModalClose = () => {
    setIsGameSearchModalOpen(false);
  };

  const handleGameSelect = (selectedGame) => {
    // Modal'ı kapat
    setIsGameSearchModalOpen(false);
    
    // Seçilen oyun bilgileriyle AddGame sayfasına git
    navigate('/game-tracking-hub/add-game', { 
      state: { 
        prefilledData: selectedGame 
      } 
    });
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

  // Cycle expansion fonksiyonları
  const toggleCycleExpansion = (cycleNumber) => {
    const newExpanded = new Set(expandedCycles);
    if (newExpanded.has(cycleNumber)) {
      newExpanded.delete(cycleNumber);
    } else {
      newExpanded.add(cycleNumber);
    }
    setExpandedCycles(newExpanded);
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
      localStorage.setItem('gameTracker_games', JSON.stringify(updatedGames));
      
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
      localStorage.setItem('gameTracker_games', JSON.stringify(gameList));
      
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
        gameTracker_games: localStorage.getItem('gameTracker_games') ? 'Var' : 'Yok',
        routeState: localStorage.getItem('routeState') ? 'Var' : 'Yok'
      },
      routeState: routeState
    };
    
    console.log('🔍 Debug Bilgileri:', debugData);
    alert(`Debug Bilgileri:\n\nOyun Sayısı: ${debugData.games}\nLocalStorage: ${JSON.stringify(debugData.localStorage, null, 2)}\n\nDetaylar console'da`);
  };

  return (
    <div className={styles.gameTrackerPage} style={{
      background: 'linear-gradient(135deg, var(--bg-gradient-1) 0%, var(--bg-gradient-2) 25%, var(--bg-gradient-3) 50%, var(--bg-gradient-4) 100%)',
      minHeight: '100vh',
      width: '100vw'
    }}>
      <div className={styles.gameTracker}>
      {/* Header */}
      <header className={styles.trackerHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1>🎮 Game Tracker</h1>
            <p>Oyun kütüphanenizi yönetin ve cycle'lara organize edin</p>
          </div>
          
          <div className={styles.headerControls}>
            {/* View Switcher */}
            <div className={styles.viewSwitcher}>
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

            {/* Navigation Buttons */}
            <div className={styles.navigationButtons}>
              <button 
                className={`${styles.navBtn} ${styles.homeBtn}`}
                onClick={() => navigate('/')}
                title="Ana Sayfaya Dön"
              >
                🏠 Ana Sayfa
              </button>
              <button 
                className={`${styles.navBtn} ${styles.hubBtn}`}
                onClick={() => navigate('/game-tracking-hub')}
                title="Oyun Hub'ına Dön"
              >
                🎮 Oyun Hub
              </button>
            </div>



            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.trackerMain} style={{
        background: 'transparent',
        backdropFilter: 'none'
      }}>
        {/* Controls */}
        <div className={styles.trackerControls}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
          />
          
          <div className={styles.controlButtons}>
            <button 
              className={styles.uploadBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              {loading ? '📤 Yükleniyor...' : '📁 Excel Dosyası Yükle'}
            </button>
            
            <button 
              className={styles.addGameBtn}
              onClick={() => setIsGameSearchModalOpen(true)}
              title="Yeni Oyun Ekle"
            >
              ➕ Oyun Ekle
            </button>
            
            <button 
              className={styles.sampleDataBtn}
              onClick={handleLoadSampleData}
              disabled={loading}
              title="Örnek oyun verilerini yükle"
            >
              {loading ? '🎮 Yükleniyor...' : '🎮 Örnek Veri Yükle'}
            </button>
            
            {games.length > 0 && (
              <>
                <button 
                  className={styles.distributeBtn}
                  onClick={handleDistributeGamesToCycles}
                  disabled={loading}
                >
                  {loading ? '🔄 Dağıtılıyor...' : '🎯 Cycle\'lara Böl'}
                </button>
                <button 
                  className={styles.debugBtn}
                  onClick={handleDebugTotalWar}
                  title="localStorage verilerini kontrol et"
                >
                  🔍 Debug
                </button>
              </>
            )}
          </div>

          {/* Orta Kompaktlık Modern Filtreler */}
          {currentView === 'library' && games.length > 0 && (
            <div className={styles.balancedFiltersContainer}>
              {/* Üst Bölüm: Arama + İstatistikler */}
              <div className={styles.topSection}>
                <div className={styles.searchBarSection}>
                  <div className={styles.searchInputWrapper}>
                    <div className={styles.searchIcon}>🔍</div>
                    <input
                      type="text"
                      placeholder="Oyun ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={styles.balancedSearchInput}
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className={styles.clearSearchBtn}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                
                <div className={styles.statsSection}>
                  <div className={styles.statItem}>
                    <span className={styles.statIcon}>📊</span>
                    <span className={styles.statLabel}>Toplam</span>
                    <span className={styles.statValue}>{filteredGames.length}</span>
                  </div>
                </div>
              </div>

              {/* Filtre Kategorileri Bölümü */}
              <div className={styles.filterCategoriesSection}>
                {/* Durum Kategorisi */}
                <div className={styles.filterCategoryBlock}>
                  <div className={styles.categoryHeader}>
                    <span className={styles.categoryIcon}>🎯</span>
                    <span className={styles.categoryTitle}>Durum</span>
                  </div>
                  <div className={styles.categoryFilters}>
                    {[
                      { value: '', label: 'Tümü', icon: '📋' },
                      { value: 'completed', label: 'Tamamlandı', icon: '✅' },
                      { value: 'playing', label: 'Oynuyor', icon: '🎯' },
                      { value: 'paused', label: 'Beklemede', icon: '⏸️' },
                      { value: 'not-started', label: 'Başlanmadı', icon: '🆕' }
                    ].map(status => (
                      <button
                        key={status.value}
                        onClick={() => setStatusFilter(status.value)}
                        className={`${styles.balancedFilterChip} ${statusFilter === status.value ? styles.active : ''}`}
                      >
                        <span className={styles.chipIcon}>{status.icon}</span>
                        <span className={styles.chipLabel}>{status.label}</span>
                        <span className={styles.chipCount}>
                          {status.value ? games.filter(g => g.status === status.value).length : games.length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform Kategorisi */}
                <div className={styles.filterCategoryBlock}>
                  <div className={styles.categoryHeader}>
                    <span className={styles.categoryIcon}>🎮</span>
                    <span className={styles.categoryTitle}>Platform</span>
                  </div>
                  <div className={styles.categoryFilters}>
                    {[
                      { value: '', label: 'Tümü', icon: '🌐' },
                      ...Array.from(new Set(games.map(g => g.platform).filter(Boolean))).slice(0, 4).map(platform => ({
                        value: platform,
                        label: platform,
                        icon: platform.toLowerCase().includes('pc') ? '🖥️' : 
                              platform.toLowerCase().includes('steam') ? '🎮' :
                              platform.toLowerCase().includes('epic') ? '🎯' : '📱'
                      }))
                    ].map(platform => (
                      <button
                        key={platform.value}
                        onClick={() => setPlatformFilter(platform.value)}
                        className={`${styles.balancedFilterChip} ${platformFilter === platform.value ? styles.active : ''}`}
                      >
                        <span className={styles.chipIcon}>{platform.icon}</span>
                        <span className={styles.chipLabel}>{platform.label}</span>
                        <span className={styles.chipCount}>
                          {platform.value ? games.filter(g => g.platform === platform.value).length : games.length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tür Kategorisi */}
                <div className={styles.filterCategoryBlock}>
                  <div className={styles.categoryHeader}>
                    <span className={styles.categoryIcon}>🎨</span>
                    <span className={styles.categoryTitle}>Tür</span>
                  </div>
                  <div className={styles.categoryFilters}>
                    {[
                      { value: '', label: 'Tümü', icon: '🎲' },
                      ...Array.from(new Set(games.map(g => g.genre).filter(Boolean))).slice(0, 4).map(genre => ({
                        value: genre,
                        label: genre,
                        icon: genre.toLowerCase().includes('action') ? '⚔️' :
                              genre.toLowerCase().includes('rpg') ? '🗡️' :
                              genre.toLowerCase().includes('strategy') ? '🧠' : '🎮'
                      }))
                    ].map(genre => (
                      <button
                        key={genre.value}
                        onClick={() => setGenreFilter(genre.value)}
                        className={`${styles.balancedFilterChip} ${genreFilter === genre.value ? styles.active : ''}`}
                      >
                        <span className={styles.chipIcon}>{genre.icon}</span>
                        <span className={styles.chipLabel}>{genre.label}</span>
                        <span className={styles.chipCount}>
                          {genre.value ? games.filter(g => g.genre === genre.value).length : games.length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hızlı Eylemler Bölümü */}
              <div className={styles.quickActionsSection}>
                <button 
                  onClick={clearAllFilters}
                  className={styles.balancedActionBtn}
                >
                  <span className={styles.actionIcon}>🗑️</span>
                  <span className={styles.actionLabel}>Filtreleri Temizle</span>
                </button>
                
                <button 
                  onClick={() => {
                    setStatusFilter('playing');
                    setSearchTerm('');
                    setPlatformFilter('');
                    setGenreFilter('');
                  }}
                  className={styles.balancedActionBtn}
                >
                  <span className={styles.actionIcon}>🎯</span>
                  <span className={styles.actionLabel}>Şu An Oynuyor</span>
                </button>
                
                <button 
                  onClick={() => {
                    setStatusFilter('not-started');
                    setSearchTerm('');
                    setPlatformFilter('');
                    setGenreFilter('');
                  }}
                  className={styles.balancedActionBtn}
                >
                  <span className={styles.actionIcon}>📚</span>
                  <span className={styles.actionLabel}>Backlog</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content based on current view */}
        {currentView === 'library' ? (
          /* Oyun Kütüphanesi */
          <div className={styles.gamesSection} style={{
            background: 'rgba(20, 25, 40, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            {/* Color Legend */}
            {showColorLegend && (
              <div className={styles.colorLegend}>
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
                      onClick={() => navigate(`/game-tracking-hub/game-tracker/game/${game.id || index}`)}
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

            <GameList
              games={games}
              filteredGames={getSmartFilteredGames()}
              selectedGames={selectedGames}
              setSelectedGames={setSelectedGames}
              onEditGame={handleEditGame}
              onDeleteGame={handleDeleteGame}
              onStatusChange={(game, index, newStatus) => {
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
                  localStorage.setItem('gameTracker_games', JSON.stringify(updatedGames));
                  
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
              onBulkStatusChange={handleBulkStatusChange}
              onBulkDelete={handleBulkDelete}
              showGameUpdate={showGameUpdate}
              showAchievement={showAchievement}
            />

          </div>
        ) : (
          /* Cycle Viewer - Yeni Expandable List View */
          <div className={styles.cyclesSection}>
            <div className={styles.cyclesHeader}>
              <div className={styles.cyclesTitleSection}>
                <h2>🔄 Cycle Kütüphanesi</h2>
                <p>Oyun döngülerinizi yönetin ve detaylarını görüntüleyin</p>
              </div>
              <div className={styles.cyclesHeaderActions}>
                {/* Toplu seçme butonları */}
                {isBulkSelectMode && (
                  <div className={styles.bulkSelectControls}>
                    <button 
                      className={`${styles.bulkControlBtn} ${styles.selectAll}`}
                      onClick={selectAllCycles}
                      title="Tümünü Seç"
                    >
                      ☑️ Tümünü Seç
                    </button>
                    <button 
                      className={`${styles.bulkControlBtn} ${styles.deselectAll}`}
                      onClick={deselectAllCycles}
                      title="Seçimi Temizle"
                    >
                      ⬜ Temizle
                    </button>
                    <button 
                      className={`${styles.bulkControlBtn} ${styles.bulkDelete}`}
                      onClick={handleBulkDeleteCycles}
                      disabled={selectedCycles.size === 0}
                      title={`${selectedCycles.size} Cycle'ı Sil`}
                    >
                      🗑️ Sil ({selectedCycles.size})
                    </button>
                  </div>
                )}
                
                <button 
                  className={`${styles.bulkSelectToggle} ${isBulkSelectMode ? styles.active : ''}`}
                  onClick={toggleBulkSelectMode}
                  title={isBulkSelectMode ? 'Toplu Seçimi Kapat' : 'Toplu Seçimi Aç'}
                >
                  {isBulkSelectMode ? '❌ Toplu Seçimi Kapat' : '☑️ Toplu Seç'}
                </button>
                
                <button 
                  className={styles.createCycleBtn}
                  onClick={handleCreateCycle}
                  title="Yeni Cycle Oluştur"
                >
                  <span className={styles.icon}>➕</span>
                  Yeni Cycle
                </button>
              </div>
            </div>

            {!routeState?.cycles || routeState.cycles.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔄</div>
                <h3>Henüz cycle oluşturulmamış</h3>
                <p>Önce oyun listesi yükleyin ve "Cycle'lara Böl" butonuna tıklayın</p>
              </div>
            ) : (
              <div className={styles.cyclesList}>
                {routeState.cycles.map((cycle, cycleIndex) => (
                  <LibraryCycleItem
                    key={cycle.cycleNumber || cycleIndex}
                    cycle={cycle}
                    isExpanded={expandedCycles.has(cycle.cycleNumber)}
                    onToggleExpand={() => toggleCycleExpansion(cycle.cycleNumber)}
                    isSelected={selectedCycles.has(cycle.cycleNumber)}
                    onSelect={() => toggleCycleSelection(cycle.cycleNumber)}
                    isBulkSelectMode={isBulkSelectMode}
                    onEditCycle={() => handleEditCycle(cycle.cycleNumber)}
                    onDeleteCycle={() => handleDeleteCycle(cycle.cycleNumber)}
                    onEditGame={(game) => {
                      // Oyun düzenleme fonksiyonu
                      console.log('Oyun düzenleme:', game);
                    }}
                    onDeleteGame={(game) => {
                      // Oyun silme fonksiyonu
                      console.log('Oyun silme:', game);
                    }}
                    onAddGame={() => {
                      // Yeni oyun ekleme fonksiyonu
                      console.log('Yeni oyun ekleme:', cycle.cycleNumber);
                    }}
                  />
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
                className={styles.btnSecondary}
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

      {/* Game Search Modal */}
      {isGameSearchModalOpen && (
        <GameSearchModal
          isOpen={isGameSearchModalOpen}
          onClose={handleGameSearchModalClose}
          onGameSelect={handleGameSelect}
        />
      )}
      </div>
    </div>
  );
}

export default GameTracker;