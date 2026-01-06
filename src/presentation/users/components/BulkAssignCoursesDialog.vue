<template>
  <q-dialog v-model="isOpen" persistent @hide="handleClose">
    <q-card style="min-width: 600px; max-width: 800px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Asignar Cursos a Usuarios</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="text-body2 text-grey-7 q-mb-md">
          Se asignarán los cursos seleccionados a
          <strong>{{ selectedUsersCount }} usuario{{ selectedUsersCount > 1 ? 's' : '' }}</strong>
        </div>

        <!-- Lista de usuarios seleccionados -->
        <q-list v-if="selectedUsers.length > 0" bordered separator class="q-mb-md">
          <q-item v-for="user in selectedUsers" :key="user.id">
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white">
                {{ getUserInitials(user) }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ getUserName(user) }}</q-item-label>
              <q-item-label caption>{{ user.email || user.document || '' }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Selector de cursos -->
        <div class="q-mb-md">
          <q-select
            v-model="selectedCourses"
            :options="courseOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            multiple
            use-chips
            use-input
            outlined
            input-debounce="300"
            :loading="loadingCourses"
            label="Seleccionar cursos"
            hint="Puede seleccionar múltiples cursos"
            @filter="filterCourses"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{ loadingCourses ? 'Cargando cursos...' : 'No se encontraron cursos' }}
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Resultado de la asignación -->
        <q-banner
          v-if="assignmentResult"
          :class="assignmentResult.success > 0 ? 'bg-positive' : 'bg-negative'"
          class="text-white q-mb-md"
        >
          <template #avatar>
            <q-icon :name="assignmentResult.success > 0 ? 'check_circle' : 'error'" size="md" />
          </template>
          <div class="text-body2">
            <strong>Resultado de la asignación:</strong>
            <ul class="q-mt-sm q-mb-none">
              <li>{{ assignmentResult.success }} inscripciones creadas exitosamente</li>
              <li v-if="assignmentResult.details.skipped.length > 0">
                {{ assignmentResult.details.skipped.length }} omitidas (ya existían)
              </li>
              <li v-if="assignmentResult.details.errors.length > 0">
                {{ assignmentResult.details.errors.length }} errores
              </li>
            </ul>
          </div>
        </q-banner>

        <!-- Detalles de errores -->
        <q-expansion-item
          v-if="assignmentResult && assignmentResult.details.errors.length > 0"
          label="Ver detalles de errores"
          icon="error"
          class="q-mb-md"
        >
          <q-list bordered>
            <q-item v-for="(error, index) in assignmentResult.details.errors" :key="index">
              <q-item-section>
                <q-item-label
                  >Usuario ID: {{ error.userId }}, Curso ID: {{ error.courseId }}</q-item-label
                >
                <q-item-label caption class="text-negative">{{ error.error }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="handleClose" />
        <q-btn
          flat
          label="Asignar"
          color="primary"
          :loading="assigning"
          :disable="selectedCourses.length === 0 || assigning"
          @click="handleAssign"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import type { User } from '../../../domain/user/models';
import { inscriptionsService } from '../../../infrastructure/http/inscriptions/inscriptions.service';
import { trainingsService } from '../../../infrastructure/http/trainings/trainings.service';
import type { Training } from '../../../domain/training/models';

interface Props {
  modelValue: boolean;
  selectedUsers: User[];
}

interface CourseOption {
  label: string;
  value: number;
  description?: string;
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

const selectedUsersCount = computed(() => props.selectedUsers.length);
const selectedCourses = ref<number[]>([]);
const courseOptions = ref<CourseOption[]>([]);
const allCourses = ref<Training[]>([]);
const loadingCourses = ref(false);
const assigning = ref(false);
const assignmentResult = ref<{
  success: number;
  failed: number;
  total: number;
  details: {
    created: Array<{ userId: number; courseId: number; inscripcionId: number }>;
    skipped: Array<{ userId: number; courseId: number; reason: string }>;
    errors: Array<{ userId: number; courseId: number; error: string }>;
  };
} | null>(null);

function getUserName(user: User): string {
  // User type has 'name' property directly
  if (user.name) {
    return user.name;
  }
  // Fallback to username if available
  return user.username || user.email || 'Usuario desconocido';
}

function getUserInitials(user: User): string {
  const name = getUserName(user);
  const parts = name.split(' ').filter((part) => part.length > 0);
  if (parts.length >= 2) {
    const first = parts[0]?.[0] || '';
    const second = parts[1]?.[0] || '';
    return `${first}${second}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

async function loadCourses() {
  loadingCourses.value = true;
  try {
    // El backend limita a 100 elementos por página, así que hacemos múltiples peticiones si es necesario
    const pageSize = 100;
    let allCoursesData: Training[] = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await trainingsService.findAll({
        page: currentPage,
        limit: pageSize,
      });

      if (response.data && response.data.length > 0) {
        allCoursesData = [...allCoursesData, ...response.data];
        hasMore = currentPage < response.totalPages;
        currentPage++;
      } else {
        hasMore = false;
      }
    }

    allCourses.value = allCoursesData;
    courseOptions.value = allCoursesData
      .filter((course) => course.status === 'published' || course.status === 'active')
      .map((course) => ({
        label: course.title,
        value: Number.parseInt(course.id),
        description: course.description,
      }));
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al cargar los cursos',
      icon: 'error',
    });
  } finally {
    loadingCourses.value = false;
  }
}

function filterCourses(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      courseOptions.value = allCourses.value
        .filter((course) => course.status === 'published' || course.status === 'active')
        .map((course) => ({
          label: course.title,
          value: Number.parseInt(course.id),
          description: course.description,
        }));
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    courseOptions.value = allCourses.value
      .filter(
        (course) =>
          (course.status === 'published' || course.status === 'active') &&
          (course.title.toLowerCase().includes(needle) ||
            course.description?.toLowerCase().includes(needle)),
      )
      .map((course) => ({
        label: course.title,
        value: Number.parseInt(course.id),
        description: course.description,
      }));
  });
}

async function handleAssign() {
  if (selectedCourses.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar al menos un curso',
      icon: 'warning',
    });
    return;
  }

  if (props.selectedUsers.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar al menos un usuario',
      icon: 'warning',
    });
    return;
  }

  assigning.value = true;
  assignmentResult.value = null;

  try {
    const userIds: number[] = props.selectedUsers.map((user) => {
      // Obtener el personaId del usuario (convertir a número si es string)
      if (user.personaId) {
        return typeof user.personaId === 'string'
          ? Number.parseInt(user.personaId, 10)
          : user.personaId;
      }
      return Number.parseInt(user.id, 10);
    });

    const result = await inscriptionsService.bulkAssignCourses(userIds, selectedCourses.value);
    assignmentResult.value = result;

    if (result.success > 0) {
      $q.notify({
        type: 'positive',
        message: `Se asignaron ${result.success} curso${result.success > 1 ? 's' : ''} exitosamente`,
        icon: 'check_circle',
        timeout: 3000,
      });
      emit('success');
    } else {
      $q.notify({
        type: 'warning',
        message: 'No se pudo asignar ningún curso. Revise los detalles de errores.',
        icon: 'warning',
        timeout: 5000,
      });
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al asignar los cursos',
      icon: 'error',
      timeout: 5000,
    });
  } finally {
    assigning.value = false;
  }
}

function handleClose() {
  selectedCourses.value = [];
  assignmentResult.value = null;
  emit('update:modelValue', false);
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      loadCourses();
      assignmentResult.value = null;
    }
  },
);
</script>

<style scoped lang="scss">
.q-item {
  min-height: 48px;
}
</style>
