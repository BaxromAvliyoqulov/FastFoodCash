<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePosStore } from '../stores/posStore';
import { useToastStore } from '../stores/toastStore';
import { formatMoney } from '../utils/formatters';
import { 
  Package, 
  AlertTriangle,
  Layers,
  ArrowDownToLine,
  CheckCircle2,
  TrendingDown,
  X,
  ShieldAlert
} from 'lucide-vue-next';

const posStore = usePosStore();
const toast = useToastStore();
const searchQuery = ref('');

// Modals state
const showIntakeModal = ref(false);
const showWasteModal = ref(false);

// Intake Form
const intakeIngredientId = ref('');
const intakeQuantity = ref<number | null>(null);
const intakeCostPerUnit = ref<number | null>(null);

// Waste Form
const wasteIngredientId = ref('');
const wasteQuantity = ref<number | null>(null);
const wasteReason = ref('Sroki o\'tgan / Buzilgan');

// Mock Audit Logs
const auditLogs = ref([
  { id: 'log-101', time: '14:20', cashier: 'Kassir 1', action: 'Gamburger sotildi (Bulochka va Kotlet -1 spisan)', riskLevel: 'LOW' },
  { id: 'log-102', time: '13:05', cashier: 'Admin', action: 'Chesse Burger retsepti o\'zgartirildi', riskLevel: 'MEDIUM' },
  { id: 'log-103', time: '11:45', cashier: 'Kassir 2', action: 'Smena yopilishida 5,000 so\'m kamomad', riskLevel: 'HIGH' },
]);

onMounted(() => {
  posStore.checkLowStockAlerts(toast);
});

const ingredients = computed(() => posStore.ingredients);

const filteredIngredients = computed(() => {
  if (!searchQuery.value) return ingredients.value;
  return ingredients.value.filter(ing => 
    ing.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

function getStockStatus(current: number, min: number | undefined) {
  if (!min) return { label: 'Joyida', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
  if (current <= min) return { label: 'Tugamoqda', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30 shadow-[0_0_10px_rgba(225,29,72,0.3)]' };
  if (current <= min * 1.5) return { label: 'O\'rtacha', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
  return { label: 'Yetarli', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
}

function handleIntakeSubmit() {
  if (!intakeIngredientId.value || !intakeQuantity.value || intakeQuantity.value <= 0) {
    toast.warning('Iltimos, ingrediyent va to\'g\'ri miqdorni kiriting!');
    return;
  }
  const ing = posStore.ingredients.find(i => i.id === intakeIngredientId.value);
  if (ing) {
    ing.currentStock += Number(intakeQuantity.value);
    if (intakeCostPerUnit.value) ing.costPerUnit = Number(intakeCostPerUnit.value);
    toast.success(`✅ Omborga ${ing.name} (+${intakeQuantity.value} ${ing.unit}) kirim qilindi!`);
    
    // Log audit
    auditLogs.value.unshift({
      id: 'log-' + Date.now().toString().slice(-4),
      time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      cashier: 'Admin (Ombormon)',
      action: `Ombor kirimi: ${ing.name} (+${intakeQuantity.value} ${ing.unit})`,
      riskLevel: 'LOW'
    });

    intakeIngredientId.value = '';
    intakeQuantity.value = null;
    intakeCostPerUnit.value = null;
    showIntakeModal.value = false;
  }
}

function handleWasteSubmit() {
  if (!wasteIngredientId.value || !wasteQuantity.value || wasteQuantity.value <= 0) {
    toast.warning('Iltimos, ingrediyent va isrof miqdorini kiriting!');
    return;
  }
  const ing = posStore.ingredients.find(i => i.id === wasteIngredientId.value);
  if (ing) {
    ing.currentStock = Math.max(0, ing.currentStock - Number(wasteQuantity.value));
    toast.error(`⚠️ ${ing.name} (-${wasteQuantity.value} ${ing.unit}) isrofga chiqarildi! Sabab: ${wasteReason.value}`);
    
    // Log audit
    auditLogs.value.unshift({
      id: 'log-' + Date.now().toString().slice(-4),
      time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      cashier: 'Admin (Ombormon)',
      action: `Isrof/Brak: ${ing.name} (-${wasteQuantity.value} ${ing.unit}) — ${wasteReason.value}`,
      riskLevel: 'HIGH'
    });

    wasteIngredientId.value = '';
    wasteQuantity.value = null;
    showWasteModal.value = false;
  }
}
</script>

<template>
  <div class="h-[calc(100vh-65px)] overflow-y-auto bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 space-y-6 sm:space-y-8 transition-colors duration-300">
    
    <!-- Header Title & Action Buttons -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">Ombor Zaxiralari & Kirim-Chiqim (Warehouse & BOM)</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Restorandagi joriy ingrediyentlar qoldig'i, kirim qilish va brak hisoboti</p>
      </div>

      <div class="flex items-center space-x-3">
        <button 
          @click="showWasteModal = true"
          class="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/20 flex items-center space-x-2 transition active:scale-95"
        >
          <TrendingDown class="w-4 h-4" />
          <span>Isrof / Brak Chiqarish</span>
        </button>

        <button 
          @click="showIntakeModal = true"
          class="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 flex items-center space-x-2 transition active:scale-95"
        >
          <ArrowDownToLine class="w-4 h-4" />
          <span>Yangi Mahsulot Qabul Qilish (Kirim)</span>
        </button>
      </div>
    </div>

    <!-- Audit Radar Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm dark:shadow-xl relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition"></div>
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold relative z-10">
          <span>Jami Ingrediyentlar</span>
          <Layers class="w-4 h-4 text-indigo-500" />
        </div>
        <div class="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono relative z-10">
          {{ posStore.ingredients.length }} xil
        </div>
        <div class="text-[11px] text-slate-500 relative z-10">Retseptura uchun omborda mavjud ingrediyentlar</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm dark:shadow-xl relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition"></div>
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold relative z-10">
          <span>Tugayotgan Mahsulotlar</span>
          <AlertTriangle class="w-4 h-4 text-rose-500" />
        </div>
        <div class="text-xl sm:text-3xl font-black text-rose-500 dark:text-rose-400 font-mono relative z-10">
          {{ posStore.lowStockIngredients.length }} ta
        </div>
        <div class="text-[11px] text-slate-500 relative z-10">Zaxirasi minimal darajadan past bo'lganlar</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm dark:shadow-xl relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition"></div>
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold relative z-10">
          <span>Sog'lom Zaxiralar</span>
          <CheckCircle2 class="w-4 h-4 text-emerald-500" />
        </div>
        <div class="text-xl sm:text-3xl font-black text-emerald-500 dark:text-emerald-400 font-mono relative z-10">
          {{ posStore.ingredients.length - posStore.lowStockIngredients.length }} ta
        </div>
        <div class="text-[11px] text-slate-500 relative z-10">Zaxirasi yetarli bo'lgan mahsulotlar</div>
      </div>

    </div>

    <!-- Inventory Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Package class="w-5 h-5 text-indigo-500" />
          <span>Hozirgi Ombor Qoldig'i & Retseptura Spisaniyesi</span>
        </h3>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Mahsulot qidirish..." 
          class="w-full sm:w-64 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none transition-all dark:text-white placeholder:text-slate-400"
        />
      </div>

      <div class="overflow-x-auto max-w-full">
        <table class="w-full text-left text-xs border-separate border-spacing-y-3 min-w-[750px]">
          <thead>
            <tr class="text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold text-[10px] px-4">
              <th class="pb-2 px-4 font-semibold">Mahsulot Nomi</th>
              <th class="pb-2 px-4 font-semibold text-center">O'lchov Birligi</th>
              <th class="pb-2 px-4 font-semibold text-center">Tannarx (birlik)</th>
              <th class="pb-2 px-4 font-semibold text-center">Minimal Chegara</th>
              <th class="pb-2 px-4 font-semibold text-center">Hozirgi Qoldiq</th>
              <th class="pb-2 px-4 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody class="font-mono text-slate-700 dark:text-slate-300">
            <tr v-for="ing in filteredIngredients" :key="ing.id" 
                class="bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md group rounded-2xl">
              
              <!-- Nomi -->
              <td class="py-4 px-4 font-bold text-slate-900 dark:text-white font-sans text-sm rounded-l-2xl">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors">
                    <Package class="w-4 h-4" />
                  </div>
                  <span>{{ ing.name }}</span>
                </div>
              </td>
              
              <!-- O'lchov -->
              <td class="py-4 px-4 text-center font-bold font-sans">
                <span class="bg-slate-200/50 dark:bg-slate-700/50 px-2.5 py-1 rounded-lg text-[10px] text-slate-600 dark:text-slate-300">
                  {{ ing.unit }}
                </span>
              </td>

              <!-- Tannarx -->
              <td class="py-4 px-4 text-center font-bold text-amber-600 dark:text-amber-400 font-mono">
                {{ formatMoney(ing.costPerUnit || 0) }} so'm
              </td>

              <!-- Minimal -->
              <td class="py-4 px-4 text-center text-slate-500 font-mono">
                {{ ing.minThreshold || 0 }} {{ ing.unit }}
              </td>

              <!-- Qoldiq -->
              <td class="py-4 px-4 text-center font-black text-sm font-mono">
                <span :class="ing.minThreshold && ing.currentStock <= ing.minThreshold ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-slate-900 dark:text-white'">
                  {{ ing.currentStock }} {{ ing.unit }}
                </span>
              </td>

              <!-- Status -->
              <td class="py-4 px-4 text-center rounded-r-2xl">
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold border" :class="getStockStatus(ing.currentStock, ing.minThreshold).color">
                  {{ getStockStatus(ing.currentStock, ing.minThreshold).label }}
                </span>
              </td>
            </tr>

            <tr v-if="filteredIngredients.length === 0">
              <td colspan="6" class="py-8 text-center text-slate-500 dark:text-slate-400 font-sans">
                Ingrediyentlar topilmadi
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Anti-Fraud Audit Log Section -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert class="w-5 h-5 text-amber-500" />
          <span>Anti-Fraud Radar & Spisaniya Loglari</span>
        </h3>
        <span class="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full font-bold">Real-time Radar</span>
      </div>

      <div class="space-y-2">
        <div v-for="log in auditLogs" :key="log.id" class="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-xs">
          <div class="flex items-center space-x-3">
            <span class="font-mono text-slate-400">{{ log.time }}</span>
            <span class="font-bold text-slate-700 dark:text-slate-300">{{ log.cashier }}:</span>
            <span class="text-slate-900 dark:text-white font-medium">{{ log.action }}</span>
          </div>
          <span :class="['px-2 py-0.5 rounded text-[9px] font-black uppercase', log.riskLevel === 'HIGH' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500']">
            {{ log.riskLevel }} RISK
          </span>
        </div>
      </div>
    </div>

    <!-- INTAKE MODAL -->
    <Teleport to="body">
      <div v-if="showIntakeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 class="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowDownToLine class="w-5 h-5 text-indigo-500" />
              <span>Omborga Mahsulot Kirim Qilish</span>
            </h3>
            <button @click="showIntakeModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleIntakeSubmit" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ingrediyent Tanlang</label>
              <select v-model="intakeIngredientId" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500">
                <option value="" disabled>-- Tanlang --</option>
                <option v-for="ing in posStore.ingredients" :key="ing.id" :value="ing.id">
                  {{ ing.name }} (Hozir: {{ ing.currentStock }} {{ ing.unit }})
                </option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kelgan Miqdori (Qo'shiladi)</label>
              <input v-model.number="intakeQuantity" type="number" step="any" placeholder="Masalan: 50" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Yangi Birlik Tannarxi (so'mda - Ixtiyoriy)</label>
              <input v-model.number="intakeCostPerUnit" type="number" placeholder="Masalan: 3500" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <div class="flex space-x-3 pt-2">
              <button type="submit" class="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-indigo-500/25 transition">
                Kirimni Saqlash
              </button>
              <button type="button" @click="showIntakeModal = false" class="px-5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-2xl">
                Bekor Qilish
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- WASTE MODAL -->
    <Teleport to="body">
      <div v-if="showWasteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 class="font-black text-lg text-rose-500 flex items-center gap-2">
              <TrendingDown class="w-5 h-5 text-rose-500" />
              <span>Isrof / Brak Spisaniya Qilish</span>
            </h3>
            <button @click="showWasteModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleWasteSubmit" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ingrediyent Tanlang</label>
              <select v-model="wasteIngredientId" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500">
                <option value="" disabled>-- Tanlang --</option>
                <option v-for="ing in posStore.ingredients" :key="ing.id" :value="ing.id">
                  {{ ing.name }} (Hozir: {{ ing.currentStock }} {{ ing.unit }})
                </option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Isrof / Brak Miqdori (Ayriladi)</label>
              <input v-model.number="wasteQuantity" type="number" step="any" placeholder="Masalan: 2.5" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-rose-500" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sababi</label>
              <input v-model="wasteReason" type="text" placeholder="Masalan: Sroki o'tgan / To'kilgan" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500" />
            </div>

            <div class="flex space-x-3 pt-2">
              <button type="submit" class="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-rose-500/25 transition">
                Spisaniya Qilish
              </button>
              <button type="button" @click="showWasteModal = false" class="px-5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-2xl">
                Bekor Qilish
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

  </div>
</template>
