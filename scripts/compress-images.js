const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, '../frontend/public/images');

async function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && /\.(png|jpg|jpeg)$/i.test(entry.name)) {
      const stats = fs.statSync(fullPath);
      if (stats.size > 100 * 1024) { // images larger than 100KB
        const webpPath = fullPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
        try {
          await sharp(fullPath)
            .resize({ width: 800, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(webpPath);

          const newStats = fs.statSync(webpPath);
          console.log(`Compressed: ${path.basename(fullPath)} (${Math.round(stats.size/1024)}KB) -> ${path.basename(webpPath)} (${Math.round(newStats.size/1024)}KB)`);
        } catch (err) {
          console.error(`Error compressing ${fullPath}:`, err);
        }
      }
    }
  }
}

processDirectory(imagesDir).then(() => {
  console.log('Image compression complete.');
}).catch(console.error);
