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
                      maxlength="15"
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

                  <div class="col-12" v-if="isNIT">
                    <q-input
                      v-model="form.companyName"
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
                      hint="Persona de contacto de la empresa"
                    >
                      <template #prepend>
                        <q-icon name="person" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.nombres"
                      label="Nombres *"
                      outlined
                      :disable="loading"
                      :rules="[(val) => !!val || 'Requerido']"
                      hint="Ej: Juan David"
                    >
                      <template #prepend>
                        <q-icon name="person" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.apellidos"
                      label="Apellidos *"
                      outlined
                      :disable="loading"
                      :rules="[(val) => !!val || 'Requerido']"
                      hint="Ej: García Pérez"
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
                      :disable="loading || form.isExternal"
                      clearable
                      :hint="
                        form.isExternal
                          ? 'Los conductores externos no pueden estar asociados a una empresa'
                          : 'Seleccione la empresa a la que pertenecerá el usuario'
                      "
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

                  <div class="col-12">
                    <!-- Conductor Externo (RF-04) - Solo para ADMIN -->
                    <q-card flat bordered class="q-pa-md bg-blue-1">
                      <div class="row items-center q-gutter-sm">
                        <q-icon name="info" color="primary" size="24px" />
                        <div class="col">
                          <div class="text-subtitle2 text-weight-medium q-mb-xs">
                            Conductor Externo
                          </div>
                          <div class="text-body2 text-grey-7">
                            Los conductores externos deben ser habilitados por el Administrador
                            después de registrar el pago correspondiente (RF-05).
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
                  </div>
                </div>
              </q-form>
            </div>
          </q-step>

          <q-step :name="3" title="Configuración" icon="settings" :done="step > 3">
            <div class="q-pa-lg">
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
              </q-form>
            </div>
          </q-step>

          <q-step :name="4" title="Revisión" icon="preview">
            <div class="q-pa-lg">
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
                        <q-item-label>{{
                          `${form.nombres} ${form.apellidos}`.trim() || 'Sin nombre'
                        }}</q-item-label>
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
