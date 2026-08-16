<script setup lang="ts">
import { usePosStore } from '../../stores/posStore';
import { ArrowLeft, Plus } from 'lucide-vue-next';
import CategoryIcon from '../CategoryIcon.vue';

defineEmits<{
  (e: 'change-tab', tab: string): void;
  (e: 'back-to-table-map'): void;
  (e: 'open-custom-product'): void;
}>();

const posStore = usePosStore();
</script>

<template>
  <div class="relative shrink-0 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/70 p-2.5 sm:p-3">
    
    <!-- Multi-column Auto-wrap Grid: Zero Horizontal Scroll -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-2.5">
      
      <!-- Back to Tables button (if in ZAL mode) -->
      <button 
        v-if="posStore.operationMode === 'ZAL'" 
        @click="$emit('back-to-table-map')" 
        class="h-[60px] sm:h-[64px] px-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-2.5 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
        title="Stol xaritasiga qaytish"
      >
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
          <ArrowLeft class="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300" />
        </div>
        <div class="min-w-0 flex-1 text-left">
          <h4 class="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate leading-tight">Stollar</h4>
          <p class="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 truncate">Xaritaga qaytish</p>
        </div>
      </button>

      <!-- Category Cards -->
      <button 
        v-for="cat in posStore.visibleCategories" 
        :key="cat.id" 
        @click="posStore.selectedCategory = cat.id" 
        :class="[
          'h-[60px] sm:h-[64px] p-2 sm:p-2.5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-2.5 sm:gap-3 text-left active:scale-[0.98] cursor-pointer shadow-sm',
          posStore.selectedCategory === cat.id 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/30' 
            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-md'
        ]"
      >
        <!-- Left Icon Box -->
        <div 
          :class="[
            'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-inner',
            posStore.selectedCategory === cat.id 
              ? 'bg-white/20 text-white' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          ]"
        >
          <CategoryIcon :cat-id="cat.id" size="lg" />
        </div>

        <!-- Right Content -->
        <div class="min-w-0 flex-1">
          <h4 
            :class="[
              'font-black text-xs sm:text-sm truncate leading-tight',
              posStore.selectedCategory === cat.id ? 'text-white' : 'text-slate-900 dark:text-white'
            ]"
          >
            {{ cat.name }}
          </h4>
          <p 
            :class="[
              'text-[10px] sm:text-[11px] font-semibold mt-0.5 truncate',
              posStore.selectedCategory === cat.id ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
            ]"
          >
            {{ cat.count }} ta taom mavjud
          </p>
        </div>
      </button>

      <!-- Quick Custom Food / Price Card -->
      <button 
        type="button"
        @click="$emit('open-custom-product')"
        class="h-[60px] sm:h-[64px] p-2 sm:p-2.5 rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 transition-all duration-200 flex items-center gap-2.5 sm:gap-3 text-left active:scale-[0.98] cursor-pointer shadow-sm hover:border-amber-500"
        title="Menyuda yo'q maxsus taom yoki erkin narx kiritish (50 sm lavash va h.k.)"
      >
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
          <Plus class="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="font-black text-xs sm:text-sm truncate leading-tight text-amber-700 dark:text-amber-300">
            Maxsus Taom
          </h4>
          <p class="text-[10px] sm:text-[11px] font-semibold mt-0.5 truncate text-amber-600/80 dark:text-amber-400/80">
            Erkin narx & 50sm
          </p>
        </div>
      </button>

    </div>

  </div>
</template>
