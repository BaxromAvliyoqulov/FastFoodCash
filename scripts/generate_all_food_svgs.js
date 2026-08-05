const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'food');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 100% Precision Custom Food Vector SVGs
const foodSvgs = {
  'hot_dog_classic.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="hdBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e1b18"/><stop offset="100%" stop-color="#0f0e0c"/></linearGradient>
      <linearGradient id="bun" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient>
      <linearGradient id="sausage" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#991b1b"/><stop offset="50%" stop-color="#dc2626"/><stop offset="100%" stop-color="#7f1d1d"/></linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#hdBg)"/>
    <ellipse cx="300" cy="300" rx="200" ry="35" fill="rgba(0,0,0,0.6)"/>
    
    <!-- Hot Dog Bun -->
    <path d="M 120,200 Q 300,120 480,200 Q 480,260 300,280 Q 120,260 120,200 Z" fill="url(#bun)"/>
    <!-- Sausage -->
    <path d="M 90,210 Q 300,160 510,210 Q 500,235 300,225 Q 100,235 90,210 Z" fill="url(#sausage)"/>
    <!-- Yellow Mustard Zigzag -->
    <path d="M 120,205 Q 150,185 180,205 Q 210,185 240,205 Q 270,185 300,205 Q 330,185 360,205 Q 390,185 420,205 Q 450,185 480,205" stroke="#facc15" stroke-width="8" fill="none" stroke-linecap="round"/>
    <!-- Ketchup Drizzle -->
    <path d="M 135,210 Q 165,195 195,210 Q 225,195 255,210 Q 285,195 315,210 Q 345,195 375,210 Q 405,195 435,210" stroke="#ef4444" stroke-width="6" fill="none" stroke-linecap="round"/>

    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#facc15" text-anchor="middle" letter-spacing="2">HOT DOG CLASSIC</text>
  </svg>`,

  'chickeen_dog.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="cdBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1c1917"/><stop offset="100%" stop-color="#0c0a09"/></linearGradient>
      <linearGradient id="cbun" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#d97706"/></linearGradient>
      <linearGradient id="chick" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#d97706"/><stop offset="100%" stop-color="#b45309"/></linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#cdBg)"/>
    <ellipse cx="300" cy="300" rx="200" ry="35" fill="rgba(0,0,0,0.6)"/>
    
    <path d="M 120,200 Q 300,120 480,200 Q 480,260 300,280 Q 120,260 120,200 Z" fill="url(#cbun)"/>
    <!-- Crispy Chicken Strips -->
    <path d="M 100,205 Q 300,165 500,205 Q 490,230 300,225 Q 110,230 100,205 Z" fill="url(#chick)"/>
    <!-- White Garlic Sauce -->
    <path d="M 130,200 Q 160,180 190,200 Q 220,180 250,200 Q 280,180 310,200 Q 340,180 370,200 Q 400,180 430,200" stroke="#fff8f0" stroke-width="10" fill="none" stroke-linecap="round"/>

    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#fbbf24" text-anchor="middle" letter-spacing="2">CHICKEEN DOG</text>
  </svg>`,

  'lavash_obichniy.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#1e1e1e"/>
    <ellipse cx="300" cy="300" rx="180" ry="30" fill="rgba(0,0,0,0.5)"/>
    <!-- Lavash Roll -->
    <path d="M 140,240 L 440,160 L 460,190 L 160,270 Z" fill="#e5d0ac"/>
    <ellipse cx="150" cy="255" rx="15" ry="18" fill="#5c3a21"/>
    <!-- Grill marks -->
    <line x1="200" y1="210" x2="220" y2="240" stroke="#8c6239" stroke-width="4"/>
    <line x1="260" y1="190" x2="280" y2="220" stroke="#8c6239" stroke-width="4"/>
    <line x1="320" y1="170" x2="340" y2="200" stroke="#8c6239" stroke-width="4"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#e5d0ac" text-anchor="middle">LAVASH (OBICHNIY)</text>
  </svg>`,

  'achchiq_lavash.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#240c0c"/>
    <ellipse cx="300" cy="300" rx="180" ry="30" fill="rgba(0,0,0,0.5)"/>
    <path d="M 140,240 L 440,160 L 460,190 L 160,270 Z" fill="#e5d0ac"/>
    <ellipse cx="150" cy="255" rx="15" ry="18" fill="#7f1d1d"/>
    <!-- Red Pepper Accent -->
    <path d="M 380,120 Q 420,110 410,140" stroke="#ef4444" stroke-width="8" fill="none"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#ef4444" text-anchor="middle">ACHCHIQ LAVASH</text>
  </svg>`,

  'danar.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#1c1917"/>
    <path d="M 150,260 Q 300,120 450,260 Z" fill="#d97706"/>
    <path d="M 180,240 Q 300,150 420,240 Z" fill="#78350f"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#fbbf24" text-anchor="middle">DANAR BREAD</text>
  </svg>`,

  'dablburger.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#18181b"/>
    <ellipse cx="300" cy="310" rx="160" ry="25" fill="rgba(0,0,0,0.6)"/>
    <!-- Bottom Bun -->
    <path d="M 160,260 Q 300,280 440,260 L 440,280 Q 300,300 160,280 Z" fill="#d97706"/>
    <!-- Patty 1 -->
    <rect x="150" y="235" width="300" height="22" rx="10" fill="#451a03"/>
    <!-- Patty 2 -->
    <rect x="150" y="205" width="300" height="22" rx="10" fill="#451a03"/>
    <!-- Top Bun -->
    <path d="M 160,195 Q 300,90 440,195 Z" fill="#f59e0b"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#f59e0b" text-anchor="middle">DABLBURGER</text>
  </svg>`,

  'dabl_cheese_burger.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#18181b"/>
    <ellipse cx="300" cy="310" rx="160" ry="25" fill="rgba(0,0,0,0.6)"/>
    <path d="M 160,260 Q 300,280 440,260 L 440,280 Q 300,300 160,280 Z" fill="#d97706"/>
    <rect x="150" y="235" width="300" height="22" rx="10" fill="#451a03"/>
    <!-- Cheese 1 Melt -->
    <polygon points="160,235 440,235 420,250 180,250" fill="#facc15"/>
    <rect x="150" y="200" width="300" height="22" rx="10" fill="#451a03"/>
    <!-- Cheese 2 Melt -->
    <polygon points="160,200 440,200 420,215 180,215" fill="#facc15"/>
    <path d="M 160,190 Q 300,85 440,190 Z" fill="#f59e0b"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#facc15" text-anchor="middle">DABL CHESSE BURGER</text>
  </svg>`,

  'burger_king.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#1c1917"/>
    <ellipse cx="300" cy="310" rx="170" ry="25" fill="rgba(0,0,0,0.6)"/>
    <path d="M 140,260 Q 300,280 460,260 L 460,280 Q 300,300 140,280 Z" fill="#d97706"/>
    <rect x="130" y="225" width="340" height="30" rx="12" fill="#451a03"/>
    <path d="M 140,215 Q 300,80 460,215 Z" fill="#f59e0b"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#fbbf24" text-anchor="middle">BURGER KING</text>
  </svg>`,

  'kfc_burger.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#240c0c"/>
    <ellipse cx="300" cy="310" rx="160" ry="25" fill="rgba(0,0,0,0.6)"/>
    <path d="M 160,260 Q 300,280 440,260 L 440,280 Q 300,300 160,280 Z" fill="#d97706"/>
    <!-- Crispy Chicken Filet -->
    <path d="M 140,220 Q 300,200 460,220 Q 450,250 300,250 Q 150,250 140,220 Z" fill="#b45309"/>
    <path d="M 160,205 Q 300,95 440,205 Z" fill="#f59e0b"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#ef4444" text-anchor="middle">KFC BURGER</text>
  </svg>`,

  'classic_fri.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#18181b"/>
    <!-- Red Box -->
    <polygon points="220,180 380,180 360,320 240,320" fill="#dc2626"/>
    <!-- Fries -->
    <rect x="230" y="100" width="14" height="100" fill="#facc15" transform="rotate(-10, 230, 100)"/>
    <rect x="255" y="80" width="14" height="120" fill="#facc15"/>
    <rect x="280" y="70" width="14" height="130" fill="#fbbf24"/>
    <rect x="305" y="85" width="14" height="115" fill="#facc15"/>
    <rect x="330" y="95" width="14" height="105" fill="#facc15" transform="rotate(12, 330, 95)"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#facc15" text-anchor="middle">CLASSIC FRI</text>
  </svg>`,

  'jaydari_fri.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#1c1917"/>
    <ellipse cx="300" cy="270" rx="160" ry="40" fill="#44403c"/>
    <ellipse cx="300" cy="265" rx="150" ry="35" fill="#78350f"/>
    <!-- Potato Wedges -->
    <path d="M 200,240 Q 250,210 300,240" stroke="#fbbf24" stroke-width="16" stroke-linecap="round"/>
    <path d="M 280,230 Q 330,200 380,230" stroke="#f59e0b" stroke-width="18" stroke-linecap="round"/>
    <path d="M 220,260 Q 280,230 340,260" stroke="#d97706" stroke-width="16" stroke-linecap="round"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#fbbf24" text-anchor="middle">JAYDARI FRI</text>
  </svg>`,

  'goshtli_assorti_pizza.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#1c1917"/>
    <circle cx="300" cy="200" r="140" fill="#d97706"/>
    <circle cx="300" cy="200" r="125" fill="#ef4444"/>
    <circle cx="300" cy="200" r="115" fill="#fef08a"/>
    <!-- Pepperoni Slices -->
    <circle cx="260" cy="160" r="18" fill="#991b1b"/>
    <circle cx="340" cy="170" r="18" fill="#991b1b"/>
    <circle cx="300" cy="230" r="18" fill="#991b1b"/>
    <circle cx="230" cy="220" r="16" fill="#78350f"/>
    <circle cx="350" cy="220" r="16" fill="#78350f"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#fef08a" text-anchor="middle">GO'SHTLI VA ASSORTI PIZZA</text>
  </svg>`,

  'alfredo_pizza.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#1c1917"/>
    <circle cx="300" cy="200" r="140" fill="#d97706"/>
    <circle cx="300" cy="200" r="125" fill="#fffbeb"/>
    <circle cx="250" cy="170" r="12" fill="#d97706"/>
    <circle cx="330" cy="180" r="14" fill="#d97706"/>
    <circle cx="290" cy="230" r="12" fill="#d97706"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#fffbeb" text-anchor="middle">ALFREDO PIZZA</text>
  </svg>`,

  'gosht_qoziqorin_pizza.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#1c1917"/>
    <circle cx="300" cy="200" r="140" fill="#d97706"/>
    <circle cx="300" cy="200" r="125" fill="#fef08a"/>
    <!-- Mushrooms -->
    <path d="M 240,160 Q 255,140 270,160 Z" fill="#78350f"/>
    <path d="M 320,180 Q 335,160 350,180 Z" fill="#78350f"/>
    <path d="M 270,220 Q 285,200 300,220 Z" fill="#78350f"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#fef08a" text-anchor="middle">GO'SHT VA QO'ZIQORIN PIZZA</text>
  </svg>`,

  'gosht_achchiq_pizza.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#240c0c"/>
    <circle cx="300" cy="200" r="140" fill="#d97706"/>
    <circle cx="300" cy="200" r="125" fill="#dc2626"/>
    <circle cx="300" cy="200" r="115" fill="#fef08a"/>
    <!-- Red Jalapeno peppers -->
    <circle cx="250" cy="160" r="10" fill="#ef4444"/>
    <circle cx="330" cy="170" r="10" fill="#ef4444"/>
    <circle cx="290" cy="230" r="10" fill="#ef4444"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#ef4444" text-anchor="middle">GO'SHT VA ACHCHIQ PIZZA</text>
  </svg>`,

  'peperoniy_pizza.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#1c1917"/>
    <circle cx="300" cy="200" r="140" fill="#d97706"/>
    <circle cx="300" cy="200" r="125" fill="#fde047"/>
    <!-- Pepperoni Slices -->
    <circle cx="240" cy="160" r="20" fill="#dc2626"/>
    <circle cx="320" cy="150" r="20" fill="#dc2626"/>
    <circle cx="350" cy="210" r="20" fill="#dc2626"/>
    <circle cx="270" cy="230" r="20" fill="#dc2626"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#ef4444" text-anchor="middle">PEPERONIY PIZZA</text>
  </svg>`,

  'doston_brend_pizza.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#1c1917"/>
    <circle cx="300" cy="200" r="140" fill="#f59e0b"/>
    <circle cx="300" cy="200" r="125" fill="#fef08a"/>
    <circle cx="300" cy="200" r="40" fill="#d97706"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#f59e0b" text-anchor="middle">DOSTON BREND PIZZA</text>
  </svg>`,

  'sezar_salat.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#142e1b"/>
    <ellipse cx="300" cy="240" rx="160" ry="50" fill="#ffffff"/>
    <ellipse cx="300" cy="230" rx="140" ry="40" fill="#15803d"/>
    <rect x="260" y="200" width="15" height="15" fill="#fef08a"/>
    <rect x="310" y="210" width="15" height="15" fill="#fef08a"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#4ade80" text-anchor="middle">SEZAR SALAT</text>
  </svg>`,

  'apetitnaya.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#1c1917"/>
    <ellipse cx="300" cy="240" rx="160" ry="50" fill="#ffffff"/>
    <ellipse cx="300" cy="230" rx="140" ry="40" fill="#fffbeb"/>
    <circle cx="270" cy="215" r="10" fill="#f59e0b"/>
    <circle cx="320" cy="225" r="10" fill="#78350f"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#f59e0b" text-anchor="middle">APETITNAYA SALAT</text>
  </svg>`,

  'jenskiy_kapriz.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#2e1423"/>
    <ellipse cx="300" cy="240" rx="160" ry="50" fill="#ffffff"/>
    <ellipse cx="300" cy="230" rx="140" ry="40" fill="#fff1f2"/>
    <circle cx="280" cy="220" r="8" fill="#f43f5e"/>
    <circle cx="320" cy="210" r="8" fill="#fbbf24"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#fb7185" text-anchor="middle">JENSKIY KAPRIZ</text>
  </svg>`,

  'barf_salat.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#142e1b"/>
    <ellipse cx="300" cy="240" rx="160" ry="50" fill="#ffffff"/>
    <ellipse cx="300" cy="230" rx="140" ry="40" fill="#166534"/>
    <rect x="250" y="210" width="30" height="8" fill="#78350f" transform="rotate(20, 250, 210)"/>
    <rect x="310" y="215" width="30" height="8" fill="#78350f" transform="rotate(-15, 310, 215)"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#86efac" text-anchor="middle">BARF SALAT</text>
  </svg>`,

  'choco_coffee.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#1c1917"/>
    <rect x="230" y="140" width="140" height="140" rx="20" fill="#451a03"/>
    <path d="M 230,170 Q 300,190 370,170 L 370,140 L 230,140 Z" fill="#fffbeb"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#d97706" text-anchor="middle">CHOCO COFFEE</text>
  </svg>`,

  'qora_jacobs.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#0f172a"/>
    <rect x="230" y="140" width="140" height="140" rx="20" fill="#1e293b"/>
    <ellipse cx="300" cy="160" rx="50" ry="15" fill="#020617"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#94a3b8" text-anchor="middle">QORA JACOBS</text>
  </svg>`,

  'cappuccino.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#1c1917"/>
    <rect x="230" y="140" width="140" height="140" rx="20" fill="#78350f"/>
    <ellipse cx="300" cy="160" rx="55" ry="18" fill="#fef3c7"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#fde047" text-anchor="middle">CAPUPUCCINO</text>
  </svg>`,

  'maccoffee_3in1.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#240c0c"/>
    <rect x="240" y="130" width="120" height="150" fill="#dc2626"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#ef4444" text-anchor="middle">MACCOFFEE 3B1</text>
  </svg>`,

  'limon_choy.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#1c1917"/>
    <rect x="220" y="120" width="160" height="160" rx="20" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="4"/>
    <circle cx="300" cy="180" r="30" fill="#facc15"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#facc15" text-anchor="middle">LIMON CHOY</text>
  </svg>`,

  'tess_kok_choy.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#142e1b"/>
    <circle cx="300" cy="200" r="70" fill="#16a34a"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#4ade80" text-anchor="middle">TESS KO'K CHOY</text>
  </svg>`,

  'tess_apelsin_choy.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#2b1e10"/>
    <circle cx="300" cy="200" r="70" fill="#ea580c"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#fb923c" text-anchor="middle">TESS APELSIN CHOY</text>
  </svg>`,

  'tess_qora_choy.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#1c1917"/>
    <circle cx="300" cy="200" r="70" fill="#78350f"/>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#d97706" text-anchor="middle">TESS QORA CHOY</text>
  </svg>`,

  'coca_cola.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#1c1917"/>
    <rect x="250" y="110" width="100" height="190" rx="15" fill="#dc2626"/>
    <text x="300" y="210" font-family="sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle" transform="rotate(-90 300 210)">Coca-Cola</text>
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#ef4444" text-anchor="middle">COCA-COLA 0.5L</text>
  </svg>`
};

for (const [filename, svgContent] of Object.entries(foodSvgs)) {
  const filePath = path.join(outDir, filename);
  fs.writeFileSync(filePath, svgContent, 'utf8');
  console.log(`[GENERATED SVG] ${filename}`);
}

console.log('All 100% precision vector food SVGs generated successfully!');
