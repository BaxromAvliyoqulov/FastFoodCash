import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const storedTheme = localStorage.getItem('fastfoodcash_theme');
  const isDark = ref<boolean>(storedTheme ? storedTheme === 'dark' : true);

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('fastfoodcash_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('fastfoodcash_theme', 'light');
    }
  }

  function toggleTheme() {
    isDark.value = !isDark.value;
    applyTheme();
  }

  // Initialize on load
  applyTheme();

  return {
    isDark,
    toggleTheme,
    applyTheme
  };
});
