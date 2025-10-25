import React, { useState, useEffect, useRef } from 'react';
import './DebugTool.css';

/**
 * DebugTool - Geliştirme için element inspector aracı
 * 
 * Özellikler:
 * - Sol üst köşede floating buton
 * - Aktif olduğunda mouse hover ile element bilgisi
 * - Sağ tık ile element ismini kopyalama
 * - Layout'u bozmayan tasarım
 */
function DebugTool() {
  const [isActive, setIsActive] = useState(false);
  const [elementInfo, setElementInfo] = useState({
    tagName: '',
    className: '',
    id: '',
    fullSelector: ''
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const debugRef = useRef(null);

  // Element bilgilerini al
  const getElementInfo = (element) => {
    if (!element || element === debugRef.current) return null;

    const tagName = element.tagName.toLowerCase();
    const className = element.className || '';
    const id = element.id || '';
    
    // CSS selector oluştur
    let selector = tagName;
    if (id) {
      selector += `#${id}`;
    }
    if (className && typeof className === 'string') {
      const classes = className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        selector += '.' + classes.join('.');
      }
    }

    // Daha detaylı bilgi için parent hierarchy
    const getFullPath = (el) => {
      const path = [];
      let current = el;
      
      while (current && current !== document.body && path.length < 5) {
        let part = current.tagName.toLowerCase();
        
        if (current.id) {
          part += `#${current.id}`;
        } else if (current.className && typeof current.className === 'string') {
          const classes = current.className.split(' ').filter(c => c.trim());
          if (classes.length > 0) {
            part += '.' + classes[0]; // İlk class'ı al
          }
        }
        
        path.unshift(part);
        current = current.parentElement;
      }
      
      return path.join(' > ');
    };

    return {
      tagName,
      className: className.toString(),
      id,
      fullSelector: getFullPath(element)
    };
  };

  // Mouse move handler
  const handleMouseMove = (e) => {
    if (!isActive) return;

    // Debug tool'un kendisini ignore et
    if (debugRef.current && debugRef.current.contains(e.target)) return;

    setMousePosition({ x: e.clientX, y: e.clientY });
    
    const info = getElementInfo(e.target);
    if (info) {
      setElementInfo(info);
    }
  };

  // Sağ tık ile kopyalama
  const handleRightClick = (e) => {
    if (!isActive) return;
    
    e.preventDefault();
    
    const copyText = elementInfo.fullSelector || elementInfo.tagName;
    
    navigator.clipboard.writeText(copyText).then(() => {
      // Kopyalama başarılı feedback'i
      console.log('📋 Kopyalandı:', copyText);
      
      // Geçici bildirim göster
      const notification = document.createElement('div');
      notification.textContent = '📋 Kopyalandı!';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        z-index: 10001;
        font-size: 14px;
        font-family: monospace;
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    }).catch(err => {
      console.error('Kopyalama hatası:', err);
    });
  };

  // Event listener'ları ekle/kaldır
  useEffect(() => {
    if (isActive) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('contextmenu', handleRightClick);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('contextmenu', handleRightClick);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('contextmenu', handleRightClick);
    };
  }, [isActive, elementInfo]);

  // Debug tool'u toggle et
  const toggleDebugTool = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setElementInfo({
        tagName: '',
        className: '',
        id: '',
        fullSelector: ''
      });
    }
  };

  return (
    <div ref={debugRef} className="debug-tool">
      {/* Debug Butonu */}
      <button 
        className={`debug-button ${isActive ? 'active' : ''}`}
        onClick={toggleDebugTool}
        title={isActive ? 'Debug modunu kapat' : 'Debug modunu aç'}
      >
        {isActive ? '🔍' : '🐛'}
      </button>

      {/* Element Bilgi Paneli */}
      {isActive && (
        <div 
          className="debug-info-panel"
          style={{
            left: Math.min(mousePosition.x + 10, window.innerWidth - 300),
            top: Math.min(mousePosition.y + 10, window.innerHeight - 150)
          }}
        >
          <div className="debug-info-header">
            🔍 Element Inspector
          </div>
          
          <div className="debug-info-content">
            <div className="debug-info-row">
              <span className="debug-label">Tag:</span>
              <span className="debug-value">{elementInfo.tagName || 'N/A'}</span>
            </div>
            
            {elementInfo.id && (
              <div className="debug-info-row">
                <span className="debug-label">ID:</span>
                <span className="debug-value">#{elementInfo.id}</span>
              </div>
            )}
            
            {elementInfo.className && (
              <div className="debug-info-row">
                <span className="debug-label">Class:</span>
                <span className="debug-value">{elementInfo.className}</span>
              </div>
            )}
            
            <div className="debug-info-row">
              <span className="debug-label">Selector:</span>
              <span className="debug-value debug-selector">{elementInfo.fullSelector || 'N/A'}</span>
            </div>
          </div>
          
          <div className="debug-info-footer">
            🖱️ Sağ tık = Kopyala
          </div>
        </div>
      )}
    </div>
  );
}

export default DebugTool;