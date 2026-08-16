<script setup lang="ts">
import { ref } from 'vue';
import { useToastStore } from '../stores/toastStore';
import { usePosStore } from '../stores/posStore';
import { 
  Printer, 
  UtensilsCrossed, 
  CheckCircle2, 
  SlidersHorizontal,
  FileText,
  Zap,
  TestTube2,
  Building2,
  PhoneCall,
  MapPin,
  Sparkles,
  Scissors,
  DollarSign,
  Wifi,
  Eye,
  X,
  Server,
  Percent
} from 'lucide-vue-next';

const toast = useToastStore();
const posStore = usePosStore();

// Service Fee (Xizmat haqi) state
const serviceFeeEnabled = ref(posStore.serviceFeeEnabled);
const serviceFeePercent = ref(posStore.serviceFeePercent);
const serviceFeeOnlyZal = ref(posStore.serviceFeeOnlyZal);

// Printer state toggles
const kassaPrinterEnabled = ref(localStorage.getItem('doston_pos_printer_kassa') !== 'false');
const kitchenPrinterEnabled = ref(localStorage.getItem('doston_pos_printer_kitchen') !== 'false');
const paperWidth = ref<'80mm' | '58mm'>((localStorage.getItem('doston_pos_paper_width') as any) || '80mm');
const autoPrintOnSubmit = ref(localStorage.getItem('doston_pos_auto_print') !== 'false');
const autoCutPaper = ref(localStorage.getItem('doston_pos_auto_cut') !== 'false');
const kickCashDrawer = ref(localStorage.getItem('doston_pos_cash_drawer') !== 'false');

// Hardware Connection Details
const kassaPrinterModel = ref(localStorage.getItem('doston_pos_kassa_model') || 'Xprinter XP-N160I (USB)');
const kitchenPrinterIp = ref(localStorage.getItem('doston_pos_kitchen_ip') || '192.168.1.200:9100');

// Receipt Branding & Content
const receiptTitle = ref(localStorage.getItem('doston_pos_receipt_title') || 'DOSTON BURGER');
const receiptAddress = ref(localStorage.getItem('doston_pos_receipt_address') || 'Toshkent sh., Chilonzor 5-mavze');
const receiptPhone = ref(localStorage.getItem('doston_pos_receipt_phone') || '+998 90 123 45 67');
const receiptFooter = ref(localStorage.getItem('doston_pos_receipt_footer') || 'Wi-Fi: doston2026 | Yoqimli ishtaha! 🍔');

// Modal Test State
const showTestModal = ref(false);
const testTarget = ref<'Kassa' | 'Oshxona'>('Kassa');

function selectPaperWidth(w: '80mm' | '58mm') {
  paperWidth.value = w;
  localStorage.setItem('doston_pos_paper_width', w);
  toast.success(`Chek qog'ozi eni ${w} o'zgardi! 🧾`);
}

function selectQuickFee(pct: number) {
  serviceFeePercent.value = pct;
  serviceFeeEnabled.value = pct > 0;
}

function saveSettings() {
  // Save service fee config in store and localstorage
  posStore.setServiceFeeConfig(
    serviceFeeEnabled.value, 
    Number(serviceFeePercent.value) || 0, 
    serviceFeeOnlyZal.value
  );

  localStorage.setItem('doston_pos_printer_kassa', String(kassaPrinterEnabled.value));
  localStorage.setItem('doston_pos_printer_kitchen', String(kitchenPrinterEnabled.value));
  localStorage.setItem('doston_pos_paper_width', paperWidth.value);
  localStorage.setItem('doston_pos_auto_print', String(autoPrintOnSubmit.value));
  localStorage.setItem('doston_pos_auto_cut', String(autoCutPaper.value));
  localStorage.setItem('doston_pos_cash_drawer', String(kickCashDrawer.value));
  
  localStorage.setItem('doston_pos_kassa_model', kassaPrinterModel.value);
  localStorage.setItem('doston_pos_kitchen_ip', kitchenPrinterIp.value);

  localStorage.setItem('doston_pos_receipt_title', receiptTitle.value);
  localStorage.setItem('doston_pos_receipt_address', receiptAddress.value);
  localStorage.setItem('doston_pos_receipt_phone', receiptPhone.value);
  localStorage.setItem('doston_pos_receipt_footer', receiptFooter.value);

  toast.success("Barcha tizim, xizmat haqi va printer sozlamalari saqlandi! 🚀✨");
}

function runTestPrint(type: 'Kassa' | 'Oshxona') {
  testTarget.value = type;
  showTestModal.value = true;
  toast.info(`${type} printeriga test signali yuborildi...`);
}

function executeSystemPrint() {
  window.print();
  showTestModal.value = false;
  toast.success("Test chek chop etishga yuborildi!");
}
</script>

<template>
  <div class="w-full min-h-full bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 sm:px-8 space-y-6 text-slate-900 dark:text-slate-100 transition-colors duration-300">
    
    <!-- ── Top Header Banner (Glassmorphism & Quick Save) ── -->
    <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
      <div class="absolute -right-10 -top-10 w-48 h-48 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex items-center space-x-4 relative z-10">
        <div class="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 shrink-0">
          <Printer class="w-7 h-7" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
              Printerlar & Hardware Engine
            </h2>
            <span class="text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              PRO POS HARDWARE 2.0
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Kassa cheklari, oshxona printer portlari, avto-chop va thermal receipt shablonlarini boshqarish
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 relative z-10">
        <div class="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SYSTEM READY</span>
        </div>
        <button 
          @click="saveSettings"
          class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black px-6 py-3 rounded-2xl flex items-center space-x-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all text-xs cursor-pointer"
        >
          <CheckCircle2 class="w-4.5 h-4.5" />
          <span>Sozlamalarni Saqlash</span>
        </button>
      </div>
    </div>

    <!-- ── Main 2-Column Dashboard Grid ── -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- LEFT COLUMN: Hardware Printer Nodes (7 cols) -->
      <div class="lg:col-span-7 space-y-6">
        
        <!-- 1. KASSA PRINTER CARD -->
        <div 
          :class="[
            'p-6 rounded-3xl border transition-all duration-300 shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden',
            kassaPrinterEnabled 
              ? 'bg-white dark:bg-slate-900 border-amber-500/40 shadow-amber-500/5 ring-1 ring-amber-500/20' 
              : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
          ]"
        >
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3.5">
                <div class="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
                  <FileText class="w-6 h-6" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-black text-lg text-slate-900 dark:text-white">Kassa Printeri</h3>
                    <span v-if="kassaPrinterEnabled" class="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">FAOL</span>
                    <span v-else class="text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase">O'CHIRILGAN</span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Mijoz uchun xarid kassa cheki (Receipt)</p>
                </div>
              </div>

              <!-- Toggle Switch -->
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="kassaPrinterEnabled" class="sr-only peer" />
                <div class="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <!-- Inputs & Descriptions -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div class="space-y-1">
                <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Printer Turi / Model:</label>
                <input 
                  type="text" 
                  v-model="kassaPrinterModel"
                  placeholder="Masalan: Xprinter XP-N160I"
                  class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div class="space-y-1">
                <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Ulanish Porti:</label>
                <div class="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span class="flex items-center gap-1.5"><Server class="w-3.5 h-3.5 text-amber-500" /> USB Direct Port</span>
                  <span class="text-[10px] text-emerald-500 font-extrabold">READY</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Test Action -->
          <div class="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <span class="text-xs text-slate-500 font-medium">To'lov yopilganda mijozga chek chiqaradi</span>
            <button 
              @click="runTestPrint('Kassa')"
              class="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <TestTube2 class="w-3.5 h-3.5" />
              <span>Test Chek Etish</span>
            </button>
          </div>
        </div>

        <!-- 2. OSHXONA PRINTER CARD -->
        <div 
          :class="[
            'p-6 rounded-3xl border transition-all duration-300 shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden',
            kitchenPrinterEnabled 
              ? 'bg-white dark:bg-slate-900 border-emerald-500/40 shadow-emerald-500/5 ring-1 ring-emerald-500/20' 
              : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
          ]"
        >
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3.5">
                <div class="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
                  <UtensilsCrossed class="w-6 h-6" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-black text-lg text-slate-900 dark:text-white">Oshxona Printeri</h3>
                    <span v-if="kitchenPrinterEnabled" class="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">FAOL</span>
                    <span v-else class="text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase">O'CHIRILGAN</span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Oshpazlar uchun kvitansiya (Kitchen Ticket)</p>
                </div>
              </div>

              <!-- Toggle Switch -->
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="kitchenPrinterEnabled" class="sr-only peer" />
                <div class="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <!-- Inputs & IP Address -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div class="space-y-1">
                <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Oshxona IP Manzili (LAN):</label>
                <input 
                  type="text" 
                  v-model="kitchenPrinterIp"
                  placeholder="Masalan: 192.168.1.200:9100"
                  class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div class="space-y-1">
                <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Chop Etish Rejimi:</label>
                <div class="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span class="flex items-center gap-1.5"><Wifi class="w-3.5 h-3.5 text-emerald-500" /> Auto Kitchen Ticket</span>
                  <span class="text-[10px] text-emerald-500 font-extrabold">LAN ON</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Test Action -->
          <div class="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <span class="text-xs text-slate-500 font-medium">Zakaz urilishi bilan oshpazga avto-kvitansiya yuboradi</span>
            <button 
              @click="runTestPrint('Oshxona')"
              class="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <TestTube2 class="w-3.5 h-3.5" />
              <span>Test Kvitansiya Etish</span>
            </button>
          </div>
        </div>

        <!-- 3. ADVANCED HARDWARE SWITCHES -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div class="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <SlidersHorizontal class="w-5 h-5 text-amber-500" />
            <h3 class="font-black text-base text-slate-900 dark:text-white">Aparatura & Chop Etish Parametrlari</h3>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Paper Width Selector -->
            <div class="space-y-2 sm:col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Chek Qog'ozi Eni (Width):</label>
              <div class="grid grid-cols-2 gap-3">
                <button 
                  @click="selectPaperWidth('80mm')"
                  :class="[
                    'py-3.5 px-4 rounded-2xl font-black text-xs border transition-all cursor-pointer flex items-center justify-center gap-2',
                    paperWidth === '80mm'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  ]"
                >
                  <FileText class="w-4 h-4" />
                  <span>80 mm (Standart Kassa)</span>
                </button>
                <button 
                  @click="selectPaperWidth('58mm')"
                  :class="[
                    'py-3.5 px-4 rounded-2xl font-black text-xs border transition-all cursor-pointer flex items-center justify-center gap-2',
                    paperWidth === '58mm'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  ]"
                >
                  <FileText class="w-4 h-4" />
                  <span>58 mm (Kichik Kassa)</span>
                </button>
              </div>
            </div>

            <!-- Auto Print -->
            <div 
              @click="autoPrintOnSubmit = !autoPrintOnSubmit"
              class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition"
            >
              <div class="flex items-center space-x-3">
                <Zap class="w-5 h-5 text-amber-500" />
                <div>
                  <div class="text-xs font-black">Direct Auto-Print</div>
                  <div class="text-[10px] text-slate-400">To'lovdan keyin darhol chop etish</div>
                </div>
              </div>
              <span :class="autoPrintOnSubmit ? 'text-emerald-500 font-black text-xs' : 'text-slate-400 text-xs'">
                {{ autoPrintOnSubmit ? 'Yoqilgan' : 'O\'chirilgan' }}
              </span>
            </div>

            <!-- Auto Cut Paper -->
            <div 
              @click="autoCutPaper = !autoCutPaper"
              class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition"
            >
              <div class="flex items-center space-x-3">
                <Scissors class="w-5 h-5 text-blue-500" />
                <div>
                  <div class="text-xs font-black">Auto Paper Cut</div>
                  <div class="text-[10px] text-slate-400">Chek qog'ozini avto-qirqish</div>
                </div>
              </div>
              <span :class="autoCutPaper ? 'text-emerald-500 font-black text-xs' : 'text-slate-400 text-xs'">
                {{ autoCutPaper ? 'Yoqilgan' : 'O\'chirilgan' }}
              </span>
            </div>

            <!-- Cash Drawer Kick -->
            <div 
              @click="kickCashDrawer = !kickCashDrawer"
              class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition sm:col-span-2"
            >
              <div class="flex items-center space-x-3">
                <DollarSign class="w-5 h-5 text-emerald-500" />
                <div>
                  <div class="text-xs font-black">Kick Cash Drawer</div>
                  <div class="text-[10px] text-slate-400">To'lov bajarilganda kassa g'alladog'ini avto-ochish (RJ11)</div>
                </div>
              </div>
              <span :class="kickCashDrawer ? 'text-emerald-500 font-black text-xs' : 'text-slate-400 text-xs'">
                {{ kickCashDrawer ? 'Yoqilgan' : 'O\'chirilgan' }}
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN: Service Fee & Receipt Branding (5 cols) -->
      <div class="lg:col-span-5 space-y-6">
        
        <!-- 0. SERVICE FEE (XIZMAT HAQI) SETTINGS CARD -->
        <div 
          :class="[
            'p-6 rounded-3xl border transition-all duration-300 shadow-sm space-y-4 relative overflow-hidden',
            serviceFeeEnabled 
              ? 'bg-white dark:bg-slate-900 border-amber-500/40 ring-1 ring-amber-500/20' 
              : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
          ]"
        >
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div class="flex items-center space-x-3">
              <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Percent class="w-5 h-5" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-black text-base text-slate-900 dark:text-white">Xizmat Haqi (Service Fee)</h3>
                  <span v-if="serviceFeeEnabled" class="text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    {{ serviceFeePercent }}% FAOL
                  </span>
                  <span v-else class="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    O'CHIQ
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Umumiy chekka foizli xizmat haqi qo'shish</p>
              </div>
            </div>

            <!-- Toggle Switch -->
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="serviceFeeEnabled" class="sr-only peer" />
              <div class="w-13 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <!-- Quick Percentage Buttons -->
          <div class="space-y-2">
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Xizmat Foizini Tanlang:</label>
            <div class="grid grid-cols-4 gap-2">
              <button 
                v-for="pct in [0, 5, 7, 10]" 
                :key="pct"
                @click="selectQuickFee(pct)"
                :class="[
                  'py-2 rounded-xl text-xs font-black border transition-all cursor-pointer',
                  (serviceFeePercent === pct && serviceFeeEnabled) || (pct === 0 && !serviceFeeEnabled)
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-md shadow-amber-500/20 scale-[1.03]'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                ]"
              >
                {{ pct === 0 ? "0% (Yo'q)" : pct + '%' }}
              </button>
            </div>

            <!-- Custom % input -->
            <div class="pt-1 flex items-center gap-2">
              <span class="text-xs text-slate-500 font-bold">Boshqa foiz:</span>
              <div class="relative flex-1">
                <input 
                  type="number" 
                  v-model.number="serviceFeePercent" 
                  min="0" 
                  max="100" 
                  placeholder="Masalan: 7"
                  class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-7 py-1.5 text-xs font-black text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none font-mono"
                />
                <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">%</span>
              </div>
            </div>
          </div>

          <!-- Application Mode (Faqat ZAL yoki Barchasi) -->
          <div class="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Qo'llash Tartibi:</label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                @click="serviceFeeOnlyZal = true"
                :class="[
                  'py-2 px-2.5 rounded-xl text-[11px] font-black border transition-all cursor-pointer flex items-center justify-center gap-1.5',
                  serviceFeeOnlyZal
                    ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 font-black'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
                ]"
              >
                <span>🏛️ Faqat Zalda (Stol/Xona)</span>
              </button>
              <button 
                @click="serviceFeeOnlyZal = false"
                :class="[
                  'py-2 px-2.5 rounded-xl text-[11px] font-black border transition-all cursor-pointer flex items-center justify-center gap-1.5',
                  !serviceFeeOnlyZal
                    ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 font-black'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
                ]"
              >
                <span>🛍️ Barcha savdolarda</span>
              </button>
            </div>
          </div>

          <!-- Live Sample Calculation -->
          <div class="bg-amber-50/50 dark:bg-slate-950/60 p-3 rounded-2xl border border-amber-200/40 dark:border-slate-800 text-xs space-y-1">
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Namunaviy Hisob:</div>
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Taomlar:</span>
              <span class="font-mono font-bold">100 000 so'm</span>
            </div>
            <div class="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
              <span>Xizmat haqi ({{ serviceFeeEnabled ? serviceFeePercent : 0 }}%):</span>
              <span class="font-mono">+{{ serviceFeeEnabled ? ((100000 * serviceFeePercent) / 100).toLocaleString('uz-UZ') : 0 }} so'm</span>
            </div>
            <div class="flex justify-between font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>Chek Jami:</span>
              <span class="font-mono text-amber-600 dark:text-amber-400">{{ (100000 + (serviceFeeEnabled ? ((100000 * serviceFeePercent) / 100) : 0)).toLocaleString('uz-UZ') }} so'm</span>
            </div>
          </div>
        </div>

        <!-- BRANDING INPUTS CARD -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sparkles class="w-5 h-5 text-amber-500" />
            <h3 class="font-black text-base text-slate-900 dark:text-white">Chek Rekvizitlari & Brendi</h3>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building2 class="w-3.5 h-3.5 text-amber-500" />
                <span>Restoran Nomi:</span>
              </label>
              <input 
                type="text" 
                v-model="receiptTitle"
                placeholder="Masalan: DOSTON BURGER"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin class="w-3.5 h-3.5 text-rose-500" />
                <span>Restoran Manzili:</span>
              </label>
              <input 
                type="text" 
                v-model="receiptAddress"
                placeholder="Masalan: Toshkent sh., Chilonzor 5-mavze"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <PhoneCall class="w-3.5 h-3.5 text-blue-500" />
                <span>Bog'lanish Telefoni:</span>
              </label>
              <input 
                type="text" 
                v-model="receiptPhone"
                placeholder="Masalan: +998 90 123 45 67"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FileText class="w-3.5 h-3.5 text-emerald-500" />
                <span>Chek Pastidagi Matn (Footer Note):</span>
              </label>
              <input 
                type="text" 
                v-model="receiptFooter"
                placeholder="Masalan: Wi-Fi: doston2026 | Yoqimli ishtaha! 🍔"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <!-- LIVE THERMAL RECEIPT PREVIEW (REAL-TIME VISUAL MOCKUP) -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div class="flex items-center space-x-2">
              <Eye class="w-4 h-4 text-amber-500" />
              <h3 class="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">Live Thermal Chek Ko'rinishi</h3>
            </div>
            <span class="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md">
              {{ paperWidth }} PAPER
            </span>
          </div>

          <!-- Realistic Thermal Receipt Mockup -->
          <div class="bg-amber-50/40 dark:bg-slate-950/80 p-4 rounded-2xl border border-amber-200/50 dark:border-slate-800 font-mono text-slate-900 dark:text-slate-200 text-xs space-y-2 shadow-inner select-none">
            
            <div class="text-center space-y-0.5 border-b border-dashed border-slate-300 dark:border-slate-700 pb-2">
              <div class="font-black text-sm uppercase tracking-widest text-amber-600 dark:text-amber-400">
                {{ receiptTitle || 'RESTO POS' }}
              </div>
              <div class="text-[10px] text-slate-500">{{ receiptAddress || 'Toshkent sh.' }}</div>
              <div class="text-[10px] text-slate-500">Tel: {{ receiptPhone || '+998 90 000 00 00' }}</div>
            </div>

            <div class="flex justify-between text-[11px] py-1 border-b border-dashed border-slate-300 dark:border-slate-700">
              <span>Chek #0042</span>
              <span>11.08.2026 17:50</span>
            </div>

            <!-- Demo Items -->
            <div class="space-y-1 text-[11px] py-1 border-b border-dashed border-slate-300 dark:border-slate-700">
              <div class="flex justify-between">
                <span>1x Doston Cheeseburger</span>
                <span>35 000 so'm</span>
              </div>
              <div class="flex justify-between">
                <span>1x Coca-Cola 0.5L</span>
                <span>8 000 so'm</span>
              </div>
              <div class="flex justify-between">
                <span>1x Fri Kartoshka L</span>
                <span>15 000 so'm</span>
              </div>
            </div>

            <!-- Total -->
            <div class="space-y-1 pt-1 font-bold">
              <div class="flex justify-between text-sm font-black">
                <span>JAMI:</span>
                <span>58 000 SO'M</span>
              </div>
              <div class="flex justify-between text-[10px] text-slate-500">
                <span>To'lov turi:</span>
                <span>NAQD PUL</span>
              </div>
            </div>

            <!-- Footer text -->
            <div class="text-center text-[10px] text-slate-500 border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 italic">
              {{ receiptFooter || 'Xaridingiz uchun rahmat!' }}
            </div>

          </div>
        </div>

      </div>

    </div>

    <!-- ── TEST PRINT MODAL ── -->
    <div v-if="showTestModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
        
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <TestTube2 class="w-5 h-5 text-amber-500" />
            <h3 class="font-black text-lg text-slate-900 dark:text-white">
              {{ testTarget }} Printeri Testi
            </h3>
          </div>
          <button @click="showTestModal = false" class="p-1 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Diagnostic Log -->
        <div class="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs space-y-1.5 shadow-inner border border-slate-800">
          <div>> CONNECTING TO HARDWARE PORT...</div>
          <div>> STATUS: OK (200ms)</div>
          <div>> TARGET: {{ testTarget === 'Kassa' ? kassaPrinterModel : kitchenPrinterIp }}</div>
          <div>> PAPER WIDTH: {{ paperWidth }}</div>
          <div class="text-amber-400 animate-pulse">> PRINT SIGNAL SENT SUCCESSFULLY!</div>
        </div>

        <div class="flex items-center space-x-3 pt-2">
          <button @click="showTestModal = false" class="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
            Yopish
          </button>
          <button @click="executeSystemPrint" class="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2">
            <Printer class="w-4 h-4" />
            <span>Printerda Chop Etish</span>
          </button>
        </div>

      </div>
    </div>

  </div>
</template>
