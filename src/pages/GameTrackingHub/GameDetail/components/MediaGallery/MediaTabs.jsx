import React from 'react';
import './MediaTabs.css';

/**
 * MediaTabs - Kompakt medya sekmelerini yöneten bileşen
 * 
 * @param {Object} props
 * @param {string} props.activeTab - Aktif sekme
 * @param {Function} props.onTabChange - Sekme değişim handler'ı
 * @param {Object} props.mediaCounts - Medya sayıları
 */
function MediaTabs({ activeTab, onTabChange, mediaCounts }) {
  const tabs = [
    {
      id: 'screenshots',
      icon: '📸',
      title: 'Ekran Görüntüleri',
      count: mediaCounts.screenshots || 0
    },
    {
      id: 'videos',
      icon: '🎬',
      title: 'Videolar',
      count: mediaCounts.videos || 0
    }
  ];

  return (
    <div className="media-tabs">
      {tabs.map(tab => (
        <button 
          key={tab.id}
          className={`media-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          disabled={tab.count === 0}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-title">{tab.title}</span>
          <span className="tab-count">({tab.count})</span>
        </button>
      ))}
    </div>
  );
}

export default MediaTabs;