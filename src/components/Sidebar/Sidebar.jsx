import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

/**
 * Sidebar - Masaüstü navigasyon komponenti
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Sidebar açık/kapalı durumu
 * @param {Function} props.onToggle - Sidebar toggle fonksiyonu
 */
function Sidebar({ isOpen = true, onToggle }) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  // Ana menü öğeleri
  const menuItems = [
    {
      id: 'ana-sayfa',
      baslik: 'Ana Sayfa',
      ikon: '🏠',
      yol: '/',
      aciklama: 'Uygulamalara genel bakış'
    },
    {
      id: 'todo',
      baslik: 'Yapılacaklar',
      ikon: '✅',
      yol: '/todo',
      aciklama: 'Görev yönetimi'
    },
    {
      id: 'hesap-makinesi',
      baslik: 'Hesap Makinesi',
      ikon: '🧮',
      yol: '/hesap-makinesi',
      aciklama: 'Matematiksel hesaplamalar'
    },
    {
      id: 'hava-durumu',
      baslik: 'Hava Durumu',
      ikon: '🌤️',
      yol: '/hava-durumu',
      aciklama: 'Meteoroloji bilgileri'
    },
    {
      id: 'not-defteri',
      baslik: 'Not Defteri',
      ikon: '📝',
      yol: '/not-defteri',
      aciklama: 'Not alma ve düzenleme'
    },
    {
      id: 'game-tracking-hub',
      baslik: 'Oyun Takibi',
      ikon: '🎮',
      yol: '/game-tracking-hub',
      aciklama: 'Oyun yönetim merkezi'
    }
  ];

  // Admin menü öğesi
  const adminItem = {
    id: 'admin',
    baslik: 'Yönetim Paneli',
    ikon: '⚙️',
    yol: '/admin',
    aciklama: 'Sistem yönetimi'
  };

  const aktifSayfa = (yol) => {
    return location.pathname === yol;
  };

  return (
    <div className={`sidebar ${isOpen ? 'acik' : 'kapali'}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo">🚀</div>
          {isOpen && (
            <div className="logo-text">
              <h2>MyCompanion</h2>
              <span>v3.0</span>
            </div>
          )}
        </div>
        <button 
          className="toggle-btn"
          onClick={onToggle}
          title={isOpen ? 'Sidebar\'ı Daralt' : 'Sidebar\'ı Genişlet'}
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Ana Menü */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          {isOpen && <h3 className="section-title">Uygulamalar</h3>}
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.id} className="nav-item">
                <Link
                  to={item.yol}
                  className={`nav-link ${aktifSayfa(item.yol) ? 'aktif' : ''}`}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={!isOpen ? item.baslik : ''}
                >
                  <span className="nav-ikon">{item.ikon}</span>
                  {isOpen && (
                    <div className="nav-content">
                      <span className="nav-baslik">{item.baslik}</span>
                      <span className="nav-aciklama">{item.aciklama}</span>
                    </div>
                  )}
                  {aktifSayfa(item.yol) && <div className="aktif-indicator"></div>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Admin Bölümü */}
        <div className="nav-section admin-section">
          {isOpen && <h3 className="section-title">Yönetim</h3>}
          <ul className="nav-list">
            <li className="nav-item">
              <Link
                to={adminItem.yol}
                className={`nav-link admin-link ${aktifSayfa(adminItem.yol) ? 'aktif' : ''}`}
                title={!isOpen ? adminItem.baslik : ''}
              >
                <span className="nav-ikon">{adminItem.ikon}</span>
                {isOpen && (
                  <div className="nav-content">
                    <span className="nav-baslik">{adminItem.baslik}</span>
                    <span className="nav-aciklama">{adminItem.aciklama}</span>
                  </div>
                )}
                {aktifSayfa(adminItem.yol) && <div className="aktif-indicator"></div>}
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Sidebar Footer */}
      {isOpen && (
        <div className="sidebar-footer">
          <div className="footer-info">
            <p>© 2024 MyCompanion</p>
            <p>Masaüstü için optimize edildi</p>
          </div>
        </div>
      )}

      {/* Tooltip for collapsed state */}
      {!isOpen && hoveredItem && (
        <div className="sidebar-tooltip">
          {menuItems.find(item => item.id === hoveredItem)?.baslik}
        </div>
      )}
    </div>
  );
}

export default Sidebar;