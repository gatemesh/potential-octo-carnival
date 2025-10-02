#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'packages', 'web', 'dist');

console.log('🔍 Verifying build output...');

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory does not exist:', buildDir);
  process.exit(1);
}

// Check for required files
const requiredFiles = [
  'index.html',
  'assets'
];

for (const file of requiredFiles) {
  const filePath = path.join(buildDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Required file/directory missing: ${file}`);
    process.exit(1);
  }
}

// Check index.html content
const indexPath = path.join(buildDir, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');

if (!indexContent.includes('<div id="root">')) {
  console.error('❌ index.html does not contain React root element');
  process.exit(1);
}

// Check assets directory
const assetsDir = path.join(buildDir, 'assets');
const assets = fs.readdirSync(assetsDir);

const hasJS = assets.some(file => file.endsWith('.js'));
const hasCSS = assets.some(file => file.endsWith('.css'));

if (!hasJS) {
  console.error('❌ No JavaScript files found in assets');
  process.exit(1);
}

if (!hasCSS) {
  console.error('❌ No CSS files found in assets');
  process.exit(1);
}

// Calculate build size
const getDirectorySize = (dir) => {
  let size = 0;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stat.size;
    }
  }
  
  return size;
};

const buildSize = getDirectorySize(buildDir);
const buildSizeMB = (buildSize / 1024 / 1024).toFixed(2);

console.log('✅ Build verification passed!');
console.log(`📊 Build size: ${buildSizeMB} MB`);
console.log(`📁 Build location: ${buildDir}`);
console.log(`📄 Assets found: ${assets.length} files`);

// List key files
console.log('\n📋 Key build files:');
assets.forEach(file => {
  if (file.endsWith('.js') || file.endsWith('.css')) {
    const filePath = path.join(assetsDir, file);
    const stat = fs.statSync(filePath);
    const sizeKB = (stat.size / 1024).toFixed(1);
    console.log(`   ${file} (${sizeKB} KB)`);
  }
});

console.log('\n🚀 Ready for deployment!');