import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ProfileDropdown.css';

/**
 * ProfileDropdown - Header'da sağ üstte bulunan profil menüsü
 */
function ProfileDropdown() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Dropdown pozisyonunu hesapla
  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.right - 220 // dropdown width
      });
    }
  };

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Profil butonuna tıklama
  const handleProfileClick = () => {
    if (!isOpen) {
      calculateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  // Çıkış yapma
  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  // Profil ayarları sayfasına yönlendir
  const handleSettings = () => {
    navigate('/profile-settings');
    setIsOpen(false);
  };

  // Kullanıcı yoksa hiçbir şey gösterme
  if (!currentUser) {
    return null;
  }

  return (
    <>
      <div className="profile-dropdown">
        {/* Profil Butonu */}
        <button 
          ref={buttonRef}
          className="profile-button"
          onClick={handleProfileClick}
          aria-label="Profil menüsü"
        >
          <div className="profile-avatar">
            {currentUser.avatar}
          </div>
          <span className="profile-name">
            {currentUser.displayName}
          </span>
          <div className={`profile-arrow ${isOpen ? 'open' : ''}`}>
            ▼
          </div>
        </button>

        {/* Dropdown Menü - Portal ile render */}
        {isOpen && createPortal(
          <div 
            ref={dropdownRef}
            className="profile-menu"
            style={{
               position: 'fixed',
               top: dropdownPosition.top,
               left: dropdownPosition.left,
               zIndex: 9999
             }}
          >
            <div className="profile-menu-header">
              <div className="profile-menu-avatar">
                {currentUser.avatar}
              </div>
              <div className="profile-menu-info">
                <div className="profile-menu-name">
                  {currentUser.displayName}
                </div>
                <div className="profile-menu-username">
                  @{currentUser.username}
                </div>
              </div>
            </div>
             
             <div className="profile-menu-items">
              <button 
                className="profile-menu-item"
                onClick={handleSettings}
              >
                <span className="profile-menu-icon">⚙️</span>
                Profil Ayarları
              </button>
              
              <button 
                className="profile-menu-item logout"
                onClick={handleLogout}
              >
                <span className="profile-menu-icon">🚪</span>
                Çıkış Yap
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>
    </>
  );
}

export default ProfileDropdown;