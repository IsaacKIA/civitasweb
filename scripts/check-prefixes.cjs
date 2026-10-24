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
const imagePrefixes = new Set();
const videoPrefixes = new Set();

htmlFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const imgRegex = /(?:src|poster)=["']([^"']+\.(?:png|webp|jpg))["']/gi;
  let m;
  while ((m = imgRegex.exec(content)) !== null) {
    const url = m[1];
    if (!url.startsWith('http')) {
      const parts = url.split('/');
      if (parts.length > 2) {
        imagePrefixes.add(parts.slice(0, -1).join('/'));
      }
    }
  }
  
  const vidRegex = /(?:src|data-video-src)=["']([^"']+\.mp4)["']/gi;
  while ((m = vidRegex.exec(content)) !== null) {
    const url = m[1];
    if (!url.startsWith('http')) {
      const parts = url.split('/');
      if (parts.length > 2) {
        videoPrefixes.add(parts.slice(0, -1).join('/'));
      }
    }
  }
});

console.log('Image URL folder prefixes in HTML:');
console.log(Array.from(imagePrefixes));
console.log('\nVideo URL folder prefixes in HTML:');
console.log(Array.from(videoPrefixes));
