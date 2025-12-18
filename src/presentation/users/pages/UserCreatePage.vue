<template>
  <q-page class="q-pa-xl column q-gutter-lg">
    <div>
      <div class="heading-main q-mb-xs">Crear nuevo usuario</div>
      <div class="heading-sub">
        Registra un nuevo usuario en el sistema (conductor, empresa o administrador).
      </div>
    </div>

    <q-card class="q-pa-lg">
      <q-form @submit="handleSubmit" class="column q-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.name"
              outlined
              label="Nombre completo *"
              :rules="[(val) => !!val || 'El nombre es requerido']"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.document"
              outlined
              label="Número de documento *"
              :rules="[(val) => !!val || 'El documento es requerido']"
            />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.email"
              outlined
              type="email"
              label="Correo electrónico *"
              :rules="[(val) => !!val || 'El email es requerido', isValidEmail]"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.phone"
              outlined
              label="Teléfono *"
              :rules="[(val) => !!val || 'El teléfono es requerido']"
            />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.role"
              outlined
              :options="roleOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Rol *"
              :rules="[(val) => !!val || 'El rol es requerido']"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.type"
              outlined
              :options="typeOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Tipo de persona *"
              :rules="[(val) => !!val || 'El tipo es requerido']"
            />
          </div>
        </div>

        <q-input
          v-if="form.type === 'juridica'"
          v-model="form.company"
          outlined
          label="Razón social *"
          :rules="form.type === 'juridica' ? [(val) => !!val || 'La razón social es requerida'] : []"
        />

        <q-checkbox v-model="form.enabled" label="Usuario habilitado" />

        <div class="row justify-end q-gutter-sm q-mt-md">
          <q-btn flat label="Cancelar" color="grey" @click="goBack" />
          <q-btn type="submit" label="Crear usuario" color="primary" unelevated />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

interface UserForm {
  name: string;
  document: string;
  email: string;
  phone: string;
  role: 'admin' | 'institutional' | 'driver' | null;
  type: 'natural' | 'juridica' | null;
  company: string;
  enabled: boolean;
}

const form = ref<UserForm>({
  name: '',
  document: '',
  email: '',
  phone: '',
  role: null,
  type: null,
  company: '',
  enabled: true,
});

const roleOptions = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Cliente Institucional', value: 'institutional' },
  { label: 'Conductor', value: 'driver' },
];

const typeOptions = [
  { label: 'Persona Natural', value: 'natural' },
  { label: 'Persona Jurídica', value: 'juridica' },
];

function isValidEmail(val: string): boolean | string {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(val) || 'Email inválido';
}

function handleSubmit() {
  // Aquí se llamaría al servicio HTTP para crear el usuario
  console.log('Crear usuario:', form.value);
  // Por ahora, redirigir a la lista
  void router.push('/users');
}

function goBack() {
  void router.push('/users');
}
</script>

