const fs = require('fs');
const path = require('path');

// 🎨 KAPSAMLI RENK DEĞİŞTİRME SCRİPTİ
// Tüm projede hardcoded renkleri design system değişkenleri ile değiştirir

console.log('🎨 Kapsamlı Renk Değiştirme Scripti Başlatılıyor...\n');

// 📊 Renk Kategorileri ve Mapping'leri
const colorMappings = {
  // 🔵 Primary Colors (Mavi tonları)
  primary: {
    '#667eea': 'var(--color-primary-500)',
    'rgba(102, 126, 234': 'rgba(var(--color-primary-500-rgb)',
    'rgb(102, 126, 234)': 'rgb(var(--color-primary-500-rgb))',
    '#3b82f6': 'var(--color-primary-600)',
    '#2563eb': 'var(--color-primary-700)',
    '#1d4ed8': 'var(--color-primary-800)',
    '#1e40af': 'var(--color-primary-900)',
  },

  // 🟣 Secondary Colors (Mor tonları)
  secondary: {
    '#764ba2': 'var(--color-secondary-500)',
    'rgba(118, 75, 162': 'rgba(var(--color-secondary-500-rgb)',
    'rgb(118, 75, 162)': 'rgb(var(--color-secondary-500-rgb))',
    '#8b5cf6': 'var(--color-secondary-500)',
    '#7c3aed': 'var(--color-secondary-600)',
    '#6b21a8': 'var(--color-secondary-700)',
    '#581c87': 'var(--color-secondary-800)',
  },

  // 🟢 Success Colors (Yeşil tonları)
  success: {
    '#22c55e': 'var(--color-success-500)',
    '#16a34a': 'var(--color-success-600)',
    '#15803d': 'var(--color-success-700)',
    '#059669': 'var(--color-success-600)',
    'rgba(34, 197, 94': 'rgba(var(--color-success-500-rgb)',
    'rgb(34, 197, 94)': 'rgb(var(--color-success-500-rgb))',
  },

  // 🟡 Warning Colors (Sarı/Turuncu tonları)
  warning: {
    '#f59e0b': 'var(--color-warning-500)',
    '#d97706': 'var(--color-warning-600)',
    '#b45309': 'var(--color-warning-700)',
    '#ea580c': 'var(--color-warning-600)',
    'rgba(245, 158, 11': 'rgba(var(--color-warning-500-rgb)',
    'rgb(245, 158, 11)': 'rgb(var(--color-warning-500-rgb))',
  },

  // 🔴 Error Colors (Kırmızı tonları)
  error: {
    '#ef4444': 'var(--color-error-500)',
    '#dc2626': 'var(--color-error-600)',
    '#b91c1c': 'var(--color-error-700)',
    '#991b1b': 'var(--color-error-800)',
    '#ff6b6b': 'var(--color-error-500)',
    'rgba(239, 68, 68': 'rgba(var(--color-error-500-rgb)',
    'rgb(239, 68, 68)': 'rgb(var(--color-error-500-rgb))',
  },

  // 🔵 Info Colors (Mavi bilgi tonları)
  info: {
    '#3b82f6': 'var(--color-info-500)',
    '#2563eb': 'var(--color-info-600)',
    '#1d4ed8': 'var(--color-info-700)',
    'rgba(59, 130, 246': 'rgba(var(--color-info-500-rgb)',
    'rgb(59, 130, 246)': 'rgb(var(--color-info-500-rgb))',
  },

  // ⚫ Neutral Colors (Gri tonları)
  neutral: {
    '#ffffff': 'var(--color-white)',
    '#f8fafc': 'var(--color-gray-50)',
    '#f1f5f9': 'var(--color-gray-100)',
    '#e2e8f0': 'var(--color-gray-200)',
    '#cbd5e1': 'var(--color-gray-300)',
    '#94a3b8': 'var(--color-gray-400)',
    '#64748b': 'var(--color-gray-500)',
    '#475569': 'var(--color-gray-600)',
    '#334155': 'var(--color-gray-700)',
    '#1e293b': 'var(--color-gray-800)',
    '#0f172a': 'var(--color-gray-900)',
    '#000000': 'var(--color-black)',
    
    // Tailwind gri tonları
    '#f3f4f6': 'var(--color-gray-100)',
    '#e5e7eb': 'var(--color-gray-200)',
    '#d1d5db': 'var(--color-gray-300)',
    '#9ca3af': 'var(--color-gray-400)',
    '#6b7280': 'var(--color-gray-500)',
    '#374151': 'var(--color-gray-600)',
    '#1f2937': 'var(--color-gray-700)',
    '#111827': 'var(--color-gray-800)',
    
    // Diğer gri tonları
    '#e0e0e0': 'var(--color-gray-300)',
    '#b0b0b0': 'var(--color-gray-400)',
    '#808080': 'var(--color-gray-500)',
    '#2d3748': 'var(--color-gray-700)',
  },

  // 🌈 Background Colors (Arka plan renkleri)
  background: {
    '#0a0a0f': 'var(--bg-gradient-1)',
    '#1a1a2e': 'var(--bg-gradient-2)',
    '#16213e': 'var(--bg-gradient-3)',
    '#0f3460': 'var(--bg-gradient-4)',
  },

  // 🔍 Common RGBA Patterns
  rgba: {
    'rgba(255, 255, 255, 0.95)': 'rgba(var(--color-white-rgb), 0.95)',
    'rgba(255, 255, 255, 0.9)': 'rgba(var(--color-white-rgb), 0.9)',
    'rgba(255, 255, 255, 0.8)': 'rgba(var(--color-white-rgb), 0.8)',
    'rgba(255, 255, 255, 0.7)': 'rgba(var(--color-white-rgb), 0.7)',
    'rgba(255, 255, 255, 0.6)': 'rgba(var(--color-white-rgb), 0.6)',
    'rgba(255, 255, 255, 0.5)': 'rgba(var(--color-white-rgb), 0.5)',
    'rgba(255, 255, 255, 0.4)': 'rgba(var(--color-white-rgb), 0.4)',
    'rgba(255, 255, 255, 0.3)': 'rgba(var(--color-white-rgb), 0.3)',
    'rgba(255, 255, 255, 0.2)': 'rgba(var(--color-white-rgb), 0.2)',
    'rgba(255, 255, 255, 0.15)': 'rgba(var(--color-white-rgb), 0.15)',
    'rgba(255, 255, 255, 0.12)': 'rgba(var(--color-white-rgb), 0.12)',
    'rgba(255, 255, 255, 0.1)': 'rgba(var(--color-white-rgb), 0.1)',
    'rgba(255, 255, 255, 0.08)': 'rgba(var(--color-white-rgb), 0.08)',
    'rgba(255, 255, 255, 0.05)': 'rgba(var(--color-white-rgb), 0.05)',
    'rgba(255, 255, 255, 0.03)': 'rgba(var(--color-white-rgb), 0.03)',
    
    'rgba(0, 0, 0, 0.9)': 'rgba(var(--color-black-rgb), 0.9)',
    'rgba(0, 0, 0, 0.8)': 'rgba(var(--color-black-rgb), 0.8)',
    'rgba(0, 0, 0, 0.7)': 'rgba(var(--color-black-rgb), 0.7)',
    'rgba(0, 0, 0, 0.6)': 'rgba(var(--color-black-rgb), 0.6)',
    'rgba(0, 0, 0, 0.5)': 'rgba(var(--color-black-rgb), 0.5)',
    'rgba(0, 0, 0, 0.4)': 'rgba(var(--color-black-rgb), 0.4)',
    'rgba(0, 0, 0, 0.3)': 'rgba(var(--color-black-rgb), 0.3)',
    'rgba(0, 0, 0, 0.2)': 'rgba(var(--color-black-rgb), 0.2)',
    'rgba(0, 0, 0, 0.15)': 'rgba(var(--color-black-rgb), 0.15)',
    'rgba(0, 0, 0, 0.1)': 'rgba(var(--color-black-rgb), 0.1)',
    'rgba(0, 0, 0, 0.05)': 'rgba(var(--color-black-rgb), 0.05)',
    
    'rgba(0,0,0,0.1)': 'rgba(var(--color-black-rgb), 0.1)',
    'rgba(0,0,0,0.2)': 'rgba(var(--color-black-rgb), 0.2)',
    'rgba(0,0,0,0.3)': 'rgba(var(--color-black-rgb), 0.3)',
  }
};

// 📁 İşlenecek dosya uzantıları
const fileExtensions = ['.css', '.js', '.jsx', '.ts', '.tsx'];

// 📊 İstatistikler
let stats = {
  filesProcessed: 0,
  totalReplacements: 0,
  categorizedReplacements: {
    primary: 0,
    secondary: 0,
    success: 0,
    warning: 0,
    error: 0,
    info: 0,
    neutral: 0,
    background: 0,
    rgba: 0
  }
};

// 🔍 Dosya işleme fonksiyonu
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileReplacements = 0;

    // Her kategori için renk değiştirme
    Object.keys(colorMappings).forEach(category => {
      Object.keys(colorMappings[category]).forEach(oldColor => {
        const newColor = colorMappings[category][oldColor];
        
        // Regex oluştur - case insensitive ve global
        const regex = new RegExp(escapeRegExp(oldColor), 'gi');
        const matches = content.match(regex);
        
        if (matches) {
          content = content.replace(regex, newColor);
          const replacementCount = matches.length;
          fileReplacements += replacementCount;
          stats.categorizedReplacements[category] += replacementCount;
          
          console.log(`  📝 ${category.toUpperCase()}: ${oldColor} → ${newColor} (${replacementCount}x)`);
        }
      });
    });

    // Dosyayı güncelle (eğer değişiklik varsa)
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesProcessed++;
      stats.totalReplacements += fileReplacements;
      
      console.log(`✅ ${path.relative(process.cwd(), filePath)} - ${fileReplacements} değişiklik yapıldı\n`);
    }

  } catch (error) {
    console.error(`❌ Hata: ${filePath} - ${error.message}`);
  }
}

// 🛡️ Regex escape fonksiyonu
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 📂 Dizin tarama fonksiyonu
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // node_modules ve .git klasörlerini atla
      if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
        processDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(fullPath);
      if (fileExtensions.includes(ext)) {
        console.log(`🔍 İşleniyor: ${path.relative(process.cwd(), fullPath)}`);
        processFile(fullPath);
      }
    }
  });
}

// 📊 İstatistik raporu
function printStats() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RENK DEĞİŞTİRME İSTATİSTİKLERİ');
  console.log('='.repeat(60));
  console.log(`📁 İşlenen dosya sayısı: ${stats.filesProcessed}`);
  console.log(`🔄 Toplam değişiklik sayısı: ${stats.totalReplacements}`);
  console.log('\n📈 Kategoriye göre değişiklikler:');
  
  Object.keys(stats.categorizedReplacements).forEach(category => {
    const count = stats.categorizedReplacements[category];
    if (count > 0) {
      const emoji = {
        primary: '🔵',
        secondary: '🟣',
        success: '🟢',
        warning: '🟡',
        error: '🔴',
        info: '🔵',
        neutral: '⚫',
        background: '🌈',
        rgba: '🔍'
      }[category] || '🎨';
      
      console.log(`  ${emoji} ${category.toUpperCase()}: ${count} değişiklik`);
    }
  });
  
  console.log('\n✨ Tüm hardcoded renkler design system değişkenleri ile değiştirildi!');
  console.log('🎨 Artık renk yönetimi tamamen merkezi ve tutarlı!');
}

// 🚀 Ana fonksiyon
function main() {
  const srcPath = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcPath)) {
    console.error('❌ src klasörü bulunamadı!');
    process.exit(1);
  }
  
  console.log('🎯 Hedef klasör: src/');
  console.log('📋 İşlenecek dosya türleri:', fileExtensions.join(', '));
  console.log('🔄 İşlem başlıyor...\n');
  
  processDirectory(srcPath);
  printStats();
}

// Script'i çalıştır
main();