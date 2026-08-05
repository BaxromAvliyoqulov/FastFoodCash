<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePosStore } from '../stores/posStore';
import { 
  Scale, 
  RefreshCw,
  Layers,
  Flame,
  ShieldAlert
} from 'lucide-vue-next';

import type { Ingredient } from '../types/pos';

const posStore = usePosStore();

// Physical Count Inputs
const physicalInputs = ref<Record<string, number>>({});

function getDiscrepancy(ingredientId: string, currentStock: number) {
  const actual = physicalInputs.value[ingredientId];
  if (actual === undefined || actual === null) return null;
  return actual - currentStock;
}

const revisionSummary = computed(() => {
  let totalDiscrepancyCost = 0;
  let alertCount = 0;

  posStore.ingredients.forEach((ing: Ingredient) => {
    const diff = getDiscrepancy(ing.id, ing.currentStock);
    if (diff !== null && diff < 0) {
      const lossCost = Math.abs(diff) * ing.costPerUnit;
      totalDiscrepancyCost += lossCost;
      if (Math.abs(diff) / (ing.currentStock || 1) > 0.05) {
        alertCount++;
      }
    }
  });

  return { totalDiscrepancyCost, alertCount };
});

function applyRevisionAdjustments() {
  let count = 0;
  posStore.ingredients.forEach((ing: Ingredient) => {
    const actual = physicalInputs.value[ing.id];
    if (actual !== undefined && actual !== null) {
      ing.currentStock = actual;
      count++;
    }
  });
  alert(`${count} ta ingrediyent fizik reviziya natijasida omborda yangilandi!`);
  physicalInputs.value = {};
}
</script>

<template>
  <div class="h-[calc(100vh-65px)] overflow-y-auto bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 space-y-6 sm:space-y-8 transition-colors duration-300">
    
    <!-- Header Title -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">Ombor & Ingrediyentlar Reviziyasi</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Smena reviziyasi: Tarozidagi fizik gramm sanoq vs Kutilayotgan retseptura qoldig'i</p>
      </div>

      <button 
        @click="applyRevisionAdjustments"
        class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center space-x-2 transition active:scale-95"
      >
        <RefreshCw class="w-4 h-4" />
        <span>Reviziya Natijalarini Tasdiqlash</span>
      </button>
    </div>

    <!-- Audit Radar Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm dark:shadow-xl">
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
          <span>Ingrediyentlar Turlari</span>
          <Layers class="w-4 h-4 text-amber-500" />
        </div>
        <div class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
          {{ posStore.ingredients.length }} xil
        </div>
        <div class="text-[11px] text-slate-500">Tizimda kuzatuvdagi ingrediyentlar</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm dark:shadow-xl">
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
          <span>Aniqlangan Moddiy Yo'qotish (Loss)</span>
          <Flame class="w-4 h-4 text-rose-500" />
        </div>
        <div class="text-xl sm:text-2xl font-black text-rose-500 dark:text-rose-400 font-mono">
          {{ revisionSummary.totalDiscrepancyCost.toLocaleString('uz-UZ') }} so'm
        </div>
        <div class="text-[11px] text-slate-500">Fizik sanoq va tizim qoldig'i o'rtasidagi pul farqi</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm dark:shadow-xl">
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
          <span>Anti-Fraud Shubhali Ogohlantirishlar</span>
          <ShieldAlert class="w-4 h-4 text-amber-500" />
        </div>
        <div class="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400 font-mono">
          {{ revisionSummary.alertCount }} ta alert
        </div>
        <div class="text-[11px] text-slate-500">Porsiya yoki retsepturadan me'yordan ortiq yo'qotish</div>
      </div>

    </div>

    <!-- Revision Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Scale class="w-5 h-5 text-amber-500" />
          <span>Ingrediyentlar Smena Reviziyasi Jadvali</span>
        </h3>
      </div>

      <div class="overflow-x-auto max-w-full">
        <table class="w-full text-left text-xs border-collapse min-w-[650px]">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <th class="py-3.5 px-4">Ingrediyent Nomi</th>
              <th class="py-3.5 px-4">O'lchov Birligi</th>
              <th class="py-3.5 px-4">Tizimdagi Qoldiq (System)</th>
              <th class="py-3.5 px-4">Fizik Sanalgan (Tarozi)</th>
              <th class="py-3.5 px-4">Farq (Variance)</th>
              <th class="py-3.5 px-4">Yo'qotish Qiymati (So'm)</th>
              <th class="py-3.5 px-4">Audit Holati</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-slate-700 dark:text-slate-300">
            <tr v-for="ing in posStore.ingredients" :key="ing.id" class="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition">
              <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-sans text-sm">{{ ing.name }}</td>
              <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-semibold">{{ ing.unit }}</td>
              <td class="py-3.5 px-4 text-amber-600 dark:text-amber-400 font-bold">
                {{ ing.currentStock.toFixed(3) }} {{ ing.unit }}
              </td>
              <td class="py-3.5 px-4">
                <input 
                  type="number" 
                  step="0.001"
                  v-model.number="physicalInputs[ing.id]"
                  placeholder="Tortilgan kg/g"
                  class="w-32 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white font-bold text-xs focus:border-amber-500 focus:outline-none"
                />
              </td>
              <td class="py-3.5 px-4">
                <span v-if="getDiscrepancy(ing.id, ing.currentStock) !== null" :class="[
                  'font-extrabold',
                  getDiscrepancy(ing.id, ing.currentStock)! < 0 ? 'text-rose-500' : 'text-emerald-500'
                ]">
                  {{ getDiscrepancy(ing.id, ing.currentStock)!.toFixed(3) }} {{ ing.unit }}
                </span>
                <span v-else class="text-slate-400 dark:text-slate-600">-</span>
              </td>
              <td class="py-3.5 px-4">
                <span v-if="getDiscrepancy(ing.id, ing.currentStock) !== null && getDiscrepancy(ing.id, ing.currentStock)! < 0" class="text-rose-500 font-bold">
                  {{ (Math.abs(getDiscrepancy(ing.id, ing.currentStock)!) * ing.costPerUnit).toLocaleString('uz-UZ') }} so'm
                </span>
                <span v-else class="text-slate-400 dark:text-slate-600">0 so'm</span>
              </td>
              <td class="py-3.5 px-4">
                <span v-if="getDiscrepancy(ing.id, ing.currentStock) !== null" :class="[
                  'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                  getDiscrepancy(ing.id, ing.currentStock)! < -0.1 ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-400' :
                  getDiscrepancy(ing.id, ing.currentStock)! > 0.1 ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400' :
                  'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 dark:text-emerald-400'
                ]">
                  {{ getDiscrepancy(ing.id, ing.currentStock)! < -0.1 ? 'Kamchilik' : getDiscrepancy(ing.id, ing.currentStock)! > 0.1 ? 'Ortiqcha' : 'Norma' }}
                </span>
                <span v-else class="text-slate-400 dark:text-slate-600 font-sans text-xs">Sanoq kutilmoqda</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>
