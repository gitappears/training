<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 500px; max-width: 600px">
      <q-card-section>
        <div class="text-h6">Inscribir Estudiante</div>
        <div class="text-caption text-grey-7 q-mt-xs">
          Selecciona un alumno creado por tu usuario para inscribirlo en esta capacitación
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-select
          v-model="selectedStudent"
          :options="filteredUsers"
          :loading="loading"
          use-input
          input-debounce="300"
          outlined
          label="Buscar Estudiante"
          hint="Busca por ID, nombre o número de documento"
          :option-label="(opt: UserOption) => formatUserLabel(opt)"
          option-value="personaId"
          emit-value
          map-options
          clearable
          @filter="filterUsers"
          @filter-abort="abortFilter"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No se encontraron usuarios. Intenta con otro criterio de búsqueda.
              </q-item-section>
            </q-item>
          </template>

          <template #option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
                <q-item-label caption>
                  ID: {{ scope.opt.personaId }} | Doc: {{ scope.opt.document }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-banner v-if="errorMessage" class="q-mt-md bg-negative text-white">
          <template #avatar>
            <q-icon name="error" />
          </template>
          {{ errorMessage }}
        </q-banner>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="primary" @click="handleCancel" />
        <q-btn
          flat
          label="Inscribir"
          color="primary"
          :disable="!selectedStudent || loading"
          @click="handleEnroll"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usersService } from '../../infrastructure/http/users/users.service';

interface UserOption {
  personaId: string;
  name: string;
  document: string;
  id: string;
}

interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  enroll: [userId: string];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const selectedStudent = ref<string | null>(null);
const allUsers = ref<UserOption[]>([]);
const filteredUsers = ref<UserOption[]>([]);
const loading = ref(false);
const errorMessage = ref('');

/**
 * Carga alumnos (rol ALUMNO) creados por el usuario actual
 * El backend filtra automáticamente por el usuario autenticado
 */
async function loadUsers() {
  loading.value = true;
  errorMessage.value = '';

  try {
    // Cargar usuarios con rol ALUMNO (driver)
    // El backend filtra automáticamente para mostrar solo los alumnos
    // creados por el usuario autenticado
    const alumnosResponse = await usersService.findAll({
      page: 1,
      limit: 1000, // Cargar suficientes usuarios
      filters: {
        role: 'driver', // Mapea a ALUMNO en el backend
      },
    });

    // Convertir a formato UserOption
    const alumnosList = alumnosResponse.data
      .map((user) => ({
        personaId: user.personaId || user.id,
        name: user.name,
        document: user.document || 'Sin documento',
        id: user.id,
      }))
      .filter((user) => user.personaId); // Filtrar usuarios sin personaId

    allUsers.value = alumnosList;
    filteredUsers.value = allUsers.value;

    if (allUsers.value.length === 0) {
      errorMessage.value = 'No se encontraron alumnos creados por tu usuario.';
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Error al cargar la lista de usuarios. Por favor, intenta nuevamente.';
    allUsers.value = [];
    filteredUsers.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * Formatea la etiqueta del usuario para mostrar en el select
 */
function formatUserLabel(user: UserOption): string {
  return `${user.name} - Doc: ${user.document} (ID: ${user.personaId})`;
}

/**
 * Filtra usuarios localmente basándose en el término de búsqueda
 */
function filterUsers(val: string, update: (fn: () => void) => void) {
  update(() => {
    if (val === '') {
      filteredUsers.value = allUsers.value;
    } else {
      const needle = val.toLowerCase();
      filteredUsers.value = allUsers.value.filter((user) => {
        return (
          user.personaId.toLowerCase().includes(needle) ||
          user.document.toLowerCase().includes(needle) ||
          user.name.toLowerCase().includes(needle)
        );
      });
    }
  });
}

/**
 * Maneja la cancelación del filtro
 */
function abortFilter() {
  // No es necesario hacer nada aquí
}

/**
 * Maneja la cancelación del diálogo
 */
function handleCancel() {
  selectedStudent.value = null;
  errorMessage.value = '';
  isOpen.value = false;
}

/**
 * Maneja la inscripción del estudiante seleccionado
 */
function handleEnroll() {
  if (selectedStudent.value) {
    emit('enroll', selectedStudent.value);
    selectedStudent.value = null;
    errorMessage.value = '';
    isOpen.value = false;
  }
}

// Cargar usuarios cuando se abre el diálogo
watch(isOpen, (newValue) => {
  if (newValue) {
    void loadUsers();
    selectedStudent.value = null;
    errorMessage.value = '';
  }
});
</script>
