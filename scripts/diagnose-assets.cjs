const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html') && !file.includes('google59e336434f702a44')) {
      results.push(fullPath);
    }
  });
  return results;
}

const htmlFiles = getHtmlFiles(rootDir);
const brokenAssets = [];
const checkedAssets = new Set();
let totalFound = 0;

htmlFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  // Match src="...", poster="...", data-video-src="..."
  const regex = /(?:src|poster|data-video-src)=["'](\/assets\/[^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    totalFound++;
    const assetUrl = match[1];
    const assetPath = decodeURIComponent(assetUrl).replace(/^\//, '');
    
    // Check in public/
    const inPublic = path.join(rootDir, 'public', assetPath);
    const inRoot = path.join(rootDir, assetPath);
    
    const exists = fs.existsSync(inPublic) || fs.existsSync(inRoot);
    if (!exists) {
      brokenAssets.push({
        htmlFile: path.relative(rootDir, f),
        url: assetUrl,
        checkedPath: inPublic
      });
    }
  }
});

console.log(`Scanned ${htmlFiles.length} HTML files.`);
console.log(`Total asset references checked: ${totalFound}`);
console.log(`Total BROKEN asset references: ${brokenAssets.length}`);

if (brokenAssets.length > 0) {
  console.log('\n--- Broken Asset Details ---');
  brokenAssets.forEach(b => console.log(`[${b.htmlFile}] -> ${b.url}`));
}
