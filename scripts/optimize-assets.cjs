const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.resolve(__dirname, '..');
const assetsImagesDir = path.join(rootDir, 'assets', 'Images');

// 1. Font link injection into HTML files
const fontLink = '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Manrope:wght@300;400;500;600;700;800&display=swap">\n';

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
let fontsUpdated = 0;

htmlFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('family=Cormorant+Garamond')) {
    if (content.includes('<link rel="stylesheet" href="/src/styles/main.css">')) {
      content = content.replace(
        '<link rel="stylesheet" href="/src/styles/main.css">',
        fontLink + '  <link rel="stylesheet" href="/src/styles/main.css">'
      );
      fs.writeFileSync(f, content, 'utf8');
      fontsUpdated++;
    }
  }
});
console.log(`[Fonts] Injected direct Google Fonts stylesheet link into ${fontsUpdated} HTML files.`);

// 2. Image WebP conversion
async function processImages() {
  const files = fs.readdirSync(assetsImagesDir);
  let totalOriginalBytes = 0;
  let totalWebpBytes = 0;
  let convertedCount = 0;

  for (const file of files) {
    if (file.endsWith('.png')) {
      const inputPath = path.join(assetsImagesDir, file);
      const baseName = path.basename(file, '.png');
      const outputPath = path.join(assetsImagesDir, `${baseName}.webp`);

      const stat = fs.statSync(inputPath);
      totalOriginalBytes += stat.size;

      // Convert using sharp with 82 quality (optimal balance of visual fidelity and tiny file size)
      await sharp(inputPath)
        .webp({ quality: 82, effort: 5 })
        .toFile(outputPath);

      const webpStat = fs.statSync(outputPath);
      totalWebpBytes += webpStat.size;
      convertedCount++;

      const saving = (((stat.size - webpStat.size) / stat.size) * 100).toFixed(1);
      console.log(`Converted: ${file} (${(stat.size / 1024).toFixed(0)}KB -> ${(webpStat.size / 1024).toFixed(0)}KB, -${saving}%)`);
    }
  }

  const origMB = (totalOriginalBytes / (1024 * 1024)).toFixed(2);
  const webpMB = (totalWebpBytes / (1024 * 1024)).toFixed(2);
  const totalSaving = (((totalOriginalBytes - totalWebpBytes) / totalOriginalBytes) * 100).toFixed(1);

  console.log(`\n==========================================`);
  console.log(`[Images] Successfully converted ${convertedCount} PNG images to WebP!`);
  console.log(`Original Total: ${origMB} MB`);
  console.log(`WebP Total:     ${webpMB} MB`);
  console.log(`Total Reduction: -${totalSaving}%`);
  console.log(`==========================================\n`);
}

processImages().catch(err => {
  console.error('Error processing images:', err);
  process.exit(1);
});
