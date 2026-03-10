const fs = require('fs');
const path = require('path');

const directoryPath = path.join('d:', 'Projects', 'nexus', 'frontend', 'src');

function findReplacements(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findReplacements(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Remove specific shadow glow utilities wrapper
            content = content.replace(/shadow-\[0_0_[0-9]+px_var\(--glow-[a-z]+\)\]/g, 'shadow-md');
            content = content.replace(/shadow-\[0_0_[0-9]+px_var\(--node-[a-z]+-glow\)\]/g, 'shadow-md');
            content = content.replace(/shadow-\[0_0_[0-9]+px_rgba\([^)]+\)\]/g, 'shadow-md');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

findReplacements(directoryPath);
