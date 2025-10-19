import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SessionHeader,
  GameBanner,
  SessionCard,
  PerformanceSection,
  MediaSection,
  HistoryView,
  GameSelectionPrompt
} from './components';
import GameSelectionScreen from '../../../components/GameSelectionScreen';
import {
  useSessionTimer,
  usePerformanceData,
  useMediaUpload
} from './hooks';
import './Session.css';

/**
 * Session - Aktif oyun session yönetim sayfası
 * Modern tasarım ile oyun deneyimini takip etme merkezi
 * 
 * Bölünmüş componentler:
 * - SessionHeader: Sayfa başlığı ve navigasyon
 * - GameBanner: Aktif oyun banner'ı
 * - SessionCard: Aktif session bilgileri
 * - PerformanceSection: Sistem performans verileri
 * - MediaSection: Ekran görüntüleri ve videolar
 * - HistoryView: Geçmiş session'lar
 */
function Session() {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  // View State
  const [currentView, setCurrentView] = useState('session'); // 'session' or 'history'
  const [showGameSelection, setShowGameSelection] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);

  // Session State
  const [notes, setNotes] = useState('');
  const [currentMood, setCurrentMood] = useState('😊');
  const [sessionRating, setSessionRating] = useState(0);

  // Audio State
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("Epic Gaming Playlist");

  // History View State
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('1 Hafta');
  const [expandedSessions, setExpandedSessions] = useState(new Set());
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    game: '',
    platform: '',
    dateRange: '',
    duration: '',
    hasMedia: ''
  });

  // Accordion Filter State
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [activeQuickFilters, setActiveQuickFilters] = useState([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Custom Hooks
  const sessionTimer = useSessionTimer();
  const performanceData = usePerformanceData();
  const mediaUpload = useMediaUpload();

  // Oyun seçme işlevi
  const handleGameSelect = (game) => {
    setCurrentGame(game);
    setShowGameSelection(false);
  };

  // Session başlatma
  const handleStartSession = () => {
    if (currentGame) {
      sessionTimer.startSession();
      performanceData.startPerformanceMonitoring();
    }
  };

  // Session bitirme
  const handleEndSession = () => {
    sessionTimer.stopSession();
    performanceData.stopPerformanceMonitoring();
    
    // Session verilerini kaydet (simüle edilmiş)
    // TODO: Gerçek API'ye session verilerini gönder
  };

  // Sıralama fonksiyonları
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Hızlı filtre toggle
  const toggleQuickFilter = (filter) => {
    setActiveQuickFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setActiveQuickFilters([]);
    setFilters({
      game: '',
      platform: '',
      dateRange: '',
      duration: '',
      hasMedia: ''
    });
    setActiveFiltersCount(0);
  };

  // Session'ı genişlet/daralt
  const toggleSessionExpansion = (sessionId) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  // Oyun seçme modal'ı render edilecek

  return (
    <div className="session-page">
      <div className="session-container">
        {/* Header */}
        <SessionHeader 
          currentView={currentView}
          setCurrentView={setCurrentView}
          navigate={navigate}
          currentGame={currentGame}
          isSessionActive={sessionTimer.isActive}
        />

        {/* Ana İçerik */}
        <main className="session-main">
          {currentView === 'session' ? (
            <>
              {/* Oyun seçim ekranı - inline olarak göster */}
              {showGameSelection && (
                <div className="inline-game-selection">
                  <GameSelectionScreen
                    onGameSelect={handleGameSelect}
                    onClose={() => setShowGameSelection(false)}
                  />
                </div>
              )}
              
              {/* Normal session içeriği - oyun seçim ekranı açık değilse göster */}
              {!showGameSelection && (
                <>
                  {/* Oyun Banner - sadece oyun seçildiyse göster */}
                  {currentGame && (
                    <GameBanner 
                      currentGame={currentGame}
                      isSessionActive={sessionTimer.isSessionActive}
                      onStartSession={handleStartSession}
                      onEndSession={handleEndSession}
                      onSelectGame={() => setShowGameSelection(true)}
                    />
                  )}
                  
                  {/* Oyun seçilmediğinde modern prompt göster */}
                  {!currentGame && (
                    <GameSelectionPrompt 
                      onSelectGame={() => setShowGameSelection(true)}
                    />
                  )}
                </>
              )}

              {/* Alt içerik - sadece oyun seçildiyse göster */}
              {currentGame && (
                <>
                  {/* Session Card */}
                  {sessionTimer.isSessionActive && (
                    <SessionCard 
                      sessionTime={sessionTimer.sessionTime}
                      formatTime={sessionTimer.formatTime}
                      currentMood={currentMood}
                      setCurrentMood={setCurrentMood}
                      sessionRating={sessionRating}
                      setSessionRating={setSessionRating}
                      notes={notes}
                      setNotes={setNotes}
                    />
                  )}

                  {/* Performance Section */}
                  <PerformanceSection 
                    performanceData={performanceData.performanceData}
                    performanceTimeRange={performanceData.performanceTimeRange}
                    setPerformanceTimeRange={performanceData.setPerformanceTimeRange}
                    performanceHistory={performanceData.performanceHistory}
                  />

                  {/* Media Section */}
                  <MediaSection 
                    screenshots={mediaUpload.screenshots}
                    videoClips={mediaUpload.videoClips}
                    isUploading={mediaUpload.isUploading}
                    screenshotInputRef={mediaUpload.screenshotInputRef}
                    videoInputRef={mediaUpload.videoInputRef}
                    handleScreenshotUpload={mediaUpload.handleScreenshotUpload}
                    handleVideoUpload={mediaUpload.handleVideoUpload}
                    triggerScreenshotUpload={mediaUpload.triggerScreenshotUpload}
                    triggerVideoUpload={mediaUpload.triggerVideoUpload}
                    deleteScreenshot={mediaUpload.deleteScreenshot}
                    deleteVideo={mediaUpload.deleteVideo}
                    formatFileSize={mediaUpload.formatFileSize}
                  />
                </>
              )}
            </>
          ) : (
            /* History View */
            <HistoryView 
              selectedTimePeriod={selectedTimePeriod}
              setSelectedTimePeriod={setSelectedTimePeriod}
              isFilterExpanded={isFilterExpanded}
              setIsFilterExpanded={setIsFilterExpanded}
              activeQuickFilters={activeQuickFilters}
              toggleQuickFilter={toggleQuickFilter}
              activeFiltersCount={activeFiltersCount}
              filters={filters}
              setFilters={setFilters}
              clearFilters={clearFilters}
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleSort={handleSort}
              getSortIcon={getSortIcon}
              expandedSessions={expandedSessions}
              toggleSessionExpansion={toggleSessionExpansion}
            />
          )}
        </main>
      </div>



      {/* Audio Element */}
      <audio ref={audioRef} loop>
        <source src="/audio/gaming-ambient.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}

export default Session;