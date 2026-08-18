<script setup lang="ts">
import { ref } from 'vue';
import type { Product, Modifier } from '../types/pos';
import { X, Check } from 'lucide-vue-next';

defineProps<{
  product: Product;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', modifiers: Modifier[]): void;
}>();

const selectedModifiers = ref<Modifier[]>([]);

function toggleModifier(mod: Modifier) {
  const idx = selectedModifiers.value.findIndex(m => m.id === mod.id);
  if (idx > -1) {
    selectedModifiers.value.splice(idx, 1);
  } else {
    selectedModifiers.value.push(mod);
  }
}

function handleConfirm() {
  emit('confirm', selectedModifiers.value);
}
</script>

<template>
  <div class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 select-none">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-slate-100 transition-colors">
      
      <!-- Modal Header (Sticky) -->
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 shrink-0 bg-slate-50/50 dark:bg-slate-950/40">
        <div>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{{ product.name }}</h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">Modifikator va qo'shimchalarni tanlang</p>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modifiers List (Scrollable) -->
      <div class="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-2">
        <div 
          v-for="mod in product.availableModifiers" 
          :key="mod.id"
          @click="toggleModifier(mod)"
          :class="[
            'p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-200',
            selectedModifiers.some(m => m.id === mod.id)
              ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white font-bold shadow-sm'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          ]"
        >
          <div class="flex items-center space-x-3">
            <div :class="[
              'w-5 h-5 rounded-lg border flex items-center justify-center transition-colors',
              selectedModifiers.some(m => m.id === mod.id) ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 dark:border-slate-700'
            ]">
              <Check v-if="selectedModifiers.some(m => m.id === mod.id)" class="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span class="font-semibold text-xs sm:text-sm">{{ mod.name }}</span>
          </div>
          <span class="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">+{{ mod.price.toLocaleString('uz-UZ') }} so'm</span>
        </div>
      </div>

      <!-- Action Buttons (Sticky Footer) -->
      <div class="flex items-center space-x-3 p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 shrink-0">
        <button 
          @click="emit('close')"
          class="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          Bekor qilish
        </button>
        <button 
          @click="handleConfirm"
          class="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer"
        >
          Savatga qo'shish
        </button>
      </div>

    </div>
  </div>
</template>
