<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-xl">
      <div class="text-center q-mb-lg">
        <div class="text-h4 q-mb-xs">Iniciar Sesión</div>
        <div class="text-body2 text-grey-7">
          Ingresa tus credenciales para acceder al sistema
        </div>
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
          :type="isPasswordVisible ? 'text' : 'password'"
          outlined
          :rules="[(val) => !!val || 'La contraseña es requerida']"
          :disable="loading"
        >
          <template #prepend>
            <q-icon name="lock" />
          </template>
          <template #append>
            <q-icon
              :name="isPasswordVisible ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPasswordVisible = !isPasswordVisible"
            />
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
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../../../stores/auth.store';
import type { LoginDto } from '../../../application/auth/auth.repository.port';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();

const form = ref<LoginDto>({
  username: '',
  password: '',
});
const rememberMe = ref(false);
const isPasswordVisible = ref(false);
const loading = computed(() => authStore.loading);

async function handleSubmit() {
  try {
    await authStore.login(form.value);
    $q.notify({
      type: 'positive',
      message: 'Sesión iniciada exitosamente',
    });
    // Redirigir a la ruta original o al home
    const redirect = route.query.redirect as string | undefined;
    void router.push(redirect || '/');
  } catch (error) {
    console.error('Login error caught in component:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Error al iniciar sesión';
    $q.notify({
      type: 'negative',
      message: errorMessage,
    });
  }
}
</script>

