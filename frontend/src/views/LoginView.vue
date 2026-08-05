<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { LogIn, Lock } from 'lucide-vue-next';

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
    pin.value = ''; // clear pin on error
  }
  
  isLoading.value = false;
};
</script>

<template>
  <div class="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
    <!-- Decorative Background Elements -->
    <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber-500/20 dark:bg-amber-600/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-500/20 dark:bg-orange-600/10 rounded-full blur-3xl"></div>
    
    <div class="relative w-full max-w-md p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300">
      
      <!-- Brand & Logo -->
      <div class="flex flex-col items-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25 mb-4">
          <LogIn class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-wide flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
          DOSTON <span class="text-amber-500">BURGER</span>
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Tizimga kirish (Kassir)</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        
        <!-- PIN / Password Input -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Maxfiy kod (PIN)</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
              <Lock class="w-5 h-5" />
            </div>
            <input 
              v-model="pin" 
              type="password" 
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="••••" 
              class="block w-full pl-10 pr-3 py-3 text-center tracking-[1em] font-mono text-xl border border-slate-300 dark:border-slate-600 rounded-xl leading-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all sm:text-sm"
              :disabled="isLoading"
              autofocus
            />
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-2">
            Faqat raqamlardan iborat PIN-kodni kiriting
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMsg" class="text-red-500 dark:text-red-400 text-sm font-medium text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg transition-all">
          {{ errorMsg }}
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          <span v-if="isLoading" class="flex items-center gap-2">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Tekshirilmoqda...
          </span>
          <span v-else>Kirish</span>
        </button>
      </form>
    </div>
  </div>
</template>
