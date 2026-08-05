import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.join(process.cwd(), 'public', 'favicon.svg');
const icon192 = path.join(process.cwd(), 'public', 'pwa-192x192.png');
const icon512 = path.join(process.cwd(), 'public', 'pwa-512x512.png');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(icon192);

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(icon512);

  console.log('PWA Icons generated successfully!');
}

generateIcons().catch(console.error);
