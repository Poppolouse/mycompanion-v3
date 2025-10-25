import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AnaSayfa from './pages/AnaSayfa';
import TodoApp from './pages/TodoApp';
import HesapMakinesi from './pages/HesapMakinesi';
import HavaDurumu from './pages/HavaDurumu';
import NotDefteri from './pages/NotDefteri';
import GameTracker from './components/GameTracker';
import GameDetail from './pages/GameTrackingHub/GameDetail';
import Statistics from './pages/GameTrackingHub/Statistics';
import RoutePlanner from './pages/GameTrackingHub/RoutePlanner';
import GameTrackingHub from './pages/GameTrackingHub';
import Session from './pages/GameTrackingHub/Session';
import AddGame from './pages/GameTrackingHub/AddGame';
import EditGame from './pages/GameTrackingHub/EditGame';
import AdminPanel from './pages/AdminPanel';
import LoginModal from './components/LoginModal';
import { ProfileSettings } from './components/UserProfile';

import { RouteProvider } from './contexts/RouteContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { UserStatsProvider } from './contexts/UserStatsContext';
import { UserGameLibraryProvider } from './contexts/UserGameLibraryContext';
import { NotificationProvider } from './components/NotificationSystem';
import DebugTool from './components/DebugTool';

import './App.css';



/**
 * Ana uygulama komponenti - Routing sistemi
 * Kullanıcıyı farklı sayfalara yönlendirir
 */
function AppContent() {
  const [sidebarAcik, setSidebarAcik] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();

  const sidebarToggle = () => {
    setSidebarAcik(!sidebarAcik);
  };

  // Loading durumu
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1e1e2e 0%, #313244 100%)',
        color: '#fff',
        fontSize: '1.2rem'
      }}>
        ⏳ Yükleniyor...
      </div>
    );
  }

  // Giriş yapılmamışsa LoginModal göster
  if (!isAuthenticated) {
    return <LoginModal />;
  }

  return (
    <GameProvider>
      <UserStatsProvider>
        <UserGameLibraryProvider>
          <NotificationProvider>
        {/* Debug Tool - Sadece development modunda */}
        {process.env.NODE_ENV === 'development' && <DebugTool />}
        <Router>
        <Routes>
        {/* Sidebar'sız bağımsız sayfalar */}
        {/* Ana sayfa - Kullanıcı sorusu ve uygulama listesi */}
        <Route path="/" element={<AnaSayfa />} />
        
        {/* Profil Ayarları */}
        <Route path="/profile-settings" element={<ProfileSettings />} />
        
        {/* Admin Panel */}
        <Route path="/admin" element={<AdminPanel />} />
        
        {/* Test Sayfaları */}
        
        
        {/* Game Tracking Hub - Ana sayfa ve alt sayfaları */}
        <Route path="/game-tracking-hub" element={<GameTrackingHub />} />
        <Route path="/game-tracking-hub/session" element={<Session />} />
        <Route path="/game-tracking-hub/game-tracker" element={
          <RouteProvider>
            <GameTracker />
          </RouteProvider>
        } />
        <Route path="/game-tracking-hub/game-tracker/game/:id" element={<GameDetail />} />
        <Route path="/game-tracking-hub/statistics" element={<Statistics />} />
        <Route path="/game-tracking-hub/route-planner" element={
          <RouteProvider>
            <RoutePlanner />
          </RouteProvider>
        } />
        <Route path="/game-tracking-hub/add-game" element={
          <RouteProvider>
            <AddGame />
          </RouteProvider>
        } />
        <Route path="/game-tracking-hub/edit-game/:gameId" element={
          <RouteProvider>
            <EditGame />
          </RouteProvider>
        } />
        
        {/* Diğer sayfalar - Sidebar ile birlikte */}
        <Route path="/*" element={
          <div className="app">
            <Sidebar isOpen={sidebarAcik} onToggle={sidebarToggle} />
            <main className={`main-content ${sidebarAcik ? 'sidebar-acik' : 'sidebar-kapali'}`}>
              <Routes>
                
                {/* Web Uygulamaları */}
                <Route path="/todo" element={<TodoApp />} />
                <Route path="/hesap-makinesi" element={<HesapMakinesi />} />
                <Route path="/hava-durumu" element={<HavaDurumu />} />
                <Route path="/not-defteri" element={<NotDefteri />} />
                
                {/* Gelecekte eklenecek uygulamalar için hazır yapı */}
                {/* <Route path="/pomodoro" element={<Pomodoro />} /> */}
                {/* <Route path="/qr-kod" element={<QrKod />} /> */}
              </Routes>
            </main>
          </div>
        } />
        </Routes>
        </Router>
          </NotificationProvider>
        </UserGameLibraryProvider>
      </UserStatsProvider>
    </GameProvider>
  );
}

/**
 * Ana App wrapper - AuthProvider ile sarılmış
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
