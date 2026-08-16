<script setup lang="ts">
import { ref } from 'vue';
import { usePosStore } from '../../stores/posStore';
import { useToastStore } from '../../stores/toastStore';
import { Sparkles, X, Plus } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const posStore = usePosStore();
const toast = useToastStore();

const customName = ref('Maxsus Lavash');
const customPrice = ref<number | null>(65000);
const customNote = ref('50 sm katta o\'lcham');

const quickPricePresets = [35000, 45000, 55000, 60000, 65000, 70000, 80000, 100000];
const quickNamePresets = [
  '50 sm Lavash',
  'Katta Tandir Lavash',
  'Maxsus Burger',
  'Mega Hot-Dog',
  'Maxsus Donar',
  'Assorti Set'
];

function formatPriceInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const raw = target.value.replace(/\D/g, '');
  if (!raw) {
    customPrice.value = null;
    target.value = '';
    return;
  }
  target.value = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  customPrice.value = parseInt(raw, 10);
}

function handleAddCustomItem() {
  if (!customName.value.trim() || !customPrice.value || customPrice.value <= 0) {
    toast.warning('Iltimos, taom nomi va narxini kiriting!');
    return;
  }
  posStore.addCustomProduct(customName.value.trim(), customPrice.value, customNote.value.trim());
  emit('close');
  // Reset for next time
  customName.value = 'Maxsus Lavash';
  customPrice.value = 65000;
  customNote.value = '';
}
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-7 space-y-5"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center space-x-3">
            <div class="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
              <Sparkles class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-black text-lg text-slate-900 dark:text-white">
                Maxsus Taom / Erkin Narx
              </h3>
              <p class="text-xs text-slate-500">
                Menyuda yo'q taom yoki maxsus o'lcham (50 sm lavash va h.k.)
              </p>
            </div>
          </div>
          <button 
            @click="emit('close')" 
            class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body Inputs -->
        <div class="space-y-4">
          
          <!-- 1. Name Input & Presets -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Taom Nomi:
            </label>
            <input 
              type="text" 
              v-model="customName" 
              placeholder="Masalan: 50 sm Lavash..." 
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
            />
            
            <!-- Quick Name Chips -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              <button 
                v-for="name in quickNamePresets" 
                :key="name"
                type="button"
                @click="customName = name"
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              >
                {{ name }}
              </button>
            </div>
          </div>

          <!-- 2. Price Input & Presets -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Narxi (so'm):
            </label>
            <div class="relative">
              <input 
                type="text" 
                :value="customPrice ? customPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''"
                @input="formatPriceInput($event)"
                placeholder="Masalan: 65 000" 
                class="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-lg font-black font-mono text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">SO'M</span>
            </div>

            <!-- Quick Price Chips -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              <button 
                v-for="price in quickPricePresets" 
                :key="price"
                type="button"
                @click="customPrice = price"
                :class="[
                  'px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border',
                  customPrice === price 
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:border-amber-400'
                ]"
              >
                {{ (price / 1000) }}k
              </button>
            </div>
          </div>

          <!-- 3. Custom Note / Request -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Oshpaz uchun maxsus izoh (Ixtiyoriy):
            </label>
            <input 
              type="text" 
              v-model="customNote" 
              placeholder="Masalan: sousi ko'p, piyozsiz, achchiq emas..." 
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

        </div>

        <!-- Footer Actions -->
        <div class="flex items-center space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button 
            type="button" 
            @click="emit('close')" 
            class="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Bekor qilish
          </button>
          <button 
            type="button" 
            @click="handleAddCustomItem" 
            class="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>Savatchaga Qo'shish</span>
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>
