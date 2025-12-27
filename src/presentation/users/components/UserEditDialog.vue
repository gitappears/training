<template>
  <q-dialog v-model="localOpen" persistent @hide="handleClose">
    <q-card style="min-width: 500px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Editar Usuario</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section v-if="user" class="q-pt-md">
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
        >
          <q-tab name="user" label="Usuario" />
          <q-tab name="personal" label="Datos Personales" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <!-- Tab: Usuario -->
          <q-tab-panel name="user">
            <q-form @submit.prevent="onSubmit" class="q-gutter-md">
              <!-- Username -->
              <q-input
                v-model="formData.username"
                outlined
                label="Nombre de usuario"
                hint="Mínimo 3 caracteres"
                :rules="[
                  (val) =>
                    (val && val.length >= 3) ||
                    'El nombre de usuario debe tener al menos 3 caracteres',
                  (val) =>
                    (val && val.length <= 100) ||
                    'El nombre de usuario no puede exceder 100 caracteres',
                ]"
              >
                <template #prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <!-- Role - Mostrar rol actual (no editable por ahora) -->
              <q-select
                v-model="formData.role"
                outlined
                label="Rol"
                :options="[
                  { label: 'ADMIN', value: 'ADMIN' },
                  { label: 'CLIENTE', value: 'CLIENTE' },
                  { label: 'INSTRUCTOR', value: 'INSTRUCTOR' },
                  { label: 'ALUMNO', value: 'ALUMNO' },
                  { label: 'OPERADOR', value: 'OPERADOR' },
                  { label: 'CONDUCTOR', value: 'DRIVER' },
                ]"
                emit-value
                map-options
              >
                <template #prepend>
                  <q-icon name="badge" />
                </template>
              </q-select>

              <!-- Status -->
              <div class="row q-gutter-md">
                <q-toggle
                  v-model="formData.habilitado"
                  label="Usuario habilitado"
                  color="positive"
                />
                <q-toggle v-model="formData.activo" label="Usuario activo" color="primary" />

                <q-toggle
                  v-model="formData.debeCambiarPassword"
                  label="Debe cambiar contraseña"
                  color="warning"
                />
              </div>
            </q-form>
          </q-tab-panel>

          <!-- Tab: Datos Personales -->
          <q-tab-panel name="personal">
            <q-form @submit.prevent="onSubmit" class="row">
              <!-- Nombres -->
              <div class="col-12 col-md-6 q-px-xs">
                <q-input
                  v-model="personalData.nombres"
                  outlined
                  label="Nombres"
                  :rules="[(val) => !!val || 'Los nombres son obligatorios']"
                >
                  <template #prepend>
                    <q-icon name="badge" />
                  </template>
                </q-input>
              </div>

              <!-- Apellidos -->
              <div class="col-12 col-md-6 q-px-xs">
                <q-input
                  v-model="personalData.apellidos"
                  outlined
                  label="Apellidos"
                  :rules="[(val) => !!val || 'Los apellidos son obligatorios']"
                >
                  <template #prepend>
                    <q-icon name="badge" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6 q-px-xs">
                <!-- Email -->
                <q-input
                  v-model="personalData.email"
                  outlined
                  label="Email"
                  type="email"
                  :rules="[
                    (val) => !!val || 'El email es obligatorio',
                    (val) => /.+@.+\..+/.test(val) || 'El email debe ser válido',
                  ]"
                >
                  <template #prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6 q-px-xs">
                <!-- Teléfono -->
                <q-input
                  v-model="personalData.telefono"
                  outlined
                  label="Teléfono"
                  mask="+## ### ### ####"
                  fill-mask
                >
                  <template #prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>
              </div>

              <!-- Fecha de Nacimiento -->
              <div class="col-12 col-md-6 q-px-xs">
                <q-input
                  v-model="personalData.fechaNacimiento"
                  outlined
                  label="Fecha de Nacimiento"
                  type="date"
                >
                  <template #prepend>
                    <q-icon name="calendar_today" />
                  </template>
                </q-input>
              </div>

              <!-- Género -->
              <div class="col-12 col-md-6 q-px-xs">
                <q-select
                  v-model="personalData.genero"
                  outlined
                  label="Género"
                  :options="genderOptions"
                  emit-value
                  map-options
                >
                  <template #prepend>
                    <q-icon name="person" />
                  </template>
                </q-select>
              </div>

              <!-- Dirección -->
              <div class="col-12 q-pt-md q-px-xs">
                <q-input v-model="personalData.direccion" outlined label="Dirección">
                  <template #prepend>
                    <q-icon name="home" />
                  </template>
                </q-input>
              </div>
            </q-form>
          </q-tab-panel>
        </q-tab-panels>

        <q-separator class="q-my-md" />

        <!-- Actions -->
        <div class="row justify-end q-gutter-sm">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            :label="activeTab === 'user' ? 'Guardar Usuario' : 'Guardar Datos Personales'"
            color="primary"
            :loading="loading"
            @click="onSubmit"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import type { User } from '../../../domain/user/models';
import { useUserEditDialog } from '../composables/useUserEditDialog';

interface Props {
  modelValue: boolean;
  user: User | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const localOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const { activeTab, formData, personalData, genderOptions, loading, handleClose, handleSubmit } =
  useUserEditDialog(toRef(props, 'user'));

async function onSubmit() {
  try {
    await handleSubmit();
    emit('success');
  } catch (error) {
    // El error ya fue manejado en el composable con notificación
    // Solo cerramos el diálogo si no hay cambios
    if (error instanceof Error && error.message === 'No hay cambios para guardar') {
      localOpen.value = false;
    }
  }
}
</script>
