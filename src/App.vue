<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useThemeStore } from './stores/theme.store';

const themeStore = useThemeStore();

onMounted(() => {
  // DEBUG: Verificar versión de la App
  console.log('🚀 APP VERSION: 2026-01-03-DEBUG-FIX-V2');
  console.log('📍 Current URL:', window.location.href);

  // FORCE: Eliminar Service Workers antiguos que puedan estar cacheando la app vieja
  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(const registration of registrations) {
        console.log('🗑️ Unregistering Service Worker:', registration);
        void registration.unregister();
      }
    });
  }

  // Asegurar que el tema se aplique correctamente
  themeStore.initTheme();
  
  // Sincronizar el tema con el body
  document.body.classList.toggle('body--dark', themeStore.isDark);
  document.body.classList.toggle('body--light', !themeStore.isDark);
  
  // Escuchar cambios
  watch(
    () => themeStore.isDark,
    (isDark) => {
      document.body.classList.toggle('body--dark', isDark);
      document.body.classList.toggle('body--light', !isDark);
    },
  );
});
</script>
