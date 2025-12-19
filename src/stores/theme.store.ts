// Store de tema usando Pinia
// Gestiona el modo oscuro/claro de la aplicación

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Dark } from 'quasar';

const THEME_KEY = 'app_theme';
const DEFAULT_THEME = 'light';

export type ThemeMode = 'light' | 'dark' | 'auto';

export const useThemeStore = defineStore('theme', () => {
  // Estado
  const mode = ref<ThemeMode>((localStorage.getItem(THEME_KEY) as ThemeMode) || DEFAULT_THEME);
  const isDark = ref(Dark.isActive);

  // Inicializar tema al cargar
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemeMode;
    if (savedTheme) {
      mode.value = savedTheme;
      applyTheme(savedTheme);
    } else {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        mode.value = 'auto';
        Dark.set(true);
        isDark.value = true;
      } else {
        Dark.set(false);
        isDark.value = false;
      }
    }
  }

  // Aplicar tema
  function applyTheme(themeMode: ThemeMode) {
    if (themeMode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      Dark.set(prefersDark);
      isDark.value = prefersDark;
    } else {
      Dark.set(themeMode === 'dark');
      isDark.value = themeMode === 'dark';
    }
  }

  // Cambiar tema
  function setTheme(themeMode: ThemeMode) {
    mode.value = themeMode;
    localStorage.setItem(THEME_KEY, themeMode);
    applyTheme(themeMode);
  }

  // Toggle entre claro y oscuro
  function toggleTheme() {
    const newMode = isDark.value ? 'light' : 'dark';
    setTheme(newMode);
  }

  // Escuchar cambios en la preferencia del sistema (solo si está en modo auto)
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (mode.value === 'auto') {
        Dark.set(e.matches);
        isDark.value = e.matches;
      }
    });
  }

  // Inicializar al crear el store (solo en cliente)
  if (typeof window !== 'undefined') {
    initTheme();
  }

  return {
    mode,
    isDark,
    setTheme,
    toggleTheme,
    initTheme,
  };
});

