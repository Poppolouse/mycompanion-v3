import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * AuthProvider - Giriş durumu yönetimi
 * 
 * Kullanıcı adı: admin
 * Şifre: admin
 */
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sayfa yüklendiğinde localStorage'dan giriş durumunu kontrol et
  useEffect(() => {
    const savedAuth = localStorage.getItem('vaulttracker:auth:isLoggedIn');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Giriş fonksiyonu
  const login = (username, password) => {
    // Sabit kullanıcı adı ve şifre kontrolü
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      localStorage.setItem('vaulttracker:auth:isLoggedIn', 'true');
      console.log('✅ Başarılı giriş yapıldı');
      return { success: true };
    } else {
      console.log('❌ Hatalı kullanıcı adı veya şifre');
      return { 
        success: false, 
        error: 'Kullanıcı adı veya şifre hatalı!' 
      };
    }
  };

  // Çıkış fonksiyonu
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('vaulttracker:auth:isLoggedIn');
    console.log('👋 Çıkış yapıldı');
  };

  const value = {
    isAuthenticated,
    isLoading,
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