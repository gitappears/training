<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-xl">
      <div class="text-center q-mb-lg">
        <div class="text-h4 q-mb-xs">Crear Cuenta</div>
        <div class="text-body2 text-grey-7">
          Completa el formulario para registrarte en el sistema
        </div>
      </div>

      <RegisterFormStepper />

      <div class="text-center q-mt-md">
        <span class="text-body2 text-grey-7">¿Ya tienes una cuenta? </span>
        <q-btn flat label="Inicia Sesión" no-caps color="primary" :to="{ name: 'login' }" />
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import RegisterFormStepper from '../components/RegisterFormStepper.vue';
</script>
