<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useThemeStore } from './stores/theme.store';

const themeStore = useThemeStore();

onMounted(() => {
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
