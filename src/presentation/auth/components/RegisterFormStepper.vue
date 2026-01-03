<template>
  <div class="register-form-container" :class="{ 'loading-overlay-active': loading }">
    <q-inner-loading :showing="loading" label="Registrando usuario..." label-class="text-primary" />
    <q-form @submit="handleSubmit">
      <q-stepper
        v-model="step"
        color="primary"
        animated
        flat
        :contracted="$q.screen.lt.md"
        class="q-mb-md"
        :class="{ 'opacity-50': loading }"
      >
        <!-- Paso 1: Foto de Perfil -->
        <q-step
          :name="1"
          title="Foto de Perfil"
          icon="camera_alt"
          :done="step > 1"
          :header-nav="step > 1"
        >
          <div class="row justify-center q-mt-md">
            <div class="col-12 col-sm-8 col-md-6">
              <div class="photo-upload-container">
                <div class="text-subtitle2 q-mb-sm text-weight-medium text-center">
                  Foto de Perfil (Opcional)
                </div>
                <div class="photo-upload-area" @click="triggerFileInput">
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept=".jpg,.png,.jpeg"
                    style="display: none"
                    :disable="loading"
                    @change="handleFileInputChange"
                  />
                  <div v-if="!photoFile" class="photo-upload-content">
                    <q-icon name="camera_alt" size="64px" color="grey-6" class="q-mb-md" />
                    <div class="text-body2 text-grey-7 q-mb-xs">Sube tu foto aquí</div>
                    <div class="text-caption text-grey-6">(máx: 5MB)</div>
                    <q-btn
                      color="primary"
                      label="Subir Foto"
                      class="q-mt-md"
                      :disable="loading"
                      @click.stop="triggerFileInput"
                    />
                  </div>
                  <div v-else class="photo-upload-preview">
                    <q-img
                      v-if="photoFilePreview"
                      :src="photoFilePreview"
                      class="photo-preview-image"
                      fit="cover"
                    />
                    <div class="photo-preview-overlay">
                      <q-btn
                        round
                        color="white"
                        text-color="primary"
                        icon="edit"
                        size="sm"
                        @click.stop="triggerFileInput"
                      />
                      <q-btn
                        round
                        color="white"
                        text-color="negative"
                        icon="delete"
                        size="sm"
                        @click.stop="removePhoto"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-step>

        <!-- Paso 2: Información Personal -->
        <q-step
          :name="2"
          title="Información Personal"
          icon="person"
          :done="step > 2"
          :header-nav="step > 2"
        >
          <div class="row q-col-gutter-md q-mt-md">
            <!-- Identificación -->
            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.tipoDocumento"
                label="Tipo Documento *"
                outlined
                :options="tiposDocumento"
                emit-value
                map-options
                :disable="loading"
                :rules="[(val) => !!val || 'Requerido']"
                hint="Tipo de documento de identificación"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.numeroDocumento"
                :label="isNIT ? 'NIT *' : 'No. Documento *'"
                outlined
                :disable="loading"
                :maxlength="10"
                :rules="[
                  (val) => !!val || 'Requerido',
                  (val) => !val || /^[0-9]+$/.test(val) || 'Solo se permiten números',
                ]"
                :hint="
                  isNIT
                    ? 'Número de identificación tributaria'
                    : 'Número de documento de identificación'
                "
              >
                <template #prepend>
                  <q-icon name="credit_card" />
                </template>
              </q-input>
            </div>

            <!-- Nombres y Apellidos / Razón Social -->
            <div class="col-12" v-if="isNIT">
              <q-input
                v-model="form.razonSocial"
                label="Razón Social *"
                outlined
                :disable="loading"
                :rules="[(val) => !!val || 'La razón social es requerida para NIT']"
                hint="Nombre legal de la empresa"
              >
                <template #prepend>
                  <q-icon name="business" />
                </template>
              </q-input>
            </div>
            <div class="col-12" v-if="isNIT">
              <q-input
                v-model="form.nombres"
                label="Nombre de Contacto"
                outlined
                :disable="loading"
                :hint="isNIT ? 'Persona de contacto de la empresa' : ''"
              >
                <template #prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-sm-6" v-if="!isNIT">
              <q-input
                v-model="form.nombres"
                label="Nombres *"
                outlined
                :disable="loading"
                :rules="[(val) => !!val || 'Requerido']"
                hint="Ej: Juan David"
              />
            </div>
            <div class="col-12 col-sm-6" v-if="!isNIT">
              <q-input
                v-model="form.apellidos"
                label="Apellidos *"
                outlined
                :disable="loading"
                hint="Ej: García Pérez"
                :rules="[(val) => !!val || 'Requerido']"
              />
            </div>

            <!-- Contacto -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.email"
                label="Email *"
                type="email"
                outlined
                :disable="loading"
                :rules="[(val) => !!val || 'Requerido']"
                hint="Ej: ejemplo@gmail.com"
              >
                <template #prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.telefono"
                outlined
                label="Teléfono"
                mask="+57 ### ### ####"
                fill-mask
                :hide-bottom-space="true"
                :rules="[
                  (val) => {
                    if (!val) return true;
                    const digits = val.replace(/\D/g, '');
                    return (
                      (digits.length >= 11 && digits.length <= 13) ||
                      'Debe tener código de país (1-3 dígitos) + 10 dígitos'
                    );
                  },
                ]"
                :disable="loading"
                hint="Formato: +57 300 123 4567"
              >
                <template #prepend>
                  <q-icon name="phone" />
                </template>
              </q-input>
            </div>
          </div>
        </q-step>

        <!-- Paso 3: Datos Adicionales -->
        <q-step
          :name="3"
          title="Datos Adicionales"
          icon="info"
          :done="step > 3"
          :header-nav="step > 3"
        >
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12 col-sm-6" v-if="!isNIT">
              <q-input
                label="Fecha Nacimiento (Opcional)"
                outlined
                v-model="fechaNacimiento"
                mask="date"
                :rules="['date']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="fechaNacimiento">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6" v-if="!isNIT">
              <q-select
                v-model="form.genero"
                label="Género (Opcional)"
                outlined
                :options="generos"
                emit-value
                map-options
                :disable="loading"
                hint="Ej: Masculino"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.direccion"
                label="Dirección de Residencia (Opcional)"
                outlined
                :disable="loading"
                hint="Ej: Calle 123 # 45-67"
              >
                <template #prepend>
                  <q-icon name="place" />
                </template>
              </q-input>
            </div>

            <!-- Información de Rol Asignado -->
            <div class="col-12">
              <q-card v-if="form.tipoDocumento" flat bordered class="q-pa-md bg-blue-1">
                <div class="row items-center q-gutter-sm">
                  <q-icon name="info" color="primary" size="24px" />
                  <div class="col">
                    <div class="text-subtitle2 text-weight-medium q-mb-xs">
                      Tipo de Registro Asignado
                    </div>
                    <div class="text-body2 text-grey-7">
                      <span v-if="isNIT">
                        Se asignará automáticamente como
                        <strong>Cliente Institucional</strong> (CLIENTE) para empresas con NIT.
                      </span>
                      <span v-else>
                        Se asignará automáticamente como <strong>Alumno</strong> (ALUMNO) para
                        personas naturales.
                      </span>
                    </div>
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </q-step>

        <!-- Paso 4: Datos de Cuenta -->
        <q-step
          :name="4"
          title="Datos de Cuenta"
          icon="lock"
          :done="step > 4"
          :header-nav="step > 4"
        >
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12">
              <q-input
                v-model="form.username"
                label="Usuario *"
                outlined
                :disable="loading"
                :rules="[
                  (val) => !!val || 'Requerido',
                  (val) => val.length >= 3 || 'Mínimo 3 caracteres',
                  (val) => !/\s/.test(val) || 'El usuario no puede contener espacios',
                ]"
                hint="Ej: juan_david_123"
              >
                <template #prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.password"
                label="Contraseña *"
                type="password"
                outlined
                :disable="loading"
                :rules="[
                  (val) => !!val || 'Requerido',
                  (val) => val.length >= 6 || 'Mínimo 6 caracteres',
                ]"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="confirmPassword"
                label="Confirmar Contraseña *"
                type="password"
                outlined
                :disable="loading"
                :rules="[
                  (val) => !!val || 'Requerido',
                  (val) => val === form.password || 'Las contraseñas no coinciden',
                ]"
              />
            </div>
          </div>
        </q-step>

        <!-- Paso 5: Aceptación de Políticas -->
        <q-step
          :name="5"
          title="Términos y Condiciones"
          icon="verified"
          :done="step > 5"
          :header-nav="step > 5"
        >
          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-md">Aceptación de Políticas *</div>

            <div class="column q-gutter-md">
              <q-checkbox v-model="aceptaPoliticaDatos" :disable="loading" class="q-mb-sm">
                <template #default>
                  <div class="row items-center">
                    <span class="q-mr-xs">Acepto la</span>
                    <a
                      href="#"
                      class="text-primary text-weight-medium"
                      @click.prevent="verPoliticaDatos"
                    >
                      Política de Tratamiento de Datos Personales
                    </a>
                  </div>
                </template>
              </q-checkbox>

              <q-checkbox v-model="aceptaTerminos" :disable="loading" class="q-mb-sm">
                <template #default>
                  <div class="row items-center">
                    <span class="q-mr-xs">Acepto los</span>
                    <a
                      href="#"
                      class="text-primary text-weight-medium"
                      @click.prevent="verTerminos"
                    >
                      Términos y Condiciones de Uso
                    </a>
                  </div>
                </template>
              </q-checkbox>

              <div
                v-if="!aceptaPoliticaDatos || !aceptaTerminos"
                class="text-negative text-caption q-mt-xs"
              >
                * Debes aceptar ambas políticas para continuar
              </div>
            </div>
          </div>
        </q-step>

        <template v-slot:navigation>
          <q-stepper-navigation>
            <q-btn
              v-if="step > 1"
              flat
              color="primary"
              label="Atrás"
              class="q-mr-sm"
              @click="step--"
              :disable="loading"
            />
            <q-btn
              v-if="step < 5"
              @click="step++"
              color="primary"
              label="Siguiente"
              :disable="loading"
            />
            <q-btn
              v-else
              type="submit"
              color="primary"
              label="Registrarse"
              :loading="loading"
              :disable="loading || !aceptaPoliticaDatos || !aceptaTerminos"
            />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </q-form>
  </div>

  <!-- Modal de Políticas -->
  <PoliciesModal
    v-model="showPoliticaModal"
    :policy-type="'datos'"
    :show-acceptance="true"
    @accepted="
      () => {
        aceptaPoliticaDatos = true;
        onPolicyAccepted();
      }
    "
  />
  <PoliciesModal
    v-model="showTerminosModal"
    :policy-type="'terminos'"
    :show-acceptance="true"
    @accepted="
      () => {
        aceptaTerminos = true;
        onPolicyAccepted();
      }
    "
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import PoliciesModal from '../../../shared/components/PoliciesModal.vue';
import { useRegisterForm } from '../composables/useRegisterForm';

const $q = useQuasar();
const step = ref(1);

const {
  form,
  loading,
  aceptaPoliticaDatos,
  aceptaTerminos,
  confirmPassword,
  showPoliticaModal,
  showTerminosModal,
  photoFile,
  isNIT,
  generos,
  tiposDocumento,
  fechaNacimiento,
  handleSubmit,
  handleFileUpload,
  verPoliticaDatos,
  verTerminos,
  onPolicyAccepted,
} = useRegisterForm();

const fileInputRef = ref<HTMLInputElement | null>(null);
const photoFilePreview = computed(() => {
  if (photoFile.value && photoFile.value instanceof File) {
    return URL.createObjectURL(photoFile.value);
  }
  return null;
});

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileInputChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] || null;
  handleFileUpload(file);
}

function removePhoto() {
  handleFileUpload(null);
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}
</script>

<style scoped lang="scss">
.register-form-container {
  position: relative;
  min-height: 400px;

  &.loading-overlay-active {
    pointer-events: none;
  }
}

.opacity-50 {
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.photo-upload-container {
  width: 100%;
}

.photo-upload-area {
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  background-color: #f7fafc;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    border-color: #4299e1;
    background-color: #edf2f7;
  }

  &:active {
    transform: scale(0.98);
  }
}

.photo-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.photo-upload-preview {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 240px;
  border-radius: 8px;
  overflow: hidden;
}

.photo-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;

  .photo-upload-preview:hover & {
    opacity: 1;
  }
}
</style>
