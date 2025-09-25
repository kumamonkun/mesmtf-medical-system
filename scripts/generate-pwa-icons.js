#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 * This script creates PWA icons from a base icon
 * Run with: node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const iconSizes = [
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// Create a simple SVG icon for MESMTF
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="#2563eb"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
          font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white">
      M
    </text>
    <circle cx="${size * 0.8}" cy="${size * 0.2}" r="${size * 0.1}" fill="#10b981"/>
  </svg>`;
};

// Create placeholder icons
const createPlaceholderIcon = (size, filename) => {
  const svg = createSVGIcon(size);
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const filePath = path.join(publicDir, filename);
  fs.writeFileSync(filePath, svg);
  console.log(`✅ Created ${filename} (${size}x${size})`);
};

// Create all icons
console.log('🚀 Generating PWA icons...\n');

iconSizes.forEach(({ size, name }) => {
  createPlaceholderIcon(size, name);
});

// Create favicon.ico (16x16)
createPlaceholderIcon(16, 'favicon.ico');

// Create apple-touch-icon (180x180)
createPlaceholderIcon(180, 'apple-touch-icon.png');

console.log('\n🎉 PWA icons generated successfully!');
console.log('\n📝 Note: These are placeholder icons. For production, replace with:');
console.log('   - Professional medical-themed icons');
console.log('   - High-quality PNG images');
console.log('   - Proper branding and colors');
console.log('\n🔧 To replace icons:');
console.log('   1. Create your icons in the required sizes');
console.log('   2. Replace the files in the /public directory');
console.log('   3. Ensure they follow PWA icon guidelines');
