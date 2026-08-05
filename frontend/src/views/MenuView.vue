<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePosStore } from '../stores/posStore';
import type { Product, Category } from '../types/pos';
import CategoryIcon from '../components/CategoryIcon.vue';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Layers,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List
} from 'lucide-vue-next';

const posStore = usePosStore();

// Category Badge Color Mapping
function getCategoryGradient(catId: string) {
  if (catId.includes('lavash')) return 'from-amber-500 to-orange-600 text-white';
  if (catId.includes('burger')) return 'from-orange-500 to-red-600 text-white';
  if (catId.includes('pizza')) return 'from-red-500 to-rose-600 text-white';
  if (catId.includes('coffee')) return 'from-amber-700 to-yellow-900 text-white';
  if (catId.includes('drinks')) return 'from-cyan-500 to-blue-600 text-white';
  if (catId.includes('energy')) return 'from-indigo-500 to-purple-600 text-white';
  if (catId.includes('juices')) return 'from-emerald-500 to-teal-600 text-white';
  if (catId.includes('salads')) return 'from-green-500 to-emerald-600 text-white';
  if (catId.includes('desserts')) return 'from-pink-500 to-rose-500 text-white';
  return 'from-amber-500 to-orange-500 text-white';
}

// Display Mode: Table vs Grid
const viewMode = ref<'table' | 'grid'>('table');

// Category CRUD Modal State
const showAddCategoryModal = ref(false);
const newCategoryName = ref('');
const editingCategory = ref<Category | null>(null);
const editCategoryName = ref('');

// Product CRUD Form Modal State
const showProductModal = ref(false);
const activeProductForm = ref<Partial<Product>>({
  name: '',
  price: 35000,
  categoryId: 'cat-burger',
  categoryName: 'Burger',
  imageUrl: '/images/burger/gamburger.png',
  isStopList: false,
  recipe: []
});

const selectedCategoryFilter = ref<string>('ALL');
const searchQuery = ref<string>('');
const categorySearchQuery = ref<string>('');

// Executive Overview Statistics
const totalCategoriesCount = computed(() => posStore.categories.length);
const activeCategoriesCount = computed(() => posStore.categories.filter(c => !c.isHidden).length);

const totalProductsCount = computed(() => posStore.products.length);
const activeProductsCount = computed(() => posStore.products.filter(p => !p.isStopList).length);
const stopListProductsCount = computed(() => posStore.products.filter(p => p.isStopList).length);

// Filtered Categories
const filteredCategoriesList = computed(() => {
  if (!categorySearchQuery.value.trim()) return posStore.categories;
  const q = categorySearchQuery.value.toLowerCase().trim();
  return posStore.categories.filter(c => c.name.toLowerCase().includes(q));
});

// Filtered Products
const filteredProductList = computed(() => {
  return posStore.products.filter(p => {
    const matchesCat = selectedCategoryFilter.value === 'ALL' || p.categoryId === selectedCategoryFilter.value;
    const matchesSearch = !searchQuery.value || p.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCat && matchesSearch;
  });
});

// Add / Update Category Functions
function handleAddCategory() {
  if (!newCategoryName.value.trim()) return;
  posStore.addCategory(newCategoryName.value);
  newCategoryName.value = '';
  showAddCategoryModal.value = false;
}

function startEditCategory(cat: Category) {
  editingCategory.value = cat;
  editCategoryName.value = cat.name;
}

function handleUpdateCategory() {
  if (editingCategory.value && editCategoryName.value.trim()) {
    posStore.updateCategory(editingCategory.value.id, editCategoryName.value);
    editingCategory.value = null;
  }
}

// Product Create/Edit Functions
function openNewProductModal() {
  activeProductForm.value = {
    name: '',
    price: 35000,
    categoryId: posStore.categories[0]?.id || 'cat-burger',
    categoryName: posStore.categories[0]?.name || 'Burger',
    imageUrl: '/images/burger/gamburger.png',
    isStopList: false,
    recipe: []
  };
  showProductModal.value = true;
}

function openEditProductModal(product: Product) {
  activeProductForm.value = JSON.parse(JSON.stringify(product));
  showProductModal.value = true;
}

function handleSaveProduct() {
  if (!activeProductForm.value.name?.trim()) {
    alert('Iltimos taom nomini kiriting!');
    return;
  }
  
  const matchedCat = posStore.categories.find(c => c.id === activeProductForm.value.categoryId);
  if (matchedCat) {
    activeProductForm.value.categoryName = matchedCat.name;
  }

  posStore.saveProduct(activeProductForm.value);
  showProductModal.value = false;
}
</script>

<template>
  <div class="h-full flex flex-col overflow-y-auto bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 space-y-6 transition-colors duration-300">
    
    <!-- Top Action Banner & Statistics Pills -->
    <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      
      <!-- Page Title -->
      <div class="flex items-center space-x-3.5">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 shrink-0">
          <FolderKanban class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
            <span>Menyu & Kategoriyalar Boshqaruvi</span>
            <span class="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">10x FULL CRUD</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kategoriyalarni tahrirlash, 1-klikda yopish va taomlar narxlarini boshqarish</p>
        </div>
      </div>

      <!-- Quick Executive Statistics Chips -->
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold">
        <div class="bg-slate-100 dark:bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center space-x-2">
          <Layers class="w-4 h-4 text-amber-500" />
          <span>Kategoriyalar: <strong class="text-slate-900 dark:text-white font-mono">{{ totalCategoriesCount }}</strong> <span class="text-[10px] text-emerald-500 font-medium">({{ activeCategoriesCount }} faol)</span></span>
        </div>

        <div class="bg-slate-100 dark:bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center space-x-2">
          <Utensils class="w-4 h-4 text-orange-500" />
          <span>Taomlar: <strong class="text-slate-900 dark:text-white font-mono">{{ totalProductsCount }}</strong> <span class="text-[10px] text-emerald-500 font-medium">({{ activeProductsCount }} faol)</span></span>
        </div>

        <div v-if="stopListProductsCount > 0" class="bg-rose-500/10 text-rose-500 px-3.5 py-2 rounded-2xl border border-rose-500/20 flex items-center space-x-1.5 animate-pulse">
          <AlertCircle class="w-4 h-4" />
          <span>Stop-List: <strong class="font-mono">{{ stopListProductsCount }} ta taom</strong></span>
        </div>
      </div>

    </div>

    <!-- 2-Column Responsive Layout: Left (Categories) & Right (Foods) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
      
      <!-- LEFT COLUMN: Categories Management (1 Column) -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
        
        <div>
          <!-- Category Card Header -->
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
            <div>
              <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Layers class="w-5 h-5 text-amber-500" />
                <span>Kategoriyalar ({{ posStore.categories.length }})</span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Yangi bo'lim ochish yoki vaqtincha yopish</p>
            </div>

            <button 
              @click="showAddCategoryModal = true"
              class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-3.5 py-2 rounded-2xl text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus class="w-4 h-4" />
              <span>Qo'shish</span>
            </button>
          </div>

          <!-- Category Search Input -->
          <div class="relative mb-3">
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="categorySearchQuery"
              type="text" 
              placeholder="Bo'lim izlash..."
              class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <!-- Categories List -->
          <div class="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-[580px] no-scrollbar">
            <div 
              v-for="cat in filteredCategoriesList" 
              :key="cat.id"
              :class="[
                'p-3 rounded-2xl border transition-all flex items-center justify-between group',
                cat.isHidden 
                  ? 'bg-rose-500/5 border-rose-500/30 text-rose-500 opacity-80' 
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40'
              ]"
            >
              <div class="flex items-center space-x-3 min-w-0 pr-2">
                <!-- Dynamic Colorful Fast Food Category Vector SVG Badge -->
                <div :class="['w-9 h-9 rounded-xl flex items-center justify-center shadow-md shrink-0 bg-gradient-to-br', getCategoryGradient(cat.id)]">
                  <CategoryIcon :cat-id="cat.id" size="md" />
                </div>

                <!-- Edit inline mode vs Normal View -->
                <div class="min-w-0">
                  <div v-if="editingCategory?.id === cat.id" class="flex items-center space-x-1">
                    <input v-model="editCategoryName" type="text" class="bg-white dark:bg-slate-900 border border-amber-500 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none" />
                    <button @click="handleUpdateCategory" class="p-1 bg-emerald-500 text-white rounded-lg"><Check class="w-3.5 h-3.5" /></button>
                    <button @click="editingCategory = null" class="p-1 bg-slate-300 dark:bg-slate-700 rounded-lg"><X class="w-3.5 h-3.5" /></button>
                  </div>

                  <div v-else>
                    <div class="font-bold text-xs text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                      <span>{{ cat.name }}</span>
                      <span v-if="cat.isHidden" class="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-mono font-bold">YOPIQ</span>
                    </div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {{ posStore.products.filter(p => p.categoryId === cat.id).length }} ta taom
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons for Category -->
              <div class="flex items-center space-x-1 shrink-0">
                <!-- Toggle Category Visibility (Hide/Show in POS) -->
                <button 
                  @click="posStore.toggleCategoryStatus(cat.id)"
                  :title="cat.isHidden ? 'Kassada ko\'rsatish' : 'Kassada yopib qo\'yish'"
                  :class="[
                    'p-1.5 rounded-xl border transition-all', 
                    cat.isHidden 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500 hover:text-white' 
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500 border-transparent'
                  ]"
                >
                  <EyeOff v-if="!cat.isHidden" class="w-3.5 h-3.5" />
                  <Eye v-else class="w-3.5 h-3.5" />
                </button>

                <button 
                  @click="startEditCategory(cat)"
                  class="p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-600 dark:text-slate-400 transition-colors"
                  title="Nomini tahrirlash"
                >
                  <Edit3 class="w-3.5 h-3.5" />
                </button>

                <button 
                  @click="posStore.deleteCategory(cat.id)"
                  class="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 transition-colors"
                  title="Kategoriyani o'chirish"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN: Foods CRUD Suite (2 Columns) -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
        
        <div>
          <!-- Header Bar: Search & Filter & View Mode Switcher -->
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
            
            <div class="flex items-center space-x-3 flex-1 min-w-[220px]">
              <!-- Search Bar -->
              <div class="relative flex-1 max-w-xs">
                <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="Taom izlash..." 
                  class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" 
                />
              </div>

              <!-- Filter by Category Dropdown -->
              <select 
                v-model="selectedCategoryFilter"
                class="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Barcha Kategoriyalar ({{ posStore.products.length }})</option>
                <option v-for="cat in posStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <div class="flex items-center space-x-2">
              <!-- View Mode Switcher (Table vs Grid) -->
              <div class="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button 
                  @click="viewMode = 'table'"
                  :class="['p-1.5 rounded-lg transition-all', viewMode === 'table' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500']"
                  title="Jadval rejimi"
                >
                  <List class="w-4 h-4" />
                </button>
                <button 
                  @click="viewMode = 'grid'"
                  :class="['p-1.5 rounded-lg transition-all', viewMode === 'grid' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500']"
                  title="Kattalashtirilgan kartochka rejimi"
                >
                  <LayoutGrid class="w-4 h-4" />
                </button>
              </div>

              <!-- Add Product Button -->
              <button 
                @click="openNewProductModal"
                class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-4 py-2 rounded-2xl text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
              >
                <Plus class="w-4 h-4" />
                <span>+ Yangi Taom</span>
              </button>
            </div>

          </div>

          <!-- TABLE VIEW MODE -->
          <div v-if="viewMode === 'table'" class="overflow-x-auto flex-1 max-h-[550px] overflow-y-auto no-scrollbar">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-950/80 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th class="p-3">Taom Nomi</th>
                  <th class="p-3">Kategoriya</th>
                  <th class="p-3">Sotish Narxi</th>
                  <th class="p-3">Holati (Stop-List)</th>
                  <th class="p-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                <tr v-for="prod in filteredProductList" :key="prod.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <!-- Product Image & Name -->
                  <td class="p-3 flex items-center space-x-3">
                    <img :src="prod.imageUrl" :alt="prod.name" class="w-10 h-10 rounded-xl object-cover bg-slate-200 shrink-0 border border-slate-200 dark:border-slate-800" />
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                        <span>{{ prod.name }}</span>
                        <span v-if="prod.recipe?.length" class="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded font-mono">BOM {{ prod.recipe.length }}</span>
                      </div>
                      <div class="text-[10px] text-slate-400 font-mono">ID: {{ prod.id }}</div>
                    </div>
                  </td>

                  <!-- Category Badge -->
                  <td class="p-3">
                    <span class="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                      <CategoryIcon :cat-id="prod.categoryId" size="sm" />
                      <span>{{ prod.categoryName }}</span>
                    </span>
                  </td>

                  <!-- Price -->
                  <td class="p-3 font-bold font-mono text-amber-600 dark:text-amber-400 text-sm">
                    {{ prod.price.toLocaleString('uz-UZ') }} so'm
                  </td>

                  <!-- Stop-List Toggle Button -->
                  <td class="p-3">
                    <button 
                      @click="posStore.toggleStopList(prod.id)"
                      :class="[
                        'px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1',
                        prod.isStopList 
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500 hover:text-white' 
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500 hover:text-white'
                      ]"
                    >
                      <AlertCircle v-if="prod.isStopList" class="w-3 h-3" />
                      <CheckCircle2 v-else class="w-3 h-3" />
                      <span>{{ prod.isStopList ? '⛔ STOP-LIST' : '✅ Sotuvda Mavjud' }}</span>
                    </button>
                  </td>

                  <!-- Product Action Buttons -->
                  <td class="p-3 text-right space-x-1.5">
                    <button 
                      @click="openEditProductModal(prod)" 
                      class="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-600 dark:text-slate-300 transition-colors"
                      title="Taomni tahrirlash"
                    >
                      <Edit3 class="w-4 h-4" />
                    </button>

                    <button 
                      @click="posStore.deleteProduct(prod.id)" 
                      class="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 transition-colors"
                      title="Taomni o'chirish"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- GRID VIEW MODE -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[550px] overflow-y-auto no-scrollbar pr-1">
            <div 
              v-for="prod in filteredProductList" 
              :key="prod.id"
              class="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-3.5 flex flex-col justify-between hover:border-amber-500/40 transition-all group"
            >
              <div>
                <!-- Image & Badges -->
                <div class="relative h-32 rounded-2xl overflow-hidden mb-3 bg-slate-200">
                  <img :src="prod.imageUrl" :alt="prod.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  
                  <!-- Stop list badge -->
                  <div v-if="prod.isStopList" class="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center text-rose-400 font-extrabold text-xs tracking-wider uppercase">
                    ⛔ STOP-LIST
                  </div>

                  <!-- Category Badge -->
                  <div class="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/10">
                    <CategoryIcon :cat-id="prod.categoryId" size="sm" />
                    <span>{{ prod.categoryName }}</span>
                  </div>
                </div>

                <h4 class="font-bold text-xs text-slate-900 dark:text-white truncate mb-1">{{ prod.name }}</h4>
                <div class="font-black text-amber-600 dark:text-amber-400 text-sm font-mono mb-2">{{ prod.price.toLocaleString('uz-UZ') }} so'm</div>
              </div>

              <!-- Card Actions -->
              <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/60">
                <button 
                  @click="posStore.toggleStopList(prod.id)"
                  :class="[
                    'px-2 py-1 rounded-xl text-[10px] font-bold border transition-all',
                    prod.isStopList ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  ]"
                >
                  {{ prod.isStopList ? '⛔ Stop-List' : '✅ Active' }}
                </button>

                <div class="flex items-center space-x-1">
                  <button @click="openEditProductModal(prod)" class="p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-amber-500 hover:text-white rounded-xl text-slate-600 dark:text-slate-300"><Edit3 class="w-3.5 h-3.5" /></button>
                  <button @click="posStore.deleteProduct(prod.id)" class="p-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded-xl text-rose-500"><Trash2 class="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>

    <!-- MODAL 1: Add Category Modal -->
    <Teleport to="body">
      <div v-if="showAddCategoryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
          <div class="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 class="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Layers class="w-4 h-4 text-amber-500" />
              <span>Yangi Kategoriya Yaratish</span>
            </h4>
            <button @click="showAddCategoryModal = false" class="text-slate-400 hover:text-slate-600"><X class="w-5 h-5" /></button>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Kategoriya Nomi</label>
            <input v-model="newCategoryName" type="text" placeholder="Masalan: Shashliklar, Souslar yoki Qazi" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" />
          </div>

          <div class="flex justify-end space-x-2 pt-2">
            <button @click="showAddCategoryModal = false" class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300">Bekor qilish</button>
            <button @click="handleAddCategory" class="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md">Yaratish</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL 2: Create / Edit Product Form Modal -->
    <Teleport to="body">
      <div v-if="showProductModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 class="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 class="w-4 h-4 text-amber-500" />
              <span>{{ activeProductForm.id ? 'Taomni Tahrirlash' : 'Yangi Taom Yaratish' }}</span>
            </h4>
            <button @click="showProductModal = false" class="text-slate-400 hover:text-slate-600"><X class="w-5 h-5" /></button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Taom Nomi</label>
              <input v-model="activeProductForm.name" type="text" placeholder="Doston Special Burger" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Sotish Narxi (SO'M)</label>
              <input v-model.number="activeProductForm.price" type="number" step="1000" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Kategoriya</label>
              <select v-model="activeProductForm.categoryId" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500">
                <option v-for="cat in posStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Rasm URL Manzili</label>
              <input v-model="activeProductForm.imageUrl" type="text" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button @click="showProductModal = false" class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300">Bekor qilish</button>
            <button @click="handleSaveProduct" class="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md">Saqlash</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
