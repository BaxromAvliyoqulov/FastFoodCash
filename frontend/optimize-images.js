import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, 'public', 'images');

// Qidiriladigan rasm formatlari
const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

async function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      if (validExtensions.includes(ext)) {
        await optimizeImage(fullPath);
      }
    }
  }
}

async function optimizeImage(filePath) {
  try {
    const originalSize = fs.statSync(filePath).size;
    
    // Rasm ma'lumotlarini vaqtinchalik xotiraga (buffer) o'qib olamiz
    const imageBuffer = fs.readFileSync(filePath);
    
    const ext = path.extname(filePath).toLowerCase();
    
    let sharpInstance = sharp(imageBuffer);
    
    // Rasm kengligi 1200px dan katta bo'lsa, proporsiyani saqlab kichraytiramiz
    const metadata = await sharpInstance.metadata();
    if (metadata.width > 1200) {
      sharpInstance = sharpInstance.resize({ width: 1200, withoutEnlargement: true });
    }

    // Formatga qarab sifatni moslaymiz (sifatni 80% gacha tushiramiz, vizual sezilmaydi)
    if (ext === '.jpg' || ext === '.jpeg') {
      sharpInstance = sharpInstance.jpeg({ quality: 80, progressive: true });
    } else if (ext === '.png') {
      sharpInstance = sharpInstance.png({ quality: 80, compressionLevel: 8 });
    } else if (ext === '.webp') {
      sharpInstance = sharpInstance.webp({ quality: 80 });
    }

    // Xuddi shu fayl ustiga yozamiz
    const optimizedBuffer = await sharpInstance.toBuffer();
    fs.writeFileSync(filePath, optimizedBuffer);
    
    const newSize = fs.statSync(filePath).size;
    const saved = originalSize - newSize;
    const savedPercent = Math.round((saved / originalSize) * 100);
    
    console.log(`✅ Kichraytirildi: ${path.basename(filePath)} | Yutilgan joy: ${(saved / 1024).toFixed(1)} KB (${savedPercent}%)`);
  } catch (error) {
    console.error(`❌ Xatolik yuz berdi (${path.basename(filePath)}):`, error.message);
  }
}

console.log('🔄 Rasmlarni hajmini kichraytirish (optimallashtirish) boshlandi...');
processDirectory(imagesDir).then(() => {
  console.log('🎉 Barcha rasmlar muvaffaqiyatli optimallashtirildi!');
});
