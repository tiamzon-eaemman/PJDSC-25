// Simple script to create placeholder icons for mobile PWA
const fs = require('fs');
const path = require('path');

// Create icons directory
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create splash directory
const splashDir = path.join(__dirname, '../public/splash');
if (!fs.existsSync(splashDir)) {
  fs.mkdirSync(splashDir, { recursive: true });
}

// Create screenshots directory
const screenshotsDir = path.join(__dirname, '../public/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Generate placeholder icons (simple colored squares)
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const maskableSizes = [192, 512];

// Create a simple SVG icon
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="#1e40af"/>
  <svg x="${size * 0.25}" y="${size * 0.25}" width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22c-5.5 0-10-4.5-10-10S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z"/>
    <path d="M12 6v6"/>
    <path d="M12 16h.01"/>
  </svg>
</svg>`;

// Create maskable icon (with padding for adaptive icons)
const createMaskableIconSVG = (size) => {
  const padding = size * 0.1;
  const iconSize = size - (padding * 2);
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1e40af"/>
  <svg x="${padding}" y="${padding}" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22c-5.5 0-10-4.5-10-10S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z"/>
    <path d="M12 6v6"/>
    <path d="M12 16h.01"/>
  </svg>
</svg>`;
};

// Generate regular icons
sizes.forEach(size => {
  const svg = createIconSVG(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png`), svg);
  console.log(`Generated icon-${size}x${size}.png`);
});

// Generate maskable icons
maskableSizes.forEach(size => {
  const svg = createMaskableIconSVG(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}-maskable.png`), svg);
  console.log(`Generated icon-${size}x${size}-maskable.png`);
});

// Generate shortcut icons
const shortcutSizes = [96];
shortcutSizes.forEach(size => {
  const svg = createIconSVG(size);
  fs.writeFileSync(path.join(iconsDir, `shortcut-gis.png`), svg);
  fs.writeFileSync(path.join(iconsDir, `shortcut-emergency.png`), svg);
  console.log(`Generated shortcut icons`);
});

console.log('Mobile PWA icons generated successfully!');
