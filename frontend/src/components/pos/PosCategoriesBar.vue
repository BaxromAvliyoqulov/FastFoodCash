<script setup lang="ts">
import { usePosStore } from '../../stores/posStore';
import { ArrowLeft } from 'lucide-vue-next';
import CategoryIcon from '../CategoryIcon.vue';

defineEmits<{
  (e: 'change-tab', tab: string): void;
  (e: 'back-to-table-map'): void;
}>();

const posStore = usePosStore();
</script>

<template>
  <div class="relative shrink-0 border-b border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 py-2.5 px-3 flex items-start gap-2">
    <button v-if="posStore.operationMode === 'ZAL'" @click="$emit('back-to-table-map')" class="shrink-0 w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm" title="Stol xaritasiga qaytish">
      <ArrowLeft class="w-4 h-4" />
    </button>
    <div class="flex-1 flex flex-wrap gap-2">
      <button v-for="cat in posStore.visibleCategories" :key="cat.id" @click="posStore.selectedCategory = cat.id" :class="['px-3.5 py-1.5 rounded-2xl font-bold text-xs transition-all flex items-center space-x-1.5 whitespace-nowrap shrink-0 active:scale-95 cursor-pointer', posStore.selectedCategory === cat.id ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-amber-400']">
        <CategoryIcon :cat-id="cat.id" size="sm" />
        <span>{{ cat.name }}</span>
        <span :class="['text-[10px] px-1.5 py-0.5 rounded-full font-mono', posStore.selectedCategory === cat.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500']">{{ cat.count }}</span>
      </button>
    </div>
  </div>
</template>
