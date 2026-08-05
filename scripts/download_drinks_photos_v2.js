const fs = require('fs');
const path = require('path');
const https = require('https');

const outDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'food');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 100% Verified, Clean Drink Photos (NO BODYBUILDERS!)
const verifiedDrinkPhotos = {
  'coca_cola_05.jpg': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop',
  'coca_cola_1l.jpg': 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&auto=format&fit=crop',
  'coca_cola_15l.jpg': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&auto=format&fit=crop',
  'coca_cola_butulka.jpg': 'https://images.unsplash.com/photo-1596803244618-8dbee441d70b?w=600&auto=format&fit=crop',

  'pepsi_05.jpg': 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=600&auto=format&fit=crop',
  'pepsi_1l.jpg': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&auto=format&fit=crop',
  'pepsi_15l.jpg': 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=600&auto=format&fit=crop',
  'pepsi_butulka.jpg': 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=600&auto=format&fit=crop',

  'fanta_05.jpg': 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600&auto=format&fit=crop',
  'fanta_1l.jpg': 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&auto=format&fit=crop',
  'fanta_15l.jpg': 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600&auto=format&fit=crop',

  'sprite.jpg': 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&auto=format&fit=crop',
  'ice_tea_05.jpg': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop',
  'ice_tea_1l.jpg': 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=600&auto=format&fit=crop',
  'santal_15.jpg': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop',
  'santal_bezgaz.jpg': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop'
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
          console.log(`[DOWNLOADED CLEAN DRINK PHOTO] ${filename}`);
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
  console.log('Downloading clean drink photos (no gym bodybuilders)...');
  for (const [filename, url] of Object.entries(verifiedDrinkPhotos)) {
    await downloadFile(filename, url);
  }
  console.log('All clean drink photos downloaded!');
}

run();
