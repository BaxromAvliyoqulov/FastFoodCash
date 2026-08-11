<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { Delete, ArrowRight, ShieldCheck, KeyRound } from 'lucide-vue-next';

const authStore = useAuthStore();

const pin = ref('');
const errorMsg = ref('');
const isLoading = ref(false);
const pinInputRef = ref<HTMLInputElement | null>(null);

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
  // Don't intercept if user is typing in another active input or modal
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
  <div class="h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950 relative overflow-hidden select-none">
    
    <!-- Decorative Background Ambient Glows -->
    <div class="absolute top-[-15%] left-[-15%] w-[500px] h-[500px] bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-15%] right-[-15%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
    
    <div class="relative w-full max-w-sm px-6 py-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl rounded-3xl border border-slate-200 dark:border-slate-800 transition-all duration-300">
      
      <!-- ── Brand Clean Header (Rasm emas, Zamonaviy Badge) ── -->
      <div class="flex flex-col items-center mb-6 text-center space-y-2">
        <div class="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
          <KeyRound class="w-8 h-8" />
        </div>

        <div>
          <div class="flex items-center justify-center gap-1.5">
            <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-wide">
              DOSTON BURGER
            </h2>
            <span class="text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
              POS
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Kassir Maxfiy PIN-kodini Kiriting
          </p>
        </div>
      </div>

      <!-- ── Hidden Auto-Focused Input for Direct Typing ── -->
      <input 
        ref="pinInputRef"
        v-model="pin"
        type="password"
        inputmode="numeric"
        pattern="[0-9]*"
        class="opacity-0 absolute -top-96 left-0 w-1 h-1 pointer-events-none"
        @keydown.enter.prevent="handleLogin"
      />

      <!-- ── Visual PIN Digit Indicator Boxes ── -->
      <div class="flex items-center justify-center gap-3 mb-6" @click="pinInputRef?.focus()">
        <div 
          v-for="i in 4" 
          :key="i"
          :class="[
            'w-11 h-13 rounded-2xl border-2 flex items-center justify-center text-2xl font-black font-mono transition-all duration-200',
            pin.length >= i
              ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-md shadow-amber-500/20 scale-105'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-300 dark:text-slate-700'
          ]"
        >
          {{ pin.length >= i ? '•' : '' }}
        </div>
      </div>

      <!-- Error Message -->
      <div 
        v-if="errorMsg" 
        class="text-rose-600 dark:text-rose-400 text-xs font-black text-center bg-rose-500/10 border border-rose-500/30 py-2.5 px-4 rounded-2xl mb-4 animate-shake"
      >
        {{ errorMsg }}
      </div>

      <!-- ── On-Screen & Physical Numpad Keyboard Grid ── -->
      <div class="grid grid-cols-3 gap-2.5 mb-6">
        <button 
          v-for="num in ['1', '2', '3', '4', '5', '6', '7', '8', '9']" 
          :key="num"
          type="button"
          @click="handleNumpadPress(num)"
          class="h-13 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-500 hover:text-white text-slate-800 dark:text-slate-100 font-black text-xl transition-all duration-150 active:scale-95 shadow-sm border border-slate-200/60 dark:border-slate-700/60 cursor-pointer flex items-center justify-center"
        >
          {{ num }}
        </button>

        <button 
          type="button"
          @click="handleClear"
          class="h-13 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-500 hover:text-white text-slate-500 font-bold text-xs transition-all duration-150 active:scale-95 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer flex items-center justify-center uppercase tracking-wider"
          title="Tozalash"
        >
          C
        </button>

        <button 
          type="button"
          @click="handleNumpadPress('0')"
          class="h-13 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-500 hover:text-white text-slate-800 dark:text-slate-100 font-black text-xl transition-all duration-150 active:scale-95 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer flex items-center justify-center"
        >
          0
        </button>

        <button 
          type="button"
          @click="handleBackspace"
          class="h-13 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-500 hover:text-white text-slate-600 dark:text-slate-300 font-bold text-sm transition-all duration-150 active:scale-95 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer flex items-center justify-center"
          title="O'chirish"
        >
          <Delete class="w-5 h-5" />
        </button>
      </div>

      <!-- Submit Action Button -->
      <button 
        type="button"
        @click="handleLogin"
        :disabled="isLoading || pin.length === 0"
        class="w-full py-4 rounded-2xl shadow-lg shadow-amber-500/25 text-sm font-black text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
      >
        <span v-if="isLoading" class="flex items-center gap-2">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Kassaga Kirilmoqda...
        </span>
        <span v-else class="flex items-center gap-1.5">
          <span>Tizimga Kirish</span>
          <ArrowRight class="w-4 h-4" />
        </span>
      </button>

      <!-- Footer Info -->
      <div class="mt-5 flex items-center justify-between text-[11px] text-slate-400 font-medium border-t border-slate-100 dark:border-slate-800/80 pt-3">
        <span>⌨️ Klaviatura / Touch Numpad</span>
        <span class="flex items-center gap-1">
          <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" /> POS 2.0
        </span>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.animate-shake {
  animation: shake 0.3s ease-in-out;
}
</style>
