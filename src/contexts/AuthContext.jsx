import React, { createContext, useContext, useState, useEffect } from 'react';
import userService from '../services/userService';

const AuthContext = createContext(null);

/**
 * AuthProvider - Kullanıcı sistemi yönetimi
 * 
 * UserService ile entegre edilmiş merkezi kullanıcı yönetimi
 */
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini kontrol et
  useEffect(() => {
    const savedAuth = localStorage.getItem('vaulttracker:auth:isLoggedIn');
    const savedUser = localStorage.getItem('vaulttracker:auth:currentUser');
    
    if (savedAuth === 'true' && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setIsAuthenticated(true);
        setCurrentUser(user);
      } catch (error) {
        console.error('localStorage kullanıcı verisi parse edilemedi:', error);
        // Hatalı veriyi temizle
        localStorage.removeItem('vaulttracker:auth:isLoggedIn');
        localStorage.removeItem('vaulttracker:auth:currentUser');
      }
    } else {
      // TEST: Otomatik giriş yap (mock veri testi için)
      console.log('🔧 TEST: Otomatik giriş yapılıyor...');
      const result = userService.authenticateUser('poppolouse', 'password123');
      if (result.success) {
        setIsAuthenticated(true);
        setCurrentUser(result.user);
        localStorage.setItem('vaulttracker:auth:isLoggedIn', 'true');
        localStorage.setItem('vaulttracker:auth:currentUser', JSON.stringify(result.user));
        console.log('✅ TEST: Otomatik giriş başarılı:', result.user.displayName);
      }
    }
    setIsLoading(false);
  }, []);

  // Giriş fonksiyonu
  const login = (username, password) => {
    // UserService ile kullanıcı doğrulama
    const result = userService.authenticateUser(username, password);
    
    if (result.success) {
      setIsAuthenticated(true);
      setCurrentUser(result.user);
      localStorage.setItem('vaulttracker:auth:isLoggedIn', 'true');
      localStorage.setItem('vaulttracker:auth:currentUser', JSON.stringify(result.user));
      console.log('✅ Başarılı giriş yapıldı:', result.user.displayName);
      return result;
    } else {
      console.log('❌ Hatalı kullanıcı adı veya şifre');
      return result;
    }
  };

  // Çıkış fonksiyonu
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('vaulttracker:auth:isLoggedIn');
    localStorage.removeItem('vaulttracker:auth:currentUser');
    console.log('👋 Çıkış yapıldı');
  };

  const value = {
    isAuthenticated,
    isLoading,
    currentUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook - AuthContext'i kullanmak için
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}