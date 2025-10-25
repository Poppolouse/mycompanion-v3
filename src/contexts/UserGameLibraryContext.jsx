/**
 * Kullanıcı Oyun Kütüphanesi Context
 * Kullanıcının kişisel oyun verilerini ve istatistiklerini yönetir
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserGameLibrary, 
  addGameToUserLibrary, 
  updateUserGameStats,
  checkGameExists,
  addGameToGlobal 
} from '../api/gameLibraryApi';
// Mock data kaldırıldı - sadece gerçek API kullanılacak

const UserGameLibraryContext = createContext(null);

export function UserGameLibraryProvider({ children }) {
  const { currentUser: user } = useAuth();
  const [userGames, setUserGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Kullanıcı kütüphanesini yükle
  const loadUserLibrary = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Gerçek API\'den kütüphane verisi yükleniyor...');
      const games = await getUserGameLibrary(user.id);
      console.log('✅ Kütüphane verisi yüklendi:', games.length, 'oyun');
      setUserGames(games);
    } catch (err) {
      setError('Kütüphane yüklenirken hata oluştu');
      console.error('Kütüphane yükleme hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcı değiştiğinde kütüphaneyi yükle
  useEffect(() => {
    loadUserLibrary();
  }, [user?.id]);

  /**
   * Yeni oyun ekle (akıllı ekleme sistemi)
   * @param {Object} gameData - Eklenecek oyun verisi
   * @returns {Promise<Object>} Eklenen oyun
   */
  const addGameToLibrary = async (gameData) => {
    if (!user?.id) {
      throw new Error('Kullanıcı girişi gerekli');
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Önce oyunun global kütüphanede olup olmadığını kontrol et
      let globalGame = await checkGameExists(gameData);
      
      // 2. Eğer yoksa, global kütüphaneye ekle
      if (!globalGame) {
        console.log('🆕 Oyun global kütüphanede bulunamadı, ekleniyor...');
        globalGame = await addGameToGlobal(gameData, user.id);
      } else {
        console.log('✅ Oyun global kütüphanede mevcut:', globalGame.title);
      }

      // 3. Kullanıcının kütüphanesine ekle
      const userGame = await addGameToUserLibrary(globalGame.id, user.id, {
        status: gameData.status || 'not_started',
        notes: gameData.notes || ''
      });

      // 4. Local state'i güncelle
      const enrichedUserGame = {
        ...userGame,
        game: globalGame // Global oyun bilgilerini ekle
      };

      setUserGames(prev => [...prev, enrichedUserGame]);
      
      return enrichedUserGame;
    } catch (err) {
      setError('Oyun eklenirken hata oluştu');
      console.error('Oyun ekleme hatası:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Oyun istatistiklerini güncelle
   * @param {string} gameId - Oyun ID'si
   * @param {Object} updates - Güncellenecek veriler
   */
  const updateGameStats = async (gameId, updates) => {
    if (!user?.id) return;

    try {
      const updatedGame = await updateUserGameStats(user.id, gameId, updates);
      
      // Local state'i güncelle
      setUserGames(prev => 
        prev.map(game => 
          game.game_id === gameId 
            ? { ...game, ...updatedGame }
            : game
        )
      );

      return updatedGame;
    } catch (err) {
      setError('İstatistik güncellenirken hata oluştu');
      console.error('İstatistik güncelleme hatası:', err);
      throw err;
    }
  };

  /**
   * Oyun oynama süresini güncelle
   * @param {string} gameId - Oyun ID'si
   * @param {number} additionalHours - Eklenen saat
   */
  const addPlaytime = async (gameId, additionalHours) => {
    const game = userGames.find(g => g.game_id === gameId);
    if (!game) return;

    const newPlaytime = (game.playtime_hours || 0) + additionalHours;
    
    return updateGameStats(gameId, {
      playtime_hours: newPlaytime,
      last_played: new Date().toISOString()
    });
  };

  /**
   * Oyun durumunu değiştir
   * @param {string} gameId - Oyun ID'si
   * @param {string} status - Yeni durum
   */
  const changeGameStatus = async (gameId, status) => {
    const updates = { status };
    
    // Eğer tamamlandı olarak işaretleniyorsa, progress'i %100 yap
    if (status === 'completed') {
      updates.progress_percentage = 100;
    }
    
    return updateGameStats(gameId, updates);
  };

  /**
   * Oyunu favorilere ekle/çıkar
   * @param {string} gameId - Oyun ID'si
   * @param {boolean} isFavorite - Favori durumu
   */
  const toggleFavorite = async (gameId, isFavorite) => {
    return updateGameStats(gameId, { is_favorite: isFavorite });
  };

  /**
   * Oyun notlarını güncelle
   * @param {string} gameId - Oyun ID'si
   * @param {string} notes - Yeni notlar
   */
  const updateGameNotes = async (gameId, notes) => {
    return updateGameStats(gameId, { notes });
  };

  /**
   * Oyun reytingini güncelle
   * @param {string} gameId - Oyun ID'si
   * @param {number} rating - Reyting (1-10)
   */
  const rateGame = async (gameId, rating) => {
    return updateGameStats(gameId, { rating });
  };

  // Hesaplanmış değerler
  const stats = {
    totalGames: userGames.length,
    completedGames: userGames.filter(g => g.status === 'completed').length,
    currentlyPlaying: userGames.filter(g => g.status === 'playing').length,
    totalPlaytime: userGames.reduce((total, game) => total + (game.playtime_hours || 0), 0),
    favoriteGames: userGames.filter(g => g.is_favorite).length,
    averageRating: userGames.filter(g => g.rating).length > 0 
      ? userGames.filter(g => g.rating).reduce((sum, g) => sum + g.rating, 0) / userGames.filter(g => g.rating).length
      : 0
  };

  const value = {
    // State
    userGames,
    isLoading,
    error,
    stats,
    
    // Actions
    loadUserLibrary,
    addGameToLibrary,
    updateGameStats,
    addPlaytime,
    changeGameStatus,
    toggleFavorite,
    updateGameNotes,
    rateGame
  };

  return (
    <UserGameLibraryContext.Provider value={value}>
      {children}
    </UserGameLibraryContext.Provider>
  );
}

export function useUserGameLibrary() {
  const context = useContext(UserGameLibraryContext);
  if (!context) {
    throw new Error('useUserGameLibrary must be used within UserGameLibraryProvider');
  }
  return context;
}