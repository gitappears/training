<template>
  <q-page class="evaluations-list-page q-pa-xl">
    <!-- Header Section -->
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <div class="text-h4 text-weight-bold text-primary q-mb-xs">Evaluaciones Disponibles</div>
        <div class="text-body1 text-grey-7">
          Accede a las evaluaciones de los cursos asignados y completa tu certificación
        </div>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-btn
          flat
          dense
          :icon="viewMode === 'grid' ? 'view_list' : 'grid_view'"
          :label="viewMode === 'grid' ? 'Lista' : 'Grid'"
          color="primary"
          @click="toggleViewMode"
        />
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="primary" text-color="white" icon="quiz" />
              <div class="col">
                <div class="text-caption text-grey-6">Total Evaluaciones</div>
                <div class="text-h5 text-weight-bold">{{ statistics.total }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="info" text-color="white" icon="schedule" />
              <div class="col">
                <div class="text-caption text-grey-6">Pendientes</div>
                <div class="text-h5 text-weight-bold">{{ statistics.pending }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="positive" text-color="white" icon="check_circle" />
              <div class="col">
                <div class="text-caption text-grey-6">Aprobadas</div>
                <div class="text-h5 text-weight-bold">{{ statistics.passed }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="negative" text-color="white" icon="cancel" />
              <div class="col">
                <div class="text-caption text-grey-6">Reprobadas</div>
                <div class="text-h5 text-weight-bold">{{ statistics.failed }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters Panel -->
    <FiltersPanel :active-filters-count="activeFiltersCount" @clear="clearAllFilters">
      <div class="col-12 col-md-4">
        <q-input
          v-model="filters.search"
          outlined
          dense
          placeholder="Buscar por curso o descripción..."
          clearable
          @update:model-value="debouncedSearch"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.courseId"
          outlined
          dense
          :options="courseOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          clearable
          placeholder="Filtrar por curso"
        >
          <template #prepend>
            <q-icon name="school" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.status"
          outlined
          dense
          :options="statusOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          clearable
          placeholder="Filtrar por estado"
        >
          <template #prepend>
            <q-icon name="toggle_on" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-2">
        <q-select
          v-model="filters.questionType"
          outlined
          dense
          :options="questionTypeOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          clearable
          placeholder="Tipo pregunta"
        >
          <template #prepend>
            <q-icon name="help" />
          </template>
        </q-select>
      </div>
    </FiltersPanel>

    <q-inner-loading :showing="loading" />

    <!-- Evaluations Grid View -->
    <div v-if="viewMode === 'grid' && !loading" class="row q-col-gutter-lg">
      <div
        v-for="evaluation in filteredEvaluations"
        :key="evaluation.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card
          class="evaluation-card cursor-pointer"
          flat
          bordered
          @click="startEvaluation(evaluation.id)"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <q-badge :color="getStatusColor(evaluation.status)" outline>
                {{ getStatusLabel(evaluation.status) }}
              </q-badge>
              <div class="text-caption text-grey-7">
                <q-icon name="help_outline" size="14px" class="q-mr-xs" />
                {{ evaluation.questionsCount }}
              </div>
            </div>
            <div class="text-subtitle1 text-weight-medium q-mb-xs">
              {{ evaluation.courseName }}
            </div>
            <div class="text-body2 text-grey-7 q-mb-sm line-clamp-2">
              {{ evaluation.description }}
            </div>
            <q-separator class="q-mb-sm" />
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-grey-6">
                <q-icon name="schedule" size="14px" class="q-mr-xs" />
                {{ evaluation.durationMinutes }} min
              </div>
              <div class="text-caption text-grey-6">
                <q-icon name="check_circle" size="14px" class="q-mr-xs" />
                Mín: {{ evaluation.minimumScore }}%
              </div>
            </div>
            <div v-if="evaluation.lastAttempt" class="q-mt-sm">
              <q-badge
                :color="evaluation.lastAttempt.passed ? 'positive' : 'negative'"
                outline
                class="q-mb-xs"
              >
                Último intento: {{ evaluation.lastAttempt.score }}%
              </q-badge>
              <div class="text-caption text-grey-6">
                {{ formatDate(evaluation.lastAttempt.date) }}
              </div>
            </div>
            <div v-if="evaluation.attemptsRemaining !== undefined" class="q-mt-sm">
              <q-badge color="info" outline>
                Intentos restantes: {{ evaluation.attemptsRemaining }}
              </q-badge>
            </div>
          </q-card-section>
          <q-card-actions class="q-pa-md q-pt-none">
            <q-btn
              flat
              :label="getActionLabel(evaluation.status)"
              color="primary"
              class="full-width"
              :icon="getActionIcon(evaluation.status)"
              @click.stop="startEvaluation(evaluation.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Evaluations Table View -->
    <q-card v-else-if="viewMode === 'table' && !loading" flat bordered>
      <q-table
        :rows="filteredEvaluations"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        :pagination="{ rowsPerPage: 10 }"
      >
        <template #body-cell-status="props">
          <q-badge :color="getStatusColor(props.row.status)" outline>
            {{ getStatusLabel(props.row.status) }}
          </q-badge>
        </template>

        <template #body-cell-questions="props">
          <div class="row items-center q-gutter-xs">
            <q-icon name="help_outline" size="16px" color="grey-6" />
            <span>{{ props.row.questionsCount }} preguntas</span>
          </div>
        </template>

        <template #body-cell-duration="props">
          <div class="row items-center q-gutter-xs">
            <q-icon name="schedule" size="16px" color="grey-6" />
            <span>{{ props.row.durationMinutes }} min</span>
          </div>
        </template>

        <template #body-cell-lastAttempt="props">
          <div v-if="props.row.lastAttempt" class="column q-gutter-xs">
            <q-badge
              :color="props.row.lastAttempt.passed ? 'positive' : 'negative'"
              outline
            >
              {{ props.row.lastAttempt.score }}%
            </q-badge>
            <div class="text-caption text-grey-6">
              {{ formatDate(props.row.lastAttempt.date) }}
            </div>
          </div>
          <span v-else class="text-grey-6">Sin intentos</span>
        </template>

        <template #body-cell-actions="props">
          <q-btn
            flat
            dense
            :label="getActionLabel(props.row.status)"
            color="primary"
            :icon="getActionIcon(props.row.status)"
            @click="startEvaluation(props.row.id)"
          />
        </template>

        <template #no-data>
          <EmptyState
            icon="quiz"
            title="No hay evaluaciones disponibles"
            description="No se encontraron evaluaciones que coincidan con los filtros aplicados."
          >
            <template #actions>
              <q-btn
                v-if="hasActiveFilters"
                flat
                color="primary"
                label="Limpiar filtros"
                @click="clearAllFilters"
              />
            </template>
          </EmptyState>
        </template>
      </q-table>
    </q-card>

    <!-- Empty State -->
    <div v-if="!loading && filteredEvaluations.length === 0 && !hasActiveFilters">
      <EmptyState
        icon="quiz"
        title="No hay evaluaciones disponibles"
        description="Completa los cursos asignados para acceder a sus evaluaciones."
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { debounce } from 'quasar';
import type { QTableColumn } from 'quasar';
import type {
  Evaluation,
  EvaluationFilters,
  EvaluationStatistics,
  EvaluationStatus,
} from '../../../domain/evaluation/models';
import EmptyState from '../../../shared/components/EmptyState.vue';
import FiltersPanel from '../../../shared/components/FiltersPanel.vue';

const router = useRouter();
const $q = useQuasar();

// Estado
const loading = ref(false);
const viewMode = ref<'grid' | 'table'>('grid');
const evaluations = ref<Evaluation[]>([]);
const filters = ref<EvaluationFilters>({
  search: '',
  courseId: null,
  status: null,
  questionType: null,
});

const statistics = ref<EvaluationStatistics>({
  total: 0,
  pending: 0,
  inProgress: 0,
  passed: 0,
  failed: 0,
  byCourse: {},
});

// Opciones de filtros
const courseOptions = [
  { label: 'Manejo Defensivo', value: '1' },
  { label: 'Primeros Auxilios', value: '2' },
  { label: 'Transporte de Mercancías Peligrosas', value: '3' },
];

const statusOptions = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'En Progreso', value: 'in_progress' },
  { label: 'Aprobada', value: 'passed' },
  { label: 'Reprobada', value: 'failed' },
];

const questionTypeOptions = [
  { label: 'Única Respuesta', value: 'single' },
  { label: 'Múltiple Respuesta', value: 'multiple' },
  { label: 'Selección de Imagen', value: 'image' },
  { label: 'Falso/Verdadero', value: 'true_false' },
  { label: 'Sí/No', value: 'yes_no' },
];

// Columnas de la tabla
const columns: QTableColumn<Evaluation>[] = [
  {
    name: 'courseName',
    field: 'courseName',
    label: 'Curso',
    align: 'left',
    sortable: true,
  },
  {
    name: 'description',
    field: 'description',
    label: 'Descripción',
    align: 'left',
  },
  {
    name: 'questions',
    field: 'questionsCount',
    label: 'Preguntas',
    align: 'center',
  },
  {
    name: 'duration',
    field: 'durationMinutes',
    label: 'Duración',
    align: 'center',
  },
  {
    name: 'status',
    field: 'status',
    label: 'Estado',
    align: 'center',
    sortable: true,
  },
  {
    name: 'lastAttempt',
    field: () => '',
    label: 'Último Intento',
    align: 'center',
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center',
    field: () => '',
  },
];

// Computed
const filteredEvaluations = computed(() => {
  let result = [...evaluations.value];

  // Filtro de búsqueda
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(
      (evaluation) =>
        evaluation.courseName.toLowerCase().includes(search) ||
        evaluation.description.toLowerCase().includes(search),
    );
  }

  // Filtro por curso
  if (filters.value.courseId) {
    result = result.filter((evaluation) => evaluation.courseId === filters.value.courseId);
  }

  // Filtro por estado
  if (filters.value.status) {
    result = result.filter((evaluation) => evaluation.status === filters.value.status);
  }

  // Filtro por tipo de pregunta (verificar si alguna pregunta coincide)
  if (filters.value.questionType) {
    result = result.filter((evaluation) =>
      evaluation.questions.some((q) => q.type === filters.value.questionType),
    );
  }

  return result;
});

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.search) count++;
  if (filters.value.courseId) count++;
  if (filters.value.status) count++;
  if (filters.value.questionType) count++;
  return count;
});

const hasActiveFilters = computed(() => activeFiltersCount.value > 0);

// Funciones
async function loadEvaluations() {
  loading.value = true;
  try {
    const { EvaluationUseCasesFactory } = await import(
      '../../../application/evaluation/evaluation.use-cases.factory'
    );
    const { evaluationsService } = await import(
      '../../../infrastructure/http/evaluations/evaluations.service'
    );
    const listEvaluationsUseCase = EvaluationUseCasesFactory.getListEvaluationsUseCase(evaluationsService);

    const result = await listEvaluationsUseCase.execute({
      page: 1,
      limit: 100, // Obtener todas para mostrar
      filters: filters.value,
    });

    evaluations.value = result.data;
    calculateStatistics();
  } catch (error) {
    console.error('Error al cargar evaluaciones:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las evaluaciones. Por favor, intenta nuevamente.',
      icon: 'error',
      position: 'top',
    });
    evaluations.value = [];
  } finally {
    loading.value = false;
  }
}

function calculateStatistics() {
  statistics.value = {
    total: evaluations.value.length,
    pending: evaluations.value.filter((e) => e.status === 'pending').length,
    inProgress: evaluations.value.filter((e) => e.status === 'in_progress').length,
    passed: evaluations.value.filter((e) => e.status === 'passed').length,
    failed: evaluations.value.filter((e) => e.status === 'failed').length,
    byCourse: evaluations.value.reduce((acc, evaluation) => {
      acc[evaluation.courseId] = (acc[evaluation.courseId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

const debouncedSearch = debounce(() => {
  // La búsqueda se actualiza automáticamente por el computed
}, 300);

function toggleViewMode() {
  viewMode.value = viewMode.value === 'grid' ? 'table' : 'grid';
}

function clearAllFilters() {
  filters.value = {
    search: '',
    courseId: null,
    status: null,
    questionType: null,
  };
}

function getStatusColor(status: EvaluationStatus): string {
  const colors: Record<EvaluationStatus, string> = {
    pending: 'info',
    in_progress: 'warning',
    passed: 'positive',
    failed: 'negative',
    expired: 'grey',
  };
  return colors[status] ?? 'grey';
}

function getStatusLabel(status: EvaluationStatus): string {
  const labels: Record<EvaluationStatus, string> = {
    pending: 'Pendiente',
    in_progress: 'En Progreso',
    passed: 'Aprobada',
    failed: 'Reprobada',
    expired: 'Expirada',
  };
  return labels[status] ?? status;
}

function getActionLabel(status: EvaluationStatus): string {
  const labels: Record<EvaluationStatus, string> = {
    pending: 'Comenzar',
    in_progress: 'Continuar',
    passed: 'Ver Resultado',
    failed: 'Reintentar',
    expired: 'Ver Detalles',
  };
  return labels[status] ?? 'Ver';
}

function getActionIcon(status: EvaluationStatus): string {
  const icons: Record<EvaluationStatus, string> = {
    pending: 'play_arrow',
    in_progress: 'continue',
    passed: 'visibility',
    failed: 'refresh',
    expired: 'info',
  };
  return icons[status] ?? 'visibility';
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function startEvaluation(id: string) {
  void router.push(`/evaluations/${id}`);
}

// Lifecycle
onMounted(() => {
  loadEvaluations();
});
</script>

<style scoped lang="scss">
.evaluations-list-page {
  background: #f9fafb;
  transition: background-color 0.3s ease;
}

body.body--dark .evaluations-list-page {
  background: #0f172a;
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

body.body--dark .stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.evaluation-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.evaluation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

body.body--dark .evaluation-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
