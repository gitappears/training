<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-lg shadow-4" style="min-width: 400px; max-width: 500px">
      <q-card-section class="text-center q-pb-none">
        <q-icon name="lock" size="64px" color="primary" class="q-mb-md" />
        <div class="text-h5 q-mb-xs">Crear Nueva Contraseña</div>
        <div class="text-body2 text-grey-7">
          Ingresa tu nueva contraseña. Debe ser segura y fácil de recordar.
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.newPassword"
            label="Nueva Contraseña"
            :type="showNewPassword ? 'text' : 'password'"
            outlined
            :rules="passwordRules"
            :disable="loading"
            autofocus
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
            <template #append>
              <q-icon
                :name="showNewPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showNewPassword = !showNewPassword"
              />
            </template>
          </q-input>

          <!-- Indicador de fuerza de contraseña -->
          <div v-if="form.newPassword" class="q-mb-md">
            <div class="text-caption text-grey-7 q-mb-xs">
              Seguridad de la contraseña:
            </div>
            <q-linear-progress
              :value="passwordStrength / 100"
              :color="passwordStrengthColor"
              class="q-mb-xs"
              rounded
            />
            <div class="text-caption" :class="`text-${passwordStrengthColor}`">
              {{ passwordStrengthText }}
            </div>
          </div>

          <q-input
            v-model="form.confirmPassword"
            label="Confirmar Contraseña"
            :type="showConfirmPassword ? 'text' : 'password'"
            outlined
            :rules="confirmPasswordRules"
            :disable="loading"
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
            <template #append>
              <q-icon
                :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>

          <!-- Requisitos de contraseña -->
          <div class="text-caption text-grey-7 q-pa-sm bg-grey-3 rounded-borders">
            <div class="text-weight-bold q-mb-xs">La contraseña debe tener:</div>
            <div :class="hasMinLength ? 'text-positive' : ''">
              <q-icon :name="hasMinLength ? 'check' : 'radio_button_unchecked'" size="xs" />
              Mínimo 8 caracteres
            </div>
            <div :class="hasUpperCase ? 'text-positive' : ''">
              <q-icon :name="hasUpperCase ? 'check' : 'radio_button_unchecked'" size="xs" />
              Al menos 1 mayúscula
            </div>
            <div :class="hasLowerCase ? 'text-positive' : ''">
              <q-icon :name="hasLowerCase ? 'check' : 'radio_button_unchecked'" size="xs" />
              Al menos 1 minúscula
            </div>
            <div :class="hasNumberOrSymbol ? 'text-positive' : ''">
              <q-icon :name="hasNumberOrSymbol ? 'check' : 'radio_button_unchecked'" size="xs" />
              Al menos 1 número o símbolo
            </div>
          </div>

          <q-btn
            type="submit"
            label="Restablecer Contraseña"
            color="primary"
            size="lg"
            class="full-width"
            :loading="loading"
            :disable="loading || !isFormValid"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const form = ref({
  newPassword: '',
  confirmPassword: '',
});

const loading = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Obtener token de URL
const token = computed(() => route.query.token as string);

// Validaciones de contraseña
const hasMinLength = computed(() => form.value.newPassword.length >= 8);
const hasUpperCase = computed(() => /[A-Z]/.test(form.value.newPassword));
const hasLowerCase = computed(() => /[a-z]/.test(form.value.newPassword));
const hasNumberOrSymbol = computed(
  () => /[\d\W]/.test(form.value.newPassword)
);

const passwordStrength = computed(() => {
  let strength = 0;
  if (hasMinLength.value) strength += 25;
  if (hasUpperCase.value) strength += 25;
  if (hasLowerCase.value) strength += 25;
  if (hasNumberOrSymbol.value) strength += 25;
  return strength;
});

const passwordStrengthColor = computed(() => {
  if (passwordStrength.value < 50) return 'negative';
  if (passwordStrength.value < 75) return 'warning';
  return 'positive';
});

const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 50) return 'Débil';
  if (passwordStrength.value < 75) return 'Media';
  return 'Fuerte';
});

const isFormValid = computed(() => {
  return (
    hasMinLength.value &&
    hasUpperCase.value &&
    hasLowerCase.value &&
    hasNumberOrSymbol.value &&
    form.value.newPassword === form.value.confirmPassword
  );
});

const passwordRules = [
  (val: string) => !!val || 'La contraseña es requerida',
  (val: string) => val.length >= 8 || 'Debe tener al menos 8 caracteres',
  (val: string) =>
    /[A-Z]/.test(val) || 'Debe contener al menos 1 mayúscula',
  (val: string) =>
    /[a-z]/.test(val) || 'Debe contener al menos 1 minúscula',
  (val: string) =>
    /[\d\W]/.test(val) || 'Debe contener al menos 1 número o símbolo',
];

const confirmPasswordRules = [
  (val: string) => !!val || 'Confirma tu contraseña',
  (val: string) =>
    val === form.value.newPassword || 'Las contraseñas no coinciden',
];

async function handleSubmit() {
  if (!token.value) {
    $q.notify({
      type: 'negative',
      message: 'Token inválido',
      caption: 'El enlace de recuperación no es válido',
    });
    return;
  }

  loading.value = true;
  try {
    await api.post('/auth/password-reset/reset', {
      token: token.value,
      newPassword: form.value.newPassword,
      confirmPassword: form.value.confirmPassword,
    });

    $q.notify({
      type: 'positive',
      message: '¡Contraseña restablecida!',
      caption: 'Ya puedes iniciar sesión con tu nueva contraseña',
    });

    // Redirigir al login después de 2 segundos
    setTimeout(() => {
      void router.push({ name: 'login' });
    }, 2000);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Error al restablecer la contraseña';

    $q.notify({
      type: 'negative',
      message: errorMessage,
      caption: 'Verifica que el enlace no haya expirado',
    });
  } finally {
    loading.value = false;
  }
}
</script>
