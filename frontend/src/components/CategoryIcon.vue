<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  catId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}>();

const iconSizeClass = computed(() => {
  if (props.size === 'sm') return 'w-4 h-4';
  if (props.size === 'lg') return 'w-7 h-7';
  if (props.size === 'xl') return 'w-9 h-9';
  return 'w-5 h-5';
});

const safeCatId = computed(() => (props.catId || '').toLowerCase());
</script>

<template>
  <span class="inline-flex items-center justify-center shrink-0 select-none">
    
    <!-- 1. 🌯 LAVASH SVG (Crispy Rolled Wrap with Fresh Fillings) -->
    <svg v-if="safeCatId.includes('lavash')" :class="iconSizeClass" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="lavashGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FDE68A" />
          <stop offset="0.5" stop-color="#F59E0B" />
          <stop offset="1" stop-color="#D97706" />
        </linearGradient>
        <linearGradient id="lavashFilling" x1="12" y1="6" x2="24" y2="18" gradientUnits="userSpaceOnUse">
          <stop stop-color="#EF4444" />
          <stop offset="0.6" stop-color="#78350F" />
          <stop offset="1" stop-color="#10B981" />
        </linearGradient>
      </defs>
      <!-- Wrap Body -->
      <path d="M8 12C8 7.58172 11.5817 4 16 4H20C24.4183 4 28 7.58172 28 12V24C28 28.4183 24.4183 32 20 32H16C11.5817 32 8 28.4183 8 24V12Z" fill="url(#lavashGrad)" />
      <!-- Grill Marks -->
      <path d="M11 15L25 10M11 21L25 16M11 27L25 22" stroke="#B45309" stroke-width="1.8" stroke-linecap="round" opacity="0.65" />
      <!-- Open Top / Fresh Meat & Greens Peeking -->
      <ellipse cx="18" cy="9" rx="7" ry="3.5" fill="url(#lavashFilling)" />
      <circle cx="15.5" cy="8.5" r="1.5" fill="#10B981" />
      <circle cx="19.5" cy="8" r="1.5" fill="#FEF08A" />
      <circle cx="17.5" cy="10" r="1.2" fill="#DC2626" />
      <!-- Outer Fold Detail -->
      <path d="M8 18C12 21 24 21 28 18" stroke="#FDE68A" stroke-width="1.5" stroke-linecap="round" opacity="0.8" />
    </svg>

    <!-- 2. 🍔 BURGER SVG (3D Layered Gourmet Cheeseburger) -->
    <svg v-else-if="safeCatId.includes('burger')" :class="iconSizeClass" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="bunTop" x1="4" y1="4" x2="32" y2="16" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FBBF24" />
          <stop offset="0.6" stop-color="#F59E0B" />
          <stop offset="1" stop-color="#D97706" />
        </linearGradient>
        <linearGradient id="pattyGrad" x1="4" y1="22" x2="32" y2="27" gradientUnits="userSpaceOnUse">
          <stop stop-color="#854D0E" />
          <stop offset="1" stop-color="#451A03" />
        </linearGradient>
      </defs>
      <!-- Top Bun -->
      <path d="M5 15C5 8.92487 9.92487 4 16 4H20C26.0751 4 31 8.92487 31 15V16H5V15Z" fill="url(#bunTop)" />
      <!-- Sesame Seeds -->
      <ellipse cx="11" cy="9" rx="1.2" ry="0.8" fill="#FFFBEB" transform="rotate(-15 11 9)" />
      <ellipse cx="18" cy="7" rx="1.2" ry="0.8" fill="#FFFBEB" />
      <ellipse cx="25" cy="9.5" rx="1.2" ry="0.8" fill="#FFFBEB" transform="rotate(20 25 9.5)" />
      <ellipse cx="15" cy="12" rx="1.2" ry="0.8" fill="#FFFBEB" transform="rotate(10 15 12)" />
      <ellipse cx="22" cy="12.5" rx="1.2" ry="0.8" fill="#FFFBEB" transform="rotate(-10 22 12.5)" />
      <!-- Fresh Curly Lettuce -->
      <path d="M4 17.5C5.5 16 7 16 8.5 17.5C10 19 11.5 19 13 17.5C14.5 16 16 16 17.5 17.5C19 19 20.5 19 22 17.5C23.5 16 25 16 26.5 17.5C28 19 29.5 19 31 17.5" stroke="#10B981" stroke-width="2.8" stroke-linecap="round" />
      <!-- Melted Cheddar Drop -->
      <path d="M5 19.5H31L28 23H22L20 24.5L18 23H11L9 24.5L7 23H5V19.5Z" fill="#FACC15" />
      <!-- Thick Grilled Beef Patty -->
      <rect x="4" y="22" width="28" height="5" rx="2.5" fill="url(#pattyGrad)" />
      <!-- Bottom Toasted Bun -->
      <path d="M6 28.5H30C30 30.7091 28.2091 32.5 26 32.5H10C7.79086 32.5 6 30.7091 6 28.5Z" fill="#D97706" />
      <line x1="6" y1="28.5" x2="30" y2="28.5" stroke="#FDE68A" stroke-width="1" />
    </svg>

    <!-- 3. 🌭 HOT DOG SVG (Brioche Roll & Flame Sausage) -->
    <svg v-else-if="safeCatId.includes('hotdog')" :class="iconSizeClass" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="sausageGrad" x1="8" y1="8" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stop-color="#F87171" />
          <stop offset="0.5" stop-color="#DC2626" />
          <stop offset="1" stop-color="#991B1B" />
        </linearGradient>
      </defs>
      <!-- Bun Back -->
      <rect x="6" y="14" width="24" height="12" rx="6" transform="rotate(-30 6 14)" fill="#D97706" opacity="0.9" />
      <!-- Grilled Red Sausage -->
      <rect x="4" y="16" width="30" height="9" rx="4.5" transform="rotate(-30 4 16)" fill="url(#sausageGrad)" />
      <!-- Sausage Highlights -->
      <path d="M7 26L28 14" stroke="#FECACA" stroke-width="1.2" stroke-linecap="round" opacity="0.6" />
      <!-- Bun Front -->
      <path d="M12 28C15 31 22 28 26 21L29 16C31 12 28 9 24 11L14 17C10 19 9 25 12 28Z" fill="#F59E0B" />
      <!-- Mustard Wave Zig-Zag -->
      <path d="M11 24C13 21 16 23 18 20C20 17 23 19 25 16" stroke="#FACC15" stroke-width="2.2" stroke-linecap="round" />
    </svg>

    <!-- 4. 🍟 QOVURILGANLAR & SNEKLAR SVG (Golden Crispy Fries) -->
    <svg v-else-if="safeCatId.includes('fried')" :class="iconSizeClass" viewBox="0 0 36 36" fill="none">
      <!-- Crispy Fries -->
      <rect x="9" y="5" width="3.5" height="18" rx="1.75" fill="#FDE047" />
      <rect x="14" y="3" width="3.5" height="20" rx="1.75" fill="#FACC15" />
      <rect x="19" y="2" width="3.5" height="21" rx="1.75" fill="#F59E0B" />
      <rect x="24" y="6" width="3.5" height="17" rx="1.75" fill="#FACC15" />
      <rect x="11" y="7" width="3" height="15" rx="1.5" transform="rotate(-8 11 7)" fill="#FEF08A" />
      <rect x="22" y="8" width="3" height="15" rx="1.5" transform="rotate(10 22 8)" fill="#F59E0B" />
      <!-- Red Box Container -->
      <path d="M6 16L8.5 32H27.5L30 16C26 18.5 22 19 18 19C14 19 10 18.5 6 16Z" fill="#DC2626" />
      <!-- Golden Crest Arc -->
      <circle cx="18" cy="25" r="4" fill="#FACC15" />
      <path d="M15.5 27L18 22L20.5 27" stroke="#DC2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

    <!-- 5. 🍕 PIZZA SVG (Italian Supreme Pizza Slice) -->
    <svg v-else-if="safeCatId.includes('pizza')" :class="iconSizeClass" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="cheeseGrad" x1="18" y1="7" x2="18" y2="30" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FEF08A" />
          <stop offset="0.6" stop-color="#FACC15" />
          <stop offset="1" stop-color="#F59E0B" />
        </linearGradient>
      </defs>
      <!-- Golden Crust -->
      <path d="M18 4L31 28C31 28 25 32 18 32C11 32 5 28 5 28L18 4Z" fill="#D97706" />
      <!-- Melty Cheese -->
      <path d="M18 7L29 27C29 27 24 30 18 30C12 30 7 27 7 27L18 7Z" fill="url(#cheeseGrad)" />
      <!-- Crust Rim Highlight -->
      <path d="M6 28C10 31 26 31 30 28" stroke="#B45309" stroke-width="2.5" stroke-linecap="round" />
      <!-- Pepperoni Discs -->
      <circle cx="18" cy="15" r="3" fill="#DC2626" />
      <circle cx="17.5" cy="14.5" r="1.2" fill="#F87171" opacity="0.6" />
      <circle cx="13" cy="22" r="2.6" fill="#DC2626" />
      <circle cx="22.5" cy="23" r="2.8" fill="#DC2626" />
      <!-- Basil Greens & Mushrooms -->
      <ellipse cx="14" cy="15" rx="1.5" ry="2.2" transform="rotate(-30 14 15)" fill="#10B981" />
      <ellipse cx="22" cy="16" rx="1.5" ry="2.2" transform="rotate(30 22 16)" fill="#10B981" />
      <circle cx="18" cy="26" r="1.5" fill="#78350F" />
    </svg>

    <!-- 6. 🥗 SALATLAR SVG (Fresh Garden Bowl with Veggies) -->
    <svg v-else-if="safeCatId.includes('salad')" :class="iconSizeClass" viewBox="0 0 36 36" fill="none">
      <!-- Fresh Greens Bouquet -->
      <circle cx="11" cy="14" r="6" fill="#10B981" />
      <circle cx="18" cy="11" r="7" fill="#059669" />
      <circle cx="25" cy="14" r="6" fill="#34D399" />
      <!-- Cherry Tomatoes & Cucumber -->
      <circle cx="14" cy="13" r="2.5" fill="#EF4444" />
      <circle cx="13.5" cy="12.5" r="0.8" fill="#FCA5A5" />
      <circle cx="21" cy="12" r="2.2" fill="#F59E0B" />
      <circle cx="24" cy="16" r="2.5" fill="#EF4444" />
      <ellipse cx="18" cy="15" rx="2" ry="1.5" fill="#84CC16" />
      <!-- Ceramic Bowl -->
      <path d="M4 17C4 17 5 31 18 31C31 31 32 17 32 17H4Z" fill="#3B82F6" />
      <path d="M4 17C4 17 10 19 18 19C26 19 32 17 32 17" stroke="#60A5FA" stroke-width="1.8" />
    </svg>

    <!-- 7. 🍰 SHIRINLIKLAR / TORTLAR SVG (Strawberry Layer Cake) -->
    <svg v-else-if="safeCatId.includes('dessert')" :class="iconSizeClass" viewBox="0 0 36 36" fill="none">
      <!-- Sponge Cake Layer 1 -->
      <path d="M5 21H31V29C31 30.6569 29.6569 32 28 32H8C6.34315 32 5 30.6569 5 29V21Z" fill="#F472B6" />
      <!-- Cream Filling Line -->
      <rect x="5" y="24" width="26" height="2" fill="#FFF1F2" />
      <!-- Chocolate Glaze -->
      <rect x="5" y="27" width="26" height="1.5" fill="#78350F" opacity="0.6" />
      <!-- Fluffy Cream Wave Layer -->
      <path d="M5 21C7 19.5 9 19.5 11 21C13 22.5 15 22.5 17 21C19 19.5 21 19.5 23 21C25 22.5 27 22.5 29 21C30 20.2 31 20.5 31 21V16H5V21Z" fill="#FFF1F2" />
      <!-- Top Strawberry -->
      <path d="M18 13C14 13 13 8 18 6C23 8 22 13 18 13Z" fill="#DC2626" />
      <circle cx="17" cy="9" r="0.6" fill="#FDE047" />
      <circle cx="19" cy="9" r="0.6" fill="#FDE047" />
      <circle cx="18" cy="11" r="0.6" fill="#FDE047" />
      <!-- Mint Leaf -->
      <path d="M18 6C17 4 19 2 21 3C22 5 20 6 18 6Z" fill="#10B981" />
    </svg>

    <!-- 8. ☕ COFFEE MENU SVG (Hot Steaming Espresso Cup) -->
    <svg v-else-if="safeCatId.includes('coffee')" :class="iconSizeClass" viewBox="0 0 36 36" fill="none">
      <!-- Saucer Base -->
      <ellipse cx="17" cy="30" rx="14" ry="2.5" fill="#94A3B8" />
      <ellipse cx="17" cy="30" rx="10" ry="1.5" fill="#CBD5E1" />
      <!-- Coffee Mug Body -->
      <path d="M6 13C6 13 7 28 17 28C27 28 28 13 28 13H6Z" fill="#78350F" />
      <!-- Golden Crema Surface -->
      <ellipse cx="17" cy="13" rx="11" ry="3.5" fill="#D97706" />
      <ellipse cx="17" cy="13" rx="8" ry="2.2" fill="#92400E" />
      <ellipse cx="15.5" cy="12.5" rx="3" ry="1" fill="#FDE68A" opacity="0.6" />
      <!-- Cup Handle -->
      <path d="M26 15H29C31.2091 15 33 16.7909 33 19V20C33 22.2091 31.2091 24 29 24H25" stroke="#78350F" stroke-width="2.5" stroke-linecap="round" />
      <!-- Steam Wisps -->
      <path d="M11 9C11 7 13 6 13 4" stroke="#F59E0B" stroke-width="1.8" stroke-linecap="round" opacity="0.85" />
      <path d="M17 8C17 6 19 5 19 3" stroke="#F59E0B" stroke-width="1.8" stroke-linecap="round" opacity="0.9" />
      <path d="M23 9C23 7 25 6 25 4" stroke="#F59E0B" stroke-width="1.8" stroke-linecap="round" opacity="0.85" />
    </svg>

    <!-- 9. 🥤 SALQIN ICHIMLIKLAR SVG (Ice Cold Drink with Straw) -->
    <svg v-else-if="safeCatId.includes('drink')" :class="iconSizeClass" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="drinkGlass" x1="6" y1="10" x2="30" y2="32" gradientUnits="userSpaceOnUse">
          <stop stop-color="#06B6D4" />
          <stop offset="1" stop-color="#3B82F6" />
        </linearGradient>
      </defs>
      <!-- Straw -->
      <path d="M22 3L16 16V30" stroke="#EF4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M22 3L20 7" stroke="#FEE2E2" stroke-width="1" />
      <!-- Glass Cup -->
      <path d="M7 10L10 30C10 31.6569 11.3431 33 13 33H23C24.6569 33 26 31.6569 26 30L29 10H7Z" fill="url(#drinkGlass)" opacity="0.9" />
      <!-- Liquid Level -->
      <path d="M8.5 15L10.5 29.5C10.5 30.5 11.5 31.5 12.5 31.5H23.5C24.5 31.5 25.5 30.5 25.5 29.5L27.5 15H8.5Z" fill="#1E293B" opacity="0.6" />
      <!-- Ice Cubes -->
      <rect x="12" y="17" width="5" height="5" rx="1.5" fill="#E0F2FE" opacity="0.9" />
      <rect x="18" y="20" width="5.5" height="5.5" rx="1.5" fill="#E0F2FE" opacity="0.8" />
      <circle cx="14" cy="27" r="1.2" fill="#BAE6FD" />
      <circle cx="21" cy="28" r="1" fill="#BAE6FD" />
      <!-- Glass Rim -->
      <ellipse cx="18" cy="10" rx="11" ry="2" fill="#E0F2FE" opacity="0.7" />
    </svg>

    <!-- 10. ⚡ ENERGETIK & MOXITO SVG (Neon Thunder Spark) -->
    <svg v-else-if="safeCatId.includes('energy')" :class="iconSizeClass" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="energyCan" x1="8" y1="4" x2="28" y2="32" gradientUnits="userSpaceOnUse">
          <stop stop-color="#6366F1" />
          <stop offset="0.6" stop-color="#4F46E5" />
          <stop offset="1" stop-color="#312E81" />
        </linearGradient>
      </defs>
      <!-- Can Body -->
      <rect x="9" y="5" width="18" height="26" rx="5" fill="url(#energyCan)" />
      <!-- Can Top Rim -->
      <rect x="11" y="3.5" width="14" height="3" rx="1.5" fill="#CBD5E1" />
      <!-- Electric Yellow Lightning Bolt -->
      <path d="M19 7L11 18H18L16 29L25 17H18L19 7Z" fill="#FACC15" />
      <!-- Energy Glow Aura -->
      <path d="M19 7L11 18H18L16 29L25 17H18L19 7Z" stroke="#FEF08A" stroke-width="1.2" opacity="0.8" />
      <!-- Lime Slice for Mojito -->
      <circle cx="24" cy="26" r="3.5" fill="#84CC16" />
      <circle cx="24" cy="26" r="2.2" fill="#BEF264" />
    </svg>

    <!-- 11. 🧃 SOKLAR / SHARBATLAR SVG (Fresh Fruit Juice Box) -->
    <svg v-else-if="safeCatId.includes('juice')" :class="iconSizeClass" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="juiceGrad" x1="8" y1="6" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stop-color="#F97316" />
          <stop offset="0.7" stop-color="#EA580C" />
          <stop offset="1" stop-color="#C2410C" />
        </linearGradient>
      </defs>
      <!-- Juice Box Tetrapack -->
      <rect x="9" y="8" width="18" height="23" rx="3.5" fill="url(#juiceGrad)" />
      <path d="M9 11L18 7L27 11V8L18 4L9 8V11Z" fill="#FED7AA" />
      <!-- Orange Fruit Graphic -->
      <circle cx="18" cy="20" r="5" fill="#FEF08A" />
      <circle cx="18" cy="20" r="3.8" fill="#F97316" />
      <path d="M18 16V24M14 20H22M15 17L21 23M15 23L21 17" stroke="#FEF08A" stroke-width="0.9" />
      <!-- Drinking Straw -->
      <path d="M22 2L20 9" stroke="#E2E8F0" stroke-width="2" stroke-linecap="round" />
    </svg>

    <!-- 12. 👑 DEFAULT / BARCHA TAOMLAR SVG (Royal Golden Fast-Food Crown & Plate) -->
    <svg v-else :class="iconSizeClass" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="plateGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FBBF24" />
          <stop offset="0.6" stop-color="#F59E0B" />
          <stop offset="1" stop-color="#D97706" />
        </linearGradient>
      </defs>
      <!-- Gold Plate Base -->
      <circle cx="18" cy="18" r="14" fill="url(#plateGrad)" />
      <circle cx="18" cy="18" r="10.5" fill="#FFFBEB" />
      <!-- Chef Toque Hat -->
      <path d="M12 18C10.5 18 9.5 16 10.5 14C10 11.5 12 9 14.5 9.5C16 7.5 20 7.5 21.5 9.5C24 9 26 11.5 25.5 14C26.5 16 25.5 18 24 18H12Z" fill="#F59E0B" />
      <rect x="12" y="18" width="12" height="3" rx="1.5" fill="#D97706" />
      <!-- Star Sparkle -->
      <path d="M18 13L19 15L21 16L19 17L18 19L17 17L15 16L17 15L18 13Z" fill="#FFFBEB" />
    </svg>

  </span>
</template>
