import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AnaSayfa from './pages/AnaSayfa';
import TodoApp from './pages/TodoApp';
import HesapMakinesi from './pages/HesapMakinesi';
import HavaDurumu from './pages/HavaDurumu';
import NotDefteri from './pages/NotDefteri';
import GameTracker from './pages/GameTracker';
import AdminPanel from './components/AdminPanel';
import './App.css';

/**
 * Ana uygulama komponenti - Routing sistemi
 * Kullanıcıyı farklı sayfalara yönlendirir
 */
function App() {
  const [sidebarAcik, setSidebarAcik] = useState(true);

  const sidebarToggle = () => {
    setSidebarAcik(!sidebarAcik);
  };

  return (
    <Router>
      <Routes>
        {/* GameTracker - Sidebar'sız bağımsız sayfa */}
        <Route path="/game-tracker" element={<GameTracker />} />
        
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
  );
}

export default App;
