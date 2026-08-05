<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  catId: string;
  size?: 'sm' | 'md' | 'lg';
}>();

const iconSizeClass = computed(() => {
  if (props.size === 'sm') return 'w-4 h-4';
  if (props.size === 'lg') return 'w-7 h-7';
  return 'w-5 h-5';
});
</script>

<template>
  <span class="inline-flex items-center justify-center shrink-0">
    
    <!-- 1. Lavash SVG (Wrap Roll) -->
    <svg v-if="catId.includes('lavash')" :class="iconSizeClass" viewBox="0 0 32 32" fill="none">
      <path d="M6 12C6 8.68629 8.68629 6 12 6H20C23.3137 6 26 8.68629 26 12V20C26 23.3137 23.3137 26 20 26H12C8.68629 26 6 23.3137 6 20V12Z" fill="#F59E0B" />
      <path d="M9 11C9 9.34315 10.3431 8 12 8H20C21.6569 8 23 9.34315 23 11V14C23 15.6569 21.6569 17 20 17H12C10.3431 17 9 15.6569 9 14V11Z" fill="#FDE68A" />
      <path d="M11 21C11 19.8954 11.8954 19 13 19H19C20.1046 19 21 19.8954 21 21C21 22.1046 20.1046 23 19 23H13C11.8954 23 11 22.1046 11 21Z" fill="#DC2626" />
      <circle cx="15" cy="12.5" r="1.5" fill="#059669" />
      <circle cx="18" cy="12.5" r="1.5" fill="#D97706" />
    </svg>

    <!-- 2. Burger SVG (Cheeseburger) -->
    <svg v-else-if="catId.includes('burger')" :class="iconSizeClass" viewBox="0 0 32 32" fill="none">
      <!-- Top Sesame Bun -->
      <path d="M5 14C5 8.47715 9.47715 4 15 4H17C22.5228 4 27 8.47715 27 14V15H5V14Z" fill="#F59E0B" />
      <!-- Sesame seeds -->
      <circle cx="11" cy="8" r="1" fill="#FEF3C7" />
      <circle cx="16" cy="7" r="1" fill="#FEF3C7" />
      <circle cx="21" cy="9" r="1" fill="#FEF3C7" />
      <!-- Lettuce -->
      <path d="M4 17C5 15.5 7 15.5 8 17C9 18.5 11 18.5 12 17C13 15.5 15 15.5 16 17C17 18.5 19 18.5 20 17C21 15.5 23 15.5 24 17C25 18.5 27 18.5 28 17" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" />
      <!-- Melted Cheese -->
      <path d="M5 19H27L24 22H18L16 23L14 22H8L5 19Z" fill="#FBBF24" />
      <!-- Beef Patty -->
      <rect x="4" y="21" width="24" height="4" rx="2" fill="#78350F" />
      <!-- Bottom Bun -->
      <path d="M6 26H26C26 27.6569 24.6569 29 23 29H9C7.34315 29 6 27.6569 6 26Z" fill="#D97706" />
    </svg>

    <!-- 3. Hot Dog SVG -->
    <svg v-else-if="catId.includes('hotdog')" :class="iconSizeClass" viewBox="0 0 32 32" fill="none">
      <!-- Bun Left -->
      <rect x="4" y="10" width="8" height="16" rx="4" transform="rotate(-30 4 10)" fill="#F59E0B" />
      <!-- Bun Right -->
      <rect x="18" y="4" width="8" height="16" rx="4" transform="rotate(-30 18 4)" fill="#D97706" />
      <!-- Red Sausage -->
      <rect x="7" y="6" width="22" height="7" rx="3.5" transform="rotate(-30 7 6)" fill="#EF4444" />
      <!-- Mustard Wave -->
      <path d="M10 13C12 11 14 15 16 13C18 11 20 15 22 13" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" />
    </svg>

    <!-- 4. Qovurilganlar & Sneklar SVG (French Fries) -->
    <svg v-else-if="catId.includes('fried')" :class="iconSizeClass" viewBox="0 0 32 32" fill="none">
      <!-- Fries Sticks -->
      <rect x="8" y="4" width="3" height="16" rx="1.5" fill="#FBBF24" />
      <rect x="13" y="2" width="3" height="18" rx="1.5" fill="#F59E0B" />
      <rect x="18" y="5" width="3" height="15" rx="1.5" fill="#FBBF24" />
      <rect x="22" y="7" width="3" height="13" rx="1.5" fill="#F59E0B" />
      <!-- Red Box -->
      <path d="M6 14L8 28H24L26 14H6Z" fill="#DC2626" />
      <!-- Golden Star Crest -->
      <circle cx="16" cy="21" r="3.5" fill="#FBBF24" />
    </svg>

    <!-- 5. Pizza SVG -->
    <svg v-else-if="catId.includes('pizza')" :class="iconSizeClass" viewBox="0 0 32 32" fill="none">
      <!-- Pizza Crust Slice -->
      <path d="M16 4L28 26C28 26 22 29 16 29C10 29 4 26 4 26L16 4Z" fill="#F59E0B" />
      <path d="M16 7L26 24.5C26 24.5 21 27 16 27C11 27 6 24.5 6 24.5L16 7Z" fill="#FBBF24" />
      <!-- Pepperoni Slices -->
      <circle cx="16" cy="14" r="2.5" fill="#DC2626" />
      <circle cx="12" cy="20" r="2" fill="#DC2626" />
      <circle cx="19" cy="21" r="2" fill="#DC2626" />
      <circle cx="16" cy="24" r="1.5" fill="#059669" />
    </svg>

    <!-- 6. Salatlar SVG (Fresh Bowl) -->
    <svg v-else-if="catId.includes('salads')" :class="iconSizeClass" viewBox="0 0 32 32" fill="none">
      <!-- Bowl Base -->
      <path d="M4 14C4 14 5 26 16 26C27 26 28 14 28 14H4Z" fill="#3B82F6" />
      <!-- Salad Greens -->
      <circle cx="10" cy="12" r="5" fill="#10B981" />
      <circle cx="16" cy="10" r="6" fill="#059669" />
      <circle cx="22" cy="12" r="5" fill="#34D399" />
      <!-- Tomato & Corn -->
      <circle cx="13" cy="11" r="2" fill="#EF4444" />
      <circle cx="19" cy="11" r="1.5" fill="#FBBF24" />
    </svg>

    <!-- 7. Shirinliklar SVG (Cake) -->
    <svg v-else-if="catId.includes('desserts')" :class="iconSizeClass" viewBox="0 0 32 32" fill="none">
      <!-- Base Layer -->
      <rect x="5" y="18" width="22" height="9" rx="3" fill="#EC4899" />
      <!-- Cream Top Layer -->
      <path d="M5 18C6.5 16.5 8.5 16.5 10 18C11.5 19.5 13.5 19.5 15 18C16.5 16.5 18.5 16.5 20 18C21.5 19.5 23.5 19.5 25 18C26 17.5 27 18 27 18V20H5V18Z" fill="#FDF2F8" />
      <!-- Chocolate Middle -->
      <rect x="5" y="21" width="22" height="2" fill="#78350F" />
      <!-- Cherry Top -->
      <circle cx="16" cy="12" r="3.5" fill="#DC2626" />
      <path d="M16 12C16 9 19 7 21 6" stroke="#059669" stroke-width="1.5" stroke-linecap="round" />
    </svg>

    <!-- 8. Coffee Menu SVG -->
    <svg v-else-if="catId.includes('coffee')" :class="iconSizeClass" viewBox="0 0 32 32" fill="none">
      <!-- Coffee Cup -->
      <rect x="7" y="11" width="16" height="15" rx="5" fill="#78350F" />
      <!-- Cup Handle -->
      <path d="M23 14H25C26.6569 14 28 15.3431 28 17V19C28 20.6569 26.6569 22 25 22H23" stroke="#92400E" stroke-width="2.5" />
      <!-- Steaming Vapor Waves -->
      <path d="M10 7C10 5.5 11 5 11 4" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" />
      <path d="M15 7C15 5.5 16 5 16 4" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" />
      <path d="M20 7C20 5.5 21 5 21 4" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" />
    </svg>

    <!-- 9. Salqin Ichimliklar SVG (Soda Can / Glass with Ice) -->
    <svg v-else-if="catId.includes('drinks')" :class="iconSizeClass" viewBox="0 0 32 32" fill="none">
      <!-- Cold Glass Container -->
      <path d="M7 8L9 27C9 28.1046 9.89543 29 11 29H21C22.1046 29 23 28.1046 23 27L25 8H7Z" fill="#06B6D4" />
      <!-- Cola Drink Fluid -->
      <path d="M8 13L9 26C9 26.5523 9.44772 27 10 27H22C22.5523 27 23 26.5523 23 26L24 13H8Z" fill="#78350F" />
      <!-- Ice Cubes -->
      <rect x="11" y="15" width="4" height="4" rx="1" fill="#E0F2FE" opacity="0.8" />
      <rect x="17" y="17" width="4" height="4" rx="1" fill="#E0F2FE" opacity="0.8" />
      <!-- Red Straw -->
      <path d="M19 4L14 17" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" />
    </svg>

    <!-- 10. Energetik & Moxito SVG (Lightning Energy) -->
    <svg v-else-if="catId.includes('energy')" :class="iconSizeClass" viewBox="0 0 32 32" fill="none">
      <!-- Can Body -->
      <rect x="9" y="5" width="14" height="23" rx="4" fill="#6366F1" />
      <!-- Electric Yellow Lightning Bolt -->
      <path d="M17 7L11 16H16L15 25L21 16H16L17 7Z" fill="#FBBF24" />
    </svg>

    <!-- 11. Soklar / Sharbatlar SVG (Apple Juice) -->
    <svg v-else-if="catId.includes('juices')" :class="iconSizeClass" viewBox="0 0 32 32" fill="none">
      <!-- Apple Juice Body -->
      <path d="M16 11C11.5817 11 8 14.5817 8 19C8 23.4183 11.5817 27 16 27C20.4183 27 24 23.4183 24 19C24 14.5817 20.4183 11 16 11Z" fill="#EF4444" />
      <!-- Leaf -->
      <path d="M16 11C16 8 19 6 22 6C22 9 19 11 16 11Z" fill="#10B981" />
      <!-- Highlight -->
      <circle cx="12" cy="16" r="2" fill="#FCA5A5" opacity="0.7" />
    </svg>

    <!-- 12. Default Barcha Taomlar SVG (Chef Hat / Plate) -->
    <svg v-else :class="iconSizeClass" viewBox="0 0 32 32" fill="none">
      <!-- Plate -->
      <circle cx="16" cy="17" r="11" fill="#F59E0B" />
      <circle cx="16" cy="17" r="8" fill="#FEF3C7" />
      <!-- Fork & Spoon -->
      <path d="M12 12V22M12 12L10 16M12 12L14 16" stroke="#D97706" stroke-width="1.5" stroke-linecap="round" />
      <path d="M20 12V22M20 12C21.5 12 22 14 20 16" stroke="#D97706" stroke-width="1.5" stroke-linecap="round" />
    </svg>

  </span>
</template>
