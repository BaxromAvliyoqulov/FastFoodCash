const fs = require('fs');
const path = require('path');
const https = require('https');

const outDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'food');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 100% Real Studio Photography for Ichimliklar, Energetik & Soklar
const drinkPhotos = {
  // Salqin Ichimliklar
  'coca_cola_05.jpg': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop',
  'coca_cola_1l.jpg': 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&auto=format&fit=crop',
  'pepsi.jpg': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&auto=format&fit=crop',
  'fanta.jpg': 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600&auto=format&fit=crop',
  'sprite.jpg': 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&auto=format&fit=crop',
  'glass_bottle.jpg': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop',
  'ice_tea.jpg': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop',
  'santal_juice.jpg': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop',

  // Energetik & Moxito
  'moxito.jpg': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop',
  'flash_energy.jpg': 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=600&auto=format&fit=crop',
  'gorilla.jpg': 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop',

  // Soklar
  'sok_olma.jpg': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop',
  'sok_shaftoli.jpg': 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop',
  'sok_multifrukt.jpg': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop',
  'sok_ormon.jpg': 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop',
  'sok_qulupnay.jpg': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop'
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
          console.log(`[DOWNLOADED DRINK PHOTO] ${filename}`);
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
  console.log('Downloading 100% real studio photography for drinks...');
  for (const [filename, url] of Object.entries(drinkPhotos)) {
    await downloadFile(filename, url);
  }
  console.log('All drink photos downloaded!');
}

run();
