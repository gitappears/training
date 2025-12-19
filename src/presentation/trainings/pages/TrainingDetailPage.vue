<template>
  <q-page class="training-detail-page">
    <q-inner-loading :showing="loading" />

    <!-- Error State -->
    <div v-if="!training && !loading" class="error-state">
      <q-icon name="error" size="64px" color="negative" class="q-mb-md" />
      <div class="text-h6 text-grey-7">Capacitación no encontrada</div>
    </div>

    <!-- Hero Banner with Image or Watermark -->
    <div v-else-if="training" class="hero-banner">
      <div
        v-if="training.coverImageUrl"
        class="hero-image"
        :style="{ backgroundImage: `url(${training.coverImageUrl})` }"
      />
      <div v-else class="hero-watermark">
        <div class="watermark-content">
          <q-icon name="school" size="120px" color="grey-4" />
          <div class="watermark-text text-grey-4">Imagen del curso</div>
        </div>
      </div>
      <div class="hero-overlay" />
      <div class="hero-content">
        <q-breadcrumbs class="text-white q-mb-sm" separator="›">
          <q-breadcrumbs-el label="Inicio" to="/" />
          <q-breadcrumbs-el label="Capacitaciones" to="/trainings" />
          <q-breadcrumbs-el :label="training.title" />
        </q-breadcrumbs>
        <h1 class="hero-title text-white">{{ training.title }}</h1>
        <div class="hero-meta text-white">
          <q-chip
            :color="modalityColor"
            text-color="white"
            size="sm"
            :icon="modalityIcon"
            class="q-mr-sm"
          >
            {{ trainingModalityLabel }}
          </q-chip>
          <span class="q-mx-sm">·</span>
          <q-icon name="schedule" size="16px" class="q-mr-xs" />
          <span>{{ training.durationHours || 0 }} horas</span>
          <span class="q-mx-sm">·</span>
          <q-icon name="category" size="16px" class="q-mr-xs" />
          <span>{{ training.area }}</span>
        </div>
        <div class="hero-instructor row items-center q-mt-md">
          <q-avatar size="48px" color="white" text-color="primary" class="q-mr-sm">
            {{ trainingInstructorInitials }}
          </q-avatar>
          <div class="column">
            <span class="text-body1 text-white text-weight-medium">{{ training.instructor }}</span>
            <span class="text-caption text-grey-2">Instructor</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="training" class="main-content q-pa-xl">
      <div class="row q-col-gutter-xl">
        <!-- Left Column: Content -->
        <div class="col-12 col-lg-8">
          <q-card flat class="content-card">
            <q-tabs
              v-model="tab"
              dense
              class="text-primary"
              active-color="primary"
              indicator-color="primary"
              align="left"
            >
              <q-tab name="overview" label="Resumen" icon="description" />
              <q-tab name="content" label="Contenido" icon="menu_book" />
              <q-tab name="students" label="Estudiantes" icon="people" />
              <q-tab name="resources" label="Recursos" icon="attach_file" />
              <q-tab name="reviews" label="Reseñas" icon="star" />
            </q-tabs>
            <q-separator />

            <q-tab-panels v-model="tab" animated class="q-mt-md">
              <q-tab-panel name="overview">
                <div class="overview-section">
                  <div class="text-h6 q-mb-md text-weight-medium">Descripción del Curso</div>
                  <div class="text-body1 text-grey-8 line-height-relaxed">
                    {{ training.description || 'Sin descripción disponible' }}
                  </div>
                  
                  <q-separator class="q-my-lg" />
                  
                  <div v-if="training.targetAudience" class="info-section q-mb-md">
                    <div class="row items-start q-gutter-md">
                      <q-icon name="groups" size="24px" color="primary" />
                      <div class="col">
                        <div class="text-subtitle2 q-mb-xs text-weight-medium">Audiencia Objetivo</div>
                        <div class="text-body2 text-grey-7">{{ training.targetAudience }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="training.startDate || training.endDate" class="info-section">
                    <div class="row items-start q-gutter-md">
                      <q-icon name="event" size="24px" color="primary" />
                      <div class="col">
                        <div class="text-subtitle2 q-mb-xs text-weight-medium">Fechas del Curso</div>
                        <div class="text-body2 text-grey-7">
                          <span v-if="training.startDate">
                            Inicio: {{ formatDate(training.startDate) }}
                          </span>
                          <span v-if="training.startDate && training.endDate"> · </span>
                          <span v-if="training.endDate">
                            Fin: {{ formatDate(training.endDate) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-tab-panel>

              <q-tab-panel name="content">
                <div class="content-section">
                  <div class="text-h6 q-mb-md text-weight-medium">Contenido del Curso</div>
                  <div v-if="training.sections.length === 0" class="empty-state">
                    <q-icon name="menu_book" size="48px" color="grey-5" class="q-mb-sm" />
                    <div class="text-body1 text-grey-6">No hay secciones disponibles</div>
                  </div>
                  <div v-else class="sections-list">
                    <q-expansion-item
                      v-for="(section, index) in training.sections"
                      :key="section.id"
                      expand-separator
                      class="section-item"
                      :default-opened="index === 0"
                    >
                      <template #header>
                        <q-item-section avatar>
                          <q-avatar color="primary" text-color="white" size="32px">
                            {{ index + 1 }}
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{ section.title }}</q-item-label>
                          <q-item-label caption>
                            <q-icon name="play_circle_outline" size="14px" class="q-mr-xs" />
                            {{ section.lessonsCount }} lecciones
                            <span class="q-mx-sm">·</span>
                            <q-icon name="schedule" size="14px" class="q-mr-xs" />
                            {{ section.durationMinutes }} min
                          </q-item-label>
                        </q-item-section>
                      </template>
                      <q-card>
                        <q-card-section>
                          <div v-if="section.description" class="text-body2 text-grey-7">
                            {{ section.description }}
                          </div>
                          <div v-else class="text-body2 text-grey-5">
                            Sin descripción disponible para esta sección
                          </div>
                        </q-card-section>
                      </q-card>
                    </q-expansion-item>
                  </div>
                </div>
              </q-tab-panel>

              <q-tab-panel name="students">
                <div class="students-section">
                  <div class="row items-center justify-between q-mb-md">
                    <div class="text-h6 text-weight-medium">Estudiantes Inscritos</div>
                    <q-badge color="primary" :label="`${training.students.length} estudiantes`" />
                  </div>
                  <div v-if="training.students.length === 0" class="empty-state">
                    <q-icon name="people" size="48px" color="grey-5" class="q-mb-sm" />
                    <div class="text-body1 text-grey-6">No hay estudiantes inscritos</div>
                  </div>
                  <q-table
                    v-else
                    :rows="training.students"
                    :columns="studentColumns"
                    row-key="id"
                    flat
                    class="students-table"
                    :pagination="{ rowsPerPage: 10 }"
                  >
                    <template #body-cell-progress="props">
                      <div class="progress-cell">
                        <q-linear-progress
                          :value="props.row.progress"
                          rounded
                          size="20px"
                          color="primary"
                          class="q-mb-xs"
                        />
                        <span class="text-caption text-grey-7">
                          {{ Math.round(props.row.progress * 100) }}%
                        </span>
                      </div>
                    </template>
                    <template #body-cell-score="props">
                      <q-input
                        v-model.number="props.row.score"
                        dense
                        outlined
                        type="number"
                        min="0"
                        max="100"
                        style="max-width: 100px"
                      />
                    </template>
                    <template #body-cell-rating="props">
                      <q-rating
                        v-model="props.row.rating"
                        max="5"
                        size="20px"
                        color="amber"
                        readonly
                      />
                    </template>
                  </q-table>
                </div>
              </q-tab-panel>

              <q-tab-panel name="resources">
                <div class="resources-section">
                  <div class="text-h6 q-mb-md text-weight-medium">Recursos y Materiales</div>
                  <div v-if="training.attachments.length === 0" class="empty-state">
                    <q-icon name="attach_file" size="48px" color="grey-5" class="q-mb-sm" />
                    <div class="text-body1 text-grey-6">No hay recursos disponibles</div>
                  </div>
                  <q-list v-else separator class="resources-list">
                    <q-item
                      v-for="att in training.attachments"
                      :key="att.id"
                      clickable
                      tag="a"
                      :href="att.url"
                      target="_blank"
                      class="resource-item"
                    >
                      <q-item-section avatar>
                        <q-avatar
                          :color="att.type === 'file' ? 'primary' : 'secondary'"
                          text-color="white"
                          size="40px"
                        >
                          <q-icon :name="att.type === 'file' ? 'attach_file' : 'link'" />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">{{ att.label }}</q-item-label>
                        <q-item-label caption class="text-grey-6">{{ att.url }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon name="open_in_new" color="grey-6" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </q-tab-panel>

              <q-tab-panel name="reviews">
                <div class="reviews-section">
                  <div class="row items-center q-gutter-md q-mb-lg">
                    <div class="rating-summary">
                      <div class="text-h3 text-weight-bold">{{ training.averageRating.toFixed(1) }}</div>
                      <q-rating
                        :model-value="training.averageRating"
                        max="5"
                        size="24px"
                        color="amber"
                        readonly
                        class="q-mb-xs"
                      />
                      <div class="text-body2 text-grey-7">
                        Basado en {{ training.reviews.length }} reseña{{ training.reviews.length !== 1 ? 's' : '' }}
                      </div>
                    </div>
                  </div>
                  <q-separator class="q-mb-lg" />
                  <div v-if="training.reviews.length === 0" class="empty-state">
                    <q-icon name="star" size="48px" color="grey-5" class="q-mb-sm" />
                    <div class="text-body1 text-grey-6">No hay reseñas disponibles</div>
                  </div>
                  <div v-else class="reviews-list">
                    <q-card
                      v-for="review in training.reviews"
                      :key="review.id"
                      flat
                      bordered
                      class="review-card q-mb-md"
                    >
                      <q-card-section>
                        <div class="row items-center justify-between q-mb-sm">
                          <div class="row items-center q-gutter-sm">
                            <q-rating
                              :model-value="review.rating"
                              max="5"
                              size="18px"
                              color="amber"
                              readonly
                            />
                            <span class="text-caption text-grey-6">{{ formatDate(review.createdAt) }}</span>
                          </div>
                        </div>
                        <div class="text-body1 text-grey-8">{{ review.comment }}</div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>

        <!-- Right Column: Sidebar -->
        <div class="col-12 col-lg-4">
          <div class="sidebar-sticky">
            <q-card flat bordered class="sidebar-card">
              <q-card-section class="q-pa-none">
                <div
                  v-if="training.coverImageUrl"
                  class="sidebar-image"
                  :style="{ backgroundImage: `url(${training.coverImageUrl})` }"
                />
                <div v-else class="sidebar-watermark">
                  <q-icon name="image" size="64px" color="grey-4" />
                  <div class="text-caption text-grey-5 q-mt-sm">Imagen del curso</div>
                </div>
              </q-card-section>
              <q-card-section>
                <div class="text-h6 q-mb-sm text-weight-medium">{{ training.title }}</div>
                <div class="row items-center q-gutter-xs q-mb-md">
                  <q-rating
                    :model-value="training.averageRating"
                    max="5"
                    size="18px"
                    color="amber"
                    readonly
                  />
                  <span class="text-body2 text-weight-medium q-ml-xs">
                    {{ training.averageRating.toFixed(1) }}
                  </span>
                  <span class="text-caption text-grey-6 q-ml-xs">
                    ({{ training.studentsCount }} {{ training.studentsCount === 1 ? 'alumno' : 'alumnos' }})
                  </span>
                </div>
                
                <q-separator class="q-mb-md" />
                
                <div class="sidebar-info q-mb-md">
                  <div class="info-row q-mb-sm">
                    <q-icon name="schedule" size="18px" color="grey-6" class="q-mr-sm" />
                    <span class="text-body2 text-grey-7">
                      <strong>Duración:</strong> {{ training.durationHours || 0 }} horas
                    </span>
                  </div>
                  <div class="info-row q-mb-sm">
                    <q-icon name="category" size="18px" color="grey-6" class="q-mr-sm" />
                    <span class="text-body2 text-grey-7">
                      <strong>Área:</strong> {{ training.area }}
                    </span>
                  </div>
                  <div class="info-row">
                    <q-icon name="people" size="18px" color="grey-6" class="q-mr-sm" />
                    <span class="text-body2 text-grey-7">
                      <strong>Capacidad:</strong>
                      {{ training.capacity ? `${training.studentsCount}/${training.capacity}` : 'Ilimitada' }}
                    </span>
                  </div>
                </div>
                
                <q-btn
                  color="primary"
                  unelevated
                  size="lg"
                  label="Inscribir Estudiante"
                  icon="person_add"
                  class="full-width q-mb-sm"
                  @click="handleEnrollStudent"
                />
                <q-btn
                  flat
                  color="primary"
                  label="Editar Capacitación"
                  icon="edit"
                  class="full-width"
                  @click="handleEditTraining"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';
import type { Training, TrainingStudent } from '../../../domain/training/models';
import { TrainingUseCasesFactory } from '../../../application/training/training.use-cases.factory';
import { trainingsService } from '../../../infrastructure/http/trainings/trainings.service';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const tab = ref<'overview' | 'content' | 'students' | 'resources' | 'reviews'>('overview');

const trainingId = parseInt(route.params.id as string);
const training = ref<Training | null>(null);
const loading = ref(false);

async function loadTraining() {
  if (isNaN(trainingId)) {
    $q.notify({
      type: 'negative',
      message: 'ID de capacitación inválido',
    });
    void router.push('/trainings');
    return;
  }

  loading.value = true;
  try {
    const getTrainingUseCase = TrainingUseCasesFactory.getGetTrainingUseCase(trainingsService);
    training.value = await getTrainingUseCase.execute(trainingId);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error al cargar la capacitación';
    $q.notify({
      type: 'negative',
      message: errorMessage,
    });
    void router.push('/trainings');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadTraining();
});

const modalityLabels: Record<string, string> = {
  online: 'Online',
  onsite: 'Presencial',
  hybrid: 'Mixta',
};

const modalityColors: Record<string, string> = {
  online: 'blue',
  onsite: 'green',
  hybrid: 'purple',
};

const modalityIcons: Record<string, string> = {
  online: 'computer',
  onsite: 'location_on',
  hybrid: 'blur_on',
};

function getModalityLabel(modality: string): string {
  return modalityLabels[modality] ?? modality;
}

function getInstructorInitials(instructor: string): string {
  return instructor
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function handleEnrollStudent() {
  $q.notify({
    type: 'info',
    message: 'Funcionalidad de inscripción próximamente',
    position: 'top',
  });
}

function handleEditTraining() {
  void router.push({ name: 'training-edit', params: { id: training.value?.id } });
}

const trainingModalityLabel = computed(() =>
  training.value ? getModalityLabel(training.value.modality) : '',
);
const trainingInstructorInitials = computed(() =>
  training.value ? getInstructorInitials(training.value.instructor) : '',
);
const modalityColor = computed(() =>
  training.value ? modalityColors[training.value.modality] || 'primary' : 'primary',
);
const modalityIcon = computed(() =>
  training.value ? modalityIcons[training.value.modality] || 'school' : 'school',
);

const studentColumns: QTableColumn<TrainingStudent>[] = [
  {
    name: 'name',
    field: 'name',
    label: 'Estudiante',
    align: 'left',
  },
  {
    name: 'email',
    field: 'email',
    label: 'Correo',
    align: 'left',
  },
  {
    name: 'progress',
    field: 'progress',
    label: 'Progreso',
    align: 'left',
  },
  {
    name: 'score',
    field: 'score',
    label: 'Nota',
    align: 'left',
  },
  {
    name: 'rating',
    field: 'rating',
    label: 'Calificación',
    align: 'left',
  },
];
</script>

<style scoped lang="scss">
.training-detail-page {
  padding: 0 !important;
  transition: background-color 0.3s ease;
}

body.body--light .training-detail-page {
  background: #f9fafb;
}

body.body--dark .training-detail-page {
  background: #0f172a;
}

// Error State
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 48px;
}

// Hero Banner
.hero-banner {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.hero-watermark {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.watermark-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
}

.watermark-text {
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  width: 100%;
  padding: 48px;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 16px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.hero-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.95rem;
  margin-top: 12px;
}

.hero-instructor {
  margin-top: 24px;
}

// Main Content
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.content-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

body.body--light .content-card {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

body.body--dark .content-card {
  background: #1e1b4b;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

// Overview Section
.overview-section {
  padding: 8px 0;
}

.info-section {
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #4f46e5;
  transition: background-color 0.3s ease;
}

body.body--light .info-section {
  background: #f8fafc;
}

body.body--dark .info-section {
  background: rgba(15, 23, 42, 0.5);
}

.line-height-relaxed {
  line-height: 1.7;
}

// Content Section
.content-section {
  padding: 8px 0;
}

.sections-list {
  .section-item {
    margin-bottom: 12px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #4f46e5;
    }
  }
}

// Students Section
.students-section {
  padding: 8px 0;
}

.students-table {
  .progress-cell {
    min-width: 150px;
  }
}

// Resources Section
.resources-section {
  padding: 8px 0;
}

.resources-list {
  .resource-item {
    border-radius: 12px;
    margin-bottom: 8px;
    transition: all 0.2s ease;

    &:hover {
      background: #f8fafc;
      transform: translateX(4px);
    }
  }
}

// Reviews Section
.reviews-section {
  padding: 8px 0;
}

.rating-summary {
  text-align: center;
  padding: 24px;
  border-radius: 16px;
  border: 2px solid #e5e7eb;
  transition: background 0.3s ease, border-color 0.3s ease;
}

body.body--light .rating-summary {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid #e5e7eb;
}

body.body--dark .rating-summary {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 2px solid rgba(148, 163, 184, 0.2);
}

.reviews-list {
  .review-card {
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  }
}

// Sidebar
.sidebar-sticky {
  position: sticky;
  top: 24px;
}

.sidebar-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

body.body--light .sidebar-card {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

body.body--dark .sidebar-card {
  background: #1e1b4b;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.sidebar-image {
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.sidebar-watermark {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 2px dashed #d1d5db;
  transition: background 0.3s ease, border-color 0.3s ease;
}

body.body--light .sidebar-watermark {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-bottom: 2px dashed #d1d5db;
}

body.body--dark .sidebar-watermark {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-bottom: 2px dashed rgba(148, 163, 184, 0.3);
}

.sidebar-info {
  .info-row {
    display: flex;
    align-items: center;
  }
}

// Empty States
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

// Responsive
@media (max-width: 1024px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-content {
    padding: 32px 24px;
  }

  .sidebar-sticky {
    position: static;
    margin-top: 24px;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.5rem;
  }

  .hero-meta {
    font-size: 0.85rem;
  }

  .main-content {
    padding: 16px !important;
  }
}
</style>
