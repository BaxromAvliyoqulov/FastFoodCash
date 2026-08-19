<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { 
  Delete, ArrowRight, 
  UtensilsCrossed, Sparkles, Lock, RotateCcw 
} from 'lucide-vue-next';

const authStore = useAuthStore();

const pin = ref('');
const errorMsg = ref('');
const isLoading = ref(false);
const pinInputRef = ref<HTMLInputElement | null>(null);

const numpadKeys = [
  { num: '1', sub: '' },
  { num: '2', sub: 'ABC' },
  { num: '3', sub: 'DEF' },
  { num: '4', sub: 'GHI' },
  { num: '5', sub: 'JKL' },
  { num: '6', sub: 'MNO' },
  { num: '7', sub: 'PQRS' },
  { num: '8', sub: 'TUV' },
  { num: '9', sub: 'WXYZ' },
];

const handleLogin = async () => {
  if (!pin.value) {
    errorMsg.value = 'Iltimos, maxfiy PIN-kodni kiriting!';
    return;
  }
  
  errorMsg.value = '';
  isLoading.value = true;
  
  const result = await authStore.loginByPin(pin.value);
  
  if (!result.success) {
    errorMsg.value = result.error || "Noto'g'ri PIN-kod!";
    pin.value = '';
  }
  
  isLoading.value = false;
};

// Keypad Button Press
function handleNumpadPress(digit: string) {
  if (pin.value.length < 6) {
    pin.value += digit;
    errorMsg.value = '';
    // Auto submit when 4 digits are entered
    if (pin.value.length === 4) {
      setTimeout(() => {
        if (pin.value.length === 4) handleLogin();
      }, 150);
    }
  }
}

function handleBackspace() {
  if (pin.value.length > 0) {
    pin.value = pin.value.slice(0, -1);
    errorMsg.value = '';
  }
}

function handleClear() {
  pin.value = '';
  errorMsg.value = '';
}

// Global Keyboard Listener (Numpad & Physical Keyboard Support)
function handleGlobalKeyDown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement && e.target !== pinInputRef.value) {
    return;
  }

  if (e.key >= '0' && e.key <= '9') {
    handleNumpadPress(e.key);
  } else if (e.key === 'Backspace') {
    handleBackspace();
  } else if (e.key === 'Escape' || e.key === 'Delete') {
    handleClear();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    handleLogin();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown);
  if (pinInputRef.value) {
    pinInputRef.value.focus();
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
});
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden select-none p-2 sm:p-4">
    
    <!-- ── Ambient Mesh Lighting Effects ── -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none"></div>
    
    <!-- Subtle Grid Pattern Overlay -->
    <div class="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>

    <!-- ── Main Glassmorphism Auth Card (Optimized for Touch Monoblocks) ── -->
    <div class="relative w-full max-w-[380px] bg-slate-900/90 backdrop-blur-2xl p-4 sm:p-6 rounded-[28px] border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-slate-100 transition-all duration-300 my-auto">
      
      <!-- Top Decorative Light Bar -->
      <div class="absolute top-0 left-12 right-12 h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent rounded-full"></div>

      <!-- ── Brand Header ── -->
      <div class="flex flex-col items-center mb-3 sm:mb-4 text-center">
        
        <!-- Glowing Brand Icon -->
        <div class="relative mb-2">
          <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 ring-4 ring-white/10">
            <UtensilsCrossed class="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" />
          </div>
          <div class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-sm" title="Tizim Online">
            <Sparkles class="w-2.5 h-2.5" />
          </div>
        </div>

        <div class="space-y-0.5">
          <div class="flex items-center justify-center gap-2">
            <h1 class="text-base sm:text-lg font-black text-white tracking-wider uppercase font-sans">
              Doston Burger
            </h1>
            <span class="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
              POS 2.0
            </span>
          </div>
          <p class="text-[11px] text-slate-400 font-medium">
            Kassaga kirish uchun PIN-kodni tering
          </p>
        </div>
      </div>

      <!-- ── Hidden Auto-Focused Input ── -->
      <input 
        ref="pinInputRef"
        v-model="pin"
        type="password"
        inputmode="numeric"
        pattern="[0-9]*"
        class="opacity-0 absolute -top-96 left-0 w-1 h-1 pointer-events-none"
        @keydown.enter.prevent="handleLogin"
      />

      <!-- ── Visual PIN Indicator Dots ── -->
      <div class="flex items-center justify-center gap-3 mb-3 sm:mb-4" @click="pinInputRef?.focus()">
        <div 
          v-for="i in 4" 
          :key="i"
          :class="[
            'w-10 h-11 sm:w-11 sm:h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-200 shadow-inner',
            pin.length >= i
              ? 'border-amber-500 bg-amber-500/20 text-amber-400 shadow-amber-500/30 scale-105 ring-2 ring-amber-500/20'
              : 'border-slate-800 bg-slate-950/60 text-slate-700'
          ]"
        >
          <div 
            v-if="pin.length >= i" 
            class="w-3 h-3 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 shadow-lg shadow-amber-400/50 animate-in zoom-in-50 duration-150"
          ></div>
          <div v-else class="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
        </div>
      </div>

      <!-- Error Message -->
      <div 
        v-if="errorMsg" 
        class="text-rose-400 text-[11px] font-black text-center bg-rose-500/10 border border-rose-500/30 py-1.5 px-3 rounded-xl mb-3 animate-shake flex items-center justify-center gap-1.5"
      >
        <span>⚠️</span>
        <span>{{ errorMsg }}</span>
      </div>

      <!-- ── Tactile Numpad Grid (Compact & Touch Responsive) ── -->
      <div class="grid grid-cols-3 gap-2 mb-3 sm:mb-4">
        <button 
          v-for="item in numpadKeys" 
          :key="item.num"
          type="button"
          @click="handleNumpadPress(item.num)"
          class="h-11 sm:h-12 rounded-xl bg-slate-800/70 hover:bg-slate-700 active:bg-amber-500 active:text-white text-white font-bold text-lg transition-all duration-100 active:scale-95 border border-white/5 hover:border-white/20 shadow-sm cursor-pointer flex flex-col items-center justify-center group"
        >
          <span class="text-lg font-black font-sans leading-none">{{ item.num }}</span>
          <span v-if="item.sub" class="text-[8px] font-mono text-slate-400 group-hover:text-slate-200 mt-0.5 tracking-wider leading-none">
            {{ item.sub }}
          </span>
        </button>

        <!-- Clear Button -->
        <button 
          type="button"
          @click="handleClear"
          class="h-11 sm:h-12 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 font-bold text-xs transition-all duration-100 active:scale-95 border border-rose-500/20 cursor-pointer flex flex-col items-center justify-center gap-0.5 uppercase tracking-wider"
          title="Tozalash (Clear)"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span class="text-[9px] font-black">C</span>
        </button>

        <!-- Zero Button -->
        <button 
          type="button"
          @click="handleNumpadPress('0')"
          class="h-11 sm:h-12 rounded-xl bg-slate-800/70 hover:bg-slate-700 active:bg-amber-500 active:text-white text-white font-black text-lg transition-all duration-100 active:scale-95 border border-white/5 hover:border-white/20 shadow-sm cursor-pointer flex items-center justify-center"
        >
          0
        </button>

        <!-- Backspace Button -->
        <button 
          type="button"
          @click="handleBackspace"
          class="h-11 sm:h-12 rounded-xl bg-slate-800/70 hover:bg-slate-700 active:bg-amber-500 active:text-white text-slate-300 hover:text-white font-bold transition-all duration-100 active:scale-95 border border-white/5 hover:border-white/20 cursor-pointer flex items-center justify-center"
          title="O'chirish (Backspace)"
        >
          <Delete class="w-4 h-4" />
        </button>
      </div>

      <!-- ── Submit Action Button ── -->
      <button 
        type="button"
        @click="handleLogin"
        :disabled="isLoading || pin.length === 0"
        class="w-full py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
      >
        <span v-if="isLoading" class="flex items-center gap-2">
          <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Tekshirilmoqda...
        </span>
        <span v-else class="flex items-center gap-2 font-sans tracking-wide">
          <span>Kassaga Kirish</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </span>
      </button>

      <!-- ── Footer Security Badge ── -->
      <div class="mt-3 flex items-center justify-center gap-1 text-[9px] text-slate-500 font-medium border-t border-white/5 pt-2">
        <Lock class="w-2.5 h-2.5 text-emerald-500" />
        <span>POS Xavfsiz Kirish Tizimi</span>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}
.animate-shake {
  animation: shake 0.3s ease-in-out;
}
</style>
