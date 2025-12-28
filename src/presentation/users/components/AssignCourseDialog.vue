<template>
  <q-dialog v-model="localOpen" persistent @hide="handleClose">
    <q-card style="min-width: 500px; max-width: 700px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Asignar Curso</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <!-- Selector de Curso -->
          <q-select
            v-model="selectedCourseId"
            :options="courseOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            outlined
            label="Seleccionar Curso"
            hint="Seleccione el curso que desea asignar al usuario"
            :loading="loadingCourses"
            :rules="[(val) => !!val || 'Debe seleccionar un curso']"
            :disable="loadingCourses"
          >
            <template #prepend>
              <q-icon name="school" />
            </template>
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{ loadingCourses ? 'Cargando cursos...' : 'No hay cursos disponibles' }}
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Información del curso seleccionado -->
          <q-card v-if="selectedCourse" flat bordered class="q-mt-md">
            <q-card-section>
              <div class="text-subtitle2 q-mb-xs">{{ selectedCourse.title }}</div>
              <div v-if="selectedCourse.description" class="text-body2 text-grey-7 q-mb-sm">
                {{ selectedCourse.description }}
              </div>
              <div class="row q-gutter-md">
                <q-badge v-if="selectedCourse.type" :label="selectedCourse.type" color="primary" outline />
                <q-badge v-if="selectedCourse.modality" :label="selectedCourse.modality" color="secondary" outline />
              </div>
            </q-card-section>
          </q-card>

          <!-- Botones de acción -->
          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="Cancelar" color="grey" v-close-popup />
            <q-btn
              type="submit"
              label="Asignar Curso"
              color="primary"
              unelevated
              :loading="submitting"
              :disable="!selectedCourseId || submitting"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { trainingsService } from '../../../infrastructure/http/trainings/trainings.service';
import { inscriptionsService } from '../../../infrastructure/http/inscriptions/inscriptions.service';
import type { Training } from '../../../domain/training/models';

interface Props {
  open: boolean;
  userId: string;
  personaId?: string;
  assignedCourseIds?: string[];
}

interface Emits {
  (e: 'update:open', value: boolean): void;
  (e: 'assigned'): void;
}

const props = withDefaults(defineProps<Props>(), {
  assignedCourseIds: () => [],
});

const emit = defineEmits<Emits>();

const $q = useQuasar();
const localOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

const selectedCourseId = ref<string | null>(null);
const courses = ref<Training[]>([]);
const loadingCourses = ref(false);
const submitting = ref(false);

const courseOptions = computed(() => {
  return courses.value
    .filter((course) => {
      // Filtrar cursos ya asignados
      return !props.assignedCourseIds.includes(course.id);
    })
    .map((course) => ({
      label: course.title,
      value: course.id,
      course: course,
    }));
});

const selectedCourse = computed(() => {
  if (!selectedCourseId.value) return null;
  return courses.value.find((c) => c.id === selectedCourseId.value) || null;
});

async function loadCourses() {
  loadingCourses.value = true;
  try {
    // Cargar todos los cursos disponibles (sin filtro de estado para mostrar más opciones)
    // El backend validará si el curso está disponible para inscripción
    const response = await trainingsService.findAll({
      page: 1,
      limit: 100,
    });
    courses.value = response.data;
  } catch (error) {
    console.error('Error loading courses:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los cursos disponibles',
      position: 'top',
    });
  } finally {
    loadingCourses.value = false;
  }
}

async function onSubmit() {
  if (!selectedCourseId.value || !props.personaId) {
    return;
  }

  submitting.value = true;
  try {
    await inscriptionsService.assignCourse(selectedCourseId.value, props.personaId);
    $q.notify({
      type: 'positive',
      message: 'Curso asignado exitosamente',
      position: 'top',
    });
    emit('assigned');
    handleClose();
  } catch (error) {
    console.error('Error assigning course:', error);
    let errorMessage = 'Error al asignar el curso';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      // Si el error indica que el curso ya está asignado, recargar los cursos
      if (error.message.includes('ya está inscrito') || error.message.includes('ya existe')) {
        emit('assigned'); // Recargar cursos para mostrar el que ya estaba asignado
      }
    }
    
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 5000,
    });
  } finally {
    submitting.value = false;
  }
}

function handleClose() {
  selectedCourseId.value = null;
  emit('update:open', false);
}

watch(
  () => props.open,
  (newValue) => {
    if (newValue) {
      void loadCourses();
    }
  },
);

onMounted(() => {
  if (props.open) {
    void loadCourses();
  }
});
</script>

