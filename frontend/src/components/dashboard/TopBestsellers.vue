<script setup lang="ts">
import { Flame } from 'lucide-vue-next';

defineProps<{
  topBestsellers: {
    rank: number;
    name: string;
    category: string;
    price: number;
    soldCount: number;
    totalRevenue: number;
    imageUrl: string;
  }[];
}>();
</script>

<template>
  <div class="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
    <div class="flex items-center justify-between mb-5">
      <div>
        <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Flame class="w-5 h-5 text-amber-500" />
          <span>Eng Ko'p Sotilgan Top Taomlar (Bestsellers)</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">Ega bo'lingan sotuvlar soni va tushum hajmi bo'yicha</p>
      </div>
    </div>

    <div class="space-y-3">
      <div 
        v-for="item in topBestsellers" 
        :key="item.name"
        class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-amber-500/40 transition-all"
      >
        <div class="flex items-center space-x-3 min-w-0">
          <!-- Rank Badge -->
          <span 
            :class="[
              'w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0',
              item.rank === 1 ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' :
              item.rank === 2 ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white' :
              item.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            ]"
          >
            #{{ item.rank }}
          </span>

          <!-- Food Image & Name -->
          <img :src="item.imageUrl" :alt="item.name" class="w-11 h-11 rounded-xl object-cover shrink-0 bg-slate-200" />
          <div class="min-w-0">
            <div class="font-bold text-xs text-slate-900 dark:text-white truncate">{{ item.name }}</div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ item.category }} • {{ item.price.toLocaleString('uz-UZ') }} so'm</div>
          </div>
        </div>

        <!-- Units & Revenue -->
        <div class="text-right shrink-0 ml-3">
          <div class="font-black text-xs text-amber-600 dark:text-amber-400 font-mono">{{ item.totalRevenue.toLocaleString('uz-UZ') }} so'm</div>
          <div class="text-[10px] text-slate-500 font-medium">{{ item.soldCount }} ta sotildi</div>
        </div>
      </div>
    </div>
  </div>
</template>
