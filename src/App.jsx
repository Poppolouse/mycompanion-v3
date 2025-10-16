import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AnaSayfa from './pages/AnaSayfa';
import TodoApp from './pages/TodoApp';
import HesapMakinesi from './pages/HesapMakinesi';
import HavaDurumu from './pages/HavaDurumu';
import NotDefteri from './pages/NotDefteri';
import GameTracker from './pages/GameTracker';
import GameDetail from './pages/GameDetail';
import Statistics from './pages/Statistics';
import RoutePlanner from './pages/RoutePlanner';
import GameTrackingHub from './pages/GameTrackingHub';
import AddGame from './pages/AddGame';
import EditGame from './pages/EditGame';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import { RouteProvider } from './contexts/RouteContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './components/NotificationSystem';
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
    <NotificationProvider>
      <Router>
        <Routes>
        {/* Game Tracking - Sidebar'sız bağımsız sayfalar */}
        <Route path="/game-tracking-hub" element={<GameTrackingHub />} />
        <Route path="/game-tracker" element={
          <RouteProvider>
            <GameTracker />
          </RouteProvider>
        } />
        <Route path="/game-tracker/game/:id" element={<GameDetail />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/route-planner" element={
          <RouteProvider>
            <RoutePlanner />
          </RouteProvider>
        } />
        <Route path="/add-game" element={<AddGame />} />
        <Route path="/edit-game/:gameId" element={<EditGame />} />
        
        {/* Diğer sayfalar - Sidebar ile birlikte */}
        <Route path="/*" element={
          <div className="app">
            <Sidebar isOpen={sidebarAcik} onToggle={sidebarToggle} />
            <main className={`main-content ${sidebarAcik ? 'sidebar-acik' : 'sidebar-kapali'}`}>
              <Routes>
                {/* Ana sayfa - Kullanıcı sorusu ve uygulama listesi */}
                <Route path="/" element={<AnaSayfa />} />
                
                {/* Web Uygulamaları */}
                <Route path="/todo" element={<TodoApp />} />
                <Route path="/hesap-makinesi" element={<HesapMakinesi />} />
                <Route path="/hava-durumu" element={<HavaDurumu />} />
                <Route path="/not-defteri" element={<NotDefteri />} />
                <Route path="/admin" element={<AdminPanel />} />
                
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
