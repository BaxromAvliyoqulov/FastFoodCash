<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Product } from '../types/pos';
import { X, Scale, Calculator, Check, Banknote, ArrowRight } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  product: Product | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', product: Product, weightKg: number, totalSum: number): void;
}>();

const inputMode = ref<'MONEY' | 'WEIGHT'>('MONEY');
const targetMoneyInput = ref<number | null>(50000);
const targetWeightInput = ref<number | null>(0.500);

const pricePerKg = computed(() => props.product?.price || 0);

// Calculated weight in KG
const calculatedWeightKg = computed(() => {
  if (!pricePerKg.value) return 0;
  if (inputMode.value === 'MONEY') {
    const money = targetMoneyInput.value || 0;
    return Number((money / pricePerKg.value).toFixed(3));
  } else {
    return Number((targetWeightInput.value || 0).toFixed(3));
  }
});

// Calculated total sum in SO'M
const calculatedTotalSum = computed(() => {
  if (!pricePerKg.value) return 0;
  if (inputMode.value === 'MONEY') {
    return Math.round(targetMoneyInput.value || 0);
  } else {
    return Math.round((targetWeightInput.value || 0) * pricePerKg.value);
  }
});

// Formatted grams / kg string
const formattedWeightText = computed(() => {
  const kg = calculatedWeightKg.value;
  if (kg >= 1) {
    return `${kg} kg (${Math.round(kg * 1000)} gram)`;
  }
  return `${Math.round(kg * 1000)} gram (${kg} kg)`;
});

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.product) {
    targetMoneyInput.value = Math.min(100000, props.product.price);
    targetWeightInput.value = 0.500;
    inputMode.value = 'MONEY';
  }
});

function selectQuickMoney(amt: number) {
  inputMode.value = 'MONEY';
  targetMoneyInput.value = amt;
}

function selectQuickWeight(kg: number) {
  inputMode.value = 'WEIGHT';
  targetWeightInput.value = kg;
}

function handleConfirm() {
  if (!props.product || calculatedWeightKg.value <= 0) {
    alert("Og'irlik yoki pul summasini kiriting!");
    return;
  }
  emit('confirm', props.product, calculatedWeightKg.value, calculatedTotalSum.value);
}
</script>

<template>
  <div v-if="isOpen && product" class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 select-none">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-slate-100 transition-colors">
      
      <!-- ── Header (Sticky) ── -->
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 sm:py-4 shrink-0 bg-slate-50/50 dark:bg-slate-950/40">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold">
            <Scale class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
              <span>{{ product.name }}</span>
              <span class="text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-extrabold uppercase">TAROZI</span>
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">1 KG Narxi: <span class="font-bold text-amber-500 font-mono">{{ pricePerKg.toLocaleString('uz-UZ') }} so'm</span></p>
          </div>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <X class="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <!-- ── Scrollable Body ── -->
      <div class="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-3.5">
        <!-- Mode Switcher Tabs (MONEY vs WEIGHT) -->
        <div class="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800">
          <button 
            @click="inputMode = 'MONEY'"
            :class="[
              'flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer',
              inputMode === 'MONEY'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900'
            ]"
          >
            <Banknote class="w-4 h-4" />
            <span>Pul Summasi Bo'yicha</span>
          </button>

          <button 
            @click="inputMode = 'WEIGHT'"
            :class="[
              'flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer',
              inputMode === 'WEIGHT'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900'
            ]"
          >
            <Calculator class="w-4 h-4" />
            <span>Og'irlik (Kg / Gram)</span>
          </button>
        </div>

        <!-- Calculation Input Area -->
        <div class="bg-slate-50 dark:bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          
          <!-- MONEY INPUT MODE -->
          <div v-if="inputMode === 'MONEY'" class="space-y-2">
            <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mijoz Xohlagan Pul Summasi (so'm):</label>
            <input 
              type="number" 
              v-model="targetMoneyInput"
              class="w-full bg-white dark:bg-slate-900 border-2 border-amber-500/50 rounded-xl px-3.5 py-2.5 sm:py-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono outline-none focus:border-amber-500"
              placeholder="Masalan: 40000"
            />

            <!-- Quick Money Presets -->
            <div class="flex flex-wrap gap-1.5 pt-0.5">
              <button 
                v-for="amt in [20000, 30000, 40000, 50000, 70000, 100000]" 
                :key="amt"
                @click="selectQuickMoney(amt)"
                class="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-[11px] font-bold hover:border-amber-500 hover:text-amber-500 transition shadow-sm active:scale-95 cursor-pointer"
              >
                {{ amt.toLocaleString('uz-UZ') }} so'm
              </button>
            </div>
          </div>

          <!-- WEIGHT INPUT MODE -->
          <div v-else class="space-y-2">
            <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Og'irlik (Kg hisobida, masalan 0.500):</label>
            <input 
              type="number" 
              step="0.050"
              v-model="targetWeightInput"
              class="w-full bg-white dark:bg-slate-900 border-2 border-amber-500/50 rounded-xl px-3.5 py-2.5 sm:py-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono outline-none focus:border-amber-500"
              placeholder="0.500"
            />

            <!-- Quick Weight Presets -->
            <div class="flex flex-wrap gap-1.5 pt-0.5">
              <button 
                v-for="preset in [{ label: '100 g', kg: 0.100 }, { label: '250 g', kg: 0.250 }, { label: '500 g', kg: 0.500 }, { label: '750 g', kg: 0.750 }, { label: '1 kg', kg: 1.000 }, { label: '1.5 kg', kg: 1.500 }]" 
                :key="preset.label"
                @click="selectQuickWeight(preset.kg)"
                class="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-[11px] font-bold hover:border-amber-500 hover:text-amber-500 transition shadow-sm active:scale-95 cursor-pointer"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <!-- Dynamic Calculation Display Badge -->
          <div class="p-3 rounded-xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-600/15 border border-amber-500/30 flex flex-col items-center justify-center text-center space-y-0.5">
            <div class="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest flex items-center gap-1">
              <Scale class="w-3.5 h-3.5 text-amber-500" />
              <span>Kassada Hisoblangan Natija:</span>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-2 text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              <span class="text-amber-500">{{ calculatedTotalSum.toLocaleString('uz-UZ') }} so'm</span>
              <ArrowRight class="w-4 h-4 text-slate-400" />
              <span class="text-emerald-600 dark:text-emerald-400">{{ formattedWeightText }}</span>
            </div>
          </div>

        </div>
      </div>

      <!-- ── Footer Action Button (Sticky) ── -->
      <div class="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 shrink-0">
        <button 
          @click="handleConfirm"
          class="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3.5 rounded-2xl font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Check class="w-5 h-5 sm:w-6 sm:h-6" />
          <span>Savatchaga Qo'shish ({{ calculatedTotalSum.toLocaleString('uz-UZ') }} so'm)</span>
        </button>
      </div>

    </div>
  </div>
</template>
