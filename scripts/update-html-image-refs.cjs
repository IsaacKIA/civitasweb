const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const assetsImagesDir = path.join(rootDir, 'assets', 'Images');

// Collect all webp basenames in assets/Images
const webpFiles = new Set(
  fs.readdirSync(assetsImagesDir)
    .filter(f => f.endsWith('.webp'))
    .map(f => f.slice(0, -5))
);

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
let totalReplacements = 0;
let filesModified = 0;

htmlFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let modified = false;

  // Replace /assets/Images/<name>.png with /assets/Images/<name>.webp if <name>.webp exists
  // Handle both literal spaces and %20
  const regex = /\/assets\/Images\/([^"'>]+)\.png/g;
  const newContent = content.replace(regex, (match, imageName) => {
    const decodedName = decodeURIComponent(imageName);
    if (webpFiles.has(decodedName) || webpFiles.has(imageName)) {
      totalReplacements++;
      modified = true;
      return `/assets/Images/${imageName}.webp`;
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(f, newContent, 'utf8');
    filesModified++;
    console.log(`Updated images to WebP in: ${path.relative(rootDir, f)}`);
  }
});

console.log(`\nReplaced ${totalReplacements} image references across ${filesModified} HTML files with .webp`);
