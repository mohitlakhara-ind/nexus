const fs = require('fs');
const { execSync } = require('child_process');

try {
  const icon192 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" fill="#0f172a"/><circle cx="96" cy="96" r="48" fill="#3b82f6"/><path d="M96 24 L144 96 L96 168 L48 96 Z" fill="#8b5cf6" opacity="0.8"/></svg>';
  fs.writeFileSync('pwa-192x192.svg', icon192);

  const icon512 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#0f172a"/><circle cx="256" cy="256" r="128" fill="#3b82f6"/><path d="M256 64 L384 256 L256 448 L128 256 Z" fill="#8b5cf6" opacity="0.8"/></svg>';
  fs.writeFileSync('pwa-512x512.svg', icon512);

  console.log('Installing sharp...');
  execSync('npm install sharp --no-save', { stdio: 'inherit' });
  const sharp = require('sharp');
  
  sharp('pwa-192x192.svg').png().toFile('pwa-192x192.png')
    .then(() => sharp('pwa-512x512.svg').png().toFile('pwa-512x512.png'))
    .then(() => sharp('pwa-512x512.svg').png().toFile('apple-touch-icon.png'))
    .then(() => {
       console.log('Images generated successfully.');
       fs.unlinkSync('pwa-192x192.svg');
       fs.unlinkSync('pwa-512x512.svg');
    })
    .catch(console.error);
    
} catch (e) {
  console.error(e);
}
