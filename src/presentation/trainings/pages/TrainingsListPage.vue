<template>
  <q-page class="q-pa-lg">
    <!-- Header Section -->
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <div class="text-h4 text-weight-bold text-primary q-mb-xs">Catálogo de Capacitaciones</div>
        <div class="text-body1 text-grey-7">
          Explora y gestiona todos los cursos disponibles en la plataforma
        </div>
      </div>
      <q-btn
        v-if="canManageTrainings"
        color="primary"
        unelevated
        icon="add"
        label="Nueva Capacitación"
        size="md"
        class="q-px-xl"
        to="/trainings/new"
        no-caps
      />
    </div>

    <q-inner-loading :showing="loading || loadingEnrollments" />

    <!-- Empty State -->
    <div v-if="!loading && !loadingEnrollments && trainings.length === 0" class="text-center q-pa-xl">
      <q-icon name="school" size="80px" color="grey-4" class="q-mb-md" />
      <div class="text-h6 text-grey-7 q-mb-sm">No hay capacitaciones disponibles</div>
      <div class="text-body2 text-grey-6 q-mb-lg">
        Crea tu primera capacitación para comenzar a formar a tu equipo.
      </div>
      <q-btn
        v-if="canManageTrainings"
        color="primary"
        unelevated
        icon="add"
        label="Crear Primera Capacitación"
        to="/trainings/new"
        no-caps
      />
    </div>

    <!-- Training Cards Grid -->
    <div v-else class="row q-col-gutter-lg">
      <div
        v-for="training in trainings"
        :key="training.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card
          class="training-card cursor-pointer"
          flat
          bordered
          @click.stop="goDetail(training.id)"
        >
          <!-- Image Section with Action Overlay -->
          <div class="relative-position">
            <q-img
              :src="training.coverImageUrl || 'https://via.placeholder.com/800x450?text=Sin+imagen'"
              :ratio="16 / 9"
              class="training-image"
            >
              <!-- Action Buttons Overlay -->
              <div class="absolute-top-right q-pa-sm">
                <div class="row q-gutter-xs">
                  <!-- Botón de Presentar Evaluación - Solo visible si el usuario está inscrito -->
                  <q-btn
                    v-if="isEnrolledIn(training.id)"
                    round
                    dense
                    size="sm"
                    color="info"
                    icon="quiz"
                    :loading="loadingEvaluation(training.id)"
                    @click.stop="presentTraining(training)"
                  >
                    <q-tooltip>Presentar evaluación</q-tooltip>
                  </q-btn>
                  <!-- Botón de Editar - Solo ADMIN e INSTRUCTOR -->
                  <q-btn
                    v-if="canManageTrainings"
                    round
                    dense
                    size="sm"
                    color="warning"
                    icon="edit"
                    @click.stop="editTraining(training.id)"
                  >
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <!-- Botón de Activar/Desactivar - Solo ADMIN y CLIENTE -->
                  <q-btn
                    v-if="canActivateTrainings"
                    round
                    dense
                    size="sm"
                    :color="isStatusActive(training.status) ? 'positive' : 'grey-6'"
                    :icon="isStatusActive(training.status) ? 'power_settings_new' : 'power_off'"
                    @click.stop="toggleStatus(training)"
                  >
                    <q-tooltip>
                      {{ isStatusActive(training.status) ? 'Desactivar' : 'Activar' }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>

              <!-- Type Badge -->
              <div class="absolute-top-left q-pa-sm">
                <q-badge
                  :color="getTypeColor(training.type)"
                  :label="getTypeLabel(training.type)"
                  class="text-weight-medium"
                />
              </div>

              <!-- Status Badge -->
              <div class="absolute-bottom-left q-pa-sm">
                <q-badge
                  :color="getStatusColor(training.status)"
                  :label="getStatusLabel(training.status)"
                  class="text-weight-medium"
                />
              </div>
            </q-img>
          </div>

          <!-- Card Content -->
          <q-card-section class="q-pa-md">
            <!-- Title -->
            <div class="text-subtitle1 text-weight-bold q-mb-xs ellipsis-2-lines" style="min-height: 48px">
              {{ training.title }}
            </div>

            <!-- Description -->
            <div class="text-caption text-grey-7 ellipsis-2-lines q-mb-md" style="min-height: 32px">
              {{ training.description || 'Sin descripción disponible' }}
            </div>

            <!-- Metadata Row -->
            <div class="row items-center justify-between q-mb-sm">
              <!-- Rating -->
              <div class="row items-center q-gutter-xs">
                <q-icon name="star" color="amber" size="16px" />
                <span class="text-caption text-weight-medium">
                  {{ training.averageRating.toFixed(1) }}
                </span>
                <span class="text-caption text-grey-6">
                  ({{ training.studentsCount }})
                </span>
              </div>

              <!-- Duration & Modality -->
              <div class="text-caption text-grey-7">
                {{ training.durationHours || 0 }}h · {{ getModalityLabel(training.modality) }}
              </div>
            </div>

            <!-- Instructor -->
            <div v-if="training.instructor" class="row items-center q-gutter-xs q-mt-sm">
              <q-icon name="person" size="14px" color="grey-6" />
              <span class="text-caption text-grey-7">{{ training.instructor }}</span>
            </div>
          </q-card-section>

          <!-- Card Actions Footer -->
          <q-card-actions class="q-pa-md q-pt-none">
            <q-btn
              flat
              dense
              color="primary"
              label="Ver detalles"
              icon="arrow_forward"
              class="full-width"
              no-caps
              @click.stop="goDetail(training.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="row justify-center q-mt-xl">
      <q-pagination
        v-model="pagination.page"
        :max="pagination.totalPages"
        :max-pages="7"
        direction-links
        boundary-links
        color="primary"
        @update:model-value="loadTrainings"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { TrainingUseCasesFactory } from '../../../application/training/training.use-cases.factory';
import { trainingsService } from '../../../infrastructure/http/trainings/trainings.service';
import type { Training } from '../../../domain/training/models';
import { useTrainingEvaluation, type TrainingWithEvaluations } from '../../../shared/composables/useTrainingEvaluation';
import { useRole } from '../../../shared/composables/useRole';
import { useUserEnrolledTrainings } from '../../../shared/composables/useUserEnrolledTrainings';

const router = useRouter();
const $q = useQuasar();

// Control de roles y permisos
const { canManageTrainings, canActivateTrainings, isAlumno } = useRole();

// Composable para gestionar inscripciones del usuario
const { enrolledTrainingIds, loadEnrollments, loading: loadingEnrollments, isEnrolledIn } = useUserEnrolledTrainings();

const trainings = ref<Training[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
});

// Composable para gestionar evaluaciones
const { navigateToEvaluation } = useTrainingEvaluation();
const loadingEvaluations = ref<Record<string, boolean>>({});

const modalityLabels: Record<string, string> = {
  online: 'Online',
  onsite: 'Presencial',
  hybrid: 'Mixta',
};

const typeLabels: Record<string, string> = {
  standard: 'ESTÁNDAR',
  certified: 'CERTIFICADA',
  survey: 'ENCUESTA',
};

const typeColors: Record<string, string> = {
  standard: 'primary',
  certified: 'positive',
  survey: 'info',
};

function getModalityLabel(modality: string): string {
  return modalityLabels[modality] ?? modality;
}

function getTypeLabel(type: string): string {
  return typeLabels[type] ?? 'ESTÁNDAR';
}

function getTypeColor(type: string): string {
  return typeColors[type] ?? 'primary';
}

/**
 * Obtiene el color del badge según el estado de la capacitación
 */
function getStatusColor(status?: string): string {
  if (!status) return 'grey-6';
  
  const statusMap: Record<string, string> = {
    'published': 'positive',
    'publicada': 'positive',
    'en_curso': 'info',
    'active': 'positive',
    'borrador': 'grey-6',
    'draft': 'grey-6',
    'finalizada': 'primary',
    'finished': 'primary',
    'cancelada': 'negative',
    'cancelled': 'negative',
  };
  
  return statusMap[status.toLowerCase()] ?? 'grey-6';
}

/**
 * Obtiene la etiqueta del estado de la capacitación
 */
function getStatusLabel(status?: string): string {
  if (!status) return 'BORRADOR';
  
  const statusMap: Record<string, string> = {
    'published': 'PUBLICADA',
    'publicada': 'PUBLICADA',
    'en_curso': 'EN CURSO',
    'active': 'ACTIVA',
    'borrador': 'BORRADOR',
    'draft': 'BORRADOR',
    'finalizada': 'FINALIZADA',
    'finished': 'FINALIZADA',
    'cancelada': 'CANCELADA',
    'cancelled': 'CANCELADA',
  };
  
  return statusMap[status.toLowerCase()] ?? status.toUpperCase();
}

async function loadTrainings() {
  loading.value = true;
  try {
    // Cargar inscripciones del usuario para todos los roles
    // Esto permite verificar si el usuario está inscrito en cada capacitación
    // y mostrar/ocultar el botón "Presentar capacitación" según corresponda
    await loadEnrollments();

    const listTrainingsUseCase = TrainingUseCasesFactory.getListTrainingsUseCase(trainingsService);
    const response = await listTrainingsUseCase.execute({
      page: pagination.value.page,
      limit: pagination.value.limit,
    });
    
    // Mapear los datos sin sobrescribir el status del backend
    let allTrainings = response.data.map((t) => ({
      ...t,
      // No sobrescribir el status, usar el que viene del backend
    })) as TrainingWithEvaluations[];

    // Si el usuario es ALUMNO, filtrar solo las capacitaciones donde está inscrito Y que estén publicadas
    if (isAlumno.value) {
      const enrolledIds = enrolledTrainingIds.value as Set<string>;
      console.log('🔍 Debug - IDs inscritos:', Array.from(enrolledIds));
      console.log('🔍 Debug - Total capacitaciones antes del filtro:', allTrainings.length);
      
      // Estados que se consideran publicados (no borrador)
      const publishedStatuses = ['published', 'publicada', 'en_curso', 'active'];
      
      allTrainings = allTrainings.filter((training) => {
        const isEnrolled = enrolledIds.has(training.id);
        const isPublished = training.status && publishedStatuses.includes(training.status.toLowerCase());
        
        console.log(`🔍 Capacitación ${training.id} (${training.title}): ${isEnrolled ? 'INSCRITO' : 'NO INSCRITO'}, Estado: ${training.status || 'sin estado'}, Publicada: ${isPublished}`);
        
        // Solo mostrar si está inscrito Y publicada (no borrador)
        return isEnrolled && isPublished;
      });
      
      console.log('🔍 Debug - Total capacitaciones después del filtro (inscritas y publicadas):', allTrainings.length);
      
      // Actualizar paginación para reflejar el filtro
      pagination.value.total = allTrainings.length;
      pagination.value.totalPages = Math.ceil(allTrainings.length / pagination.value.limit);
    } else {
      // Para otros roles, mantener la paginación original
      pagination.value.total = response.total;
      pagination.value.totalPages = response.totalPages;
    }

    trainings.value = allTrainings;
  } catch (error) {
    // Mejorar mensajes de error con más contexto
    let errorMessage = 'Error al cargar las capacitaciones';

    if (error instanceof Error) {
      const errorStr = error.message.toLowerCase();

      if (errorStr.includes('network') || errorStr.includes('timeout')) {
        errorMessage = 'Error de conexión: Verifique su conexión a internet e intente nuevamente';
      } else if (errorStr.includes('401') || errorStr.includes('unauthorized')) {
        errorMessage = 'Error de autenticación: Su sesión ha expirado. Por favor, inicie sesión nuevamente';
        void router.push('/auth/login');
      } else if (errorStr.includes('403') || errorStr.includes('forbidden')) {
        errorMessage = 'Error de permisos: No tiene permisos para ver capacitaciones';
      } else if (errorStr.includes('500') || errorStr.includes('server')) {
        errorMessage = 'Error del servidor: Por favor, intente más tarde o contacte al administrador';
      } else {
        errorMessage = error.message;
      }
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      icon: 'error',
      position: 'top',
      timeout: 7000,
      actions: [
        {
          label: 'Reintentar',
          color: 'white',
          handler: () => {
            void loadTrainings();
          },
        },
        {
          label: 'Cerrar',
          color: 'white',
        },
      ],
    });
  } finally {
    loading.value = false;
  }
}

function goDetail(id: string) {
  void router.push(`/trainings/${id}`);
}

function editTraining(id: string) {
  void router.push(`/trainings/${id}/edit`);
}

/**
 * Presenta la capacitación redirigiendo a su evaluación
 * Sigue el principio de responsabilidad única
 */
async function presentTraining(training: Training): Promise<void> {
  loadingEvaluations.value[training.id] = true;
  try {
    const trainingWithEvals = training as TrainingWithEvaluations;
    await navigateToEvaluation(trainingWithEvals);
  } catch (error) {
    console.error('Error al presentar capacitación:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al acceder a la evaluación de la capacitación',
      icon: 'error',
      position: 'top',
      timeout: 4000,
    });
  } finally {
    loadingEvaluations.value[training.id] = false;
  }
}

/**
 * Verifica si se está cargando la evaluación para una capacitación específica
 */
function loadingEvaluation(trainingId: string): boolean {
  return loadingEvaluations.value[trainingId] ?? false;
}

/**
 * Verifica si el estado de la capacitación se considera "activo"
 */
function isStatusActive(status?: string): boolean {
  if (!status) return false;
  
  const activeStatuses = ['published', 'publicada', 'en_curso', 'active'];
  return activeStatuses.includes(status.toLowerCase());
}

function toggleStatus(training: Training): void {
  const isActive = isStatusActive(training.status);
  const action = isActive ? 'desactivar' : 'activar';

  // Verificar si $q.dialog está disponible, si no usar confirm nativo
  if (typeof $q.dialog !== 'function') {
    // Fallback si dialog no está disponible
    if (confirm(`¿Está seguro de que desea ${action} la capacitación "${training.title}"? Los certificados ya emitidos no se afectarán (RF-10).`)) {
      void handleToggleStatusConfirm(training, isActive);
    }
    return;
  }

  // Modal de confirmación mejorado
  $q.dialog({
    title: 'Confirmar cambio de estado',
    message: `¿Está seguro de que desea ${action} la capacitación "${training.title}"?`,
    html: true,
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey-7',
    },
    ok: {
      label: 'Confirmar',
      color: isActive ? 'negative' : 'positive',
      unelevated: true,
    },
    persistent: true,
  }).onOk(async () => {
    void handleToggleStatusConfirm(training, isActive);
  });
}

async function handleToggleStatusConfirm(training: Training, isActive: boolean): Promise<void> {
  try {
    const actionPast = isActive ? 'desactivada' : 'activada';
    
    // Importar servicio de toggle
    const { trainingsToggleStatusService } = await import(
      '../../../infrastructure/http/trainings/trainings-toggle-status.service'
    );

    // Llamar al endpoint de toggle
    const updatedTraining = await trainingsToggleStatusService.toggleActivoInactivo(
      parseInt(training.id),
    );

    // Actualizar el estado localmente basándose en la respuesta del backend
    // El backend retorna un Training ya mapeado, pero recargamos para asegurar consistencia
    const trainingIndex = trainings.value.findIndex((t) => t.id === training.id);
    if (trainingIndex !== -1) {
      const foundTraining = trainings.value[trainingIndex];
      if (foundTraining) {
        // Usar el estado del Training retornado (ya mapeado por el servicio)
        // Si no está disponible, inferir basándose en la acción realizada
        if (updatedTraining.status) {
          foundTraining.status = updatedTraining.status;
        } else {
          // Fallback: mapear según la acción realizada
          foundTraining.status = isActive ? 'draft' : 'published';
        }
      }
    }
    
    // Recargar la lista para asegurar que todos los estados estén actualizados
    await loadTrainings();

      $q.notify({
        type: 'positive',
        message: `Capacitación ${actionPast} exitosamente`,
        icon: 'check_circle',
        position: 'top',
      });
  } catch (error) {
    // Mejorar mensajes de error para toggle
    let errorMessage = 'Error al cambiar el estado';

    if (error instanceof Error) {
      const errorStr = error.message.toLowerCase();

      if (errorStr.includes('evaluación') || errorStr.includes('evaluation')) {
        errorMessage = 'No se puede activar: Debe vincular una evaluación primero (RF-09)';
      } else if (errorStr.includes('certificado') || errorStr.includes('certificate')) {
        errorMessage = 'Los certificados existentes no se afectarán al cambiar el estado (RF-10)';
      } else if (errorStr.includes('network') || errorStr.includes('timeout')) {
        errorMessage = 'Error de conexión: Verifique su conexión e intente nuevamente';
      } else {
        errorMessage = error.message;
      }
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      icon: 'error',
      position: 'top',
      timeout: 7000,
      actions: [
        {
          label: 'Cerrar',
          color: 'white',
        },
      ],
    });
  }
}

onMounted(() => {
  void loadTrainings();
});
</script>

<style lang="scss" scoped>
.training-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    border-color: rgba(79, 70, 229, 0.3);
  }
}

.training-image {
  position: relative;
  overflow: hidden;

  :deep(.q-img__container) {
    transition: transform 0.3s ease;
  }

  &:hover :deep(.q-img__container) {
    transform: scale(1.05);
  }
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

// Asegurar que los botones de acción sean visibles
.absolute-top-right {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.training-card:hover .absolute-top-right {
  opacity: 1;
}

// Badge styles
.q-badge {
  padding: 4px 8px;
  font-size: 10px;
  letter-spacing: 0.5px;
}
</style>
