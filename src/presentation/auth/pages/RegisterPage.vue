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
        <!-- Identificación -->
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.tipoDocumento"
              label="Tipo Doc *"
              outlined
              :options="tiposDocumento"
              emit-value
              map-options
              :disable="loading"
              :rules="[val => !!val || 'Requerido']"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.numeroDocumento"
              label="No. Documento *"
              outlined
              :disable="loading"
              :rules="[
                val => !!val || 'Requerido',
                val => /^[0-9]+$/.test(val) || 'Solo se permiten números'
              ]"
            />
          </div>
        </div>

        <!-- Nombres y Apellidos -->
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.nombres"
              label="Nombres *"
              outlined
              :disable="loading"
              :rules="[val => !!val || 'Requerido']"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.apellidos"
              label="Apellidos (Opcional)"
              outlined
              :disable="loading"
            />
          </div>
        </div>

        <!-- Contacto -->
        <q-input
          v-model="form.email"
          label="Email (Opcional)"
          type="email"
          outlined
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
          :rules="[
             val => !val || /^[0-9]+$/.test(val) || 'Solo se permiten números'
          ]"
        >
          <template #prepend>
            <q-icon name="phone" />
          </template>
        </q-input>

        <!-- Datos Demográficos -->
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-6">
             <q-input
              v-model="form.fechaNacimiento"
              label="Fecha Nacimiento (Opcional)"
              type="date"
              outlined
              stack-label
              :disable="loading"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.genero"
              label="Género (Opcional)"
              outlined
              :options="generos"
              emit-value
              map-options
              :disable="loading"
            />
          </div>
        </div>

        <q-input
          v-model="form.direccion"
          label="Dirección de Residencia (Opcional)"
          outlined
          :disable="loading"
        >
           <template #prepend>
            <q-icon name="place" />
          </template>
        </q-input>

        <q-file
          v-model="photoFile"
          label="Foto de Perfil (Opcional)"
          outlined
          :disable="loading"
          accept=".jpg, .png, .jpeg"
          @update:model-value="handleFileUpload"
        >
           <template #prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>

        <q-separator class="q-my-md" />
        <div class="text-subtitle2 q-mb-sm text-primary">Datos de Cuenta</div>

        <!-- Usuario -->
        <q-input
          v-model="form.username"
          label="Usuario *"
          outlined
          :disable="loading"
          :rules="[
            val => !!val || 'Requerido',
            val => val.length >= 3 || 'Mínimo 3 caracteres'
          ]"
        >
          <template #prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.password"
              label="Contraseña *"
              type="password"
              outlined
              :disable="loading"
              :rules="[
                val => !!val || 'Requerido',
                val => val.length >= 6 || 'Mínimo 6 caracteres'
              ]"
            />
          </div>
           <div class="col-12 col-md-6">
            <q-input
              v-model="confirmPassword"
              label="Confirmar Contraseña *"
              type="password"
              outlined
              :disable="loading"
              :rules="[
                val => !!val || 'Requerido',
                val => val === form.password || 'Las contraseñas no coinciden'
              ]"
            />
          </div>
        </div>

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

    <!-- Modal de Políticas -->
    <PoliciesModal
      v-model="showPoliticaModal"
      :policy-type="'datos'"
      :show-acceptance="true"
      @accepted="() => { aceptaPoliticaDatos = true; onPolicyAccepted(); }"
    />
    <PoliciesModal
      v-model="showTerminosModal"
      :policy-type="'terminos'"
      :show-acceptance="true"
      @accepted="() => { aceptaTerminos = true; onPolicyAccepted(); }"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../../../stores/auth.store';
import type { RegisterDto } from '../../../application/auth/auth.repository.port';
import PoliciesModal from '../../../shared/components/PoliciesModal.vue';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const aceptaPoliticaDatos = ref(false);
const aceptaTerminos = ref(false);

const generos = [
  { label: 'Masculino', value: 'M' },
  { label: 'Femenino', value: 'F' },
  { label: 'Otro', value: 'O' },
];

const tiposDocumento = [
  { label: 'Cédula de Ciudadanía', value: 'CC' },
  { label: 'Cédula de Extranjería', value: 'CE' },
  { label: 'Pasaporte', value: 'PA' },
  { label: 'NIT', value: 'NIT' },
];

// Campos adicionales para formulario
const confirmPassword = ref('');
const photoFile = ref<File | null>(null);

function handleFileUpload(file: File) {
  // TODO: Implementar subida de archivo real cuando exista endpoint
  // Por ahora solo tomamos el nombre como URL simulada si se requiere
  console.log('Archivo seleccionado:', file.name);
  form.value.fotoUrl = 'https://placeholder.com/' + file.name;
}

const form = ref<RegisterDto>({
  numeroDocumento: '',
  tipoDocumento: 'CC',
  nombres: '',
  apellidos: '',
  razonSocial: '', // Vacío por defecto
  email: '',
  telefono: '',
  fechaNacimiento: '',
  genero: '',
  direccion: '',
  fotoUrl: '',
  username: '',
  password: '',
  tipoRegistro: 'OPERADOR', // Por defecto OPERADOR
});

const loading = computed(() => authStore.loading);
const showPoliticaModal = ref(false);
const showTerminosModal = ref(false);

function verPoliticaDatos() {
  showPoliticaModal.value = true;
}

function verTerminos() {
  showTerminosModal.value = true;
}

function onPolicyAccepted() {
  $q.notify({
    type: 'positive',
    message: 'Política aceptada correctamente',
    position: 'top',
  });
}

function isValidEmail(email: string) {
  const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
  return emailPattern.test(email);
}

async function handleSubmit() {
  // Validaciones
  if (!aceptaPoliticaDatos.value || !aceptaTerminos.value) {
    $q.notify({
      type: 'negative',
      message: 'Debes aceptar las políticas y términos para continuar',
      position: 'top',
    });
    return;
  }

  if (form.value.password !== confirmPassword.value) {
    $q.notify({
      type: 'negative',
      message: 'Las contraseñas no coinciden',
      position: 'top',
    });
    return;
  }

  if (form.value.email && !isValidEmail(form.value.email)) {
    $q.notify({
      type: 'negative',
      message: 'Por favor ingrese un correo válido',
    });
    return;
  }

  try {
    // Aseguramos que valores opcionales sean undefined si están vacíos string
    const payload: RegisterDto = {
      ...form.value,
      razonSocial: '', // Siempre vacío según requerimiento
      telefono: form.value.telefono || undefined,
      fechaNacimiento: form.value.fechaNacimiento || undefined,
      genero: form.value.genero || undefined,
      direccion: form.value.direccion || undefined,
      fotoUrl: form.value.fotoUrl || undefined,
    };

    await authStore.register(payload);
    $q.notify({
      color: 'positive',
      message: 'Registro exitoso; espere aprobación del administrador. Su cuenta está deshabilitada temporalmente.',
      icon: 'check',
      timeout: 5000,
    });
    await router.push({ name: 'login' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Registration error:', error);
    let errorMessage = 'Error al registrar usuario';

    if (error.response && error.response.data) {
      const data = error.response.data;
      // Backend might return { message: '...' } or { error: '...', message: ... }
      if (data.message) {
        errorMessage = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      timeout: 5000,
    });
  }
}
</script>

