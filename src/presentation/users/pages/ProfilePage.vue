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
          <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Información Personal</div>
              <div class="row q-col-gutter-md">
                <!-- Read-only fields -->
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    :model-value="localProfile?.persona?.numeroDocumento || ''"
                    label="No. Documento"
                    readonly
                    hint="No editable"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    :model-value="localProfile.username"
                    label="Usuario"
                    readonly
                    hint="No editable"
                  />
                </div>

                <!-- Editable fields -->
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.nombres"
                    label="Nombres *"
                    outlined
                    :rules="[(val) => !!val || 'Requerido']"
                    :disable="loading"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="form.apellidos" label="Apellidos" outlined :disable="loading" />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.email"
                    label="Email"
                    type="email"
                    outlined
                    :rules="[(val) => !val || /.+@.+\..+/.test(val) || 'Email inválido']"
                    :disable="loading"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.telefono"
                    label="Teléfono"
                    outlined
                    mask="+57 ### ### ####"
                    fill-mask
                    :disable="loading"
                    hint="Formato: +57 300 123 4567"
                  />
                </div>
                <div class="col-12">
                  <q-input v-model="form.direccion" label="Dirección" outlined :disable="loading" />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.fechaNacimiento"
                    label="Fecha de Nacimiento"
                    outlined
                    type="date"
                    stack-label
                    :disable="loading"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.genero"
                    :options="generoOptions"
                    label="Género"
                    outlined
                    emit-value
                    map-options
                    :disable="loading"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="form.biografia"
                    label="Biografía / Perfil Profesional"
                    outlined
                    type="textarea"
                    rows="3"
                    :disable="loading"
                  />
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
                  :disable="loading || isValidatingPassword"
                  :loading="isValidatingPassword"
                  hint="Ingrese su contraseña actual para habilitar el cambio"
                  @blur="validateCurrentPassword"
                  @keyup.enter="validateCurrentPassword"
                >
                  <template #append>
                    <q-icon
                      v-if="isCurrentPasswordValid"
                      name="check_circle"
                      color="positive"
                      class="q-mr-xs"
                    />
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
                  :rules="[(val) => !val || val.length >= 8 || 'Mínimo 8 caracteres']"
                  hint="Dejar en blanco para no cambiar"
                  :disable="loading || !canChangePassword"
                >
                  <template #prepend>
                    <q-icon v-if="!canChangePassword" name="lock" color="grey-6" class="q-mr-xs" />
                  </template>
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
                  :rules="[(val) => val === form.newPassword || 'Las contraseñas no coinciden']"
                  :disable="loading || !canChangePassword"
                >
                  <template #prepend>
                    <q-icon v-if="!canChangePassword" name="lock" color="grey-6" class="q-mr-xs" />
                  </template>
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
                :loading="loading"
                icon="save"
                size="lg"
                :disable="loading"
              />
            </q-card-actions>
          </q-form>
        </q-card>
        <div v-else class="text-center q-pa-lg">
          <q-spinner color="primary" size="3em" />
          <p class="q-mt-md">Cargando perfil...</p>
        </div>
      </div>

      <!-- Avatar Card -->
      <div class="col-12 col-md-4">
        <q-card class="text-center">
          <q-card-section>
            <q-avatar size="120px" font-size="52px" color="primary" text-color="white">
              <img v-if="form.fotoUrl" :src="fullImageUrl" alt="Foto de perfil" />
              <span v-else>{{ form.nombres ? form.nombres.charAt(0).toUpperCase() : 'U' }}</span>
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
              :disable="loading || uploadingPhoto"
              :loading="uploadingPhoto"
              @update:model-value="handleFileUpload"
            >
              <template v-slot:prepend>
                <q-icon name="camera_alt" />
              </template>
            </q-file>
            <div v-if="uploadingPhoto" class="text-caption text-primary q-mt-xs">
              Subiendo foto...
            </div>
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
                :class="{ 'avatar-selected': form.fotoUrl === avatar.url }"
                @click="selectAvatar(avatar.url)"
              >
                <img :src="avatar.url" :alt="`Avatar ${avatar.seed}`" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useProfileForm } from '../composables/useProfileForm';
import { useAuthStore } from '../../../stores/auth.store';

const authStore = useAuthStore();

const {
  form,
  loading,
  uploadingPhoto,
  photoToUpload,
  localProfile,
  isValidatingPassword,
  isCurrentPasswordValid,
  isCurrentPasswordVisible,
  isNewPasswordVisible,
  isConfirmPasswordVisible,
  generoOptions,
  defaultAvatars,
  fullImageUrl,
  canChangePassword,
  populateForm,
  handleFileUpload,
  handleSubmit,
  selectAvatar,
  validateCurrentPassword,
} = useProfileForm();

onMounted(async () => {
  if (!authStore.profile) {
    await authStore.fetchProfile();
  }
  populateForm();
});
</script>

<style scoped lang="scss">
.avatar-option {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border: 2px solid transparent;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &.avatar-selected {
    border-color: var(--q-primary);
    box-shadow: 0 0 0 2px var(--q-primary);
  }
}
</style>
