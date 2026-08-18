<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  catId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}>();

const iconSizeClass = computed(() => {
  if (props.size === 'sm') return 'w-4 h-4';
  if (props.size === 'lg') return 'w-7 h-7';
  if (props.size === 'xl') return 'w-10 h-10';
  return 'w-5 h-5';
});

const safeCatId = computed(() => (props.catId || '').toLowerCase());
</script>

<template>
  <span class="inline-flex items-center justify-center shrink-0 select-none drop-shadow-sm">
    
    <!-- 1. 🌯 PREMIUM 3D LAVASH (Tandir Gril Lavash with Fresh Fillings) -->
    <svg v-if="safeCatId.includes('lavash')" :class="iconSizeClass" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="pLavashBody" x1="10" y1="6" x2="38" y2="42" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FEF08A" />
          <stop offset="0.3" stop-color="#FDE047" />
          <stop offset="0.7" stop-color="#F59E0B" />
          <stop offset="1" stop-color="#D97706" />
        </linearGradient>
        <linearGradient id="pLavashCore" x1="16" y1="8" x2="32" y2="24" gradientUnits="userSpaceOnUse">
          <stop stop-color="#EF4444" />
          <stop offset="0.5" stop-color="#78350F" />
          <stop offset="1" stop-color="#10B981" />
        </linearGradient>
        <radialGradient id="pLavashShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#000" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#000" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Shadow -->
      <ellipse cx="24" cy="44" rx="14" ry="3" fill="url(#pLavashShadow)" />
      <!-- Wrap Roll Body -->
      <path d="M12 16C12 10.4772 16.4772 6 22 6H26C31.5228 6 36 10.4772 36 16V34C36 39.5228 31.5228 44 26 44H22C16.4772 44 12 39.5228 12 34V16Z" fill="url(#pLavashBody)" />
      <!-- Charcoal Grill Stripes -->
      <path d="M15 20L33 13M14 28L34 21M15 36L33 29" stroke="#92400E" stroke-width="2.2" stroke-linecap="round" opacity="0.6" />
      <!-- Top Filling Cross-Section -->
      <ellipse cx="24" cy="12" rx="9.5" ry="5" fill="url(#pLavashCore)" />
      <!-- Tender Beef Chunks & Veggies -->
      <circle cx="21" cy="11.5" r="2.2" fill="#881337" />
      <circle cx="27" cy="11" r="2" fill="#15803D" />
      <circle cx="23.5" cy="13.5" r="1.8" fill="#DC2626" />
      <circle cx="25.5" cy="10" r="1.5" fill="#FEF9C3" />
      <!-- Specular Gloss Sheen -->
      <path d="M14 18C15 22 15 30 14 36" stroke="#FEF9C3" stroke-width="2" stroke-linecap="round" opacity="0.8" />
      <!-- Outer Tortilla Fold Lip -->
      <path d="M12 24C17 28 31 28 36 24" stroke="#FEF08A" stroke-width="2" stroke-linecap="round" />
    </svg>

    <!-- 2. 🍔 PREMIUM 3D GOURMET BURGER (Layered Brioche Cheeseburger) -->
    <svg v-else-if="safeCatId.includes('burger') || safeCatId.includes('gamburger')" :class="iconSizeClass" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="pBunTop" x1="6" y1="4" x2="42" y2="20" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FDE047" />
          <stop offset="0.4" stop-color="#F59E0B" />
          <stop offset="1" stop-color="#B45309" />
        </linearGradient>
        <linearGradient id="pPatty" x1="6" y1="28" x2="42" y2="35" gradientUnits="userSpaceOnUse">
          <stop stop-color="#78350F" />
          <stop offset="0.5" stop-color="#451A03" />
          <stop offset="1" stop-color="#291104" />
        </linearGradient>
      </defs>
      <!-- Base Shadow -->
      <ellipse cx="24" cy="44" rx="16" ry="3" fill="#000" opacity="0.25" />
      <!-- Golden Brioche Top Bun -->
      <path d="M7 19C7 11.268 13.268 5 21 5H27C34.732 5 41 11.268 41 19V20H7V19Z" fill="url(#pBunTop)" />
      <!-- Bun Gloss Highlight -->
      <path d="M12 12C15 8.5 22 7 28 7" stroke="#FEF9C3" stroke-width="2" stroke-linecap="round" opacity="0.8" />
      <!-- Sesame Seeds with 3D Depth -->
      <ellipse cx="15" cy="12" rx="1.5" ry="0.9" fill="#FFFBEB" transform="rotate(-15 15 12)" />
      <ellipse cx="24" cy="9" rx="1.5" ry="0.9" fill="#FFFBEB" />
      <ellipse cx="33" cy="13" rx="1.5" ry="0.9" fill="#FFFBEB" transform="rotate(20 33 13)" />
      <ellipse cx="20" cy="16" rx="1.5" ry="0.9" fill="#FFFBEB" transform="rotate(10 20 16)" />
      <ellipse cx="29" cy="16.5" rx="1.5" ry="0.9" fill="#FFFBEB" transform="rotate(-10 29 16.5)" />
      <!-- Wavy Crispy Emerald Lettuce -->
      <path d="M5 22C7 20 9 20 11 22C13 24 15 24 17 22C19 20 21 20 23 22C25 24 27 24 29 22C31 20 33 20 35 22C37 24 39 24 41 22C43 20 44 21 44 22" stroke="#10B981" stroke-width="3.6" stroke-linecap="round" />
      <!-- Tomato Slices -->
      <rect x="8" y="24" width="14" height="3" rx="1.5" fill="#EF4444" />
      <rect x="26" y="24" width="14" height="3" rx="1.5" fill="#DC2626" />
      <!-- Melted Cheddar Drip Corners -->
      <path d="M6 25H42L38 30H30L27 32.5L24 30H15L12 32.5L9 30H6V25Z" fill="#FACC15" />
      <!-- Juicy Charbroiled Patty -->
      <rect x="5" y="29" width="38" height="6.5" rx="3.25" fill="url(#pPatty)" />
      <!-- Bottom Bun -->
      <path d="M8 37.5H40C40 40.5376 37.5376 43 34.5 43H13.5C10.4624 43 8 40.5376 8 37.5Z" fill="#D97706" />
      <line x1="8" y1="37.5" x2="40" y2="37.5" stroke="#FDE68A" stroke-width="1.2" />
    </svg>

    <!-- 3. 🌭 PREMIUM 3D HOT DOG (Brioche Roll & Grilled Sausage) -->
    <svg v-else-if="safeCatId.includes('hotdog') || safeCatId.includes('hot-dog') || safeCatId.includes('hot dog')" :class="iconSizeClass" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="pHotdogBun" x1="4" y1="18" x2="44" y2="36" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FDE047" />
          <stop offset="0.5" stop-color="#F59E0B" />
          <stop offset="1" stop-color="#B45309" />
        </linearGradient>
        <linearGradient id="pSausage" x1="2" y1="20" x2="46" y2="28" gradientUnits="userSpaceOnUse">
          <stop stop-color="#EF4444" />
          <stop offset="0.5" stop-color="#B91C1C" />
          <stop offset="1" stop-color="#7F1D1D" />
        </linearGradient>
      </defs>
      <!-- Base Shadow -->
      <ellipse cx="24" cy="42" rx="18" ry="3" fill="#000" opacity="0.25" />
      <!-- Soft Brioche Bun Base -->
      <rect x="4" y="22" width="40" height="16" rx="8" fill="url(#pHotdogBun)" />
      <!-- Juicy Grilled Beef Frank Sausage -->
      <rect x="2" y="16" width="44" height="14" rx="7" fill="url(#pSausage)" />
      <path d="M5 23C15 20 33 20 43 23" stroke="#F87171" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
      <!-- Zigzag Mustard Swirl -->
      <path d="M7 23C9 19 12 27 15 23C18 19 21 27 24 23C27 19 30 27 33 23C36 19 39 27 41 23" stroke="#FACC15" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <!-- Ketchup Drops -->
      <circle cx="10" cy="21" r="1.5" fill="#EF4444" />
      <circle cx="28" cy="21" r="1.5" fill="#EF4444" />
    </svg>

    <!-- 4. 🍟 PREMIUM 3D CRISPY FRIES (Golden French Fries in Classic Red Box) -->
    <svg v-else-if="safeCatId.includes('fries') || safeCatId.includes('fri') || safeCatId.includes('kartoshka')" :class="iconSizeClass" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="pFry" x1="12" y1="4" x2="12" y2="30" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FEF08A" />
          <stop offset="0.6" stop-color="#FACC15" />
          <stop offset="1" stop-color="#D97706" />
        </linearGradient>
      </defs>
      <!-- Golden Potato Fries -->
      <rect x="11" y="7" width="4.5" height="23" rx="2.25" transform="rotate(-6 11 7)" fill="url(#pFry)" />
      <rect x="18" y="4" width="4.5" height="26" rx="2.25" fill="#FEF08A" />
      <rect x="25" y="3" width="4.5" height="27" rx="2.25" fill="url(#pFry)" />
      <rect x="32" y="8" width="4.5" height="22" rx="2.25" transform="rotate(8 32 8)" fill="url(#pFry)" />
      <rect x="14" y="10" width="4" height="20" rx="2" transform="rotate(-12 14 10)" fill="#F59E0B" />
      <rect x="29" y="10" width="4" height="20" rx="2" transform="rotate(12 29 10)" fill="#FDE047" />
      <!-- Red Box Container -->
      <path d="M8 20L11 42H37L40 20C35 23.5 30 24 24 24C18 24 13 23.5 8 20Z" fill="#DC2626" />
      <!-- Box Highlight & Gold Star Medal -->
      <path d="M12 40L9.5 22" stroke="#EF4444" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="24" cy="33" r="5.5" fill="#FACC15" />
      <path d="M21 35.5L24 29L27 35.5" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

    <!-- 5. 🍕 PREMIUM 3D PIZZA SLICE (Supreme Pepperoni Mozzarella) -->
    <svg v-else-if="safeCatId.includes('pizza') || safeCatId.includes('pitsa')" :class="iconSizeClass" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="pPizzaCheese" x1="24" y1="8" x2="24" y2="40" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FEF9C3" />
          <stop offset="0.5" stop-color="#FACC15" />
          <stop offset="1" stop-color="#F59E0B" />
        </linearGradient>
      </defs>
      <!-- Thick Crust -->
      <path d="M24 5L41 37C41 37 33 42 24 42C15 42 7 37 7 37L24 5Z" fill="#B45309" />
      <!-- Molten Cheese Surface -->
      <path d="M24 9L38.5 35.5C38.5 35.5 32 39.5 24 39.5C16 39.5 9.5 35.5 9.5 35.5L24 9Z" fill="url(#pPizzaCheese)" />
      <!-- Baked Crust Rim Texture -->
      <path d="M8 37C14 41 34 41 40 37" stroke="#78350F" stroke-width="3" stroke-linecap="round" />
      <!-- Savory Pepperoni Disks -->
      <circle cx="24" cy="19" r="4" fill="#DC2626" />
      <circle cx="23.5" cy="18.5" r="1.5" fill="#FCA5A5" opacity="0.6" />
      <circle cx="17.5" cy="28" r="3.5" fill="#DC2626" />
      <circle cx="30" cy="29.5" r="3.8" fill="#DC2626" />
      <!-- Fresh Basil & Mushroom -->
      <ellipse cx="18" cy="19" rx="2" ry="3" transform="rotate(-30 18 19)" fill="#15803D" />
      <ellipse cx="29" cy="20.5" rx="2" ry="3" transform="rotate(35 29 20.5)" fill="#15803D" />
      <circle cx="24" cy="34" r="2" fill="#78350F" />
    </svg>

    <!-- 6. 🥗 PREMIUM 3D SALATLAR (Garden Fresh Avocado Bowl) -->
    <svg v-else-if="safeCatId.includes('salad') || safeCatId.includes('salat')" :class="iconSizeClass" viewBox="0 0 48 48" fill="none">
      <!-- Fresh Lettuce Bouquet -->
      <circle cx="15" cy="18" r="8" fill="#10B981" />
      <circle cx="24" cy="14" r="9.5" fill="#059669" />
      <circle cx="33" cy="18" r="8" fill="#34D399" />
      <!-- Cherry Tomatoes & Cucumber Slices -->
      <circle cx="18.5" cy="17" r="3.5" fill="#EF4444" />
      <circle cx="17.8" cy="16.2" r="1.2" fill="#FECACA" />
      <circle cx="28" cy="16" r="3" fill="#F59E0B" />
      <circle cx="32" cy="21" r="3.2" fill="#DC2626" />
      <ellipse cx="24" cy="20" rx="3" ry="2" fill="#84CC16" />
      <!-- Ceramic Sky Bowl with Depth -->
      <path d="M5 22C5 22 6.5 41 24 41C41.5 41 43 22 43 22H5Z" fill="#2563EB" />
      <path d="M5 22C5 22 13 25 24 25C35 25 43 22 43 22" stroke="#60A5FA" stroke-width="2.5" />
    </svg>

    <!-- 7. 🍰 PREMIUM 3D SHIRINLIKLAR / TORT (Velvet Strawberry Cream Cake) -->
    <svg v-else-if="safeCatId.includes('dessert') || safeCatId.includes('shirin') || safeCatId.includes('tort')" :class="iconSizeClass" viewBox="0 0 48 48" fill="none">
      <!-- Sponge Layer 1 -->
      <path d="M7 28H41V39C41 41.2091 39.2091 43 37 43H11C8.79086 43 7 41.2091 7 39V28Z" fill="#F472B6" />
      <!-- Cream Filling Strips -->
      <rect x="7" y="32" width="34" height="3" fill="#FFF1F2" />
      <rect x="7" y="36" width="34" height="2" fill="#831843" opacity="0.4" />
      <!-- White Whipped Vanilla Cream Wave -->
      <path d="M7 28C9.5 25.5 12.5 25.5 15 28C17.5 30.5 20.5 30.5 23 28C25.5 25.5 28.5 25.5 31 28C33.5 30.5 36.5 30.5 39 28C40.5 27 41 27.5 41 28V21H7V28Z" fill="#FFF1F2" />
      <!-- Ripe Glazed Strawberry Top -->
      <path d="M24 17C18.5 17 17 10.5 24 7.5C31 10.5 29.5 17 24 17Z" fill="#DC2626" />
      <circle cx="22.5" cy="12" r="0.8" fill="#FEF08A" />
      <circle cx="25.5" cy="12" r="0.8" fill="#FEF08A" />
      <circle cx="24" cy="14.5" r="0.8" fill="#FEF08A" />
      <path d="M24 7.5C22.5 5 25 2.5 28 3.5C29 6 26.5 7.5 24 7.5Z" fill="#15803D" />
    </svg>

    <!-- 8. ☕ PREMIUM 3D COFFEE MENU (Crema Espresso & Steam Waves) -->
    <svg v-else-if="safeCatId.includes('coffee') || safeCatId.includes('kofe') || safeCatId.includes('qahva')" :class="iconSizeClass" viewBox="0 0 48 48" fill="none">
      <!-- Saucer Plate -->
      <ellipse cx="23" cy="40" rx="19" ry="3.5" fill="#94A3B8" />
      <ellipse cx="23" cy="40" rx="14" ry="2" fill="#E2E8F0" />
      <!-- Ceramic Coffee Mug -->
      <path d="M8 17C8 17 9.5 37 23 37C36.5 37 38 17 38 17H8Z" fill="#78350F" />
      <!-- Velvety Crema Surface -->
      <ellipse cx="23" cy="17" rx="15" ry="5" fill="#D97706" />
      <ellipse cx="23" cy="17" rx="11" ry="3" fill="#B45309" />
      <ellipse cx="21" cy="16" rx="4" ry="1.5" fill="#FDE68A" opacity="0.7" />
      <!-- Cup Handle -->
      <path d="M35 20H40C42.7614 20 45 22.2386 45 25V27C45 29.7614 42.7614 32 40 32H34" stroke="#78350F" stroke-width="3.5" stroke-linecap="round" />
      <!-- Aromatic Rising Steam -->
      <path d="M15 11C15 8.5 17.5 7 17.5 4.5" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" opacity="0.9" />
      <path d="M23 10C23 7.5 25.5 6 25.5 3.5" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" />
      <path d="M31 11C31 8.5 33.5 7 33.5 4.5" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" opacity="0.9" />
    </svg>

    <!-- 9. 🥤 PREMIUM 3D SALQIN ICHIMLIKLAR (Icy Refreshing Cola Drink) -->
    <svg v-else-if="safeCatId.includes('drink') || safeCatId.includes('salqin') || safeCatId.includes('ichimlik') || safeCatId.includes('napitk')" :class="iconSizeClass" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="pDrinkGlass" x1="8" y1="12" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stop-color="#06B6D4" />
          <stop offset="1" stop-color="#2563EB" />
        </linearGradient>
      </defs>
      <!-- Candy Stripe Straw -->
      <path d="M30 4L22 20V40" stroke="#EF4444" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M30 4L27 10" stroke="#FFF" stroke-width="1.5" stroke-linecap="round" />
      <!-- Cold Glass Cup -->
      <path d="M9 13L13 40C13 42.2091 14.7909 44 17 44H31C33.2091 44 35 42.2091 35 40L39 13H9Z" fill="url(#pDrinkGlass)" opacity="0.85" />
      <!-- Dark Cola Fluid -->
      <path d="M11 20L13.8 39.5C13.8 40.5 14.8 41.5 16 41.5H32C33.2 41.5 34.2 40.5 34.2 39.5L37 20H11Z" fill="#1E293B" opacity="0.65" />
      <!-- Floating Crystal Ice Cubes -->
      <rect x="16" y="23" width="7" height="7" rx="2" fill="#E0F2FE" opacity="0.9" />
      <rect x="25" y="27" width="7" height="7" rx="2" fill="#E0F2FE" opacity="0.85" />
      <!-- Frosted Rim -->
      <ellipse cx="24" cy="13" rx="15" ry="3" fill="#BAE6FD" opacity="0.8" />
    </svg>

    <!-- 10. ⚡ PREMIUM 3D ENERGETIK & MOXITO (Neon Spark Energy Can) -->
    <svg v-else-if="safeCatId.includes('energy') || safeCatId.includes('energetik') || safeCatId.includes('moxito') || safeCatId.includes('mojito')" :class="iconSizeClass" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="pEnergyCan" x1="10" y1="5" x2="38" y2="43" gradientUnits="userSpaceOnUse">
          <stop stop-color="#818CF8" />
          <stop offset="0.5" stop-color="#4F46E5" />
          <stop offset="1" stop-color="#312E81" />
        </linearGradient>
      </defs>
      <!-- Metallic Can Body -->
      <rect x="12" y="7" width="24" height="35" rx="7" fill="url(#pEnergyCan)" />
      <!-- Top Metallic Lip -->
      <rect x="15" y="4.5" width="18" height="4" rx="2" fill="#E2E8F0" />
      <!-- High Voltage Lightning Bolt -->
      <path d="M26 9L15 24H24L21 39L33 23H24L26 9Z" fill="#FACC15" />
      <path d="M26 9L15 24H24L21 39L33 23H24L26 9Z" stroke="#FEF08A" stroke-width="1.8" />
      <!-- Fresh Mojito Lime -->
      <circle cx="32" cy="35" r="5" fill="#84CC16" />
      <circle cx="32" cy="35" r="3.2" fill="#BEF264" />
    </svg>

    <!-- 11. 🧃 PREMIUM 3D SOKLAR / SHARBATLAR (Juice Box Tetrapack) -->
    <svg v-else-if="safeCatId.includes('juice') || safeCatId.includes('sok') || safeCatId.includes('sharbat')" :class="iconSizeClass" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="pJuiceBox" x1="10" y1="8" x2="38" y2="42" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FB923C" />
          <stop offset="0.6" stop-color="#EA580C" />
          <stop offset="1" stop-color="#9A3412" />
        </linearGradient>
      </defs>
      <!-- Juice Box Body -->
      <rect x="11" y="11" width="26" height="32" rx="4.5" fill="url(#pJuiceBox)" />
      <path d="M11 15L24 10L37 15V11L24 6L11 11V15Z" fill="#FED7AA" />
      <!-- Juicy Orange Fruit Graphic -->
      <circle cx="24" cy="27" r="7" fill="#FEF08A" />
      <circle cx="24" cy="27" r="5.2" fill="#F97316" />
      <path d="M24 22V32M19 27H29M20 23L28 31M20 31L28 23" stroke="#FEF08A" stroke-width="1.2" />
      <!-- Flexi Straw -->
      <path d="M30 3L27 12" stroke="#F1F5F9" stroke-width="2.8" stroke-linecap="round" />
    </svg>

    <!-- 12. 👑 PREMIUM 3D ROYAL CHEF / BARCHA TAOMLAR -->
    <svg v-else :class="iconSizeClass" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="pPlate" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FDE047" />
          <stop offset="0.5" stop-color="#F59E0B" />
          <stop offset="1" stop-color="#B45309" />
        </linearGradient>
      </defs>
      <!-- Royal Gold Plate Base -->
      <circle cx="24" cy="24" r="19" fill="url(#pPlate)" />
      <circle cx="24" cy="24" r="14.5" fill="#FFFBEB" />
      <!-- Chef Toque Hat -->
      <path d="M16 25C14 25 12.5 22 14 19C13 16 16 12.5 19.5 13C21.5 10 26.5 10 28.5 13C32 12.5 35 16 34 19C35.5 22 34 25 32 25H16Z" fill="#F59E0B" />
      <rect x="16" y="25" width="16" height="4" rx="2" fill="#D97706" />
      <!-- Royal Diamond Sparkles -->
      <path d="M24 18L25.5 21L28.5 22.5L25.5 24L24 27L22.5 24L19.5 22.5L22.5 21L24 18Z" fill="#FFFBEB" />
    </svg>

  </span>
</template>
