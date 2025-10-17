const fs = require('fs');
const path = require('path');

// 🔍 CSS VARIABLE VALIDATOR
// Tüm projede tanımsız CSS variable'ları ve circular reference'ları tespit eder

console.log('🔍 CSS Variable Validator Başlatılıyor...\n');

// 📂 Taranacak dosya türleri
const cssExtensions = ['.css', '.scss', '.sass'];
const jsExtensions = ['.js', '.jsx', '.ts', '.tsx'];

// 🎯 Tanımlı variable'ları topla
const definedVariables = new Set();
const usedVariables = new Set();
const circularReferences = new Map();

// 📁 Dosya okuma fonksiyonu
function readFilesRecursively(dir, extensions) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// 🎨 CSS variable tanımlarını bul
function findDefinedVariables(content, filePath) {
  const defineRegex = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
  let match;
  
  while ((match = defineRegex.exec(content)) !== null) {
    const varName = `--${match[1]}`;
    const varValue = match[2].trim();
    
    definedVariables.add(varName);
    
    // Circular reference kontrolü
    if (varValue.includes(`var(${varName})`)) {
      circularReferences.set(varName, { file: filePath, value: varValue });
    }
  }
}

// 🔍 CSS variable kullanımlarını bul
function findUsedVariables(content) {
  const useRegex = /var\(([^)]+)\)/g;
  let match;
  
  while ((match = useRegex.exec(content)) !== null) {
    const varName = match[1].split(',')[0].trim(); // Fallback'i ignore et
    usedVariables.add(varName);
  }
}

// 🚀 Ana fonksiyon
function validateCSSVariables() {
  const srcDir = path.join(__dirname, 'src');
  
  // CSS dosyalarını tara
  const cssFiles = readFilesRecursively(srcDir, cssExtensions);
  const jsFiles = readFilesRecursively(srcDir, jsExtensions);
  
  console.log(`📁 ${cssFiles.length} CSS dosyası taranıyor...`);
  console.log(`📁 ${jsFiles.length} JS/JSX dosyası taranıyor...\n`);
  
  // CSS dosyalarını analiz et
  cssFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(__dirname, file);
    
    findDefinedVariables(content, relativePath);
    findUsedVariables(content);
  });
  
  // JS dosyalarında CSS variable kullanımını bul
  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    findUsedVariables(content);
  });
  
  // 📊 Sonuçları analiz et
  const undefinedVariables = [...usedVariables].filter(varName => !definedVariables.has(varName));
  
  // 📋 Rapor oluştur
  console.log('📊 CSS VARIABLE VALIDATION RAPORU');
  console.log('=====================================\n');
  
  console.log(`✅ Tanımlı Variable'lar: ${definedVariables.size}`);
  console.log(`🔍 Kullanılan Variable'lar: ${usedVariables.size}`);
  console.log(`❌ Tanımsız Variable'lar: ${undefinedVariables.length}`);
  console.log(`🔄 Circular Reference'lar: ${circularReferences.size}\n`);
  
  // Tanımsız variable'ları listele
  if (undefinedVariables.length > 0) {
    console.log('❌ TANIMSIZ VARIABLE\'LAR:');
    console.log('-------------------------');
    undefinedVariables.forEach(varName => {
      console.log(`   ${varName}`);
    });
    console.log('');
  }
  
  // Circular reference'ları listele
  if (circularReferences.size > 0) {
    console.log('🔄 CIRCULAR REFERENCE\'LAR:');
    console.log('---------------------------');
    circularReferences.forEach((info, varName) => {
      console.log(`   ${varName}: ${info.value}`);
      console.log(`   📁 ${info.file}\n`);
    });
  }
  
  // Öneriler
  console.log('💡 ÖNERİLER:');
  console.log('------------');
  
  if (undefinedVariables.length > 0) {
    console.log('1. Tanımsız variable\'ları design-system.css\'e ekleyin');
    console.log('2. Typo kontrolü yapın (-- prefix, doğru isim)');
    console.log('3. Import sırasını kontrol edin');
  }
  
  if (circularReferences.size > 0) {
    console.log('4. Circular reference\'ları direkt değerlerle değiştirin');
    console.log('5. Variable hierarchy\'sini gözden geçirin');
  }
  
  if (undefinedVariables.length === 0 && circularReferences.size === 0) {
    console.log('🎉 Tüm CSS variable\'lar doğru tanımlanmış!');
  }
  
  console.log('\n🔧 Düzeltme için: npm run css:fix');
}

// Script'i çalıştır
validateCSSVariables();