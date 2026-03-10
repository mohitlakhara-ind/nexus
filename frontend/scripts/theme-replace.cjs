const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../src');

const replacements = {
  'bg-dark-bg': 'bg-bg',
  'bg-[#18181b]': 'bg-surface',
  'bg-[#0f0f13]': 'bg-bg',
  'text-white': 'text-text-main',
  'text-gray-400': 'text-text-muted',
  'border-dark-border': 'border-border',
  'border-white/10': 'border-border',
  'border-white/5': 'border-border',
  'bg-white/5': 'bg-surface-hover',
  'bg-dark-bg/50': 'bg-bg/50',
  'border-white/20': 'border-border',
  'bg-white/10': 'bg-surface-hover hover:bg-surface-hover/80',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      for (const [key, value] of Object.entries(replacements)) {
        if (content.includes(key)) {
          content = content.split(key).join(value);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
console.log('Theme replacement completely done.');
