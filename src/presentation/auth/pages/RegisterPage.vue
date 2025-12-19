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
          label="Nombres *"
          outlined
          class="col"
          :rules="[
            (val) => !!val || 'Los nombres son requeridos',
            (val) => val.trim().length >= 2 || 'Mínimo 2 caracteres',
            (val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(val) || 'Solo se permiten letras y espacios',
          ]"
          :disable="loading"
          hint="Solo letras, mínimo 2 caracteres"
        />
        <q-input
          v-model="form.apellidos"
          label="Apellidos *"
          outlined
          class="col"
          :rules="[
            (val) => !!val || 'Los apellidos son requeridos',
            (val) => val.trim().length >= 2 || 'Mínimo 2 caracteres',
            (val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(val) || 'Solo se permiten letras y espacios',
          ]"
          :disable="loading"
          hint="Solo letras, mínimo 2 caracteres"
        />
        </div>

        <div class="row q-gutter-sm">
          <q-select
            v-model="form.tipoDocumento"
            label="Tipo de Documento"
            outlined
            :options="tiposDocumento"
            class="col-4"
            :rules="[(val) => !!val || 'El tipo de documento es requerido']"
            :disable="loading"
          />
          <q-input
            v-model="form.numeroDocumento"
            label="Número de Documento *"
            outlined
            class="col-8"
            :rules="[
              (val) => !!val || 'El número de documento es requerido',
              (val) => /^[0-9]+$/.test(val) || 'Solo se permiten números',
              (val) => val.length >= 7 || 'Mínimo 7 dígitos',
              (val) => val.length <= 15 || 'Máximo 15 dígitos',
            ]"
            :disable="loading"
            hint="Solo números, entre 7 y 15 dígitos"
          />
        </div>

        <q-input
          v-model="form.email"
          label="Email *"
          type="email"
          outlined
          :rules="[
            (val) => !!val || 'El email es requerido',
            (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Email inválido',
            (val) => val.length <= 100 || 'Máximo 100 caracteres',
          ]"
          :disable="loading"
          hint="Formato: usuario@dominio.com"
        >
          <template #prepend>
            <q-icon name="email" />
          </template>
        </q-input>

        <q-input
          v-model="form.telefono"
          label="Teléfono (Opcional)"
          outlined
          :rules="[
            (val) => !val || /^[0-9+\-\s()]+$/.test(val) || 'Formato inválido',
            (val) => !val || val.length <= 20 || 'Máximo 20 caracteres',
          ]"
          :disable="loading"
          hint="Formato: +57 300 1234567"
        >
          <template #prepend>
            <q-icon name="phone" />
          </template>
        </q-input>

        <!-- Credenciales -->
        <div class="text-subtitle2 q-mt-md">Credenciales de Acceso</div>

        <q-input
          v-model="form.username"
          label="Nombre de Usuario *"
          outlined
          :rules="[
            (val) => !!val || 'El nombre de usuario es requerido',
            (val) => val.length >= 3 || 'Mínimo 3 caracteres',
            (val) => val.length <= 30 || 'Máximo 30 caracteres',
            (val) => /^[a-zA-Z0-9_]+$/.test(val) || 'Solo letras, números y guión bajo',
            (val) => !val.startsWith('_') || 'No puede comenzar con guión bajo',
            (val) => !val.endsWith('_') || 'No puede terminar con guión bajo',
          ]"
          :disable="loading"
          hint="3-30 caracteres, letras, números y guión bajo"
        >
          <template #prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <q-input
          v-model="form.password"
          label="Contraseña *"
          type="password"
          outlined
          :rules="[
            (val) => !!val || 'La contraseña es requerida',
            (val) => val.length >= 8 || 'Mínimo 8 caracteres',
            (val) => val.length <= 50 || 'Máximo 50 caracteres',
            (val) => /[A-Z]/.test(val) || 'Debe contener al menos una mayúscula',
            (val) => /[a-z]/.test(val) || 'Debe contener al menos una minúscula',
            (val) => /[0-9]/.test(val) || 'Debe contener al menos un número',
          ]"
          :disable="loading"
          hint="Mínimo 8 caracteres, mayúscula, minúscula y número"
        >
          <template #prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <q-input
          v-model="confirmPassword"
          label="Confirmar Contraseña *"
          type="password"
          outlined
          :rules="[
            (val) => !!val || 'Confirma tu contraseña',
            (val) => val === form.password || 'Las contraseñas no coinciden',
          ]"
          :disable="loading"
          hint="Debe coincidir con la contraseña"
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
            :rules="[
              (val) => !val || val.length <= 20 || 'Máximo 20 caracteres',
              (val) => !val || /^[A-Z0-9-]+$/.test(val) || 'Solo mayúsculas, números y guiones',
            ]"
            :disable="loading"
            hint="Formato: ABC123 o ABC-123"
          >
            <template #prepend>
              <q-icon name="badge" />
            </template>
          </q-input>
        </template>

        <template v-if="tipoRegistro === 'INSTRUCTOR'">
          <q-input
            v-model="form.especialidad"
            label="Especialidad (Opcional)"
            outlined
            :rules="[
              (val) => !val || val.length >= 3 || 'Mínimo 3 caracteres',
              (val) => !val || val.length <= 100 || 'Máximo 100 caracteres',
            ]"
            :disable="loading"
            hint="Área de especialización del instructor"
          >
            <template #prepend>
              <q-icon name="workspace_premium" />
            </template>
          </q-input>
          <q-input
            v-model="form.biografia"
            label="Biografía (Opcional)"
            type="textarea"
            outlined
            rows="3"
            :rules="[
              (val) => !val || val.length <= 500 || 'Máximo 500 caracteres',
            ]"
            :disable="loading"
            hint="Descripción profesional (máximo 500 caracteres)"
          >
            <template #prepend>
              <q-icon name="description" />
            </template>
          </q-input>
        </template>

        <!-- Aceptación de Políticas (RF-43, RF-44) -->
        <q-separator class="q-my-md" />
        <div class="text-subtitle2 q-mb-sm">Aceptación de Políticas *</div>
        
        <div class="column q-gutter-sm">
          <q-checkbox
            v-model="aceptaPoliticaDatos"
            :disable="loading"
            class="q-mb-sm"
          >
            <template #default>
              <div class="row items-center">
                <span class="q-mr-xs">Acepto la</span>
                <a href="#" class="text-primary text-weight-medium" @click.prevent="verPoliticaDatos">
                  Política de Tratamiento de Datos Personales
                </a>
              </div>
            </template>
          </q-checkbox>
          
          <q-checkbox
            v-model="aceptaTerminos"
            :disable="loading"
            class="q-mb-sm"
          >
            <template #default>
              <div class="row items-center">
                <span class="q-mr-xs">Acepto los</span>
                <a href="#" class="text-primary text-weight-medium" @click.prevent="verTerminos">
                  Términos y Condiciones de Uso
                </a>
              </div>
            </template>
          </q-checkbox>
          
          <div v-if="!aceptaPoliticaDatos || !aceptaTerminos" class="text-negative text-caption q-mt-xs">
            * Debes aceptar ambas políticas para continuar
          </div>
        </div>

        <q-btn
          type="submit"
          label="Registrarse"
          color="primary"
          size="lg"
          class="full-width"
          :loading="loading"
          :disable="loading || !aceptaPoliticaDatos || !aceptaTerminos"
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
const aceptaPoliticaDatos = ref(false);
const aceptaTerminos = ref(false);

const tiposDocumento = [
  { label: 'Cédula de Ciudadanía', value: 'CC' },
  { label: 'Cédula de Extranjería', value: 'CE' },
  { label: 'Pasaporte', value: 'PA' },
  { label: 'Tarjeta de Identidad', value: 'TI' },
  { label: 'NIT', value: 'NIT' },
];

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

function verPoliticaDatos() {
  // TODO: Implementar modal o página con política de tratamiento de datos
  $q.notify({
    type: 'info',
    message: 'Política de tratamiento de datos - Próximamente',
    position: 'top',
  });
}

function verTerminos() {
  // TODO: Implementar modal o página con términos y condiciones
  $q.notify({
    type: 'info',
    message: 'Términos y condiciones - Próximamente',
    position: 'top',
  });
}

async function handleSubmit() {
  // Validar aceptación de políticas (RF-43, RF-44)
  if (!aceptaPoliticaDatos.value || !aceptaTerminos.value) {
    $q.notify({
      type: 'negative',
      message: 'Debes aceptar las políticas y términos para continuar',
      position: 'top',
    });
    return;
  }

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

