<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-xl">
      <div class="text-center q-mb-lg">
        <div class="text-h4 q-mb-xs">Iniciar Sesión</div>
        <div class="text-body2 text-grey-7">Ingresa tus credenciales para acceder al sistema</div>
      </div>

      <q-form @submit="handleSubmit" class="q-gutter-md">
        <q-input
          v-model="form.username"
          label="Usuario o Email"
          outlined
          :rules="[(val) => !!val || 'El usuario es requerido']"
          :disable="loading"
        >
          <template #prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <q-input
          v-model="form.password"
          label="Contraseña"
          :type="inputType"
          outlined
          :rules="[(val) => !!val || 'La contraseña es requerida']"
          :disable="loading"
        >
          <template #prepend>
            <q-icon name="lock" />
          </template>
          <template #append>
            <q-icon :name="icon" class="cursor-pointer" @click="toggle" />
          </template>
        </q-input>

        <div class="row items-center justify-between">
          <q-checkbox v-model="rememberMe" label="Recordarme" :disable="loading" />
          <q-btn
            flat
            label="¿Olvidaste tu contraseña?"
            no-caps
            size="sm"
            :to="{ name: 'forgot-password' }"
            :disable="loading"
          />
        </div>

        <q-btn
          type="submit"
          label="Iniciar Sesión"
          color="primary"
          size="lg"
          class="full-width"
          :loading="loading"
          :disable="loading"
        />

        <div class="text-center q-mt-md">
          <span class="text-body2 text-grey-7">¿No tienes una cuenta? </span>
          <q-btn
            flat
            label="Regístrate"
            no-caps
            color="primary"
            :to="{ name: 'register' }"
            :disable="loading"
          />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth, usePasswordVisibility } from '../../../shared/composables';
import type { LoginDto } from '../../../application/auth/auth.repository.port';

const { login, loading } = useAuth();
const { inputType, icon, toggle } = usePasswordVisibility();
const rememberMe = ref(false);

const form = ref<LoginDto>({
  username: '',
  password: '',
});

async function handleSubmit() {
  await login(form.value);
}
</script>
