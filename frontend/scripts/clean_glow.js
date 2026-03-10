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

            // Remove specific shadow glow utilities like shadow-[0_0_...var(--glow...)]
            content = content.replace(/shadow-\[.*?--glow.*?\]/g, 'shadow-md');
            content = content.replace(/shadow-\[.*?glow.*?\]/g, 'shadow-md');
            content = content.replace(/var\(--node-.*?-glow\)/g, 'rgba(0,0,0,0.1)'); // fallback

            // Clean up Ranks and Badges specific glowing attributes if any left as raw strings
            // We'll leave the code structure but just replace the value
            // Not touching Ranks/badges object structure broadly to avoid breaking logic, just the CSS.

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

findReplacements(directoryPath);
