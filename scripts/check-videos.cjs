const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publicVideoesDir = path.join(rootDir, 'public', 'assets', 'Videoes');

const actualVideosInPublic = new Set(
  fs.existsSync(publicVideoesDir) ? fs.readdirSync(publicVideoesDir) : []
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
const referencedVideos = new Set();
const missingVideos = [];

htmlFiles.forEach(hf => {
  const content = fs.readFileSync(hf, 'utf8');
  const regex = /(?:src|data-video-src)=["'](\/assets\/Videoes\/[^"']+)["']/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const videoUrl = m[1];
    const filename = path.basename(videoUrl);
    referencedVideos.add(filename);
    
    // Check exact case-sensitive match in actualVideosInPublic
    if (!actualVideosInPublic.has(filename)) {
      missingVideos.push({ file: path.relative(rootDir, hf), video: filename });
    }
  }
});

console.log('Total unique videos referenced in HTML:', referencedVideos.size);
console.log('Total actual files in public/assets/Videoes:', actualVideosInPublic.size);
console.log('Missing videos (case-sensitive):', missingVideos.length);
if (missingVideos.length > 0) {
  console.log('Missing details:', missingVideos);
}
