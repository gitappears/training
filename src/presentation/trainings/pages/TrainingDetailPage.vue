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
          <!-- FAL-004: Badge de tipo de capacitación -->
          <q-chip
            :color="getTypeColor(training.type)"
            text-color="white"
            size="sm"
            :icon="getTypeIcon(training.type)"
            class="q-mr-sm"
          >
            {{ getTypeLabel(training.type) }}
          </q-chip>
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
              <q-tab name="resources" label="Recursos" icon="attach_file" />
              <q-tab v-if="!isAlumno" name="students" label="Estudiantes" icon="people" />
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

                  <div v-if="training.startDate || training.endDate" class="info-section q-mb-md">
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

                  <!-- Sección de Recursos y Materiales -->
                  <div v-if="allAttachments.length > 0" class="info-section">
                    <div class="row items-start q-gutter-md">
                      <q-icon name="attach_file" size="24px" color="primary" />
                      <div class="col">
                        <div class="text-subtitle2 q-mb-xs text-weight-medium">Recursos y Materiales</div>
                        <div class="column q-gutter-xs q-mt-sm">
                          <q-item
                            v-for="att in allAttachments"
                            :key="att.id"
                            clickable
                            tag="a"
                            :href="att.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            dense
                            class="resource-link-item"
                          >
                            <q-item-section avatar>
                              <q-icon
                                :name="att.type === 'file' ? 'attach_file' : 'link'"
                                :color="att.type === 'file' ? 'primary' : 'secondary'"
                                size="20px"
                              />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-body2">{{ att.label }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-icon name="open_in_new" size="16px" color="grey-6" />
                            </q-item-section>
                          </q-item>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-tab-panel>

              <q-tab-panel name="resources">
                <div class="resources-section">
                  <div class="row items-center justify-between q-mb-md">
                    <div class="text-h6 text-weight-medium">Recursos y Materiales</div>
                    <q-badge v-if="allAttachments.length > 0" color="primary" :label="`${allAttachments.length} recursos`" />
                  </div>

                  <q-inner-loading :showing="loadingMaterials" />

                  <div v-if="!loadingMaterials && allAttachments.length === 0" class="empty-state">
                    <q-icon name="attach_file" size="48px" color="grey-5" class="q-mb-sm" />
                    <div class="text-body1 text-grey-6">No hay recursos disponibles</div>
                    <div class="text-caption text-grey-5 q-mt-xs">
                      Los recursos agregados durante la creación de la capacitación aparecerán aquí
                    </div>
                  </div>

                  <div v-else class="resources-container">
                    <q-list separator class="resources-list">
                      <q-item
                        v-for="att in allAttachments"
                        :key="att.id"
                        class="resource-item"
                        :class="{ 'resource-item--video': att.type === 'video' }"
                      >
                        <!-- Videos: mostrar como iframe -->
                        <template v-if="att.type === 'video'">
                          <q-item-section class="full-width">
                            <div class="video-container q-mb-md">
                              <div class="text-subtitle2 q-mb-sm text-weight-medium">{{ att.label }}</div>
                              <div class="video-wrapper">
                                <iframe
                                  :src="getVideoEmbedUrl(att.url)"
                                  frameborder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowfullscreen
                                  class="video-iframe"
                                />
                              </div>
                            </div>
                          </q-item-section>
                        </template>

                        <!-- Archivos y enlaces: mostrar como antes -->
                        <template v-else>
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
                            <q-btn
                              flat
                              round
                              dense
                              icon="open_in_new"
                              color="grey-6"
                              :href="att.url"
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          </q-item-section>
                        </template>
                      </q-item>
                    </q-list>
                  </div>
                </div>
              </q-tab-panel>
              
              <q-tab-panel name="students">
                <div class="students-section">
                  <q-inner-loading :showing="loadingStudents" />
                  <div class="row items-center justify-between q-mb-md">
                    <div class="text-h6 text-weight-medium">Estudiantes Inscritos</div>
                    <q-badge color="primary" :label="`${enrolledStudents.length} estudiantes`" />
                  </div>
                  <div v-if="!loadingStudents && enrolledStudents.length === 0" class="empty-state">
                    <q-icon name="people" size="48px" color="grey-5" class="q-mb-sm" />
                    <div class="text-body1 text-grey-6">No hay estudiantes inscritos</div>
                  </div>
                  <q-table
                    v-else-if="!loadingStudents"
                    :rows="enrolledStudents"
                    :columns="studentColumns"
                    row-key="id"
                    flat
                    class="students-table"
                    :pagination="{ rowsPerPage: 10 }"
                    :filter="studentFilter"
                    :loading="savingScore"
                  >
                    <template #top>
                      <div class="row full-width items-center q-gutter-md">
                        <q-input
                          v-model="studentFilter"
                          filled
                          dense
                          placeholder="Buscar por nombre o documento..."
                          class="col"
                          clearable
                        >
                          <template #prepend>
                            <q-icon name="search" />
                          </template>
                        </q-input>
                      </div>
                    </template>

                    <template #body-cell-name="props">
                      <q-td :props="props">
                        <div class="text-weight-medium">{{ props.value }}</div>
                      </q-td>
                    </template>

                    <template #body-cell-documentNumber="props">
                      <q-td :props="props">
                        <div class="text-body2">{{ props.value || 'N/A' }}</div>
                      </q-td>
                    </template>

                    <template #body-cell-score="props">
                      <q-td :props="props" class="text-center">
                        <q-input
                          v-model.number="props.row.score"
                          dense
                          outlined
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          style="max-width: 120px"
                          :readonly="!canManageTrainings"
                          :class="getScoreClass(props.row.score)"
                          @blur="handleScoreChange(props.row)"
                        >
                          <template #append>
                            <q-icon
                              v-if="props.row.score !== undefined && props.row.score !== null"
                              :name="props.row.score >= 70 ? 'check_circle' : 'cancel'"
                              :color="props.row.score >= 70 ? 'positive' : 'negative'"
                              size="xs"
                            />
                          </template>
                        </q-input>
                      </q-td>
                    </template>

                    <template #no-data>
                      <div class="full-width row justify-center items-center text-grey-6 q-pa-lg">
                        <q-icon name="people" size="48px" class="q-mr-sm" />
                        <div>No hay estudiantes inscritos</div>
                      </div>
                    </template>
                  </q-table>

                  <!-- Botón de guardar si hay cambios pendientes -->
                  <div v-if="hasUnsavedChanges && canManageTrainings" class="row justify-end q-mt-md">
                    <q-btn
                      color="primary"
                      label="Guardar Cambios"
                      icon="save"
                      :loading="savingScore"
                      @click="saveAllScores"
                    />
                  </div>
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

                <!-- Botón de Presentar Evaluación - Solo visible si el usuario está inscrito -->
                <q-btn
                  v-if="isEnrolled"
                  color="info"
                  unelevated
                  size="lg"
                  label="Presentar Evaluación"
                  icon="quiz"
                  class="full-width q-mb-sm"
                  :loading="loadingEvaluation || loadingEnrollment"
                  @click="handlePresentEvaluation"
                />

                <!-- Botón de Inscribir Estudiante - Solo ADMIN, CLIENTE, INSTRUCTOR -->
                <q-btn
                  v-if="canEnrollStudents"
                  color="primary"
                  unelevated
                  size="lg"
                  label="Inscribir Estudiante"
                  icon="person_add"
                  class="full-width q-mb-sm"
                  @click="handleEnrollStudent"
                />
                <q-separator v-if="canEnrollStudents || canActivateTrainings || canManageTrainings" class="q-my-md" />

                <!-- Status Toggle (RF-10) - Solo ADMIN y CLIENTE -->
                <div v-if="canActivateTrainings" class="status-toggle-section q-mb-md">
                  <div class="text-subtitle2 q-mb-sm text-weight-medium">Estado de la Capacitación</div>
                  <q-banner
                    :class="trainingStatus === 'active' ? 'bg-positive-1' : 'bg-grey-2'"
                    rounded
                    dense
                    class="q-mb-sm"
                  >
                    <template #avatar>
                      <q-icon
                        :name="trainingStatus === 'active' ? 'check_circle' : 'cancel'"
                        :color="trainingStatus === 'active' ? 'positive' : 'grey-6'"
                      />
                    </template>
                    <div class="text-body2 text-weight-medium">
                      {{ trainingStatus === 'active' ? 'ACTIVA' : 'INACTIVA' }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ trainingStatus === 'active' ? 'La capacitación está disponible para inscripciones' : 'La capacitación no está disponible' }}
                    </div>
                  </q-banner>
                  <q-btn
                    :color="trainingStatus === 'active' ? 'negative' : 'positive'"
                    :label="trainingStatus === 'active' ? 'Desactivar' : 'Activar'"
                    :icon="trainingStatus === 'active' ? 'power_settings_new' : 'power'"
                    class="full-width"
                    outline
                    @click="handleToggleStatus"
                  >
                    <q-tooltip>
                      {{ trainingStatus === 'active' ? 'Desactivar capacitación (RF-10)' : 'Activar capacitación (RF-10)' }}
                    </q-tooltip>
                  </q-btn>
                </div>

                <q-separator v-if="canManageTrainings" class="q-my-md" />

                <!-- Botón de Editar - Solo ADMIN e INSTRUCTOR -->
                <q-btn
                  v-if="canManageTrainings"
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
import type { Training, TrainingStudent, TrainingAttachment } from '../../../domain/training/models';
import { TrainingUseCasesFactory } from '../../../application/training/training.use-cases.factory';
import { trainingsService } from '../../../infrastructure/http/trainings/trainings.service';
// import { materialsService } from '../../../infrastructure/http/materials/materials.service';
import type { Material } from '../../../domain/material/models';
import { useRole } from '../../../shared/composables/useRole';
import { useTrainingEvaluation, type TrainingWithEvaluations } from '../../../shared/composables/useTrainingEvaluation';
import { useEnrollmentCheck } from '../../../shared/composables/useEnrollmentCheck';
import { useAuthStore } from '../../../stores/auth.store';
import { inscriptionsService, type InscriptionWithDocument } from '../../../infrastructure/http/inscriptions/inscriptions.service';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const tab = ref<'overview' | 'content' | 'students' | 'resources' | 'reviews'>('overview');

// Control de roles y permisos
const { canManageTrainings, canActivateTrainings, canEnrollStudents, isAlumno } = useRole();

const trainingId = parseInt(route.params.id as string);
const training = ref<Training | null>(null);
const loading = ref(false);
const materials = ref<Material[]>([]);
const loadingMaterials = ref(false);

// Tipo extendido para estudiantes con documento e ID de inscripción
interface StudentWithDocument extends TrainingStudent {
  documentNumber?: string;
  inscriptionId?: string;
}

const enrolledStudents = ref<StudentWithDocument[]>([]);
const loadingStudents = ref(false);
const studentFilter = ref('');
const savingScore = ref(false);
const hasUnsavedChanges = ref(false);
const pendingScoreChanges = ref<Map<string, { inscriptionId: string; score: number }>>(new Map());

// Composable para gestionar evaluaciones
const { navigateToEvaluation } = useTrainingEvaluation();
const loadingEvaluation = ref(false);

// Composable para verificar inscripción del usuario
const { isEnrolled, loading: loadingEnrollment, checkEnrollment } = useEnrollmentCheck({
  courseId: computed(() => training.value?.id ?? ''),
});

/**
 * Carga los materiales de la capacitación desde el backend
 * TODO: Implementar método findByCapacitacion en materialsService
 */
function loadMaterials(): void {
  if (isNaN(trainingId)) return;

  loadingMaterials.value = true;
  try {
    // TODO: Implementar cuando el servicio de materiales tenga el método findByCapacitacion
    // Por ahora, los materiales se obtienen desde el training directamente
    materials.value = [];
  } catch (error) {
    console.warn('Error al cargar materiales de la capacitación:', error);
    // No es crítico, continuar sin materiales
    materials.value = [];
  } finally {
    loadingMaterials.value = false;
  }
}

/**
 * Mapea un material del dominio a un TrainingAttachment
 */
function mapMaterialToAttachment(material: Material): TrainingAttachment {
  const tipoNombre = material.tipoMaterial?.nombre?.toLowerCase() || '';
  const tipoCodigo = material.tipoMaterial?.codigo?.toUpperCase() || '';

  // Detectar si es un video
  if (tipoNombre === 'video' || tipoCodigo === 'VIDEO') {
    return {
      id: material.id,
      type: 'video',
      label: material.nombre,
      url: material.url,
    };
  }

  // Determinar si es un enlace o un archivo
  const isLink =
    tipoNombre.includes('enlace') ||
    tipoNombre.includes('link') ||
    tipoCodigo === 'LINK' ||
    (material.url.startsWith('http') && !material.url.match(/\.(pdf|doc|docx|ppt|pptx|jpg|jpeg|png|gif|mp4|webm|mp3|wav)$/i));

  return {
    id: material.id,
    type: isLink ? 'link' : 'file',
    label: material.nombre,
    url: material.url,
  };
}

/**
 * Computed que combina los attachments del training con los materiales cargados
 * Elimina duplicados basándose en la URL
 */
const allAttachments = computed<TrainingAttachment[]>(() => {
  const attachmentsFromTraining = training.value?.attachments || [];
  const attachmentsFromMaterials = materials.value
    .filter((m) => m.activo !== false)
    .map(mapMaterialToAttachment);

  // Combinar y eliminar duplicados por URL
  const combined = [...attachmentsFromTraining, ...attachmentsFromMaterials];
  const uniqueMap = new Map<string, TrainingAttachment>();

  for (const att of combined) {
    if (!uniqueMap.has(att.url)) {
      uniqueMap.set(att.url, att);
    }
  }

  return Array.from(uniqueMap.values());
});

/**
 * Carga todos los estudiantes inscritos en la capacitación
 */
async function loadEnrolledStudents(): Promise<void> {
  if (isNaN(trainingId) || !training.value) return;

  loadingStudents.value = true;
  try {
    const inscriptions = await inscriptionsService.findByCourse(training.value.id);
    
    // Mapear inscripciones a StudentWithDocument
    enrolledStudents.value = inscriptions.map((inscription: InscriptionWithDocument): StudentWithDocument => {
      const student: StudentWithDocument = {
        id: inscription.userId,
        name: inscription.userName,
        email: '',
        progress: inscription.progress,
      };
      if (inscription.documentNumber) {
        student.documentNumber = inscription.documentNumber;
      }
      if (inscription.inscriptionId) {
        student.inscriptionId = inscription.inscriptionId;
      }
      if (inscription.score !== undefined) {
        student.score = inscription.score;
      }
      return student;
    });
  } catch (error) {
    console.error('Error al cargar estudiantes inscritos:', error);
    enrolledStudents.value = [];
    // No mostrar notificación de error, solo log en consola
    // para no interrumpir la experiencia del usuario
  } finally {
    loadingStudents.value = false;
  }
}

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
    // Cargar training y materiales en paralelo para mejor rendimiento
    const getTrainingUseCase = TrainingUseCasesFactory.getGetTrainingUseCase(trainingsService);

    training.value = await getTrainingUseCase.execute(trainingId);
    // Cargar materiales (maneja sus propios errores)
    loadMaterials();
    // Cargar estudiantes inscritos (solo si no es ALUMNO)
    if (!isAlumno.value) {
      await loadEnrolledStudents();
    }
    // Verificar si el usuario está inscrito en esta capacitación
    await checkEnrollment();
  } catch (error) {
    // Mejorar mensajes de error con más contexto
    let errorMessage = 'Error al cargar la capacitación';

    if (error instanceof Error) {
      const errorStr = error.message.toLowerCase();

      if (errorStr.includes('404') || errorStr.includes('not found')) {
        errorMessage = 'Capacitación no encontrada: La capacitación solicitada no existe o ha sido eliminada';
      } else if (errorStr.includes('network') || errorStr.includes('timeout')) {
        errorMessage = 'Error de conexión: Verifique su conexión a internet e intente nuevamente';
      } else if (errorStr.includes('401') || errorStr.includes('unauthorized')) {
        errorMessage = 'Error de autenticación: Su sesión ha expirado. Por favor, inicie sesión nuevamente';
        void router.push('/auth/login');
        return;
      } else if (errorStr.includes('403') || errorStr.includes('forbidden')) {
        errorMessage = 'Error de permisos: No tiene permisos para ver esta capacitación';
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
          label: 'Volver',
          color: 'white',
          handler: () => {
            void router.push('/trainings');
          },
        },
        {
          label: 'Cerrar',
          color: 'white',
        },
      ],
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

// FAL-004: Funciones para tipo de capacitación
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

const typeIcons: Record<string, string> = {
  standard: 'school',
  certified: 'verified',
  survey: 'poll',
};

function getTypeLabel(type: string): string {
  return typeLabels[type] ?? 'ESTÁNDAR';
}

function getTypeColor(type: string): string {
  return typeColors[type] ?? 'primary';
}

function getTypeIcon(type: string): string {
  return typeIcons[type] ?? 'school';
}

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
  if (!training.value) return;

  // Verificar que la capacitación esté disponible para inscripciones
  if (training.value.status !== 'published' && training.value.status !== 'active') {
    $q.notify({
      type: 'warning',
      message: 'Solo se pueden realizar inscripciones en capacitaciones publicadas o activas',
      icon: 'warning',
      position: 'top',
    });
    return;
  }

  // Verificar si $q.dialog está disponible, si no usar prompt nativo
  if (typeof $q.dialog !== 'function') {
    // Fallback si dialog no está disponible
    const estudianteId = prompt('Ingresa el ID del estudiante que deseas inscribir en esta capacitación:');
    if (estudianteId && !isNaN(Number(estudianteId)) && Number(estudianteId) > 0) {
      void handleEnrollStudentConfirm(estudianteId);
    }
    return;
  }

  $q.dialog({
    title: 'Inscribir Estudiante',
    message: 'Ingresa el ID del estudiante que deseas inscribir en esta capacitación',
    prompt: {
      model: '',
      type: 'number',
      label: 'ID del Estudiante',
      hint: 'Ingresa el ID numérico del estudiante',
      isValid: (val) => val !== '' && !isNaN(Number(val)) && Number(val) > 0,
    },
    persistent: true,
    ok: {
      label: 'Inscribir',
      color: 'primary',
    },
    cancel: {
      label: 'Cancelar',
      flat: true,
    },
  }).onOk((estudianteId: string) => {
    void handleEnrollStudentConfirm(estudianteId);
  });
}

async function handleEnrollStudentConfirm(estudianteId: string): Promise<void> {
  try {
    const { inscriptionsService } = await import(
      '../../../infrastructure/http/inscriptions/inscriptions.service'
    );

    // Crear la inscripción
    await inscriptionsService.create({
      courseId: training.value!.id,
      userId: estudianteId,
    });

    $q.notify({
      type: 'positive',
      message: 'Estudiante inscrito exitosamente',
      icon: 'check_circle',
      position: 'top',
    });

    // Recargar la capacitación para actualizar el contador de estudiantes
    await loadTraining();
    // Recargar estudiantes inscritos
    if (!isAlumno.value) {
      await loadEnrolledStudents();
    }
    
    // Si el usuario inscrito es el usuario actual, verificar inscripción
    // Obtener personaId del perfil (puede venir como personaId directo o desde persona.id)
    const profile = authStore.profile as { personaId?: number; persona?: { id?: number } } | null;
    const currentPersonaId = profile?.personaId || profile?.persona?.id;
    if (currentPersonaId && estudianteId === currentPersonaId.toString()) {
      await checkEnrollment();
    }
  } catch (error: unknown) {
    // Extraer el mensaje de error de forma más robusta
    let errorMessage = 'Error al inscribir el estudiante';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }
    
    // Mostrar notificación con el mensaje del error
    $q.notify({
      type: 'negative',
      message: errorMessage,
      icon: 'error',
      position: 'top',
      timeout: 7000, // Aumentar tiempo para mensajes más largos
      actions: [
        {
          label: 'Cerrar',
          color: 'white',
        },
      ],
    });
    
    // Log para depuración
    console.error('Error al inscribir estudiante:', error);
  }
}

function handleEditTraining() {
  void router.push({ name: 'training-edit', params: { id: training.value?.id } });
}

/**
 * Obtiene la clase CSS para la nota según si está aprobada o no
 */
function getScoreClass(score: number | undefined): string {
  if (score === undefined || score === null) return '';
  return score >= 70 ? 'text-positive' : 'text-negative';
}

/**
 * Maneja el cambio de nota de un estudiante
 */
function handleScoreChange(student: StudentWithDocument): void {
  if (!canManageTrainings || !student.inscriptionId) return;
  
  hasUnsavedChanges.value = true;
  if (student.score !== undefined && student.score !== null) {
    pendingScoreChanges.value.set(student.id, {
      inscriptionId: student.inscriptionId,
      score: student.score,
    });
  } else {
    // Si se borra la nota, también guardar el cambio
    pendingScoreChanges.value.set(student.id, {
      inscriptionId: student.inscriptionId,
      score: 0,
    });
  }
}

/**
 * Guarda todos los cambios de notas pendientes
 */
async function saveAllScores(): Promise<void> {
  if (!canManageTrainings || pendingScoreChanges.value.size === 0) return;

  savingScore.value = true;
  try {
    const { inscriptionsService } = await import(
      '../../../infrastructure/http/inscriptions/inscriptions.service'
    );

    // Guardar todas las notas pendientes
    const savePromises = Array.from(pendingScoreChanges.value.entries()).map(
      async ([userId, { inscriptionId, score }]) => {
        try {
          const updateDto: { score?: number } = {};
          if (score > 0) {
            updateDto.score = score;
          }
          await inscriptionsService.update(inscriptionId, updateDto);
          // Actualizar el estudiante en la lista local
          const student = enrolledStudents.value.find(s => s.id === userId);
          if (student) {
            if (score > 0) {
              student.score = score;
            } else {
              delete student.score;
            }
          }
        } catch (error) {
          console.error(`Error al guardar nota para estudiante ${userId}:`, error);
          throw error;
        }
      }
    );

    await Promise.all(savePromises);

    $q.notify({
      type: 'positive',
      message: 'Notas guardadas exitosamente',
      icon: 'check_circle',
      position: 'top',
      timeout: 3000,
    });

    pendingScoreChanges.value.clear();
    hasUnsavedChanges.value = false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    $q.notify({
      type: 'negative',
      message: `Error al guardar las notas: ${errorMessage}`,
      icon: 'error',
      position: 'top',
      timeout: 5000,
    });
  } finally {
    savingScore.value = false;
  }
}

/**
 * Presenta la evaluación de la capacitación
 * Redirige a la evaluación asociada a esta capacitación
 */
async function handlePresentEvaluation(): Promise<void> {
  if (!training.value) {
    $q.notify({
      type: 'warning',
      message: 'No se puede acceder a la evaluación. La capacitación no está cargada.',
      icon: 'warning',
      position: 'top',
    });
    return;
  }

  loadingEvaluation.value = true;
  try {
    const trainingWithEvals = training.value as TrainingWithEvaluations;
    await navigateToEvaluation(trainingWithEvals);
  } catch (error) {
    console.error('Error al presentar evaluación:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al acceder a la evaluación de la capacitación',
      icon: 'error',
      position: 'top',
      timeout: 4000,
    });
  } finally {
    loadingEvaluation.value = false;
  }
}

/**
 * Determina si la capacitación está activa
 * Considera 'published' y 'active' como estados activos
 */
const trainingStatus = computed(() => {
  if (!training.value?.status) return 'inactive';
  
  // Estados considerados como activos (permiten inscripciones)
  const estadosActivos: string[] = ['published', 'active'];
  return estadosActivos.includes(training.value.status) ? 'active' : 'inactive';
});

function handleToggleStatus(): void {
  if (!training.value) return;

  const currentStatus = trainingStatus.value;
  const action = currentStatus === 'active' ? 'desactivar' : 'activar';

  // Verificar si $q.dialog está disponible, si no usar confirm nativo
  if (typeof $q.dialog !== 'function') {
    // Fallback si dialog no está disponible
    if (confirm(`¿Está seguro de que desea ${action} esta capacitación? Los certificados ya emitidos no se afectarán (RF-10).`)) {
      void handleToggleStatusConfirm();
    }
    return;
  }

  // Modal de confirmación mejorado
  $q.dialog({
    title: 'Confirmar cambio de estado',
    message: `¿Está seguro de que desea ${action} la capacitación "${training.value.title}"?`,
    html: true,
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey-7',
    },
    ok: {
      label: 'Confirmar',
      color: currentStatus === 'active' ? 'negative' : 'positive',
      unelevated: true,
    },
    persistent: true,
  }).onOk(() => {
    void handleToggleStatusConfirm();
  });
}

async function handleToggleStatusConfirm(): Promise<void> {
  try {
    const currentStatus = trainingStatus.value;
    const actionPast = currentStatus === 'active' ? 'desactivada' : 'activada';

    // Importar servicio de toggle
    const { trainingsToggleStatusService } = await import(
      '../../../infrastructure/http/trainings/trainings-toggle-status.service'
    );

    // Llamar al endpoint de toggle
    const updatedTraining = await trainingsToggleStatusService.toggleActivoInactivo(trainingId);

    // Recargar la capacitación para obtener el estado actualizado del backend
    await loadTraining();

    $q.notify({
      type: 'positive',
      message: `Capacitación ${actionPast} exitosamente`,
      icon: 'check_circle',
      position: 'top',
    });
  } catch (error) {
    // Mejorar mensajes de error
    let errorMessage = 'Error al cambiar el estado';
    
    if (error instanceof Error) {
      const errorStr = error.message.toLowerCase();
      
      if (errorStr.includes('evaluación') || errorStr.includes('evaluation')) {
        errorMessage = 'No se puede activar: Debe vincular una evaluación primero (RF-09)';
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
    });
  }
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

const studentColumns: QTableColumn<StudentWithDocument>[] = [
  {
    name: 'name',
    field: 'name',
    label: 'Estudiante',
    align: 'left',
    sortable: true,
    required: true,
  },
  {
    name: 'documentNumber',
    field: 'documentNumber',
    label: 'Documento',
    align: 'left',
    sortable: true,
    format: (val: string) => val || 'N/A',
  },
  {
    name: 'score',
    field: 'score',
    label: 'Nota',
    align: 'center',
    sortable: true,
    format: (val: number) => val !== undefined && val !== null ? val.toFixed(2) : 'Sin calificar',
  },
];

/**
 * Convierte URLs de YouTube, Vimeo, etc. a URLs de embed para iframes
 */
function getVideoEmbedUrl(url: string): string {
  if (!url) return '';

  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Si no es YouTube ni Vimeo, devolver la URL original (podría ser un iframe directo)
  return url;
}
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

.resource-link-item {
  border-radius: 8px;
  transition: all 0.2s ease;
  padding: 8px;

  &:hover {
    background: rgba(79, 70, 229, 0.1);
    transform: translateX(4px);
  }
}

body.body--dark .resource-link-item:hover {
  background: rgba(79, 70, 229, 0.2);
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

.video-container {
  width: 100%;
}

.video-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  border-radius: 8px;
  background: #000;
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.resource-item--video {
  padding: 16px;
}

.resources-container {
  width: 100%;
}
</style>
