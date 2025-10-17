/**
 * UserService - Merkezi kullanıcı yönetim servisi
 * 
 * AuthContext ve Admin Panel arasında veri senkronizasyonu sağlar
 */

// Varsayılan kullanıcı veritabanı
const defaultUsers = [
  {
    id: 1,
    username: 'poppolouse',
    password: '123Ardat123',
    displayName: 'Poppolouse',
    email: 'poppolouse@vaulttracker.com',
    role: 'admin',
    isActive: true,
    avatar: '👤',
    createdAt: new Date().toISOString(),
    lastLogin: null
  },
  {
    id: 2,
    username: 'admin',
    password: 'admin123',
    displayName: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    isActive: true,
    avatar: '🛠️',
    createdAt: new Date().toISOString(),
    lastLogin: null
  },
  {
    id: 3,
    username: 'user1',
    password: 'user123',
    displayName: 'Test User',
    email: 'user1@example.com',
    role: 'user',
    isActive: true,
    avatar: '👤',
    createdAt: new Date().toISOString(),
    lastLogin: null
  },
  {
    id: 4,
    username: 'user2',
    password: 'user123',
    displayName: 'Demo User',
    email: 'user2@example.com',
    role: 'user',
    isActive: false,
    avatar: '👤',
    createdAt: new Date().toISOString(),
    lastLogin: null
  }
];

class UserService {
  constructor() {
    this.storageKey = 'vaulttracker:users:database';
    this.initializeUsers();
  }

  // Kullanıcı veritabanını başlat
  initializeUsers() {
    const storedUsers = localStorage.getItem(this.storageKey);
    if (!storedUsers) {
      this.saveUsers(defaultUsers);
    }
  }

  // Tüm kullanıcıları getir
  getAllUsers() {
    const users = localStorage.getItem(this.storageKey);
    return users ? JSON.parse(users) : defaultUsers;
  }

  // Kullanıcıları kaydet
  saveUsers(users) {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  // Kullanıcı adı ile kullanıcı bul
  getUserByUsername(username) {
    const users = this.getAllUsers();
    return users.find(user => user.username === username);
  }

  // ID ile kullanıcı bul
  getUserById(id) {
    const users = this.getAllUsers();
    return users.find(user => user.id === id);
  }

  // Kullanıcı girişi doğrula
  authenticateUser(username, password) {
    const user = this.getUserByUsername(username);
    if (user && user.password === password && user.isActive) {
      // Son giriş zamanını güncelle
      this.updateLastLogin(user.id);
      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      };
    }
    return {
      success: false,
      error: 'Kullanıcı adı veya şifre hatalı!'
    };
  }

  // Son giriş zamanını güncelle
  updateLastLogin(userId) {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex].lastLogin = new Date().toISOString();
      this.saveUsers(users);
    }
  }

  // Yeni kullanıcı ekle
  addUser(userData) {
    const users = this.getAllUsers();
    
    // Kullanıcı adı kontrolü
    if (this.getUserByUsername(userData.username)) {
      return {
        success: false,
        error: 'Bu kullanıcı adı zaten kullanılıyor!'
      };
    }

    // Yeni kullanıcı oluştur
    const newUser = {
      id: Math.max(...users.map(u => u.id)) + 1,
      username: userData.username,
      password: userData.password,
      displayName: userData.displayName,
      email: userData.email,
      role: userData.role || 'user',
      isActive: true,
      avatar: userData.avatar || '👤',
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    users.push(newUser);
    this.saveUsers(users);

    return {
      success: true,
      user: newUser
    };
  }

  // Kullanıcı güncelle
  updateUser(userId, userData) {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return {
        success: false,
        error: 'Kullanıcı bulunamadı!'
      };
    }

    // Kullanıcı adı değişikliği kontrolü
    if (userData.username && userData.username !== users[userIndex].username) {
      if (this.getUserByUsername(userData.username)) {
        return {
          success: false,
          error: 'Bu kullanıcı adı zaten kullanılıyor!'
        };
      }
    }

    // Kullanıcıyı güncelle
    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      id: userId // ID değişmemeli
    };

    this.saveUsers(users);

    return {
      success: true,
      user: users[userIndex]
    };
  }

  // Kullanıcı sil
  deleteUser(userId) {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(user => user.id !== userId);
    
    if (filteredUsers.length === users.length) {
      return {
        success: false,
        error: 'Kullanıcı bulunamadı!'
      };
    }

    this.saveUsers(filteredUsers);

    return {
      success: true,
      message: 'Kullanıcı başarıyla silindi!'
    };
  }

  // Kullanıcı durumunu değiştir (aktif/pasif)
  toggleUserStatus(userId) {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return {
        success: false,
        error: 'Kullanıcı bulunamadı!'
      };
    }

    users[userIndex].isActive = !users[userIndex].isActive;
    this.saveUsers(users);

    return {
      success: true,
      user: users[userIndex]
    };
  }

  // Kullanıcı istatistikleri
  getUserStats() {
    const users = this.getAllUsers();
    return {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      admins: users.filter(u => u.role === 'admin').length,
      users: users.filter(u => u.role === 'user').length
    };
  }

  // Veritabanını sıfırla
  resetDatabase() {
    this.saveUsers(defaultUsers);
    return {
      success: true,
      message: 'Veritabanı varsayılan değerlere sıfırlandı!'
    };
  }
}

// Singleton instance
const userService = new UserService();

export default userService;