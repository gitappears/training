<template>
  <q-dialog v-model="isOpen" persistent @hide="handleClose">
    <q-card style="min-width: 500px; max-width: 700px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ empresa ? 'Editar Empresa' : 'Nueva Empresa' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit">
          <div class="row">
            <div class="col-12 col-md-6 q-pa-sm">
              <q-input
                v-model="form.numeroDocumento"
                label="Número de Documento (NIT) *"
                outlined
                :rules="[
                  (val) => !!val || 'El número de documento es requerido',
                  (val) => /^[0-9-]+$/.test(val) || 'Solo números y guiones',
                ]"
                hint="Ejemplo: 900123456-1"
                :disable="loading || !!empresa"
                @update:model-value="(val) => (form.numeroDocumento = toUpperCaseFormatter(val))"
              />
            </div>
            <div class="col-12 col-md-6 q-pa-sm">
              <q-select
                v-model="form.tipoDocumento"
                :options="TIPO_DOCUMENTO_OPTIONS"
                label="Tipo de Documento"
                outlined
                emit-value
                map-options
                :disable="loading"
              />
            </div>
            <div class="col-xs-12 q-pa-sm">
              <q-input
                v-model="form.razonSocial"
                label="Razón Social *"
                outlined
                :rules="[(val) => !!val || 'La razón social es requerida']"
                :disable="loading"
                @update:model-value="(val) => (form.razonSocial = toUpperCaseFormatter(val))"
              />
            </div>
            <div class="col-12 col-md-6 q-pa-sm">
              <q-input
                v-model="form.email"
                label="Email"
                type="email"
                outlined
                :rules="[
                  (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Email inválido',
                ]"
                :disable="loading"
                @update:model-value="(val) => (form.email = toUpperCaseFormatter(val))"
              />
            </div>
            <div class="col-12 col-md-6 q-pa-sm">
              <q-input
                v-model="form.telefono"
                label="Teléfono"
                outlined
                :disable="loading"
                mask="+57 ### ### ####"
                unmasked-value
                @update:model-value="(val) => (form.telefono = toUpperCaseFormatter(val))"
              />
            </div>
            <div class="col-12 q-pa-sm">
              <q-input
                v-model="form.direccion"
                label="Dirección"
                outlined
                type="textarea"
                rows="2"
                :disable="loading"
                @update:model-value="(val) => (form.direccion = toUpperCaseFormatter(val))"
              />
            </div>
            <div class="col-12 q-pa-sm">
              <q-toggle
                v-model="isActive"
                label="Empresa activa"
                color="positive"
                :disable="loading"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey" @click="handleClose" :disable="loading" />
        <q-btn
          unelevated
          label="Guardar"
          color="primary"
          :loading="loading"
          @click="handleSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import {
  empresasService,
  type Empresa,
  type CreateEmpresaDto,
  type UpdateEmpresaDto,
} from '../../../infrastructure/http/empresas/empresas.service';
import { TIPO_DOCUMENTO_OPTIONS } from '../../../shared/constants/tipo-documento';

interface Props {
  modelValue: boolean;
  empresa?: Empresa | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const $q = useQuasar();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const loading = ref(false);

const isActive = computed({
  get: () => {
    const activo = form.value.activo;
    // Convertir 1/0 a boolean si es necesario (el backend puede enviar 1/0)
    if (activo === 1) return true;
    if (activo === 0) return false;
    // Si es undefined, retornar true por defecto
    return true;
  },
  set: (value: boolean) => {
    form.value.activo = value;
  },
});

const form = ref<CreateEmpresaDto & { activo?: boolean | number | string }>({
  numeroDocumento: '',
  tipoDocumento: 'NIT',
  razonSocial: '',
  email: '',
  telefono: '',
  direccion: '',
  activo: true,
});

function toUpperCaseFormatter(val: string | number | null | undefined): string {
  if (!val) return '';
  return String(val).toUpperCase();
}

function populateForm() {
  if (props.empresa) {
    form.value = {
      numeroDocumento: props.empresa.numeroDocumento,
      tipoDocumento: props.empresa.tipoDocumento,
      razonSocial: props.empresa.razonSocial,
      email: props.empresa.email || '',
      telefono: props.empresa.telefono || '',
      direccion: props.empresa.direccion || '',
      activo: props.empresa.activo,
    };
  } else {
    form.value = {
      numeroDocumento: '',
      tipoDocumento: 'NIT',
      razonSocial: '',
      email: '',
      telefono: '',
      direccion: '',
      activo: true,
    };
  }
}

async function handleSubmit() {
  loading.value = true;
  try {
    if (props.empresa) {
      // Convertir activo a boolean si es necesario
      const activoValue = isActive.value;

      const updateDto: UpdateEmpresaDto = {
        razonSocial: form.value.razonSocial,
        ...(form.value.email && { email: form.value.email }),
        ...(form.value.telefono && { telefono: form.value.telefono }),
        ...(form.value.direccion && { direccion: form.value.direccion }),
        ...(activoValue !== undefined && { activo: activoValue }),
      };
      await empresasService.update(props.empresa.id, updateDto);
      $q.notify({
        type: 'positive',
        message: 'Empresa actualizada exitosamente',
        icon: 'check_circle',
      });
    } else {
      const createDto: CreateEmpresaDto = {
        numeroDocumento: form.value.numeroDocumento,
        razonSocial: form.value.razonSocial,
        ...(form.value.tipoDocumento && { tipoDocumento: form.value.tipoDocumento }),
        ...(form.value.email && { email: form.value.email }),
        ...(form.value.telefono && { telefono: form.value.telefono }),
        ...(form.value.direccion && { direccion: form.value.direccion }),
      };
      await empresasService.create(createDto);
      $q.notify({
        type: 'positive',
        message: 'Empresa creada exitosamente',
        icon: 'check_circle',
      });
    }
    emit('success');
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al guardar la empresa',
      icon: 'error',
    });
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  populateForm();
  emit('update:modelValue', false);
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      populateForm();
    }
  },
);

watch(
  () => props.empresa,
  () => {
    if (props.modelValue) {
      populateForm();
    }
  },
);
</script>
