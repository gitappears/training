<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-xl">
      <div class="text-center q-mb-lg">
        <div class="text-h4 q-mb-xs">Crear Cuenta</div>
        <div class="text-body2 text-grey-7">
          Completa el formulario para registrarte en el sistema
        </div>
      </div>

      <q-form @submit="handleSubmit" class="q-gutter-md">
        <q-tabs v-model="tipoRegistro" class="q-mb-md">
          <q-tab name="ALUMNO" label="Alumno" />
          <q-tab name="INSTRUCTOR" label="Instructor" />
        </q-tabs>

        <q-separator />

        <!-- Información Personal -->
        <div class="text-subtitle2 q-mt-md">Información Personal</div>

        <div class="row q-gutter-sm">
          <q-input
            v-model="form.nombres"
            label="Nombres"
            outlined
            class="col"
            :rules="[(val) => !!val || 'Los nombres son requeridos']"
            :disable="loading"
          />
          <q-input
            v-model="form.apellidos"
            label="Apellidos"
            outlined
            class="col"
            :rules="[(val) => !!val || 'Los apellidos son requeridos']"
            :disable="loading"
          />
        </div>

        <q-input
          v-model="form.numeroDocumento"
          label="Número de Documento"
          outlined
          :rules="[(val) => !!val || 'El número de documento es requerido']"
          :disable="loading"
        />

        <q-input
          v-model="form.email"
          label="Email"
          type="email"
          outlined
          :rules="[
            (val) => !!val || 'El email es requerido',
            (val) => /.+@.+\..+/.test(val) || 'Email inválido',
          ]"
          :disable="loading"
        >
          <template #prepend>
            <q-icon name="email" />
          </template>
        </q-input>

        <q-input
          v-model="form.telefono"
          label="Teléfono (Opcional)"
          outlined
          :disable="loading"
        />

        <!-- Credenciales -->
        <div class="text-subtitle2 q-mt-md">Credenciales de Acceso</div>

        <q-input
          v-model="form.username"
          label="Nombre de Usuario"
          outlined
          :rules="[
            (val) => !!val || 'El nombre de usuario es requerido',
            (val) => val.length >= 3 || 'Mínimo 3 caracteres',
          ]"
          :disable="loading"
        >
          <template #prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <q-input
          v-model="form.password"
          label="Contraseña"
          type="password"
          outlined
          :rules="[
            (val) => !!val || 'La contraseña es requerida',
            (val) => val.length >= 6 || 'Mínimo 6 caracteres',
          ]"
          :disable="loading"
        >
          <template #prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <q-input
          v-model="confirmPassword"
          label="Confirmar Contraseña"
          type="password"
          outlined
          :rules="[
            (val) => !!val || 'Confirma tu contraseña',
            (val) => val === form.password || 'Las contraseñas no coinciden',
          ]"
          :disable="loading"
        >
          <template #prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <!-- Campos específicos por tipo -->
        <template v-if="tipoRegistro === 'ALUMNO'">
          <q-input
            v-model="form.codigoEstudiante"
            label="Código de Estudiante (Opcional)"
            outlined
            :disable="loading"
          />
        </template>

        <template v-if="tipoRegistro === 'INSTRUCTOR'">
          <q-input
            v-model="form.especialidad"
            label="Especialidad (Opcional)"
            outlined
            :disable="loading"
          />
          <q-input
            v-model="form.biografia"
            label="Biografía (Opcional)"
            type="textarea"
            outlined
            rows="3"
            :disable="loading"
          />
        </template>

        <q-btn
          type="submit"
          label="Registrarse"
          color="primary"
          size="lg"
          class="full-width"
          :loading="loading"
          :disable="loading"
        />

        <div class="text-center q-mt-md">
          <span class="text-body2 text-grey-7">¿Ya tienes una cuenta? </span>
          <q-btn
            flat
            label="Inicia Sesión"
            no-caps
            color="primary"
            :to="{ name: 'login' }"
            :disable="loading"
          />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../../../stores/auth.store';
import type { RegisterDto } from '../../../application/auth/auth.repository.port';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const tipoRegistro = ref<'ALUMNO' | 'INSTRUCTOR'>('ALUMNO');
const confirmPassword = ref('');

const form = ref<RegisterDto>({
  numeroDocumento: '',
  tipoDocumento: 'CC',
  nombres: '',
  apellidos: '',
  email: '',
  telefono: '',
  username: '',
  password: '',
  tipoRegistro: 'ALUMNO',
});

const loading = computed(() => authStore.loading);

// Actualizar tipoRegistro en el form cuando cambia
watch(tipoRegistro, (newValue) => {
  form.value.tipoRegistro = newValue;
});

async function handleSubmit() {
  try {
    await authStore.register(form.value);
    $q.notify({
      type: 'positive',
      message: 'Registro exitoso. Bienvenido!',
    });
    void router.push('/');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error al registrar usuario';
    $q.notify({
      type: 'negative',
      message: errorMessage,
    });
  }
}
</script>

