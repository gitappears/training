<template>
  <q-page class="q-pa-xl column q-gutter-lg">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-8">
        <div class="text-caption text-grey-7 q-mb-xs">Capacitación</div>
        <div class="text-h5 q-mb-xs">{{ training.title }}</div>
        <div class="text-caption text-grey-7 q-mb-sm">
          {{ training.area }} · {{ trainingModalityLabel }} · {{ training.durationHours }} h
        </div>
        <div class="row items-center q-gutter-sm q-mb-md">
          <q-avatar size="32px" color="primary" text-color="white">
            {{ trainingInstructorInitials }}
          </q-avatar>
          <div class="column">
            <span class="text-body2">{{ training.instructor }}</span>
            <span class="text-caption text-grey-6">Instructor</span>
          </div>
        </div>

        <q-tabs
          v-model="tab"
          dense
          class="text-primary"
          active-color="primary"
          indicator-color="primary"
        >
          <q-tab name="overview" label="Resumen" />
          <q-tab name="content" label="Contenido" />
          <q-tab name="students" label="Estudiantes" />
          <q-tab name="resources" label="Recursos" />
          <q-tab name="reviews" label="Reseñas" />
        </q-tabs>
        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="overview">
            <div class="q-mt-md">
              <div class="text-subtitle1 q-mb-sm">Descripción</div>
              <div class="text-body2 text-grey-8">{{ training.description }}</div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="content">
            <div class="q-mt-md column q-gutter-sm">
              <q-expansion-item
                v-for="section in training.sections"
                :key="section.id"
                expand-separator
                :label="section.title"
                :caption="`${section.lessonsCount} lecciones · ${section.durationMinutes} min`"
              />
            </div>
          </q-tab-panel>

          <q-tab-panel name="students">
            <div class="q-mt-md">
              <div class="text-subtitle1 q-mb-sm">Estudiantes inscritos</div>
              <q-table :rows="training.students" :columns="studentColumns" row-key="id" flat dense>
                <template #body-cell-progress="props">
                  <q-linear-progress :value="props.row.progress" rounded size="10px" />
                </template>
                <template #body-cell-score="props">
                  <q-input v-model.number="props.row.score" dense type="number" min="1" max="100" />
                </template>
                <template #body-cell-rating="props">
                  <q-rating v-model="props.row.rating" max="5" size="16px" color="amber" />
                </template>
              </q-table>
            </div>
          </q-tab-panel>

          <q-tab-panel name="resources">
            <div class="q-mt-md column q-gutter-md">
              <div>
                <div class="text-subtitle1 q-mb-xs">Adjuntos</div>
                <q-list bordered separator>
                  <q-item
                    v-for="att in training.attachments"
                    :key="att.id"
                    clickable
                    tag="a"
                    :href="att.url"
                    target="_blank"
                  >
                    <q-item-section avatar>
                      <q-icon :name="att.type === 'file' ? 'attach_file' : 'link'" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ att.label }}</q-item-label>
                      <q-item-label caption>{{ att.url }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="reviews">
            <div class="q-mt-md column q-gutter-md">
              <div class="row items-center q-gutter-sm">
                <q-icon name="star" color="amber" size="24px" />
                <div class="text-h6">{{ training.averageRating.toFixed(1) }}</div>
                <div class="text-caption text-grey-7">
                  Basado en {{ training.reviews.length }} reseñas
                </div>
              </div>
              <q-separator spaced />
              <q-timeline color="primary" layout="comfortable" side="right">
                <q-timeline-entry
                  v-for="review in training.reviews"
                  :key="review.id"
                  :subtitle="review.createdAt"
                >
                  <div class="row items-center q-gutter-sm q-mb-xs">
                    <q-rating v-model="review.rating" max="5" size="16px" color="amber" readonly />
                  </div>
                  <div class="text-body2">{{ review.comment }}</div>
                </q-timeline-entry>
              </q-timeline>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-img :src="training.coverImageUrl" :ratio="16 / 9" />
          <q-card-section>
            <div class="text-subtitle1 q-mb-xs">{{ training.title }}</div>
            <div class="row items-center q-gutter-xs q-mb-sm">
              <q-icon name="star" color="amber" size="18px" />
              <span class="text-caption">{{ training.averageRating.toFixed(1) }}</span>
              <span class="text-caption text-grey-6">({{ training.studentsCount }} alumnos)</span>
            </div>
            <q-btn
              color="primary"
              unelevated
              label="Inscribir estudiante (mock)"
              class="full-width"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import type { QTableColumn } from 'quasar';
import type { Training, TrainingStudent } from '../../../domain/training/models';

const route = useRoute();
const tab = ref<'overview' | 'content' | 'students' | 'resources' | 'reviews'>('overview');

const trainingId = route.params.id as string;

const training = ref<Training>({
  id: trainingId,
  title: 'Onboarding nuevos colaboradores',
  description: 'Conoce la cultura, procesos y herramientas clave de la compañía.',
  type: 'standard',
  modality: 'online',
  coverImageUrl:
    'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
  promoVideoUrl: '',
  instructor: 'Equipo de Personas',
  area: 'RRHH',
  targetAudience: 'Todos los colaboradores',
  startDate: '2025-01-10',
  endDate: '2025-01-31',
  durationHours: 4,
  capacity: 200,
  studentsCount: 152,
  averageRating: 4.7,
  sections: [
    {
      id: 's1',
      title: 'Bienvenida y cultura',
      description: '',
      lessonsCount: 4,
      durationMinutes: 35,
    },
    { id: 's2', title: 'Procesos clave', description: '', lessonsCount: 5, durationMinutes: 50 },
  ],
  attachments: [
    {
      id: 'a1',
      type: 'file',
      label: 'Manual del colaborador (PDF)',
      url: '#',
    },
    {
      id: 'a2',
      type: 'link',
      label: 'Intranet corporativa',
      url: 'https://intranet.example.com',
    },
  ],
  images: [],
  students: [
    { id: 'st1', name: 'Ana Pérez', email: 'ana@example.com', progress: 0.8, score: 90, rating: 5 },
    {
      id: 'st2',
      name: 'Juan López',
      email: 'juan@example.com',
      progress: 0.45,
      score: 70,
      rating: 4,
    },
  ],
  reviews: [
    {
      id: 'r1',
      studentId: 'st1',
      rating: 5,
      comment: 'Excelente introducción, muy clara y amigable.',
      createdAt: '2025-01-15',
    },
  ],
});

const modalityLabels: Record<string, string> = {
  online: 'Online',
  onsite: 'Presencial',
  hybrid: 'Mixta',
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

const trainingModalityLabel = computed(() => getModalityLabel(training.value.modality));
const trainingInstructorInitials = computed(() => getInstructorInitials(training.value.instructor));

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
