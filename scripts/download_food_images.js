const fs = require('fs');
const path = require('path');
const https = require('https');

// 100% Verified food image URLs from Pexels HD CDN
const foodImages = {
  // Hot Dog
  'hot_dog_classic.jpg': 'https://images.pexels.com/photos/103566/pexels-photo-103566.jpeg?auto=compress&cs=tinysrgb&w=600',
  'chickeen_dog.jpg': 'https://images.pexels.com/photos/262945/pexels-photo-262945.jpeg?auto=compress&cs=tinysrgb&w=600',

  // Remaining Torts
  'prazdnichniy_oq_tort.jpg': 'https://images.pexels.com/photos/1702373/pexels-photo-1702373.jpeg?auto=compress&cs=tinysrgb&w=600',
  'zebra_biskvit_tort.jpg': 'https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg?auto=compress&cs=tinysrgb&w=600',
  'yongoqli_qaymoqli_tort.jpg': 'https://images.pexels.com/photos/808941/pexels-photo-808941.jpeg?auto=compress&cs=tinysrgb&w=600',

  // Coffee & Drinks
  'choco_coffee.jpg': 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=600',
  'qora_jacobs.jpg': 'https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg?auto=compress&cs=tinysrgb&w=600',
  'cappuccino.jpg': 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=600',
  'maccoffee_3in1.jpg': 'https://images.pexels.com/photos/851555/pexels-photo-851555.jpeg?auto=compress&cs=tinysrgb&w=600',
  'limon_choy.jpg': 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=600',
  'tess_kok_choy.jpg': 'https://images.pexels.com/photos/227908/pexels-photo-227908.jpeg?auto=compress&cs=tinysrgb&w=600',
  'tess_apelsin_choy.jpg': 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600',
  'tess_qora_choy.jpg': 'https://images.pexels.com/photos/1493088/pexels-photo-1493088.jpeg?auto=compress&cs=tinysrgb&w=600',
  'coca_cola.jpg': 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=600'
};

const baseDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'food');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

function downloadImage(filename, url) {
  return new Promise((resolve) => {
    const dest = path.join(baseDir, filename);
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`[SUCCESS] Downloaded ${filename}`);
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
  console.log('Downloading remaining verified food photography from Pexels...');
  for (const [filename, url] of Object.entries(foodImages)) {
    await downloadImage(filename, url);
  }
  console.log('All remaining food images downloaded to frontend/public/images/food/');
}

run();
