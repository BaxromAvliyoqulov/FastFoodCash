<script setup lang="ts">
import { ref } from 'vue';
import { useToastStore } from '../stores/toastStore';
import { 
  Printer, 
  UtensilsCrossed, 
  CheckCircle2, 
  SlidersHorizontal,
  FileText,
  Zap
} from 'lucide-vue-next';

const toast = useToastStore();

const kassaPrinterEnabled = ref(
  localStorage.getItem('doston_pos_printer_kassa') !== 'false'
);
const kitchenPrinterEnabled = ref(
  localStorage.getItem('doston_pos_printer_kitchen') !== 'false'
);
const paperWidth = ref<'80mm' | '58mm'>(
  (localStorage.getItem('doston_pos_paper_width') as any) || '80mm'
);
const autoPrintOnSubmit = ref(
  localStorage.getItem('doston_pos_auto_print') !== 'false'
);

function saveSettings() {
  localStorage.setItem('doston_pos_printer_kassa', String(kassaPrinterEnabled.value));
  localStorage.setItem('doston_pos_printer_kitchen', String(kitchenPrinterEnabled.value));
  localStorage.setItem('doston_pos_paper_width', paperWidth.value);
  localStorage.setItem('doston_pos_auto_print', String(autoPrintOnSubmit.value));

  toast.success("Printer sozlamalari muvaffaqiyatli saqlandi! 🖨️");
}
</script>

<template>
  <div class="w-full min-h-full bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 space-y-6 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 dark:text-slate-100">
    
    <!-- Top Header -->
    <div class="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex items-center space-x-3">
        <div class="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
          <Printer class="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h2 class="text-xl font-black tracking-wide text-slate-900 dark:text-white">
            Printerlar Boshqaruvi va Sozlamalari
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Kassa va Oshxona chek printerlarini yoqish yoki o'chirish</p>
        </div>
      </div>

      <button 
        @click="saveSettings"
        class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black px-6 py-3 rounded-2xl flex items-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-xs cursor-pointer"
      >
        <CheckCircle2 class="w-4 h-4" />
        <span>Sozlamalarni Saqlash</span>
      </button>
    </div>

    <!-- Printer Controls Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- 1. KASSA PRINTERI (Receipt Printer) -->
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <FileText class="w-6 h-6" />
              </div>
              <div>
                <h3 class="font-black text-lg text-slate-900 dark:text-white">Kassa Printeri</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Mijoz uchun kassa cheki (Receipt)</p>
              </div>
            </div>

            <!-- Toggle Switch -->
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="kassaPrinterEnabled" class="sr-only peer" />
              <div class="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            Yoqilgan bo'lsa: Har safar buyurtma to'lanib yopilganda mijoz uchun <b>Kassa Cheki</b> chiqariladi.
          </p>
        </div>

        <div class="pt-2 flex items-center justify-between text-xs font-bold border-t border-slate-100 dark:border-slate-800">
          <span class="text-slate-500">Holat:</span>
          <span :class="kassaPrinterEnabled ? 'text-emerald-500' : 'text-rose-500'">
            {{ kassaPrinterEnabled ? '✅ FAOL (YOQILGAN)' : '❌ O\'CHIRILGAN' }}
          </span>
        </div>
      </div>

      <!-- 2. OSHXONA PRINTERI (Kitchen Printer) -->
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <UtensilsCrossed class="w-6 h-6" />
              </div>
              <div>
                <h3 class="font-black text-lg text-slate-900 dark:text-white">Oshxona Printeri</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Oshpazlar uchun kvitansiya (Kitchen Ticket)</p>
              </div>
            </div>

            <!-- Toggle Switch -->
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="kitchenPrinterEnabled" class="sr-only peer" />
              <div class="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            Yoqilgan bo'lsa: Yangi buyurtma urilganda oshxona (o'zi bilan / zal) kvitansiyasi oshpaz uchun avtomatik chiqariladi.
          </p>
        </div>

        <div class="pt-2 flex items-center justify-between text-xs font-bold border-t border-slate-100 dark:border-slate-800">
          <span class="text-slate-500">Holat:</span>
          <span :class="kitchenPrinterEnabled ? 'text-emerald-500' : 'text-rose-500'">
            {{ kitchenPrinterEnabled ? '✅ FAOL (YOQILGAN)' : '❌ O\'CHIRILGAN' }}
          </span>
        </div>
      </div>

    </div>

    <!-- Paper & Global Print Parameters -->
    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div class="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <SlidersHorizontal class="w-5 h-5 text-amber-500" />
        <h3 class="font-black text-base text-slate-900 dark:text-white">Qog'oz Eni va Avto-Chop Etish</h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        <!-- Paper Width Selector -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Chek Qog'ozi Eni:
          </label>
          <div class="flex space-x-3">
            <button 
              @click="paperWidth = '80mm'"
              :class="[
                'flex-1 py-3 px-4 rounded-2xl font-black text-xs border transition-all cursor-pointer',
                paperWidth === '80mm'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              ]"
            >
              80 mm (Standart Kassa)
            </button>
            <button 
              @click="paperWidth = '58mm'"
              :class="[
                'flex-1 py-3 px-4 rounded-2xl font-black text-xs border transition-all cursor-pointer',
                paperWidth === '58mm'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              ]"
            >
              58 mm (Kichik Kassa)
            </button>
          </div>
        </div>

        <!-- Auto Print Toggle -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Avto-Chop Etish (Direct Auto-Print):
          </label>
          <div 
            @click="autoPrintOnSubmit = !autoPrintOnSubmit"
            class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition"
          >
            <div class="flex items-center space-x-2">
              <Zap class="w-4 h-4 text-amber-500" />
              <span class="text-xs font-bold">To'lovdan keyin darhol oynasiz chop etish</span>
            </div>
            <span :class="autoPrintOnSubmit ? 'text-emerald-500 font-bold text-xs' : 'text-slate-400 text-xs'">
              {{ autoPrintOnSubmit ? 'Yoqilgan' : 'O\'chirilgan' }}
            </span>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>
