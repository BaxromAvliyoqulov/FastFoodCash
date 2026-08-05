const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'food');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 9 High-craft custom SVGs for Torts
const tortSvgs = {
  'napoleon_tort.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e1b18"/>
        <stop offset="100%" stop-color="#0f0e0c"/>
      </linearGradient>
      <linearGradient id="pastry" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e6b87d"/>
        <stop offset="50%" stop-color="#c48e4d"/>
        <stop offset="100%" stop-color="#9e692a"/>
      </linearGradient>
      <linearGradient id="cream" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffdf7"/>
        <stop offset="100%" stop-color="#f5e8c7"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#bg)"/>
    <ellipse cx="300" cy="310" rx="220" ry="40" fill="rgba(0,0,0,0.6)"/>
    
    <!-- Napoleon Layered Wedge -->
    <g transform="translate(120, 70)">
      <!-- Cake Base shadow -->
      <polygon points="50,220 310,240 330,130 80,110" fill="#6e461b"/>
      
      <!-- Pastry Layers -->
      <polygon points="50,220 310,240 310,225 50,205" fill="url(#pastry)"/>
      <polygon points="50,205 310,225 310,215 50,195" fill="url(#cream)"/>
      <polygon points="50,195 310,215 310,200 50,180" fill="url(#pastry)"/>
      <polygon points="50,180 310,200 310,190 50,170" fill="url(#cream)"/>
      <polygon points="50,170 310,190 310,175 50,155" fill="url(#pastry)"/>
      <polygon points="50,155 310,175 310,165 50,145" fill="url(#cream)"/>
      <polygon points="50,145 310,165 310,150 50,130" fill="url(#pastry)"/>
      
      <!-- Top Slice Face -->
      <polygon points="50,130 310,150 250,60 30,50" fill="#f2cb9b"/>
      
      <!-- Powdered Sugar Dusting -->
      <polygon points="55,128 305,148 245,63 35,53" fill="rgba(255,255,255,0.75)"/>
      
      <!-- Strawberries on top -->
      <circle cx="140" cy="85" r="16" fill="#e62e2e"/>
      <polygon points="140,65 135,75 145,75" fill="#2d8a39"/>
      <circle cx="170" cy="95" r="14" fill="#cc2424"/>
    </g>
    
    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#f3d09a" text-anchor="middle" letter-spacing="2">NAPOLEON TORT</text>
  </svg>`,

  'medovik_tort.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="honeyBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2b1e10"/>
        <stop offset="100%" stop-color="#140d07"/>
      </linearGradient>
      <linearGradient id="honeyLayer" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d9822b"/>
        <stop offset="100%" stop-color="#995213"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#honeyBg)"/>
    <ellipse cx="300" cy="300" rx="210" ry="38" fill="rgba(0,0,0,0.65)"/>
    
    <!-- Medovik Cake Slice -->
    <g transform="translate(130, 80)">
      <!-- Side Layers -->
      <polygon points="40,210 300,225 300,70 40,60" fill="url(#honeyLayer)"/>
      <!-- Cream stripes -->
      <line x1="40" y1="85" x2="300" y2="98" stroke="#fff3d6" stroke-width="4"/>
      <line x1="40" y1="110" x2="300" y2="123" stroke="#fff3d6" stroke-width="4"/>
      <line x1="40" y1="135" x2="300" y2="148" stroke="#fff3d6" stroke-width="4"/>
      <line x1="40" y1="160" x2="300" y2="173" stroke="#fff3d6" stroke-width="4"/>
      <line x1="40" y1="185" x2="300" y2="198" stroke="#fff3d6" stroke-width="4"/>

      <!-- Top Slice Face -->
      <polygon points="40,60 300,70 230,20 20,20" fill="#e69c45"/>
      <!-- Honey Comb Pattern Overlay -->
      <polygon points="40,60 300,70 230,20 20,20" fill="rgba(255,230,175,0.4)"/>

      <!-- Honey Drip -->
      <path d="M 60,60 Q 80,90 90,60 Q 120,105 130,60 Q 180,95 190,60" fill="#ffaa00" opacity="0.9"/>
    </g>

    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#f5b352" text-anchor="middle" letter-spacing="2">MEDOVIK TORT (ASALLI)</text>
  </svg>`,

  'snickers_tort.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="chocoBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1c120c"/>
        <stop offset="100%" stop-color="#0a0604"/>
      </linearGradient>
      <linearGradient id="darkChoco" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3d2314"/>
        <stop offset="100%" stop-color="#1f1007"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#chocoBg)"/>
    <ellipse cx="300" cy="305" rx="210" ry="38" fill="rgba(0,0,0,0.7)"/>

    <g transform="translate(130, 75)">
      <!-- Cake side -->
      <polygon points="40,210 300,225 300,70 40,60" fill="url(#darkChoco)"/>
      <!-- Caramel & Peanut Layers -->
      <rect x="40" y="90" width="260" height="12" fill="#d97706" transform="rotate(3, 40, 90)"/>
      <rect x="40" y="145" width="260" height="12" fill="#d97706" transform="rotate(3, 40, 145)"/>
      <!-- White Nougat layer -->
      <rect x="40" y="118" width="260" height="10" fill="#fff7ed" transform="rotate(3, 40, 118)"/>

      <!-- Top Slice Face -->
      <polygon points="40,60 300,70 230,20 20,20" fill="#2b180d"/>
      
      <!-- Thick Caramel Glaze & Peanuts -->
      <polygon points="38,58 302,68 232,18 18,18" fill="#b45309"/>
      <circle cx="100" cy="40" r="7" fill="#f59e0b"/>
      <circle cx="130" cy="45" r="8" fill="#f59e0b"/>
      <circle cx="160" cy="35" r="6" fill="#f59e0b"/>
      <circle cx="190" cy="50" r="7" fill="#f59e0b"/>
      <circle cx="210" cy="38" r="8" fill="#f59e0b"/>
    </g>

    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#f59e0b" text-anchor="middle" letter-spacing="2">SNICKERS TORT</text>
  </svg>`,

  'krasniy_velvet_tort.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="redBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#240c12"/>
        <stop offset="100%" stop-color="#0f0407"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#redBg)"/>
    <ellipse cx="300" cy="305" rx="210" ry="38" fill="rgba(0,0,0,0.65)"/>

    <g transform="translate(130, 75)">
      <!-- Red Sponge Side -->
      <polygon points="40,210 300,225 300,70 40,60" fill="#991b1b"/>
      <!-- Snowy White Cream Cheese Layers -->
      <line x1="40" y1="100" x2="300" y2="113" stroke="#ffffff" stroke-width="10"/>
      <line x1="40" y1="150" x2="300" y2="163" stroke="#ffffff" stroke-width="10"/>

      <!-- Top Face Crimson Red Sponge -->
      <polygon points="40,60 300,70 230,20 20,20" fill="#dc2626"/>
      <!-- Top Cream Frosting Rosettes -->
      <polygon points="38,58 302,68 232,18 18,18" fill="#f8fafc" opacity="0.95"/>
      <circle cx="80" cy="40" r="10" fill="#ef4444"/>
      <circle cx="150" cy="45" r="10" fill="#ef4444"/>
      <circle cx="210" cy="35" r="10" fill="#ef4444"/>
    </g>

    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#f87171" text-anchor="middle" letter-spacing="2">KRASNIY VELVET TORT</text>
  </svg>`,

  'shokoladli_glazur_tort.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="darkBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1a1a1a"/>
        <stop offset="100%" stop-color="#080808"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#darkBg)"/>
    <ellipse cx="300" cy="305" rx="210" ry="38" fill="rgba(0,0,0,0.7)"/>

    <g transform="translate(130, 75)">
      <polygon points="40,210 300,225 300,70 40,60" fill="#291810"/>
      <line x1="40" y1="110" x2="300" y2="123" stroke="#4a2e1b" stroke-width="8"/>
      <line x1="40" y1="160" x2="300" y2="173" stroke="#4a2e1b" stroke-width="8"/>

      <!-- Glossy Dark Chocolate Drip Top -->
      <polygon points="40,60 300,70 230,20 20,20" fill="#140b07"/>
      <path d="M 40,60 Q 60,95 80,60 Q 110,110 130,60 Q 170,100 190,60 Q 230,115 250,60 L 300,70 L 230,20 L 20,20 Z" fill="#0d0704"/>
    </g>

    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#fbbf24" text-anchor="middle" letter-spacing="2">SHOKOLADLI GLAZUR TORT</text>
  </svg>`,

  'cheesecake.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="ccBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#241e17"/>
        <stop offset="100%" stop-color="#120e0a"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#ccBg)"/>
    <ellipse cx="300" cy="305" rx="210" ry="38" fill="rgba(0,0,0,0.6)"/>

    <g transform="translate(130, 75)">
      <!-- Crust Base -->
      <polygon points="40,210 300,225 300,185 40,170" fill="#854d0e"/>
      <!-- Smooth Baked Cheese Filling Body -->
      <polygon points="40,170 300,185 300,70 40,60" fill="#fef3c7"/>

      <!-- Golden Top Crust -->
      <polygon points="40,60 300,70 230,20 20,20" fill="#fde68a"/>
      <polygon points="40,60 300,70 230,20 20,20" fill="rgba(217,119,6,0.25)"/>

      <!-- Mint Leaf Accent -->
      <path d="M 160,35 Q 180,20 190,35 Q 180,50 160,35 Z" fill="#16a34a"/>
    </g>

    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#fef08a" text-anchor="middle" letter-spacing="2">NEW YORK CHEESECAKE</text>
  </svg>`,

  'prazdnichniy_oq_tort.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="whiteBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#whiteBg)"/>
    <ellipse cx="300" cy="305" rx="210" ry="38" fill="rgba(0,0,0,0.5)"/>

    <g transform="translate(130, 75)">
      <!-- Pure White Frosting Side -->
      <polygon points="40,210 300,225 300,70 40,60" fill="#f8fafc"/>
      <line x1="40" y1="135" x2="300" y2="148" stroke="#e2e8f0" stroke-width="3"/>

      <!-- Red Ribbon Motif around base -->
      <line x1="40" y1="195" x2="300" y2="210" stroke="#dc2626" stroke-width="12"/>

      <!-- Top White Face -->
      <polygon points="40,60 300,70 230,20 20,20" fill="#ffffff"/>
      <!-- Red Cream Roses -->
      <circle cx="90" cy="40" r="12" fill="#ef4444"/>
      <circle cx="160" cy="45" r="14" fill="#ef4444"/>
      <circle cx="220" cy="35" r="12" fill="#ef4444"/>
    </g>

    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#e2e8f0" text-anchor="middle" letter-spacing="2">PRAZDNICHNIY OQ TORT</text>
  </svg>`,

  'zebra_biskvit_tort.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="zbBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#261a15"/>
        <stop offset="100%" stop-color="#120c0a"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#zbBg)"/>
    <ellipse cx="300" cy="305" rx="210" ry="38" fill="rgba(0,0,0,0.65)"/>

    <g transform="translate(130, 75)">
      <!-- Base Sponge -->
      <polygon points="40,210 300,225 300,70 40,60" fill="#fef3c7"/>
      <!-- Zebra Dark Stripes -->
      <polygon points="40,75 300,88 300,98 40,85" fill="#451a03"/>
      <polygon points="40,115 300,128 300,138 40,125" fill="#451a03"/>
      <polygon points="40,155 300,168 300,178 40,165" fill="#451a03"/>
      <polygon points="40,195 300,208 300,218 40,205" fill="#451a03"/>

      <!-- Top Face Zebra Marble -->
      <polygon points="40,60 300,70 230,20 20,20" fill="#fde68a"/>
      <path d="M 40,50 Q 100,25 150,50 Q 200,25 260,55" stroke="#451a03" stroke-width="6" fill="none"/>
    </g>

    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="24" fill="#fde047" text-anchor="middle" letter-spacing="2">ZEBRA BISKVIT TORT</text>
  </svg>`,

  'yongoqli_qaymoqli_tort.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="nutBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2e2117"/>
        <stop offset="100%" stop-color="#140e0a"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#nutBg)"/>
    <ellipse cx="300" cy="305" rx="210" ry="38" fill="rgba(0,0,0,0.65)"/>

    <g transform="translate(130, 75)">
      <!-- Nut Cream Layers Side -->
      <polygon points="40,210 300,225 300,70 40,60" fill="#fffbeb"/>
      <line x1="40" y1="105" x2="300" y2="118" stroke="#d97706" stroke-width="6"/>
      <line x1="40" y1="155" x2="300" y2="168" stroke="#d97706" stroke-width="6"/>

      <!-- Top Face Cream with Hazelnuts & Caramel Drizzle -->
      <polygon points="40,60 300,70 230,20 20,20" fill="#fef3c7"/>
      
      <!-- Hazelnuts on top (NOT MACARONS!) -->
      <circle cx="80" cy="40" r="9" fill="#92400e"/>
      <circle cx="110" cy="48" r="8" fill="#b45309"/>
      <circle cx="140" cy="35" r="10" fill="#92400e"/>
      <circle cx="170" cy="45" r="8" fill="#b45309"/>
      <circle cx="200" cy="36" r="9" fill="#92400e"/>
      <circle cx="230" cy="48" r="8" fill="#b45309"/>
    </g>

    <text x="300" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="22" fill="#fef08a" text-anchor="middle" letter-spacing="1.5">YONG'OQLI QAYMOQLI TORT</text>
  </svg>`
};

for (const [filename, svgContent] of Object.entries(tortSvgs)) {
  const filePath = path.join(outDir, filename);
  fs.writeFileSync(filePath, svgContent, 'utf8');
  console.log(`[GENERATED] ${filename}`);
}

console.log('All 9 custom SVG cake graphics generated!');
