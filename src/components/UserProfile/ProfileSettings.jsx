import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileDropdown from '../ProfileDropdown';
import userService from '../../services/userService';
import './ProfileSettings.css';

/**
 * ProfileSettings - Kullanıcı profil ayarları sayfası
 * Kişisel bilgiler, tercihler, bildirimler, gizlilik ve hesap ayarları
 */
function ProfileSettings() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState('personal');
  const [editingCategories, setEditingCategories] = useState({});
  const [formData, setFormData] = useState({
    displayName: 'Kullanıcı',
    email: 'kullanici@example.com',
    bio: 'Merhaba! Ben bir oyun sevdalısıyım.',
    theme: 'dark',
    language: 'tr',
    notifications: true,
    emailNotifications: false,
    soundEffects: true
  });

  // Admin Panel State'leri
  const [users, setUsers] = useState([]);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    role: 'user'
  });

  // Kullanıcıları UserService'ten yükle
  useEffect(() => {
    loadUsers();
    // Debug: currentUser kontrolü
    console.log('🔍 ProfileSettings currentUser:', currentUser);
    console.log('🔍 currentUser?.role:', currentUser?.role);
    console.log('🔍 Is admin?:', currentUser?.role === 'admin');
  }, [currentUser]);

  const loadUsers = () => {
    const allUsers = userService.getAllUsers();
    setUsers(allUsers);
  };

  // Kategori listesi - Admin olmayan kullanıcılar için admin paneli kaldırılır
  const allCategories = [
    { id: 'personal', name: 'Kişisel Bilgiler', icon: '👤' },
    { id: 'preferences', name: 'Tercihler', icon: '⚙️' },
    { id: 'notifications', name: 'Bildirimler', icon: '🔔' },
    { id: 'privacy', name: 'Gizlilik', icon: '🔒' },
    { id: 'account', name: 'Hesap', icon: '👤' },
    { id: 'admin', name: 'Admin Paneli', icon: '🛠️' }
  ];

  const categories = allCategories.filter(category => 
    category.id !== 'admin' || currentUser?.role === 'admin'
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      displayName: 'Kullanıcı',
      email: 'kullanici@example.com',
      bio: 'Merhaba! Ben bir oyun sevdalısıyım.',
      theme: 'dark',
      language: 'tr',
      notifications: true,
      emailNotifications: false,
      soundEffects: true
    });
    setIsEditing(false);
  };

  // Navigation fonksiyonları
  const handleGoBack = () => navigate(-1);
  const handleGoHome = () => navigate('/');

  const toggleCategoryEdit = (category) => {
    setEditingCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const saveCategoryChanges = (category) => {
    // Burada API çağrısı yapılabilir
    setEditingCategories(prev => ({
      ...prev,
      [category]: false
    }));
  };

  const cancelCategoryEdit = (category) => {
    setEditingCategories(prev => ({
      ...prev,
      [category]: false
    }));
    // Form verilerini eski haline döndür
  };
  const handleCategoryChange = (categoryId) => setActiveCategory(categoryId);

  // Düzenleme modunu aç
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Aktif kategoriye göre içerik render et
  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'personal':
        return renderPersonalInfo();
      case 'preferences':
        return renderPreferences();
      case 'notifications':
        return renderNotifications();
      case 'privacy':
        return renderPrivacy();
      case 'account':
        return renderAccount();
      case 'admin':
        return renderAdminPanel();
      default:
        return renderPersonalInfo();
    }
  };

  // Kişisel bilgiler içeriği
  const renderPersonalInfo = () => {
    const isEditing = editingCategories.personal;
    return (
      <div className="settings-section">
        <div className="section-header">
          <h2>Kişisel Bilgiler</h2>
          <p>Profil bilgilerinizi güncelleyin</p>
          <div className="section-actions">
            {!isEditing ? (
              <button 
                className="btn-edit-section"
                onClick={() => toggleCategoryEdit('personal')}
              >
                <i className="fas fa-edit"></i>
                Düzenle
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="btn-save-section"
                  onClick={() => saveCategoryChanges('personal')}
                >
                  <i className="fas fa-check"></i>
                  Kaydet
                </button>
                <button 
                  className="btn-cancel-section"
                  onClick={() => cancelCategoryEdit('personal')}
                >
                  <i className="fas fa-times"></i>
                  İptal
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="displayName">Ad Soyad</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Adınızı girin"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">E-posta</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="E-posta adresinizi girin"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Hakkımda</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Kendiniz hakkında kısa bir açıklama yazın"
            rows="4"
          />
        </div>
      </div>
    );
  };

  // Tercihler içeriği
  const renderPreferences = () => {
    const isEditing = editingCategories.preferences;
    return (
      <div className="settings-section">
        <div className="section-header">
          <h2>Uygulama Tercihleri</h2>
          <p>Uygulamanın görünümünü ve davranışını özelleştirin</p>
          <div className="section-actions">
            {!isEditing ? (
              <button 
                className="btn-edit-section"
                onClick={() => toggleCategoryEdit('preferences')}
              >
                <i className="fas fa-edit"></i>
                Düzenle
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="btn-save-section"
                  onClick={() => saveCategoryChanges('preferences')}
                >
                  <i className="fas fa-check"></i>
                  Kaydet
                </button>
                <button 
                  className="btn-cancel-section"
                  onClick={() => cancelCategoryEdit('preferences')}
                >
                  <i className="fas fa-times"></i>
                  İptal
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="theme">Tema</label>
          <select
            id="theme"
            name="theme"
            value={formData.theme}
            onChange={handleInputChange}
            disabled={!isEditing}
          >
            <option value="dark">Koyu Tema</option>
            <option value="light">Açık Tema</option>
            <option value="auto">Sistem Ayarı</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="language">Dil</label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            disabled={!isEditing}
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="soundEffects"
              checked={formData.soundEffects}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <span>Ses efektleri</span>
          </label>
        </div>
      </div>
    );
  };

  // Bildirimler içeriği
  const renderNotifications = () => {
    const isEditing = editingCategories.notifications;
    return (
      <div className="settings-section">
        <div className="section-header">
          <h2>Bildirim Ayarları</h2>
          <p>Hangi bildirimleri almak istediğinizi seçin</p>
          <div className="section-actions">
            {!isEditing ? (
              <button 
                className="btn-edit-section"
                onClick={() => toggleCategoryEdit('notifications')}
              >
                <i className="fas fa-edit"></i>
                Düzenle
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="btn-save-section"
                  onClick={() => saveCategoryChanges('notifications')}
                >
                  <i className="fas fa-check"></i>
                  Kaydet
                </button>
                <button 
                  className="btn-cancel-section"
                  onClick={() => cancelCategoryEdit('notifications')}
                >
                  <i className="fas fa-times"></i>
                  İptal
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="notifications"
              checked={formData.notifications}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <span>Uygulama bildirimleri</span>
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="emailNotifications"
              checked={formData.emailNotifications}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <span>E-posta bildirimleri</span>
          </label>
        </div>
      </div>
    );
  };

  // Gizlilik içeriği
  const renderPrivacy = () => {
    const isEditing = editingCategories.privacy;
    return (
      <div className="settings-section">
        <div className="section-header">
          <h2>Gizlilik ve Güvenlik</h2>
          <p>Hesap güvenliğinizi ve gizliliğinizi yönetin</p>
          <div className="section-actions">
            {!isEditing ? (
              <button 
                className="btn-edit-section"
                onClick={() => toggleCategoryEdit('privacy')}
              >
                <i className="fas fa-edit"></i>
                Düzenle
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="btn-save-section"
                  onClick={() => saveCategoryChanges('privacy')}
                >
                  <i className="fas fa-check"></i>
                  Kaydet
                </button>
                <button 
                  className="btn-cancel-section"
                  onClick={() => cancelCategoryEdit('privacy')}
                >
                  <i className="fas fa-times"></i>
                  İptal
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="profileVisibility"
              checked={formData.profileVisibility}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <span>Profili herkese açık yap</span>
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="dataSharing"
              checked={formData.dataSharing}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <span>Analitik verilerini paylaş</span>
          </label>
        </div>
      </div>
    );
  };

  // Hesap içeriği
  const renderAccount = () => {
    const isEditing = editingCategories.account;
    return (
      <div className="settings-section">
        <div className="section-header">
          <h2>Hesap Yönetimi</h2>
          <p>Hesap ayarlarınızı ve güvenlik seçeneklerinizi yönetin</p>
          <div className="section-actions">
            {!isEditing ? (
              <button 
                className="btn-edit-section"
                onClick={() => toggleCategoryEdit('account')}
              >
                <i className="fas fa-edit"></i>
                Düzenle
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="btn-save-section"
                  onClick={() => saveCategoryChanges('account')}
                >
                  <i className="fas fa-check"></i>
                  Kaydet
                </button>
                <button 
                  className="btn-cancel-section"
                  onClick={() => cancelCategoryEdit('account')}
                >
                  <i className="fas fa-times"></i>
                  İptal
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <button 
            type="button" 
            className="btn-danger"
            disabled={!isEditing}
          >
            Şifre Değiştir
          </button>
        </div>

        <div className="form-group">
          <button 
            type="button" 
            className="btn-danger"
            disabled={!isEditing}
          >
            Hesabı Sil
          </button>
        </div>
      </div>
    );
  };

  // Admin Panel Fonksiyonları
  const handleAddUser = () => {
    if (newUser.username && newUser.displayName && newUser.email && newUser.password) {
      const result = userService.addUser(newUser);
      if (result.success) {
        loadUsers(); // Kullanıcı listesini yenile
        setNewUser({ username: '', displayName: '', email: '', password: '', role: 'user' });
        setShowAddUserForm(false);
        console.log('✅ Kullanıcı başarıyla eklendi:', result.user.displayName);
      } else {
        alert('❌ Hata: ' + result.error);
      }
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const handleSaveUser = () => {
    const result = userService.updateUser(editingUser.id, editingUser);
    if (result.success) {
      loadUsers(); // Kullanıcı listesini yenile
      setEditingUser(null);
      console.log('✅ Kullanıcı başarıyla güncellendi:', result.user.displayName);
    } else {
      alert('❌ Hata: ' + result.error);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      const result = userService.deleteUser(userId);
      if (result.success) {
        loadUsers(); // Kullanıcı listesini yenile
        console.log('✅ Kullanıcı başarıyla silindi');
      } else {
        alert('❌ Hata: ' + result.error);
      }
    }
  };

  const toggleUserStatus = (userId) => {
    const result = userService.toggleUserStatus(userId);
    if (result.success) {
      loadUsers(); // Kullanıcı listesini yenile
      console.log('✅ Kullanıcı durumu güncellendi:', result.user.displayName);
    } else {
      alert('❌ Hata: ' + result.error);
    }
  };

  // Admin Paneli içeriği
  const renderAdminPanel = () => {

    return (
      <div className="settings-section admin-panel">
        <div className="section-header">
          <h2>🛠️ Admin Paneli</h2>
          <p>Site yönetim araçları ve kullanıcı yönetimi</p>
          <div className="section-actions">
            <button 
              className="btn-add-user"
              onClick={() => setShowAddUserForm(!showAddUserForm)}
            >
              <i className="fas fa-plus"></i>
              Yeni Kullanıcı Ekle
            </button>
          </div>
        </div>

        {/* Yeni Kullanıcı Ekleme Formu */}
        {showAddUserForm && (
          <div className="add-user-form">
            <h3>Yeni Kullanıcı Ekle</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Kullanıcı Adı</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="Kullanıcı adı"
                />
              </div>
              <div className="form-group">
                <label>Ad Soyad</label>
                <input
                  type="text"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
                  placeholder="Ad Soyad"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>E-posta</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="E-posta adresi"
                />
              </div>
              <div className="form-group">
                <label>Şifre</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Şifre"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={handleAddUser}>
                Kullanıcı Ekle
              </button>
              <button className="btn-secondary" onClick={() => setShowAddUserForm(false)}>
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Kullanıcı Listesi */}
        <div className="users-list">
          <h3>Mevcut Kullanıcılar</h3>
          <div className="users-table">
            <div className="table-header">
              <div className="table-cell">Kullanıcı</div>
              <div className="table-cell">E-posta</div>
              <div className="table-cell">Rol</div>
              <div className="table-cell">Durum</div>
              <div className="table-cell">İşlemler</div>
            </div>
            {users.map(user => (
              <div key={user.id} className="table-row">
                {editingUser && editingUser.id === user.id ? (
                  <>
                    <div className="table-cell">
                      <input
                        type="text"
                        value={editingUser.displayName}
                        onChange={(e) => setEditingUser({...editingUser, displayName: e.target.value})}
                      />
                    </div>
                    <div className="table-cell">
                      <input
                        type="email"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      />
                    </div>
                    <div className="table-cell">
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                      >
                        <option value="user">Kullanıcı</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="table-cell">
                      <span className={`status ${editingUser.isActive ? 'active' : 'inactive'}`}>
                        {editingUser.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <div className="table-cell">
                      <button className="btn-save" onClick={handleSaveUser}>
                        Kaydet
                      </button>
                      <button className="btn-cancel" onClick={() => setEditingUser(null)}>
                        İptal
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="table-cell">
                      <div className="user-info">
                        <strong>{user.displayName}</strong>
                        <small>@{user.username}</small>
                      </div>
                    </div>
                    <div className="table-cell">{user.email}</div>
                    <div className="table-cell">
                      <span className={`role ${user.role}`}>
                        {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                      </span>
                    </div>
                    <div className="table-cell">
                      <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <div className="table-cell">
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEditUser(user)}
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-toggle" 
                        onClick={() => toggleUserStatus(user.id)}
                        title={user.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                      >
                        {user.isActive ? '🔒' : '🔓'}
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteUser(user.id)}
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="profile-settings">
      {/* Standart Header */}
      <header className="tracker-header">
        <div className="header-content">
          <div className="header-left">
            <h1>⚙️ Profil Ayarları</h1>
            <p>Hesap bilgilerinizi ve tercihlerinizi yönetin</p>
          </div>
          <div className="header-controls">
            <div className="navigation-buttons">
              <button 
                className="nav-btn"
                onClick={handleGoBack}
                title="Geri Dön"
              >
                ← Geri
              </button>
              <button 
                className="nav-btn home-btn"
                onClick={handleGoHome}
                title="Ana Sayfaya Dön"
              >
                🏠 Ana Sayfa
              </button>
              <button 
                className={`nav-btn admin-btn ${activeCategory === 'admin' ? 'active' : ''} ${!currentUser?.role || currentUser.role !== 'admin' ? 'disabled' : ''}`}
                onClick={() => {
                  if (currentUser?.role === 'admin') {
                    setActiveCategory('admin');
                  }
                }}
                disabled={!currentUser?.role || currentUser.role !== 'admin'}
                title={currentUser?.role === 'admin' ? "Admin Paneli" : "Admin yetkisi gerekli"}
              >
                🛠️ Admin
              </button>
            </div>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <div className="settings-layout">
        {/* Sidebar */}
        <aside className="settings-sidebar">
          <nav className="sidebar-nav">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`sidebar-item ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                <span className="sidebar-icon">{category.icon}</span>
                <span className="sidebar-text">{category.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="settings-content">
          {renderCategoryContent()}
        </main>
      </div>
    </div>
  );
}

export default ProfileSettings;