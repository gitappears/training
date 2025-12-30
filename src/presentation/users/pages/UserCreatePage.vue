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
                        form.documentType === 'NIT'
                          ? 'Nombre de Contacto (Opcional)'
                          : 'Nombre Completo *'
                      "
                      :rules="
                        form.documentType === 'NIT'
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
                      :hint="form.documentType === 'NIT' ? 'Persona de contacto de la empresa' : ''"
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
                      :disable="loading || isNIT"
                      :hint="
                        isNIT ? 'Automáticamente establecido como Persona Jurídica para NIT' : ''
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
                      :disable="loading || isNIT"
                      :hint="
                        isNIT
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
                </div>

                <q-input
                  v-if="form.role === 'driver'"
                  v-model="form.company"
                  outlined
                  label="Empresa (Opcional)"
                  :disable="loading"
                  hint="Empresa a la que pertenece el conductor"
                >
                  <template #prepend>
                    <q-icon name="business" />
                  </template>
                </q-input>

                <!-- Conductor Externo (RF-04) -->
                <q-card v-if="form.role === 'driver'" flat bordered class="q-pa-md bg-blue-1">
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

                <div v-if="form.role === 'driver'" class="column q-gutter-sm">
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
                </div>

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
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { QForm } from 'quasar';
import { PeopleUseCasesFactory } from '../../../application/people/people.use-cases.factory';
import { peopleService } from '../../../infrastructure/http/people/people.service';
import { authService } from '../../../infrastructure/http/auth/auth.service';
import { useRoles } from '../composables/useRoles';
import type { UserRole, PersonType } from '../../../domain/user/models';

const router = useRouter();
const $q = useQuasar();

// Estado
const step = ref(1);
const loading = ref(false);
const basicFormRef = ref<QForm | null>(null);
const typeFormRef = ref<QForm | null>(null);
const configFormRef = ref<QForm | null>(null);

interface UserForm {
  documentType: 'CC' | 'CE' | 'PA' | 'TI' | 'NIT' | null;
  document: string;
  name: string;
  email: string;
  phone: string;
  personType: PersonType | null;
  role: UserRole | null;
  companyName: string;
  company: string;
  isExternal: boolean;
  enabled: boolean;
  studentCode?: string;
}

const form = ref<UserForm>({
  documentType: null,
  document: '',
  name: '',
  email: '',
  phone: '',
  personType: null,
  role: null,
  companyName: '',
  company: '',
  isExternal: false,
  enabled: true,
  studentCode: '',
});

// Opciones
const documentTypeOptions = ['CC', 'CE', 'PA', 'TI', 'NIT'];

const personTypeOptions = [
  { label: 'Persona Natural', value: 'natural' },
  { label: 'Persona Jurídica', value: 'juridica' },
];

// Cargar roles desde el backend
const { roleOptions } = useRoles();

// Funciones
function isValidEmail(val: string): boolean | string {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(val) || 'Email inválido';
}

// Computed para verificar si el tipo de documento es NIT
const isNIT = computed(() => form.value.documentType === 'NIT');

// Watcher para aplicar validación automática cuando el tipo de documento es NIT
watch(
  () => form.value.documentType,
  (newValue) => {
    if (newValue === 'NIT') {
      // Establecer automáticamente tipo de persona como jurídica
      form.value.personType = 'juridica';
      // Establecer automáticamente rol como cliente institucional
      form.value.role = 'institutional';
    }
  },
  { immediate: true },
);

function onPersonTypeChange(value: PersonType) {
  if (value === 'natural') {
    form.value.companyName = '';
  }
}

async function nextStep() {
  if (step.value === 1) {
    const success = await basicFormRef.value?.validate();
    if (success) {
      step.value++;
    }
  } else if (step.value === 2) {
    const success = await typeFormRef.value?.validate();
    if (success) {
      step.value++;
    }
  } else if (step.value === 3) {
    const success = await configFormRef.value?.validate();
    if (success) {
      step.value++;
    }
  }
}

function previousStep() {
  if (step.value > 1) {
    step.value--;
  }
}

// Función para generar username automáticamente
function generateUsername(name: string, document: string): string {
  // Tomar el primer nombre y primer apellido, convertir a minúsculas y quitar acentos
  const nameParts = name.trim().split(' ');
  const firstName =
    nameParts[0]
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') || '';
  const lastName =
    nameParts.length > 1
      ? nameParts[nameParts.length - 1]
          ?.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') || ''
      : '';

  // Combinar nombre.apellido y agregar últimos 4 dígitos del documento
  const baseUsername = lastName ? `${firstName}.${lastName}` : firstName;
  const docSuffix = document.slice(-4);

  return `${baseUsername}.${docSuffix}`;
}

// Función para generar contraseña temporal
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const length = 12;
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TEMP_${password}`;
}

// Función para separar nombres y apellidos
function splitName(fullName: string): { nombres: string; apellidos: string } {
  const parts = fullName
    .trim()
    .split(' ')
    .filter((p) => p.length > 0);
  if (parts.length === 0) {
    return { nombres: '', apellidos: '' };
  }
  if (parts.length === 1) {
    return { nombres: parts[0] || '', apellidos: '' };
  }
  const nombres = parts[0] || '';
  const apellidos = parts.slice(1).join(' ');
  return { nombres, apellidos };
}

async function handleSubmit() {
  loading.value = true;

  try {
    // Validar formulario completo
    const validations = await Promise.all([
      basicFormRef.value?.validate(),
      typeFormRef.value?.validate(),
      configFormRef.value?.validate(),
    ]);

    if (validations.every((v) => v !== false)) {
      const { nombres, apellidos } = splitName(form.value.name);
      const username = generateUsername(form.value.name, form.value.document);
      const password = generateTemporaryPassword();

      // Si es conductor externo, usar el servicio de personas
      if (form.value.role === 'driver' && form.value.isExternal) {
        const createExternalDriverUseCase =
          PeopleUseCasesFactory.getCreateExternalDriverUseCase(peopleService);
        const driverData: {
          numeroDocumento: string;
          tipoDocumento: string;
          nombres: string;
          apellidos: string;
          email: string;
          telefono?: string;
        } = {
          numeroDocumento: form.value.document,
          tipoDocumento: form.value.documentType || 'CC',
          nombres,
          apellidos,
          email: form.value.email,
        };
        if (form.value.phone) {
          driverData.telefono = form.value.phone;
        }
        await createExternalDriverUseCase.execute(driverData);

        $q.notify({
          type: 'positive',
          message: 'Conductor externo creado exitosamente. Debe ser habilitado después del pago.',
          position: 'top',
        });
      } else if (form.value.role === 'admin') {
        // Crear administrador usando el endpoint de admin
        const adminData: {
          numeroDocumento: string;
          tipoDocumento: string;
          nombres: string;
          apellidos: string;
          email: string;
          username: string;
          password: string;
          telefono?: string;
          habilitado?: boolean;
        } = {
          numeroDocumento: form.value.document,
          tipoDocumento: form.value.documentType || 'CC',
          nombres,
          apellidos,
          email: form.value.email,
          username,
          password,
          habilitado: form.value.enabled,
        };
        if (form.value.phone) {
          adminData.telefono = form.value.phone;
        }
        await authService.createAdmin(adminData);

        $q.notify({
          type: 'positive',
          message: `Administrador creado exitosamente. Username: ${username}, Contraseña temporal: ${password}`,
          position: 'top',
          timeout: 10000,
        });
      } else {
        // Para otros roles (driver, institutional), usar el endpoint de registro
        // Mapear roles del frontend al backend
        let tipoRegistro: 'ALUMNO' | 'INSTRUCTOR' | 'OPERADOR' = 'ALUMNO';

        if (form.value.role === 'driver') {
          tipoRegistro = 'ALUMNO';
        } else if (form.value.role === 'institutional') {
          // CLIENTE no está en el enum de registro, usar OPERADOR como alternativa
          tipoRegistro = 'OPERADOR';
        }

        const registerData: {
          numeroDocumento: string;
          tipoDocumento: string;
          nombres: string;
          apellidos: string;
          email: string;
          username: string;
          password: string;
          tipoRegistro: 'ALUMNO' | 'INSTRUCTOR' | 'OPERADOR';
          telefono?: string;
          razonSocial?: string;
          codigoEstudiante?: string;
          habilitado?: boolean;
        } = {
          numeroDocumento: form.value.document,
          tipoDocumento: form.value.documentType || 'CC',
          nombres,
          apellidos,
          email: form.value.email,
          username,
          password,
          tipoRegistro,
          habilitado: form.value.enabled,
        };

        if (form.value.phone) {
          registerData.telefono = form.value.phone;
        }
        if (form.value.companyName) {
          registerData.razonSocial = form.value.companyName;
        }
        if (form.value.studentCode) {
          registerData.codigoEstudiante = form.value.studentCode;
        }

        await authService.register(registerData);

        // Mensaje de éxito
        const message = form.value.enabled
          ? `Usuario registrado y habilitado exitosamente. Username: ${username}, Contraseña temporal: ${password}`
          : `Usuario registrado exitosamente. Username: ${username}, Contraseña temporal: ${password}. Debe ser habilitado por el administrador.`;

        $q.notify({
          type: 'positive',
          message,
          position: 'top',
          timeout: 10000,
        });
      }

      void router.push('/users');
    } else {
      $q.notify({
        type: 'negative',
        message: 'Por favor, complete todos los campos requeridos',
        position: 'top',
      });
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al crear el usuario',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}

function getDocumentTypeLabel(type: string | null): string {
  const labels: Record<string, string> = {
    CC: 'Cédula de Ciudadanía',
    CE: 'Cédula de Extranjería',
    PA: 'Pasaporte',
    TI: 'Tarjeta de Identidad',
    NIT: 'NIT',
  };
  return labels[type ?? ''] ?? type ?? '';
}

function getRoleLabel(role: UserRole | null): string {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    institutional: 'Cliente Institucional',
    driver: 'Conductor',
  };
  return labels[role ?? ''] ?? role ?? '';
}

function goBack() {
  void router.push('/users');
}
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
