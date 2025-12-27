<template>
  <q-layout>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// Layout independiente para páginas de autenticación (login, registro)
// No incluye el menú lateral ni el header principal
</script>

<style scoped>
.bg-grey-1 {
  background-color: #f5f5f5;
}
</style>
