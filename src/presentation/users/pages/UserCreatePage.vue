<template>
  <q-page class="user-create-page q-pa-xl">
    <!-- Header -->
    <div class="q-mb-xl">
      <div class="row items-center q-mb-md">
        <q-btn flat round icon="arrow_back" color="primary" @click="goBack" class="q-mr-sm">
          <q-tooltip>Volver</q-tooltip>
        </q-btn>
        <div class="col">
          <div class="text-h4 text-weight-bold text-primary q-mb-xs">Crear Nuevo Usuario</div>
          <div class="text-body1 text-grey-7">
            Registra un nuevo usuario en el sistema. Completa todos los pasos del formulario.
          </div>
        </div>
      </div>
    </div>

    <!-- Wizard -->
    <q-card flat bordered class="wizard-card">
      <q-card-section class="q-pa-none">
        <!-- Wizard Steps -->
        <q-stepper v-model="step" color="primary" animated flat class="wizard-stepper">
          <q-step :name="1" title="Información Básica" icon="person" :done="step > 1">
            <div class="q-pa-lg">
              <div class="text-subtitle1 q-mb-md text-weight-medium">Datos Personales</div>
              <q-form ref="basicFormRef" @submit="nextStep" class="column q-gutter-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="form.documentType"
                      outlined
                      label="Tipo de Documento *"
                      :options="documentTypeOptions"
                      :rules="[(val) => !!val || 'El tipo de documento es requerido']"
                      :disable="loading"
                    >
                      <template #prepend>
                        <q-icon name="badge" />
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.document"
                      outlined
                      :label="form.documentType === 'NIT' ? 'NIT' : 'Número de Documento *'"
                      :rules="[
                        (val) =>
                          form.documentType === 'NIT'
                            ? !val || /^[0-9]+$/.test(val) || 'Solo números'
                            : !!val || 'El número de documento es requerido',
                        (val) => /^[0-9]+$/.test(val) || 'Solo números',
                        (val) => (val.length >= 7 && val.length <= 15) || 'Entre 7 y 15 dígitos',
                      ]"
                      :disable="loading"
                      hint="Entre 7 y 15 dígitos numéricos"
                    >
                      <template #prepend>
                        <q-icon name="credit_card" />
                      </template>
                    </q-input>
                  </div>
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.name"
                      outlined
                      :label="
                        form.documentType === 'NIT' && isAdmin
                          ? 'Nombre de Contacto (Opcional)'
                          : 'Nombre Completo *'
                      "
                      :rules="
                        form.documentType === 'NIT' && isAdmin
                          ? [
                              (val) =>
                                !val || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo letras',
                              (val) => !val || val.length >= 2 || 'Mínimo 2 caracteres',
                            ]
                          : [
                              (val) => !!val || 'El nombre es requerido',
                              (val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo letras',
                              (val) => val.length >= 2 || 'Mínimo 2 caracteres',
                            ]
                      "
                      :disable="loading"
                      :hint="
                        form.documentType === 'NIT' && isAdmin
                          ? 'Persona de contacto de la empresa'
                          : ''
                      "
                    >
                      <template #prepend>
                        <q-icon name="person" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.email"
                      outlined
                      type="email"
                      label="Correo Electrónico *"
                      :rules="[
                        (val) => !!val || 'El email es requerido',
                        (val) => isValidEmail(val) || 'Email inválido',
                        (val) => val.length <= 100 || 'Máximo 100 caracteres',
                      ]"
                      :disable="loading"
                    >
                      <template #prepend>
                        <q-icon name="email" />
                      </template>
                    </q-input>
                  </div>
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.phone"
                      outlined
                      label="Teléfono"
                      mask="+57 ### ### ####"
                      fill-mask
                      :rules="[
                        (val) => {
                          if (!val) return true;
                          const digits = val.replace(/\D/g, '');
                          // Debe tener código de país (1-3 dígitos) + exactamente 10 dígitos
                          // Total: entre 11 y 13 dígitos
                          return (
                            (digits.length >= 11 && digits.length <= 13) ||
                            'Debe tener código de país (1-3 dígitos) + 10 dígitos'
                          );
                        },
                      ]"
                      :disable="loading"
                      hint="Formato: +57 300 123 4567 (código de país + 10 dígitos)"
                    >
                      <template #prepend>
                        <q-icon name="phone" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-form>
            </div>
          </q-step>

          <q-step :name="2" title="Tipo y Rol" icon="category" :done="step > 2">
            <div class="q-pa-lg">
              <div class="text-subtitle1 q-mb-md text-weight-medium">Configuración de Usuario</div>
              <q-form ref="typeFormRef" @submit="nextStep" class="column q-gutter-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="form.personType"
                      outlined
                      label="Tipo de Persona *"
                      :options="personTypeOptions"
                      option-label="label"
                      option-value="value"
                      emit-value
                      map-options
                      :rules="[(val) => !!val || 'El tipo de persona es requerido']"
                      :disable="loading || isNIT || isCliente"
                      :hint="
                        isCliente
                          ? 'Automáticamente establecido como Persona Natural para alumnos'
                          : isNIT
                            ? 'Automáticamente establecido como Persona Jurídica para NIT'
                            : ''
                      "
                      @update:model-value="onPersonTypeChange"
                    >
                      <template #prepend>
                        <q-icon name="account_box" />
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="form.role"
                      outlined
                      label="Rol *"
                      :options="roleOptions"
                      option-label="label"
                      option-value="value"
                      emit-value
                      map-options
                      :rules="[(val) => !!val || 'El rol es requerido']"
                      :disable="loading || isNIT || isCliente"
                      :hint="
                        isCliente
                          ? 'Automáticamente establecido como Alumno'
                          : isNIT
                            ? 'Automáticamente establecido como Cliente Institucional para NIT'
                            : ''
                      "
                    >
                      <template #prepend>
                        <q-icon name="badge" />
                      </template>
                    </q-select>
                  </div>

                  <div class="col-12">
                    <q-input
                      v-if="form.personType === 'juridica'"
                      v-model="form.companyName"
                      outlined
                      label="Razón Social *"
                      :rules="
                        form.personType === 'juridica'
                          ? [(val) => !!val || 'La razón social es requerida']
                          : []
                      "
                      :disable="loading"
                    >
                      <template #prepend>
                        <q-icon name="business" />
                      </template>
                    </q-input>
                  </div>

                  <!-- Select de Empresa (solo para ADMIN) -->
                  <div v-if="isAdmin" class="col-12">
                    <q-select
                      v-model="form.empresaId"
                      outlined
                      label="Empresa"
                      :options="empresas"
                      option-label="razonSocial"
                      option-value="id"
                      emit-value
                      map-options
                      :loading="loadingEmpresas"
                      clearable
                      hint="Seleccione la empresa a la que pertenecerá el usuario"
                    >
                      <template #prepend>
                        <q-icon name="business" />
                      </template>
                      <template #option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.razonSocial }}</q-item-label>
                            <q-item-label caption>
                              {{ scope.opt.numeroDocumento }} - {{ scope.opt.email || 'Sin email' }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>

                  <!-- Información para CLIENTE -->
                  <div v-if="!isAdmin && currentUserEmpresaId" class="col-12">
                    <q-card flat bordered class="q-pa-md bg-blue-1">
                      <div class="row items-center q-gutter-sm">
                        <q-icon name="info" color="primary" size="24px" />
                        <div class="col">
                          <div class="text-subtitle2 text-weight-medium q-mb-xs">
                            Empresa Asociada
                          </div>
                          <div class="text-body2 text-grey-7">
                            El usuario será asociado automáticamente a su empresa.
                          </div>
                        </div>
                      </div>
                    </q-card>
                  </div>
                </div>

                <q-input
                  v-if="form.role === 'driver'"
                  :model-value="isCliente ? currentUserEmpresaName || '' : form.company"
                  outlined
                  :label="isCliente ? 'Empresa' : 'Empresa (Opcional)'"
                  :disable="loading || isCliente"
                  :hint="
                    isCliente
                      ? 'Empresa asociada automáticamente'
                      : 'Empresa a la que pertenece el conductor'
                  "
                  :readonly="isCliente"
                  @update:model-value="
                    (val: string | number | null) => {
                      if (!isCliente && typeof val === 'string') form.company = val;
                    }
                  "
                >
                  <template #prepend>
                    <q-icon name="business" />
                  </template>
                </q-input>

                <!-- Conductor Externo (RF-04) - Solo para ADMIN -->
                <q-card
                  v-if="form.role === 'driver' && isAdmin"
                  flat
                  bordered
                  class="q-pa-md bg-blue-1"
                >
                  <div class="row items-center q-gutter-sm">
                    <q-icon name="info" color="primary" size="24px" />
                    <div class="col">
                      <div class="text-subtitle2 text-weight-medium q-mb-xs">Conductor Externo</div>
                      <div class="text-body2 text-grey-7">
                        Los conductores externos deben ser habilitados por el Administrador después
                        de registrar el pago correspondiente (RF-05).
                      </div>
                    </div>
                    <q-toggle
                      v-model="form.isExternal"
                      label="Es conductor externo"
                      color="primary"
                      :disable="loading"
                    />
                  </div>
                </q-card>
              </q-form>
            </div>
          </q-step>

          <q-step :name="3" title="Configuración" icon="settings" :done="step > 3">
            <div class="q-pa-lg">
              <div class="text-subtitle1 q-mb-md text-weight-medium">Configuración Adicional</div>
              <q-form ref="configFormRef" @submit="nextStep" class="column q-gutter-md">
                <q-checkbox
                  v-model="form.enabled"
                  label="Usuario habilitado"
                  :disable="loading"
                  color="primary"
                >
                  <template #default>
                    <div class="column q-ml-sm">
                      <div class="text-body2">El usuario podrá iniciar sesión inmediatamente</div>
                      <div v-if="form.isExternal" class="text-caption text-warning q-mt-xs">
                        ⚠️ Los conductores externos requieren habilitación manual después del pago
                        (RF-05)
                      </div>
                    </div>
                  </template>
                </q-checkbox>

                <q-separator />

                <!-- <div v-if="form.role === 'driver'" class="column q-gutter-sm">
                  <div class="text-subtitle2 text-weight-medium">
                    Información Adicional (Opcional)
                  </div>
                  <q-input
                    v-model="form.studentCode"
                    outlined
                    label="Código de Estudiante"
                    :disable="loading"
                    hint="Código único del estudiante en el sistema"
                  >
                    <template #prepend>
                      <q-icon name="school" />
                    </template>
                  </q-input>
                </div> -->

                <!-- Solo mostrar información adicional para empresas si es persona natural con rol institutional -->
                <!-- Si es persona jurídica, la razón social ya se capturó en el paso 2 -->
                <div
                  v-if="form.role === 'institutional' && form.personType === 'natural'"
                  class="column q-gutter-sm"
                >
                  <div class="text-subtitle2 text-weight-medium">Información de Empresa</div>
                  <q-input
                    v-model="form.companyName"
                    outlined
                    label="Razón Social (Opcional)"
                    :disable="loading"
                    hint="Opcional para personas naturales con rol institucional"
                  >
                    <template #prepend>
                      <q-icon name="business" />
                    </template>
                  </q-input>
                </div>
              </q-form>
            </div>
          </q-step>

          <q-step :name="4" title="Revisión" icon="preview">
            <div class="q-pa-lg">
              <div class="text-subtitle1 q-mb-md text-weight-medium">Revisar Información</div>
              <div class="review-section">
                <q-card flat bordered class="q-pa-md q-mb-md">
                  <div class="text-subtitle2 q-mb-sm text-weight-medium">Datos Personales</div>
                  <q-list separator>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Tipo de Documento</q-item-label>
                        <q-item-label>{{ getDocumentTypeLabel(form.documentType) }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Número de Documento</q-item-label>
                        <q-item-label>{{ form.document }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="form.personType === 'natural'">
                      <q-item-section>
                        <q-item-label caption>Nombre Completo</q-item-label>
                        <q-item-label>{{ form.name }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="form.personType === 'juridica'">
                      <q-item-section>
                        <q-item-label caption>Razón Social</q-item-label>
                        <q-item-label>{{ form.companyName }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Email</q-item-label>
                        <q-item-label>{{ form.email }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="form.phone">
                      <q-item-section>
                        <q-item-label caption>Teléfono</q-item-label>
                        <q-item-label>{{ form.phone }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card>

                <q-card flat bordered class="q-pa-md q-mb-md">
                  <div class="text-subtitle2 q-mb-sm text-weight-medium">Configuración</div>
                  <q-list separator>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Tipo de Persona</q-item-label>
                        <q-item-label>
                          {{
                            form.personType === 'juridica' ? 'Persona Jurídica' : 'Persona Natural'
                          }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Rol</q-item-label>
                        <q-item-label>{{ getRoleLabel(form.role) }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="form.companyName">
                      <q-item-section>
                        <q-item-label caption>Razón Social / Empresa</q-item-label>
                        <q-item-label>{{ form.companyName }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="form.isExternal">
                      <q-item-section>
                        <q-item-label caption>Conductor Externo</q-item-label>
                        <q-item-label>
                          <q-badge color="warning" outline>Sí</q-badge>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Estado</q-item-label>
                        <q-item-label>
                          <q-badge :color="form.enabled ? 'positive' : 'negative'" outline>
                            {{ form.enabled ? 'Habilitado' : 'Deshabilitado' }}
                          </q-badge>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card>
              </div>
            </div>
          </q-step>

          <template #navigation>
            <q-stepper-navigation>
              <q-btn
                v-if="step > 1"
                flat
                color="primary"
                label="Atrás"
                class="q-mr-sm"
                @click="previousStep"
              />
              <q-btn v-if="step < 4" color="primary" label="Siguiente" @click="nextStep" />
              <q-btn
                v-else
                color="primary"
                label="Crear Usuario"
                :loading="loading"
                @click="handleSubmit"
              />
              <q-btn flat label="Cancelar" color="grey" class="q-ml-sm" @click="goBack" />
            </q-stepper-navigation>
          </template>
        </q-stepper>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useUserCreateForm } from '../composables/useUserCreateForm';

const {
  step,
  loading,
  form,
  basicFormRef,
  typeFormRef,
  configFormRef,
  isNIT,
  documentTypeOptions,
  personTypeOptions,
  roleOptions,
  empresas,
  loadingEmpresas,
  isAdmin,
  isCliente,
  currentUserEmpresaId,
  currentUserEmpresaName,
  isValidEmail,
  onPersonTypeChange,
  nextStep,
  previousStep,
  handleSubmit,
  getDocumentTypeLabel,
  getRoleLabel,
  goBack,
} = useUserCreateForm();
</script>

<style scoped lang="scss">
.user-create-page {
  background: #f9fafb;
  transition: background-color 0.3s ease;
}

body.body--dark .user-create-page {
  background: #0f172a;
}

.wizard-card {
  background: white;
  transition: background-color 0.3s ease;
}

body.body--dark .wizard-card {
  background: #1e1b4b;
}

.wizard-stepper {
  background: transparent;
}

.review-section {
  max-width: 800px;
}
</style>
