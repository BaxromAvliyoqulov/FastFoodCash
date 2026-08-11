<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { Lock } from 'lucide-vue-next';

const authStore = useAuthStore();

const pin = ref('');
const errorMsg = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  if (!pin.value) {
    errorMsg.value = 'Iltimos, maxfiy kodni kiritng!';
    return;
  }
  
  errorMsg.value = '';
  isLoading.value = true;
  
  const result = await authStore.loginByPin(pin.value);
  
  if (!result.success) {
    errorMsg.value = result.error || 'Login yoki parolda xatolik!';
    pin.value = '';
  }
  
  isLoading.value = false;
};
</script>

<template>
  <div class="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
    <!-- Decorative Background Blobs -->
    <div class="absolute top-[-15%] left-[-15%] w-[500px] h-[500px] bg-amber-500/15 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-15%] right-[-15%] w-[500px] h-[500px] bg-orange-500/15 dark:bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-400/5 rounded-full blur-3xl pointer-events-none"></div>
    
    <div class="relative w-full max-w-sm px-6 py-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-slate-200/60 dark:border-slate-700/60 transition-all duration-300">
      
      <!-- ── Brand Logo ── -->
      <div class="flex flex-col items-center mb-8">
        <!-- Logo image — katta, aniq ko'rinadigan -->
        <div class="mb-3 drop-shadow-2xl">
          <img 
            src="/doston-burger-logo.png" 
            alt="Doston Burger Logo" 
            class="w-48 h-auto object-contain select-none"
            draggable="false"
          />
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-semibold">
          Kassa POS Tizimiga Kirish
        </p>
      </div>

      <!-- ── Login Form ── -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        
        <!-- PIN Input -->
        <div class="space-y-1.5">
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Maxfiy kod (PIN)
          </label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
              <Lock class="w-5 h-5" />
            </div>
            <input 
              v-model="pin" 
              type="password" 
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="••••••" 
              class="block w-full pl-11 pr-4 py-3.5 text-center tracking-[0.5em] font-mono text-2xl border border-slate-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              :disabled="isLoading"
              autofocus
            />
          </div>
          <p class="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            Faqat raqamlardan iborat PIN-kodni kiriting
          </p>
        </div>

        <!-- Error Message -->
        <div 
          v-if="errorMsg" 
          class="text-red-600 dark:text-red-400 text-sm font-medium text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 py-2.5 px-4 rounded-xl"
        >
          {{ errorMsg }}
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl shadow-lg shadow-amber-500/20 text-sm font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-amber-500/30"
        >
          <span v-if="isLoading" class="flex items-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Tekshirilmoqda...
          </span>
          <span v-else>Tizimga Kirish</span>
        </button>
      </form>

      <!-- Footer -->
      <p class="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-6 font-medium">
        Doston Burger © Fast Food Cafe POS
      </p>
    </div>
  </div>
</template>
