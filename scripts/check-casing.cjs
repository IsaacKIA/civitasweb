const { execSync } = require('child_process');
const fs = require('fs');

const gitFiles = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean);

// Find all asset paths in git
const assetPaths = gitFiles.filter(f => f.toLowerCase().includes('assets/'));

const casingVariants = new Set();
assetPaths.forEach(p => {
  const parts = p.split('/');
  if (parts.length >= 2) {
    casingVariants.add(parts.slice(0, 2).join('/'));
  }
});

console.log('--- Casing Variants in Git ---');
console.log(Array.from(casingVariants));

// Check HTML files for what they reference
const htmlFiles = gitFiles.filter(f => f.endsWith('.html'));
const htmlRefVariants = new Set();

htmlFiles.forEach(hf => {
  if (fs.existsSync(hf)) {
    const content = fs.readFileSync(hf, 'utf8');
    const regex = /(?:src|poster|data-video-src)=["'](\/?[^"']+)["']/g;
    let m;
    while ((m = regex.exec(content)) !== null) {
      const url = m[1];
      if (url.toLowerCase().includes('assets/')) {
        const clean = url.replace(/^\//, '');
        const parts = clean.split('/');
        if (parts.length >= 2) {
          htmlRefVariants.add(parts.slice(0, 2).join('/'));
        }
      }
    }
  }
});

console.log('\n--- Casing Variants in HTML References ---');
console.log(Array.from(htmlRefVariants));
