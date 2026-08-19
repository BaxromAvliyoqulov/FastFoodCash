<script setup lang="ts">
import { ref } from 'vue';
import { usePosStore } from '../stores/posStore';
import { useToastStore } from '../stores/toastStore';
import { formatWithSpaces, formatMoneyInput } from '../utils/formatters';
import type { Product } from '../types/pos';
import { X, Plus, Trash2, Edit3, Layers } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const posStore = usePosStore();
const toast = useToastStore();
const activeEditProduct = ref<Partial<Product> | null>(null);

function startNewProduct() {
  activeEditProduct.value = {
    name: '',
    price: 25000,
    categoryId: 'cat-burger',
    categoryName: 'Burger',
    imageUrl: '/images/burger/gamburger.png',
    isStopList: false,
    recipe: []
  };
}

function startEditProduct(product: Product) {
  activeEditProduct.value = JSON.parse(JSON.stringify(product));
}

function saveActiveProduct() {
  if (!activeEditProduct.value || !activeEditProduct.value.name) {
    toast.error('Iltimos, taom nomini kiriting!');
    return;
  }
  posStore.saveProduct(activeEditProduct.value);
  toast.success('Taom muvaffaqiyatli saqlandi!');
  activeEditProduct.value = null;
}
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors">
        
        <!-- Header -->
        <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div class="flex items-center space-x-3">
            <div class="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Layers class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-black text-base text-slate-900 dark:text-white">Menyuni Boshqarish (Menu Suite 10x)</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Taomlar narxini tahrirlash, Stop-List va yangi taom qo'shish</p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <button 
              @click="startNewProduct"
              class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-4 py-2 rounded-2xl text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus class="w-4 h-4" />
              <span>Yangi Taom Qo'shish</span>
            </button>

            <button 
              @click="emit('close')"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-100 dark:bg-slate-950">
          
          <!-- Product Edit Form Drawer (if active) -->
          <div v-if="activeEditProduct" class="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-amber-500/40 shadow-xl space-y-4 animate-in slide-in-from-top duration-300">
            <div class="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 class="w-4 h-4 text-amber-500" />
                <span>{{ activeEditProduct.id ? 'Taomni Tahrirlash' : 'Yangi Taom Yaratish' }}</span>
              </h4>
              <button @click="activeEditProduct = null" class="text-xs font-bold text-slate-400 hover:text-slate-600">Bekor qilish</button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Taom Nomi</label>
                <input v-model="activeEditProduct.name" type="text" placeholder="Masalan: Doston Special Burger" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Sotish Narxi (SO'M)</label>
                <div class="relative">
                  <input 
                    type="text" 
                    :value="formatWithSpaces(activeEditProduct.price)" 
                    @input="activeEditProduct.price = formatMoneyInput($event)" 
                    placeholder="Masalan: 25 000" 
                    class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" 
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Kategoriya</label>
                <select v-model="activeEditProduct.categoryId" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500">
                  <option v-for="cat in posStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Rasm URL Manzili</label>
                <input v-model="activeEditProduct.imageUrl" type="text" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" />
              </div>
            </div>

            <div class="flex justify-end space-x-3 pt-2">
              <button @click="activeEditProduct = null" class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300">Bekor qilish</button>
              <button @click="saveActiveProduct" class="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md">Saqlash</button>
            </div>
          </div>

          <!-- Product Table List -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th class="p-3.5">Taom</th>
                  <th class="p-3.5">Kategoriya</th>
                  <th class="p-3.5">Narxi</th>
                  <th class="p-3.5">Holati (Stop-List)</th>
                  <th class="p-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                <tr v-for="prod in posStore.products" :key="prod.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="p-3.5 flex items-center space-x-3">
                    <img :src="prod.imageUrl" :alt="prod.name" class="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0" />
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">{{ prod.name }}</div>
                      <div class="text-[10px] text-slate-400 font-mono">ID: {{ prod.id }}</div>
                    </div>
                  </td>
                  <td class="p-3.5 text-slate-600 dark:text-slate-300 font-semibold">{{ prod.categoryName }}</td>
                  <td class="p-3.5 font-bold font-mono text-amber-600 dark:text-amber-400">{{ prod.price.toLocaleString('uz-UZ') }} so'm</td>
                  <td class="p-3.5">
                    <button 
                      @click="posStore.toggleStopList(prod.id)"
                      :class="[
                        'px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border',
                        prod.isStopList 
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' 
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      ]"
                    >
                      {{ prod.isStopList ? '⛔ STOP-LIST' : '✅ Sotuvda Mavjud' }}
                    </button>
                  </td>
                  <td class="p-3.5 text-right space-x-2">
                    <button @click="startEditProduct(prod)" class="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white rounded-lg text-slate-600 dark:text-slate-300 transition-colors">
                      <Edit3 class="w-4 h-4" />
                    </button>
                    <button @click="posStore.deleteProduct(prod.id)" class="p-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded-lg text-rose-500 transition-colors">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  </Teleport>
</template>
