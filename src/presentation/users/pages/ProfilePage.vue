<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Profile Header -->
      <div class="col-12">
        <q-card class="my-card">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Mi Perfil</div>
            <div class="text-subtitle2">Administra tu información personal y de seguridad</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Edit Form -->
      <div class="col-12 col-md-8">
        <q-card v-if="localProfile">
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Información Personal</div>
              <div class="row q-col-gutter-md">
                <!-- Read-only fields -->
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    :model-value="localProfile.numeroDocumento"
                    label="No. Documento"
                    readonly
                    hint="No editable"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model="localProfile.username"
                    label="Usuario"
                    readonly
                    hint="No editable"
                  />
                </div>

                <!-- Editable fields -->
                <div class="col-12 col-md-6">
                  <q-input v-model="form.nombres" label="Nombres *" outlined :rules="[val => !!val || 'Requerido']" />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="form.apellidos" label="Apellidos" outlined />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="form.email" label="Email" type="email" outlined />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="form.telefono" label="Teléfono" outlined mask="##########" />
                </div>
                <div class="col-12">
                  <q-input v-model="form.direccion" label="Dirección" outlined />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="form.fechaNacimiento" label="Fecha de Nacimiento" outlined type="date" stack-label />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.genero"
                    :options="generoOptions"
                    label="Género"
                    outlined
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12">
                  <q-input v-model="form.biografia" label="Biografía / Perfil Profesional" outlined type="textarea" rows="3" />
                </div>
              </div>
            </q-card-section>

            <q-separator class="q-my-md" />

            <q-card-section>
              <div class="text-h6 q-mb-md">Cambiar Contraseña</div>
              <div class="q-gutter-md">
                <q-input
                  v-model="form.currentPassword"
                  label="Contraseña Actual"
                  :type="isCurrentPasswordVisible ? 'text' : 'password'"
                  outlined
                  :rules="[val => !form.newPassword || !!val || 'Requerido si cambia la contraseña']"
                >
                  <template #append>
                    <q-icon
                      :name="isCurrentPasswordVisible ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isCurrentPasswordVisible = !isCurrentPasswordVisible"
                    />
                  </template>
                </q-input>
                <q-input
                  v-model="form.newPassword"
                  label="Nueva Contraseña"
                  :type="isNewPasswordVisible ? 'text' : 'password'"
                  outlined
                  :rules="[val => !val || val.length >= 8 || 'Mínimo 8 caracteres']"
                  hint="Dejar en blanco para no cambiar"
                >
                  <template #append>
                    <q-icon
                      :name="isNewPasswordVisible ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isNewPasswordVisible = !isNewPasswordVisible"
                    />
                  </template>
                </q-input>
                <q-input
                  v-model="form.confirmPassword"
                  label="Confirmar Nueva Contraseña"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  outlined
                  :rules="[val => val === form.newPassword || 'Las contraseñas no coinciden']"
                >
                  <template #append>
                    <q-icon
                      :name="isConfirmPasswordVisible ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                    />
                  </template>
                </q-input>
              </div>
            </q-card-section>

            <q-card-actions class="q-pa-md justify-end">
              <q-btn
                label="Guardar Cambios"
                type="submit"
                color="primary"
                :loading="authStore.loading"
                icon="save"
                size="lg"
              />
            </q-card-actions>
          </q-form>
        </q-card>
        <div v-else class="text-center p-4">
          <q-spinner color="primary" size="3em" />
          <p>Cargando perfil...</p>
        </div>
      </div>

      <!-- Avatar Card -->
      <div class="col-12 col-md-4">
        <q-card class="text-center">
          <q-card-section>
            <q-avatar size="120px" font-size="52px" color="primary" text-color="white">
              <img v-if="form.fotoUrl" :src="fullImageUrl" />
              <span v-else>{{ form.nombres ? form.nombres.charAt(0) : 'U' }}</span>
            </q-avatar>
            <div class="text-h6 q-mt-sm">{{ form.nombres }} {{ form.apellidos }}</div>
            <div class="text-body2 text-grey">{{ form.email }}</div>
          </q-card-section>
          <q-card-section>
             <q-file
                v-model="photoToUpload"
                label="Cambiar foto de perfil"
                outlined
                dense
                accept="image/*"
                @update:model-value="handleFileUpload"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">O selecciona un avatar</div>
            <div class="row q-gutter-sm justify-center">
              <q-avatar
                v-for="avatar in defaultAvatars"
                :key="avatar.seed"
                size="60px"
                class="cursor-pointer avatar-option"
                @click="form.fotoUrl = avatar.url"
              >
                <img :src="avatar.url" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed, watch } from 'vue';
import { useAuthStore } from '../../../stores/auth.store';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

const authStore = useAuthStore();
const $q = useQuasar();

const localProfile = ref<any>(null); // This is just for rendering username and doc number
const photoToUpload = ref<File | null>(null);

const isCurrentPasswordVisible = ref(false);
const isNewPasswordVisible = ref(false);
const isConfirmPasswordVisible = ref(false);

const generoOptions = [
  { label: 'Masculino', value: 'M' },
  { label: 'Femenino', value: 'F' },
  { label: 'Otro', value: 'O' },
];

const defaultAvatars = [
  { seed: 'Felix', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Felix' },
  { seed: 'Mimi', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Mimi' },
  { seed: 'Sheba', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Sheba' },
  { seed: 'Max', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Max' },
  { seed: 'Abby', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Abby' },
];

const form = reactive({
  nombres: '',
  apellidos: '',
  email: '',
  telefono: '',
  direccion: '',
  fechaNacimiento: '',
  genero: '',
  biografia: '',
  fotoUrl: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const fullImageUrl = computed(() => {
  if (!form.fotoUrl) return '';
  // Si la URL es completa, la usamos, si no, la componemos con la base de la API
  if (form.fotoUrl.startsWith('http')) {
    return form.fotoUrl;
  }
  return `${api.defaults.baseURL}${form.fotoUrl}`;
});

function populateForm() {
  if (authStore.profile) {
    localProfile.value = authStore.profile; // Keep localProfile updated
    const p = authStore.profile as any;
    form.nombres = p.nombres || '';
    form.apellidos = p.apellidos || '';
    form.email = p.email || '';
    form.telefono = p.telefono || '';
    form.direccion = p.direccion || '';
    form.fechaNacimiento = p.fechaNacimiento || '';
    form.genero = p.genero || '';
    form.biografia = p.biografia || '';
    form.fotoUrl = p.fotoUrl || '';
    // Clear password fields on form population
    form.currentPassword = '';
    form.newPassword = '';
    form.confirmPassword = '';
  }
}

onMounted(async () => {
  if (!authStore.profile) {
    await authStore.fetchProfile();
  }
  populateForm();
});

watch(
  () => authStore.profile,
  () => {
    populateForm();
  },
  { deep: true }
);

async function handleFileUpload(file: File) {
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  $q.loading.show({ message: 'Subiendo foto...' });

  try {
    const response = await api.post('/auth/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    form.fotoUrl = response.data.filePath;
    $q.notify({ type: 'positive', message: 'Foto subida. Guarda los cambios para aplicarla.' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al subir la foto.' });
  } finally {
    $q.loading.hide();
  }
}

async function onSubmit() {
  if (form.newPassword && form.newPassword !== form.confirmPassword) {
    $q.notify({
      type: 'negative',
      message: 'La nueva contraseña y su confirmación no coinciden.'
    });
    return;
  }

  try {
    const payload: { [key: string]: any } = { ...form };

    // El backend no espera este campo, es solo para validación en el frontend
    delete payload.confirmPassword;

    // No enviar campo de contraseña actual si no se está cambiando
    if (!payload.newPassword) {
      delete payload.currentPassword;
      delete payload.newPassword;
    }
    
    Object.keys(payload).forEach(key => {
      if (payload[key] === '') {
        if (['nombres', 'apellidos', 'email'].includes(key) && !payload[key]) {
           // Dejar que la validación del form se encargue
        } else {
          payload[key] = undefined;
        }
      }
    });

    await authStore.updateProfile(payload);
    
    $q.notify({
      type: 'positive',
      message: 'Perfil actualizado exitosamente'
    });

    form.currentPassword = '';
    form.newPassword = '';
    form.confirmPassword = '';
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al actualizar perfil'
    });
  }
}
</script>
