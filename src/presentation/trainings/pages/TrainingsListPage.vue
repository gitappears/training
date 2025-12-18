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

    <q-inner-loading :showing="loading" />

    <!-- Empty State -->
    <div v-if="!loading && trainings.length === 0" class="text-center q-pa-xl">
      <q-icon name="school" size="80px" color="grey-4" class="q-mb-md" />
      <div class="text-h6 text-grey-7 q-mb-sm">No hay capacitaciones disponibles</div>
      <div class="text-body2 text-grey-6 q-mb-lg">
        Crea tu primera capacitación para comenzar a formar a tu equipo.
      </div>
      <q-btn
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
                  <q-btn
                    round
                    dense
                    size="sm"
                    color="info"
                    icon="visibility"
                    @click.stop="goDetail(training.id)"
                  >
                    <q-tooltip>Ver detalles</q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    dense
                    size="sm"
                    color="purple"
                    icon="analytics"
                    @click.stop="viewStatistics()"
                  >
                    <q-tooltip>Ver estadísticas</q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    dense
                    size="sm"
                    color="warning"
                    icon="edit"
                    @click.stop="editTraining(training.id)"
                  >
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    dense
                    size="sm"
                    :color="(training.status || 'active') === 'active' ? 'positive' : 'grey-6'"
                    :icon="(training.status || 'active') === 'active' ? 'power_settings_new' : 'power_off'"
                    @click.stop="toggleStatus(training)"
                  >
                    <q-tooltip>
                      {{ (training.status || 'active') === 'active' ? 'Desactivar' : 'Activar' }}
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
                  :color="(training.status || 'active') === 'active' ? 'positive' : 'grey-6'"
                  :label="(training.status || 'active') === 'active' ? 'ACTIVO' : 'INACTIVO'"
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
import type { Training, TrainingStatus } from '../../../domain/training/models';

const router = useRouter();
const $q = useQuasar();

const trainings = ref<Training[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
});

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

async function loadTrainings() {
  loading.value = true;
  try {
    const listTrainingsUseCase = TrainingUseCasesFactory.getListTrainingsUseCase(trainingsService);
    const response = await listTrainingsUseCase.execute({
      page: pagination.value.page,
      limit: pagination.value.limit,
    });
    // Agregar status por defecto si no existe
    trainings.value = response.data.map((t) => ({
      ...t,
      status: (t.status || 'active'),
    }));
    pagination.value.total = response.total;
    pagination.value.totalPages = response.totalPages;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error al cargar las capacitaciones';
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
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

function viewStatistics() {
  $q.notify({
    type: 'info',
    message: 'Funcionalidad de estadísticas próximamente',
    position: 'top',
  });
  // TODO: Implementar página de estadísticas
  // void router.push(`/trainings/${id}/statistics`);
}

function toggleStatus(training: Training) {
  const currentStatus = training.status || 'active';
  const newStatus: TrainingStatus = currentStatus === 'active' ? 'inactive' : 'active';
  const action = newStatus === 'active' ? 'activada' : 'desactivada';

  try {
    // TODO: Implementar actualización de estado en el backend
    // await trainingsService.updateStatus(training.id, newStatus);
    
    // Actualizar el estado localmente
    const trainingIndex = trainings.value.findIndex((t) => t.id === training.id);
    if (trainingIndex !== -1) {
      const foundTraining = trainings.value[trainingIndex];
      if (foundTraining) {
        foundTraining.status = newStatus;
      }
    }

    $q.notify({
      type: 'positive',
      message: `Capacitación ${action} exitosamente`,
      position: 'top',
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error al cambiar el estado';
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
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
