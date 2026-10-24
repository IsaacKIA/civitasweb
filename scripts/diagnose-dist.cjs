const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const htmlFiles = getHtmlFiles(distDir);
const brokenInDist = [];
let totalFound = 0;

htmlFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  // Match src="...", poster="...", data-video-src="..."
  const regex = /(?:src|poster|data-video-src)=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const assetUrl = match[1];
    if (assetUrl.startsWith('http') || assetUrl.startsWith('data:') || assetUrl.startsWith('#') || assetUrl.endsWith('.html')) {
      continue;
    }
    totalFound++;
    
    // Resolve path relative to dist root
    const cleanUrl = decodeURIComponent(assetUrl).split('?')[0].split('#')[0];
    let resolvedPath;
    if (cleanUrl.startsWith('/')) {
      resolvedPath = path.join(distDir, cleanUrl.slice(1));
    } else {
      resolvedPath = path.resolve(path.dirname(f), cleanUrl);
    }
    
    if (!fs.existsSync(resolvedPath)) {
      brokenInDist.push({
        htmlFile: path.relative(distDir, f),
        url: assetUrl,
        resolvedPath: path.relative(distDir, resolvedPath)
      });
    }
  }
});

console.log(`Scanned ${htmlFiles.length} HTML files in dist/`);
console.log(`Total local asset references checked: ${totalFound}`);
console.log(`BROKEN in dist: ${brokenInDist.length}`);

if (brokenInDist.length > 0) {
  console.log('\n--- Broken in Dist Details ---');
  // show unique broken urls
  const uniqueUrls = new Set();
  brokenInDist.forEach(b => {
    if (!uniqueUrls.has(b.url)) {
      uniqueUrls.add(b.url);
      console.log(`Missing in dist: "${b.url}" (referenced in ${b.htmlFile})`);
    }
  });
}
