<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-1">
        <div class="full-width" style="max-width: 500px">
          <router-view />
        </div>
      </q-page>
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

