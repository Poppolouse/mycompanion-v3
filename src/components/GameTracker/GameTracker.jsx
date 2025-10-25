import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { readExcelFile, parseGameList, parseGameListWithRAWG } from '../../utils/excelUtils';
import { searchGames, getGameDetails } from '../../api/gameApi';
import { organizeCurrentData } from '../../utils/organizeCurrentData';
import { useRoute } from '../../contexts/RouteContext';
import { useGame } from '../../contexts/GameContext';
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

  // 🎮 Game Context - Bağımsız state management
  const {
    games,
    setGames,
    loading,
    setLoading,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    platformFilter,
    setPlatformFilter,
    genreFilter,
    setGenreFilter,
    selectedGames,
    setSelectedGames,
    filteredGames,
    uniqueValues,
    stats,
    getGameStatus,
    clearAllFilters,
    updateGame,
    deleteGame,
    toggleGameSelection,
    selectAllGames,
    clearSelection,
    updateAllGameImages
  } = useGame();

  // 📱 UI state'leri (sadece GameTracker'a özel)
  const [currentView, setCurrentView] = useState('library'); // 'library' veya 'cycles'
  const [viewMode, setViewMode] = useState('list'); // 'list' veya 'grid'
  const [showColorLegend, setShowColorLegend] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showSmartSearch, setShowSmartSearch] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'progress', 'status', 'platform'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' veya 'desc'

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

  // RAWG Import State
  const [isRAWGImporting, setIsRAWGImporting] = useState(false);
  const [rawgProgress, setRawgProgress] = useState({ current: 0, total: 0 });

  // Refs
  const searchInputRef = useRef(null);

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

  // 🖼️ Sayfa açıldığında otomatik resim güncelleme (sadece bir kez)
  useEffect(() => {
    const autoUpdateImages = async () => {
      // Sadece oyunlar yüklendiyse ve loading durumunda değilse çalıştır
      if (games.length > 0 && !loading) {
        try {
          await updateAllGameImages();
        } catch (error) {
          console.error('❌ Otomatik resim güncelleme hatası:', error);
        }
      }
    };

    // 5 saniye delay ile başlat (sayfa tamamen yüklendikten sonra)
    const timer = setTimeout(autoUpdateImages, 5000);
    
    return () => clearTimeout(timer);
  }, []); // Sadece component mount olduğunda çalışsın

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

  // Son oynanan oyunları getir - useMemo ile optimize edildi
  const recentlyPlayedGames = useMemo(() => {
    return games
      .filter(game => game.lastPlayed)
      .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
      .slice(0, 10);
  }, [games]);

  const getRecentlyPlayedGames = useCallback(() => recentlyPlayedGames, [recentlyPlayedGames]);

  // Route state güncelleme fonksiyonu
  const updateRouteState = (newState) => {
    // RouteContext'ten gelen fonksiyon kullanılacak
    // Bu fonksiyon RouteContext'te tanımlanmalı
  };

  // Geriye uyumluluk için wrapper fonksiyon
  const getSmartFilteredGames = useCallback(() => filteredGames, [filteredGames]);

  // Benzersiz değerleri getir (geriye uyumluluk için)
  const getUniqueValues = useCallback((field) => {
    return uniqueValues[field] || [];
  }, [uniqueValues]);

  // Platform ve genre için özel fonksiyonlar
  const getUniquePlatforms = useCallback(() => {
    return getUniqueValues('platform');
  }, [getUniqueValues]);

  const getUniqueGenres = useCallback(() => {
    return getUniqueValues('genre');
  }, [getUniqueValues]);

  // Platform icon fonksiyonu
  const getPlatformIcon = useCallback((platform) => {
    const platformIcons = {
      'PC': '💻',
      'PlayStation': '🎮',
      'PlayStation 2': '🎮',
      'PlayStation 3': '🎮',
      'PlayStation 4': '🎮',
      'PlayStation 5': '🎮',
      'Xbox': '🎮',
      'Xbox 360': '🎮',
      'Xbox One': '🎮',
      'Xbox Series X/S': '🎮',
      'Nintendo Switch': '🎮',
      'Nintendo 3DS': '🎮',
      'Nintendo DS': '🎮',
      'Nintendo Wii': '🎮',
      'Nintendo Wii U': '🎮',
      'Steam': '💻',
      'Epic Games': '💻',
      'Origin': '💻',
      'Uplay': '💻',
      'GOG': '💻',
      'Mobile': '📱',
      'Android': '📱',
      'iOS': '📱',
      'Web': '🌐'
    };
    return platformIcons[platform] || '🎮';
  }, []);

  // Genre icon fonksiyonu
  const getGenreIcon = useCallback((genre) => {
    const genreIcons = {
      'Action': '⚔️',
      'Adventure': '🗺️',
      'RPG': '🧙‍♂️',
      'Strategy': '🧠',
      'Simulation': '🏗️',
      'Sports': '⚽',
      'Racing': '🏎️',
      'Puzzle': '🧩',
      'Platformer': '🏃‍♂️',
      'Fighting': '👊',
      'Shooter': '🔫',
      'Horror': '👻',
      'Survival': '🏕️',
      'Sandbox': '🏗️',
      'MMORPG': '🌍',
      'Indie': '🎨',
      'Casual': '😊',
      'Educational': '📚',
      'Music': '🎵',
      'Party': '🎉'
    };
    return genreIcons[genre] || '🎮';
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

  // Sıralama fonksiyonu
  const getSortedGames = useCallback((gamesToSort) => {
    if (!gamesToSort || gamesToSort.length === 0) return [];
    
    const sorted = [...gamesToSort].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'date':
          aValue = new Date(a.lastPlayed || a.dateAdded || 0);
          bValue = new Date(b.lastPlayed || b.dateAdded || 0);
          break;
        case 'status':
          const statusOrder = { 'playing': 1, 'completed': 2, 'paused': 3, 'dropped': 4, 'planning': 5, 'wishlist': 6 };
          aValue = statusOrder[a.status] || 6;
          bValue = statusOrder[b.status] || 6;
          break;
        case 'platform':
          aValue = a.platform?.toLowerCase() || '';
          bValue = b.platform?.toLowerCase() || '';
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [sortBy, sortOrder]);

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
      'dropped': 'Bırakıldı',
      'planning': 'Planlanıyor',
      'wishlist': 'İstek Listesi'
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

  // Excel dosyası yükleme (RAWG entegrasyonlu)
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setIsRAWGImporting(true);
    setError('');
    setRawgProgress({ current: 0, total: 0 });

    try {
      const data = await readExcelFile(file);
      
      // Progress callback for RAWG enrichment
      const progressCallback = (current, total) => {
        setRawgProgress({ current, total });
      };

      // RAWG ile zenginleştirilmiş oyun listesi
      const gameList = await parseGameListWithRAWG(data, progressCallback);
      
      if (gameList.length === 0) {
        throw new Error('Excel dosyasında geçerli oyun verisi bulunamadı');
      }

      setGames(gameList);
      localStorage.setItem('gameTracker_games', JSON.stringify(gameList));
      
      // Başarı bildirimi
      showSuccess(`${gameList.length} oyun RAWG verileri ile zenginleştirilerek yüklendi!`, {
        title: '🎮 Dosya Yüklendi'
      });
      
    } catch (err) {
      const errorMessage = err.message || 'Dosya yüklenirken bir hata oluştu';
      setError(errorMessage);
      showError(errorMessage, {
        title: '📁 Dosya Yükleme Hatası'
      });
    } finally {
      setLoading(false);
      setIsRAWGImporting(false);
      setRawgProgress({ current: 0, total: 0 });
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

  // Mevcut oyunları RAWG ile zenginleştir
  const handleEnrichExistingGames = async () => {
    if (games.length === 0) {
      showWarning('Zenginleştirilecek oyun bulunamadı!', {
        title: '⚠️ Uyarı'
      });
      return;
    }

    setLoading(true);
    setIsRAWGImporting(true);
    setError('');
    setRawgProgress({ current: 0, total: games.length });

    try {
      const enrichedGames = [];
      
      for (let i = 0; i < games.length; i++) {
        const game = games[i];
        setRawgProgress({ current: i + 1, total: games.length });
        
        try {
          // RAWG'den oyun ara
          const searchResults = await searchGames(game.title || game.name);
          
          if (searchResults && searchResults.length > 0) {
            const rawgGame = searchResults[0]; // En iyi eşleşme
            
            // RAWG verilerini mevcut oyun verisiyle birleştir
            const enrichedGame = {
              ...game, // Mevcut veriler korunur
              // RAWG'den gelen veriler (sadece eksik olanlar doldurulur)
              description: game.description || rawgGame.description || '',
              genres: game.genres || rawgGame.genres || ['Action'],
              platforms: game.platforms || rawgGame.platforms || [game.platform || 'PC'],
              developer: game.developer || rawgGame.developer || '',
              publisher: game.publisher || rawgGame.publisher || '',
              releaseDate: game.releaseDate || rawgGame.releaseDate || '',
              metacritic: game.metacritic || rawgGame.metacritic || null,
              esrbRating: game.esrbRating || rawgGame.esrbRating || '',
              playtime: game.playtime || rawgGame.playtime || null,
              backgroundImage: game.backgroundImage || rawgGame.backgroundImage || '',
              // RAWG ID'sini ekle (gelecekte kullanım için)
              rawgId: rawgGame.id || null,
              // Zenginleştirme tarihi
              enrichedAt: new Date().toISOString()
            };
            
            enrichedGames.push(enrichedGame);
          } else {
            // RAWG'de bulunamadı, mevcut veriyi koru
            enrichedGames.push(game);
          }
          
          // API rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (gameError) {
          console.warn(`${game.title} için RAWG verisi alınamadı:`, gameError);
          // Hata durumunda mevcut veriyi koru
          enrichedGames.push(game);
        }
      }
      
      // Zenginleştirilmiş oyunları kaydet
      setGames(enrichedGames);
      localStorage.setItem('gameTracker_games', JSON.stringify(enrichedGames));
      
      showSuccess(`${enrichedGames.length} oyun RAWG verileri ile zenginleştirildi!`, {
        title: '🎮 Zenginleştirme Tamamlandı'
      });
      
    } catch (err) {
      const errorMessage = err.message || 'Oyunlar zenginleştirilirken bir hata oluştu';
      setError(errorMessage);
      showError(errorMessage, {
        title: '🎮 Zenginleştirme Hatası'
      });
    } finally {
      setLoading(false);
      setIsRAWGImporting(false);
      setRawgProgress({ current: 0, total: 0 });
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

  const handleGameSlotSelect = (cycleNumber, gamePosition, gameType) => {
    setSelectedGameSlot({ cycleNumber, gamePosition, gameType });
    setModalSearchTerm(''); // Arama kutusunu temizle
    setShowGameSelectionModal(true);
  };

  const handleGameRemove = (cycleNumber, gamePosition) => {
    const success = removeCycleGame(cycleNumber, gamePosition);
    if (success) {
      showSuccess('Oyun cycle\'dan kaldırıldı');
    } else {
      showError('Oyun kaldırılırken hata oluştu');
    }
  };

  const handleGameSelection = (gameId) => {
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
    
    alert(`Debug Bilgileri:\n\nOyun Sayısı: ${debugData.games}\nLocalStorage: ${JSON.stringify(debugData.localStorage, null, 2)}`);
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

      {/* Main Content Container */}
      <div className={styles.gameTrackerContainer}>
        {/* Games Section */}

        {/* Content based on current view */}
        {currentView === 'library' ? (
          /* Oyun Kütüphanesi - Ana Sayfa Tasarım Dili */
          <div className={styles.librarySection}>
            
            {/* Modern Quick Stats Section - Session History Tarzı */}
            <section className={styles.modernQuickStatsSection}>
              <div className={styles.statsHeader}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.titleIcon}>📊</span>
                  Kütüphane İstatistikleri
                </h2>
                <div className={styles.statsSubtitle}>
                  Oyun koleksiyonunuzun genel durumu
                </div>
              </div>
              
              <div className={styles.modernStatsGrid}>
                {/* Toplam Oyun Kartı */}
                <div className={`${styles.modernStatCard} ${styles.totalGamesCard}`}>
                  <div className={styles.statCardHeader}>
                    <div className={styles.statCardIcon}>🎮</div>
                    <div className={styles.statCardBadge}>Toplam</div>
                  </div>
                  <div className={styles.statCardContent}>
                    <div className={styles.statMainValue}>{games.length}</div>
                    <div className={styles.statMainLabel}>Oyun</div>
                  </div>

                </div>

                {/* Tamamlanan Oyunlar Kartı */}
                <div className={`${styles.modernStatCard} ${styles.completedGamesCard}`}>
                  <div className={styles.statCardHeader}>
                    <div className={styles.statCardIcon}>✅</div>
                    <div className={styles.statCardBadge}>Başarı</div>
                  </div>
                  <div className={styles.statCardContent}>
                    <div className={styles.statMainValue}>
                      {games.filter(g => g.status === 'completed').length}
                    </div>
                    <div className={styles.statMainLabel}>Tamamlandı</div>
                  </div>
                  <div className={styles.statCardFooter}>
                    <div className={styles.statProgress}>
                      <div className={styles.statProgressBar}>
                        <div 
                          className={styles.statProgressFill}
                          style={{ 
                            width: `${games.length > 0 ? (games.filter(g => g.status === 'completed').length / games.length) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <span className={styles.statProgressText}>
                        {games.length > 0 ? Math.round((games.filter(g => g.status === 'completed').length / games.length) * 100) : 0}% Tamamlanma
                      </span>
                    </div>
                  </div>
                </div>

                {/* Devam Eden Oyunlar Kartı */}
                <div className={`${styles.modernStatCard} ${styles.playingGamesCard}`}>
                  <div className={styles.statCardHeader}>
                    <div className={styles.statCardIcon}>🎯</div>
                    <div className={styles.statCardBadge}>Aktif</div>
                  </div>
                  <div className={styles.statCardContent}>
                    <div className={styles.statMainValue}>
                      {games.filter(g => g.status === 'playing').length}
                    </div>
                    <div className={styles.statMainLabel}>Devam Eden</div>
                  </div>

                </div>



                {/* Bekleyen Oyunlar Kartı */}
                <div className={`${styles.modernStatCard} ${styles.backlogGamesCard}`}>
                  <div className={styles.statCardHeader}>
                    <div className={styles.statCardIcon}>📚</div>
                    <div className={styles.statCardBadge}>Backlog</div>
                  </div>
                  <div className={styles.statCardContent}>
                    <div className={styles.statMainValue}>
                      {games.filter(g => g.status === 'backlog' || g.status === 'not_started').length}
                    </div>
                    <div className={styles.statMainLabel}>Bekleyen</div>
                  </div>

                </div>


              </div>
            </section>



            {/* Modern Search Section */}
            <section className={styles.modernSearchSection}>
              <div className={styles.searchHeader}>
                <div className={styles.sectionTitle}>
                  <span className={styles.titleIcon}>🔍</span>
                  Gelişmiş Arama
                </div>
                <div className={styles.searchSubtitle}>
                  Oyun koleksiyonunuzda hızlı ve akıllı arama yapın
                </div>
              </div>

              <div className={styles.modernSearchCard}>
                <div className={styles.searchCardHeader}>
                  <div className={styles.searchCardIcon}>🎯</div>
                  <div className={styles.searchCardTitle}>Arama Merkezi</div>
                  {searchTerm && (
                    <div className={styles.searchActiveBadge}>
                      {filteredGames.length} sonuç
                    </div>
                  )}
                </div>

                <div className={styles.searchCardContent}>
                  <div className={styles.modernSearchInputWrapper}>
                    <div className={styles.searchInputIcon}>🔍</div>
                    <input
                      type="text"
                      placeholder="Oyun adı, platform, tür veya akıllı komut girin..."
                      className={styles.modernSearchInput}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      ref={searchInputRef}
                    />
                    {searchTerm && (
                      <button 
                        className={styles.modernClearSearchBtn}
                        onClick={() => setSearchTerm('')}
                        title="Aramayı temizle"
                      >
                        ✕
                      </button>
                    )}
                    <div className={styles.searchShortcut}>Ctrl+F</div>
                  </div>

                  {/* Gelişmiş Filtreler */}
                  <div className={styles.advancedFiltersSection}>
                    <div className={styles.filtersRow}>
                      <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>
                          <span className={styles.filterIcon}>📊</span>
                          Durum
                        </label>
                        <select 
                          className={styles.modernFilterSelect}
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="">Tüm Durumlar</option>
                          <option value="Devam Ediyor">🎯 Devam Ediyor</option>
                          <option value="Tamamlandı">✅ Tamamlandı</option>
                          <option value="Bırakıldı">❌ Bırakıldı</option>
                          <option value="Planlandı">📅 Planlandı</option>
                          <option value="Duraklatıldı">⏸️ Duraklatıldı</option>
                        </select>
                      </div>

                      <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>
                          <span className={styles.filterIcon}>🎮</span>
                          Platform
                        </label>
                        <select 
                          className={styles.modernFilterSelect}
                          value={platformFilter}
                          onChange={(e) => setPlatformFilter(e.target.value)}
                        >
                          <option value="">Tüm Platformlar</option>
                          {getUniquePlatforms().map(platform => (
                            <option key={platform} value={platform}>
                              {getPlatformIcon(platform)} {platform}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>
                          <span className={styles.filterIcon}>🎭</span>
                          Tür
                        </label>
                        <select 
                          className={styles.modernFilterSelect}
                          value={genreFilter}
                          onChange={(e) => setGenreFilter(e.target.value)}
                        >
                          <option value="">Tüm Türler</option>
                          {getUniqueGenres().map(genre => (
                            <option key={genre} value={genre}>
                              {getGenreIcon(genre)} {genre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Aktif Filtreler */}
                    {(statusFilter || platformFilter || genreFilter) && (
                      <div className={styles.activeFilters}>
                        <div className={styles.activeFiltersHeader}>
                          <span className={styles.activeFiltersTitle}>Aktif Filtreler:</span>
                          <button 
                            className={styles.clearAllFiltersBtn}
                            onClick={() => {
                              setStatusFilter('');
                              setPlatformFilter('');
                              setGenreFilter('');
                            }}
                            title="Tüm filtreleri temizle"
                          >
                            Tümünü Temizle
                          </button>
                        </div>
                        <div className={styles.activeFilterTags}>
                          {statusFilter && (
                            <div className={styles.activeFilterTag}>
                              <span>📊 {statusFilter}</span>
                              <button onClick={() => setStatusFilter('')}>×</button>
                            </div>
                          )}
                          {platformFilter && (
                            <div className={styles.activeFilterTag}>
                              <span>🎮 {platformFilter}</span>
                              <button onClick={() => setPlatformFilter('')}>×</button>
                            </div>
                          )}
                          {genreFilter && (
                            <div className={styles.activeFilterTag}>
                              <span>🎭 {genreFilter}</span>
                              <button onClick={() => setGenreFilter('')}>×</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.searchActions}>
                    <button 
                      className={`${styles.modernSearchActionBtn} ${showSmartSearch ? styles.active : ''}`}
                      onClick={() => setShowSmartSearch(!showSmartSearch)}
                      title="Akıllı arama komutlarını göster/gizle"
                    >
                      <span className={styles.btnIcon}>🧠</span>
                      Akıllı Komutlar
                      {showSmartSearch && <span className={styles.activeIndicator}>●</span>}
                    </button>
                    
                    <button 
                      className={`${styles.modernSearchActionBtn} ${showColorLegend ? styles.active : ''}`}
                      onClick={() => setShowColorLegend(!showColorLegend)}
                      title="Renk açıklamasını göster/gizle"
                    >
                      <span className={styles.btnIcon}>🎨</span>
                      Renk Rehberi
                      {showColorLegend && <span className={styles.activeIndicator}>●</span>}
                    </button>
                  </div>
                </div>

                {/* Smart Search Help */}
                {showSmartSearch && (
                  <div className={styles.modernSmartSearchHelp}>
                    <div className={styles.smartSearchHeader}>
                      <div className={styles.smartSearchTitle}>
                        <span className={styles.smartSearchIcon}>🧠</span>
                        Akıllı Arama Komutları
                      </div>
                      <div className={styles.smartSearchSubtitle}>
                        Gelişmiş filtreleme için bu komutları kullanın
                      </div>
                    </div>
                    
                    <div className={styles.modernSearchCommands}>
                      <div className={styles.commandGroup}>
                        <div className={styles.commandGroupTitle}>Durum Filtreleri</div>
                        <div className={styles.commandItems}>
                          <div className={styles.modernCommandItem}>
                            <code className={styles.commandCode}>status:completed</code>
                            <span className={styles.commandDesc}>Tamamlanan oyunlar</span>
                            <div className={styles.commandExample}>✅</div>
                          </div>
                          <div className={styles.modernCommandItem}>
                            <code className={styles.commandCode}>status:playing</code>
                            <span className={styles.commandDesc}>Devam eden oyunlar</span>
                            <div className={styles.commandExample}>🎯</div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.commandGroup}>
                        <div className={styles.commandGroupTitle}>Platform & Tür</div>
                        <div className={styles.commandItems}>
                          <div className={styles.modernCommandItem}>
                            <code className={styles.commandCode}>platform:PC</code>
                            <span className={styles.commandDesc}>PC oyunları</span>
                            <div className={styles.commandExample}>🖥️</div>
                          </div>
                          <div className={styles.modernCommandItem}>
                            <code className={styles.commandCode}>genre:RPG</code>
                            <span className={styles.commandDesc}>RPG oyunları</span>
                            <div className={styles.commandExample}>🎮</div>
                          </div>
                        </div>
                      </div>


                    </div>
                  </div>
                )}

                <div className={styles.searchCardFooter}>
                  <div className={styles.searchStats}>
                    <span className={styles.searchStatsItem}>
                      <span className={styles.statsIcon}>📚</span>
                      Toplam: {games.length} oyun
                    </span>
                    <span className={styles.searchStatsItem}>
                      <span className={styles.statsIcon}>🔍</span>
                      Gösterilen: {filteredGames.length} oyun
                    </span>
                    {searchTerm && (
                      <span className={styles.searchStatsItem}>
                        <span className={styles.statsIcon}>⚡</span>
                        Arama: "{searchTerm}"
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Games Section - Session History Card Tarzı */}
            {games.length > 0 && getRecentlyPlayedGames().length > 0 && (
              <section className={styles.recentGamesSection}>
                <div className={styles.sectionHeader}>
                  <h3>⏰ Son Oynananlar</h3>
                  <span className={styles.sectionCount}>
                    {getRecentlyPlayedGames().length} oyun
                  </span>
                </div>
                
                <div className={styles.recentGamesGrid}>
                  {getRecentlyPlayedGames().slice(0, 6).map((game, index) => (
                    <div 
                      key={`recent-${index}`} 
                      className={styles.recentGameCard}
                      onClick={() => navigate(`/game-tracking-hub/game-tracker/game/${game.id || index}`)}
                    >
                      <div className={styles.recentGameImage}>
                        {game.coverImage ? (
                          <img src={game.coverImage} alt={game.title || game.name} />
                        ) : (
                          <div className={styles.recentGamePlaceholder}>
                            🎮
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.recentGameInfo}>
                        <h4>{game.title || game.name}</h4>
                        <div className={styles.recentGameMeta}>
                          <span className={styles.recentGameDate}>
                            {new Date(game.lastPlayed).toLocaleDateString('tr-TR')}
                          </span>
                          <div className={`${styles.recentGameStatus} ${styles[getGameStatus(game)]}`}>
                            {getGameStatus(game) === 'completed' && '✅'}
                            {getGameStatus(game) === 'playing' && '🎯'}
                            {getGameStatus(game) === 'paused' && '⏸️'}
                            {getGameStatus(game) === 'dropped' && '❌'}
                            {getGameStatus(game) === 'planning' && '📋'}
                            {getGameStatus(game) === 'wishlist' && '⭐'}
                            {getGameStatus(game) === 'not-started' && '🔴'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Error Message - Session History Tarzı */}
            {error && (
              <div className={styles.errorSection}>
                <div className={styles.errorCard}>
                  <div className={styles.errorIcon}>❌</div>
                  <div className={styles.errorContent}>
                    <h4>Hata Oluştu</h4>
                    <p>{error}</p>
                  </div>
                  <button 
                    className={styles.errorCloseBtn}
                    onClick={() => setError('')}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Yeni Oyun Kütüphanesi - Komple Yeniden Tasarlandı */}
            <section className={styles.modernGameLibrary}>
              <div className={styles.libraryHeader}>
                <div className={styles.libraryTitleSection}>
                  <div className={styles.libraryTitle}>
                    <span className={styles.libraryIcon}>🎮</span>
                    <h3>Oyun Kütüphanesi</h3>
                    <div className={styles.libraryBadge}>
                      {getSmartFilteredGames().length} / {games.length}
                    </div>
                  </div>
                  <div className={styles.librarySubtitle}>
                    Koleksiyonunuzu yönetin ve oyunlarınızı keşfedin
                  </div>
                </div>

                {/* Oyun Ekle Butonu */}
                <div className={styles.addGameSection}>
                  <button 
                    className={`${styles.modernBtn} ${styles.addGameBtn}`}
                    onClick={() => setIsGameSearchModalOpen(true)}
                    title="Yeni oyun ekle"
                  >
                    <span className={styles.btnIcon}>➕</span>
                    <span className={styles.btnText}>Oyun Ekle</span>
                  </button>
                </div>

                <div className={styles.libraryControls}>
                  {/* Görünüm Kontrolleri */}
                  <div className={styles.viewModeControls}>
                    <button 
                      className={`${styles.modernViewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                      onClick={() => setViewMode('grid')}
                      title="Grid Görünümü"
                    >
                      <span className={styles.viewIcon}>⊞</span>
                      Grid
                    </button>
                    <button 
                      className={`${styles.modernViewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                      onClick={() => setViewMode('list')}
                      title="Liste Görünümü"
                    >
                      <span className={styles.viewIcon}>☰</span>
                      Liste
                    </button>
                  </div>

                  {/* Sıralama Kontrolleri */}
                  <div className={styles.sortControls}>
                    <select 
                      className={styles.modernSortSelect}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="name">📝 İsme Göre</option>
                      <option value="date">📅 Tarihe Göre</option>
                      <option value="status">🎯 Duruma Göre</option>
                      <option value="platform">🎮 Platforma Göre</option>
                    </select>
                    <button 
                      className={`${styles.sortOrderBtn} ${sortOrder === 'desc' ? styles.desc : ''}`}
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      title={`Sıralama: ${sortOrder === 'asc' ? 'Artan' : 'Azalan'}`}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>

                  {/* Toplu İşlemler */}
                  <div className={styles.bulkActions}>
                    <button 
                      className={`${styles.bulkSelectBtn} ${selectedGames.length > 0 ? styles.active : ''}`}
                      onClick={() => setSelectedGames([])}
                      title="Toplu Seçim"
                    >
                      <span className={styles.bulkIcon}>☑️</span>
                      {selectedGames.length > 0 ? `${selectedGames.length} Seçili` : 'Toplu Seç'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Oyun Listesi */}
              <div className={styles.modernGameGrid}>
                {getSortedGames(getSmartFilteredGames()).length === 0 ? (
                  <div className={styles.emptyLibrary}>
                    <div className={styles.emptyIcon}>📚</div>
                    <h4>Henüz oyun yok</h4>
                    <p>Kütüphanenize ilk oyununuzu ekleyin</p>
                    <button 
                      className={styles.addFirstGameBtn}
                      onClick={() => setShowAddGameModal(true)}
                    >
                      <span className={styles.btnIcon}>➕</span>
                      İlk Oyunu Ekle
                    </button>
                  </div>
                ) : (
                  <div className={`${styles.gameCardsContainer} ${styles[viewMode]}`}>
                    {getSortedGames(getSmartFilteredGames()).map((game, index) => (
                      <div 
                        key={`game-${index}`}
                        className={`${styles.modernGameCard} ${selectedGames.includes(index) ? styles.selected : ''}`}
                        onClick={() => navigate(`/game-tracking-hub/game-tracker/game/${game.id || index}`)}
                      >
                        {/* Oyun Kapak Görseli */}
                        <div className={styles.gameCardImage}>
                          {(game.coverImage || game.banner || game.background) ? (
                            <img 
                              src={game.coverImage || game.banner || game.background} 
                              alt={game.title || game.name}
                              className={styles.gameCover}
                            />
                          ) : (
                            <div className={styles.gamePlaceholder}>
                              <span className={styles.placeholderIcon}>🎮</span>
                            </div>
                          )}
                          
                          {/* Durum Badge */}
                          <div className={`${styles.statusBadge} ${styles[getGameStatus(game)]}`}>
                            {getGameStatus(game) === 'completed' && '✅'}
                            {getGameStatus(game) === 'playing' && '🎯'}
                            {getGameStatus(game) === 'paused' && '⏸️'}
                            {getGameStatus(game) === 'dropped' && '❌'}
                            {getGameStatus(game) === 'planning' && '📋'}
                            {getGameStatus(game) === 'wishlist' && '⭐'}
                            {getGameStatus(game) === 'not-started' && '🔴'}
                          </div>

                          {/* Seçim Checkbox */}
                          <div 
                            className={styles.selectionCheckbox}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newSelected = selectedGames.includes(index)
                                ? selectedGames.filter(i => i !== index)
                                : [...selectedGames, index];
                              setSelectedGames(newSelected);
                            }}
                          >
                            {selectedGames.includes(index) ? '☑️' : '⬜'}
                          </div>
                        </div>

                        {/* Oyun Bilgileri */}
                        <div className={styles.gameCardContent}>
                          <div className={styles.gameCardHeader}>
                            <h4 className={styles.gameTitle}>
                              {game.title || game.name}
                            </h4>
                          </div>

                          {/* Oyun Meta Bilgileri - Sadece Tür ve Geliştirici */}
                          <div className={styles.gameCardMeta}>
                            {game.genre && (
                              <div className={styles.gameGenre}>
                                {getGenreIcon(game.genre)} {game.genre}
                              </div>
                            )}
                            {game.developer && (
                              <div className={styles.gameDeveloper}>
                                👨‍💻 {game.developer}
                              </div>
                            )}
                          </div>

                          {/* Hızlı Aksiyonlar - Sadece toplu seçim modunda silme butonu */}
                          {isBulkSelectMode && (
                            <div className={styles.gameCardActions}>
                              <button 
                                className={`${styles.quickActionBtn} ${styles.danger}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteGame(game, index);
                                }}
                                title="Sil"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sayfalama */}
              {getSmartFilteredGames().length > 12 && (
                <div className={styles.libraryPagination}>
                  <button className={styles.paginationBtn}>
                    ← Önceki
                  </button>
                  <div className={styles.paginationInfo}>
                    Sayfa 1 / 1
                  </div>
                  <button className={styles.paginationBtn}>
                    Sonraki →
                  </button>
                </div>
              )}
            </section>

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
                    }}
                    onDeleteGame={(game) => {
                      // Oyun silme fonksiyonu
                    }}
                    onAddGame={() => {
                      // Yeni oyun ekleme fonksiyonu
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
      </div>

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