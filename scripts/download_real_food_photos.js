const fs = require('fs');
const path = require('path');
const https = require('https');

const outDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'food');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const remainingPhotos = {
  'prazdnichniy_oq_tort.jpg': 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop',
  'zebra_biskvit_tort.jpg': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop',
  'yongoqli_qaymoqli_tort.jpg': 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop',
  'choco_coffee.jpg': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop',
  'qora_jacobs.jpg': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop',
  'cappuccino.jpg': 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop',
  'maccoffee_3in1.jpg': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop',
  'limon_choy.jpg': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop',
  'tess_kok_choy.jpg': 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=600&auto=format&fit=crop',
  'tess_apelsin_choy.jpg': 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop',
  'tess_qora_choy.jpg': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop',
  'coca_cola.jpg': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop'
};

function downloadFile(filename, url) {
  return new Promise((resolve) => {
    const dest = path.join(outDir, filename);
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200 || response.statusCode === 301 || response.statusCode === 302) {
        if (response.statusCode === 301 || response.statusCode === 302) {
          return downloadFile(filename, response.headers.location).then(resolve);
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`[DOWNLOADED PHOTO] ${filename}`);
          resolve(true);
        });
      } else {
        console.error(`[FAIL] ${filename}: HTTP ${response.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.error(`[ERROR] ${filename}: ${err.message}`);
      resolve(false);
    });
  });
}

async function run() {
  for (const [filename, url] of Object.entries(remainingPhotos)) {
    await downloadFile(filename, url);
  }
  console.log('Remaining real food photos downloaded!');
}

run();
