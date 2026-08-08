<script setup lang="ts">
import { AlertTriangle, Layers } from 'lucide-vue-next';

defineProps<{
  lowStockIngredients: {
    id: string;
    name: string;
    currentStock: number;
    unit: string;
  }[];
}>();
</script>

<template>
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle class="w-5 h-5 text-rose-500" />
          <span>Ombor Qoldig'i (Low Stock Alert)</span>
        </h3>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Kam qolgan va to'ldirilishi kerak bo'lgan masalliqlar</p>

      <div v-if="lowStockIngredients.length" class="space-y-3">
        <div 
          v-for="ing in lowStockIngredients" 
          :key="ing.id"
          class="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs"
        >
          <div class="flex justify-between font-bold text-slate-900 dark:text-white mb-1">
            <span>{{ ing.name }}</span>
            <span class="text-rose-500 font-mono">{{ ing.currentStock }} {{ ing.unit }}</span>
          </div>
          <div class="w-full bg-rose-200 dark:bg-rose-950/60 h-2 rounded-full overflow-hidden">
            <div 
              class="bg-rose-500 h-full rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(100, (ing.currentStock / 100) * 100)}%` }"
            ></div>
          </div>
        </div>
      </div>

      <div v-else class="p-6 text-center text-slate-400 text-xs font-medium">
        Barcha masalliqlar omborda yetarli darajada mavjud! ✅
      </div>
    </div>

    <div class="mt-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
      <span class="flex items-center gap-1.5"><Layers class="w-4 h-4 text-amber-500" /> Avto-spisaniya faol</span>
      <span class="font-bold text-emerald-500">100% Avtomatik</span>
    </div>
  </div>
</template>
