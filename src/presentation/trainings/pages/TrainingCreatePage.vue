<template>
  <q-page class="q-pa-xl column q-gutter-lg">
    <div>
      <div class="heading-main q-mb-xs">Crear nueva capacitación</div>
      <div class="heading-sub">
        Define los datos básicos de la capacitación que estará disponible para tus usuarios.
      </div>
    </div>

    <q-card class="q-pa-lg">
      <TrainingForm @submit="handleSubmit" />
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import TrainingForm, { type TrainingFormModel } from '../components/TrainingForm.vue';

function handleSubmit(payload: TrainingFormModel) {
  // Por ahora solo usamos mocks: mostramos por consola.
  // Aquí se podría llamar a un caso de uso en application/ + infraestructura HTTP.
  console.log('Nueva capacitación (mock):', payload);
}
</script>
