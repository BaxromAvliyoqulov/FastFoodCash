<script setup lang="ts">
import { usePosStore } from '../../stores/posStore';
import { Plus, Sparkles, Scale } from 'lucide-vue-next';
import type { Product } from '../../types/pos';

const emit = defineEmits<{
  (e: 'product-click', product: Product): void;
  (e: 'open-modifiers', product: Product, event: Event): void;
}>();

const posStore = usePosStore();

function isWeightedProduct(prod: Product): boolean {
  if (prod.isWeighted || prod.unit === 'KG') return true;
  const name = prod.name.toLowerCase();
  return name.includes('kg') || name.includes('baliq');
}
</script>

<template>
  <div class="flex-1 p-3 sm:p-4 overflow-y-auto min-h-0">
    <div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3 pb-16">
      <div
        v-for="prod in posStore.filteredProducts"
        :key="prod.id"
        @click="emit('product-click', prod)"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/50 rounded-3xl p-3 flex flex-col cursor-pointer group transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/8 hover:-translate-y-0.5 active:scale-[0.98] relative overflow-hidden"
      >
        <div class="relative h-28 sm:h-32 rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-950">
          <img :src="prod.imageUrl" :alt="prod.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          
          <!-- Weighted product badge -->
          <div v-if="isWeightedProduct(prod)" class="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-xl text-[10px] font-black border border-amber-400 flex items-center gap-1 shadow-md">
            <Scale class="w-3 h-3" />TAROZI (KG)
          </div>

          <button v-if="prod.availableModifiers?.length" @click.stop="emit('open-modifiers', prod, $event)" class="absolute top-2 right-2 bg-white/90 dark:bg-slate-950/85 backdrop-blur-sm px-2 py-0.5 rounded-xl text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 hover:bg-amber-500 hover:text-white transition-colors">
            <Sparkles class="w-3 h-3" />+Qo'shimcha
          </button>
          
          <div v-if="prod.isStopList" class="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
            <span class="text-xs font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-lg border border-rose-500/30">Stop-List</span>
          </div>
        </div>
        
        <div class="min-w-0 flex-1">
          <div class="text-[10px] uppercase tracking-wider font-extrabold text-amber-600 dark:text-amber-500 mb-0.5 truncate">{{ prod.categoryName }}</div>
          <h4 class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors truncate">{{ prod.name }}</h4>
        </div>
        
        <div class="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
          <span class="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
            {{ prod.price.toLocaleString('uz-UZ') }} so'm <span v-if="isWeightedProduct(prod)" class="text-[10px] font-normal text-slate-400">/kg</span>
          </span>
          <div class="w-7 h-7 rounded-xl bg-amber-500/10 group-hover:bg-amber-500 flex items-center justify-center transition-colors shrink-0">
            <Scale v-if="isWeightedProduct(prod)" class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:text-white transition-colors" />
            <Plus v-else class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
