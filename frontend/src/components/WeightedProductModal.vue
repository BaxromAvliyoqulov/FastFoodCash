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
  <div v-if="isOpen && product" class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-slate-100 transition-colors">
      
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold">
            <Scale class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
              <span>{{ product.name }}</span>
              <span class="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-extrabold uppercase">TAROZI</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">1 KG Narxi: <span class="font-bold text-amber-500 font-mono">{{ pricePerKg.toLocaleString('uz-UZ') }} so'm</span></p>
          </div>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Mode Switcher Tabs (MONEY vs WEIGHT) -->
      <div class="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <button 
          @click="inputMode = 'MONEY'"
          :class="[
            'flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer',
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
            'flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer',
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
      <div class="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        
        <!-- MONEY INPUT MODE -->
        <div v-if="inputMode === 'MONEY'" class="space-y-3">
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mijoz Xohlagan Pul Summasi (so'm):</label>
          <input 
            type="number" 
            v-model="targetMoneyInput"
            class="w-full bg-white dark:bg-slate-900 border-2 border-amber-500/50 rounded-2xl px-4 py-3.5 text-2xl font-black text-slate-900 dark:text-white font-mono outline-none focus:border-amber-500"
            placeholder="Masalan: 40000"
          />

          <!-- Quick Money Presets -->
          <div class="flex flex-wrap gap-2 pt-1">
            <button 
              v-for="amt in [20000, 30000, 40000, 50000, 70000, 100000]" 
              :key="amt"
              @click="selectQuickMoney(amt)"
              class="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold hover:border-amber-500 hover:text-amber-500 transition shadow-sm active:scale-95 cursor-pointer"
            >
              {{ amt.toLocaleString('uz-UZ') }} so'm
            </button>
          </div>
        </div>

        <!-- WEIGHT INPUT MODE -->
        <div v-else class="space-y-3">
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Og'irlik (Kg hisobida, masalan 0.500):</label>
          <input 
            type="number" 
            step="0.050"
            v-model="targetWeightInput"
            class="w-full bg-white dark:bg-slate-900 border-2 border-amber-500/50 rounded-2xl px-4 py-3.5 text-2xl font-black text-slate-900 dark:text-white font-mono outline-none focus:border-amber-500"
            placeholder="0.500"
          />

          <!-- Quick Weight Presets -->
          <div class="flex flex-wrap gap-2 pt-1">
            <button 
              v-for="preset in [{ label: '100 g', kg: 0.100 }, { label: '250 g', kg: 0.250 }, { label: '500 g', kg: 0.500 }, { label: '750 g', kg: 0.750 }, { label: '1 kg', kg: 1.000 }, { label: '1.5 kg', kg: 1.500 }]" 
              :key="preset.label"
              @click="selectQuickWeight(preset.kg)"
              class="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold hover:border-amber-500 hover:text-amber-500 transition shadow-sm active:scale-95 cursor-pointer"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <!-- Dynamic Calculation Display Badge -->
        <div class="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-600/15 border border-amber-500/30 flex flex-col items-center justify-center text-center space-y-1">
          <div class="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest flex items-center gap-1.5">
            <Scale class="w-4 h-4 text-amber-500" />
            <span>Kassada Hisoblangan Natija:</span>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-2 text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
            <span class="text-amber-500">{{ calculatedTotalSum.toLocaleString('uz-UZ') }} so'm</span>
            <ArrowRight class="w-5 h-5 text-slate-400" />
            <span class="text-emerald-600 dark:text-emerald-400">{{ formattedWeightText }}</span>
          </div>
        </div>

      </div>

      <!-- Action Button -->
      <button 
        @click="handleConfirm"
        class="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
      >
        <Check class="w-6 h-6" />
        <span>Savatchaga Qo'shish ({{ calculatedTotalSum.toLocaleString('uz-UZ') }} so'm)</span>
      </button>

    </div>
  </div>
</template>
