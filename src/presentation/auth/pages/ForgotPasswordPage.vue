<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-lg shadow-4" style="min-width: 400px; max-width: 500px">
      <q-card-section class="text-center q-pb-none">
        <q-icon name="lock_reset" size="64px" color="primary" class="q-mb-md" />
        <div class="text-h5 q-mb-xs">¿Olvidaste tu contraseña?</div>
        <div class="text-body2 text-grey-7">
          No te preocupes. Ingresa tu usuario o email y te enviaremos
          instrucciones para recuperarla.
        </div>
      </q-card-section>

      <q-card-section v-if="!submitted">
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.usernameOrEmail"
            label="Usuario o Email"
            outlined
            :rules="[(val) => !!val || 'Este campo es requerido']"
            :disable="loading"
            autofocus
          >
            <template #prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <div class="q-gutter-sm">
            <q-btn
              type="submit"
              label="Enviar enlace de recuperación"
              color="primary"
              size="lg"
              class="full-width"
              :loading="loading"
              :disable="loading"
            />

            <q-btn
              flat
              label="Volver al login"
              color="primary"
              size="md"
              class="full-width"
              :to="{ name: 'login' }"
              :disable="loading"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-card-section v-else class="text-center">
        <q-icon name="mark_email_read" size="64px" color="positive" class="q-mb-md" />
        <div class="text-h6 q-mb-md text-positive">¡Correo enviado!</div>
        <div class="text-body2 text-grey-7 q-mb-md">
          Si el usuario existe, se ha enviado un correo electrónico a
          <strong>{{ emailSentTo }}</strong> con instrucciones para recuperar tu
          contraseña.
        </div>
        <div class="text-caption text-grey-6 q-mb-md">
          <q-icon name="info" size="18px" />
          Revisa también la carpeta de spam si no lo encuentras.
        </div>
        <q-btn
          label="Volver al login"
          color="primary"
          :to="{ name: 'login' }"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

const $q = useQuasar();

const form = ref({
  usernameOrEmail: '',
});

const loading = ref(false);
const submitted = ref(false);
const emailSentTo = ref('');

async function handleSubmit() {
  loading.value = true;
  try {
    const response = await api.post('/auth/password-reset/request', {
      usernameOrEmail: form.value.usernameOrEmail,
    });

    submitted.value = true;
    emailSentTo.value = response.data.emailSentTo || 'tu correo registrado';

    $q.notify({
      type: 'positive',
      message: 'Correo de recuperación enviado',
      caption: 'Revisa tu bandeja de entrada',
    });
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Error al procesar la solicitud';

    $q.notify({
      type: 'negative',
      message: errorMessage,
    });
  } finally {
    loading.value = false;
  }
}
</script>
