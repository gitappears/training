<template>
  <q-page class="q-pa-xl column q-gutter-lg">
    <div>
      <div class="heading-main q-mb-xs">Evaluaciones disponibles</div>
      <div class="heading-sub">
        Accede a las evaluaciones de los cursos asignados y completa tu certificación.
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div
        v-for="evaluation in evaluations"
        :key="evaluation.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card class="cursor-pointer" @click="startEvaluation(evaluation.id)">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <q-badge :color="getStatusColor(evaluation.status)" outline>
                {{ evaluation.status }}
              </q-badge>
              <div class="text-caption text-grey-7">
                {{ evaluation.questionsCount }} preguntas
              </div>
            </div>
            <div class="text-subtitle1 text-weight-medium q-mb-xs">
              {{ evaluation.courseName }}
            </div>
            <div class="text-caption text-grey-7 q-mb-sm">
              {{ evaluation.description }}
            </div>
            <q-separator class="q-mb-sm" />
            <div class="row items-center justify-between">
              <div class="text-caption text-grey-6">
                <q-icon name="schedule" size="16px" />
                {{ evaluation.durationMinutes }} min
              </div>
              <div class="text-caption text-grey-6">
                <q-icon name="check_circle" size="16px" />
                Mínimo: {{ evaluation.minimumScore }}%
              </div>
            </div>
            <div v-if="evaluation.lastAttempt" class="q-mt-sm">
              <div class="text-caption text-grey-7">
                Último intento: {{ evaluation.lastAttempt.date }} - Puntuación:
                {{ evaluation.lastAttempt.score }}%
              </div>
            </div>
          </q-card-section>
          <q-card-actions>
            <q-btn
              flat
              :label="evaluation.status === 'Pendiente' ? 'Comenzar' : 'Reintentar'"
              color="primary"
              class="full-width"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-card v-if="evaluations.length === 0" class="q-pa-xl text-center">
      <q-icon name="quiz" size="64px" color="grey-5" class="q-mb-md" />
      <div class="text-h6 text-grey-7">No hay evaluaciones disponibles</div>
      <div class="text-body2 text-grey-6 q-mt-sm">
        Completa los cursos asignados para acceder a sus evaluaciones.
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

interface Evaluation {
  id: string;
  courseName: string;
  description: string;
  questionsCount: number;
  durationMinutes: number;
  minimumScore: number;
  status: 'Pendiente' | 'En progreso' | 'Aprobada' | 'Reprobada';
  lastAttempt?: {
    date: string;
    score: number;
  };
}

const evaluations = ref<Evaluation[]>([
  {
    id: '1',
    courseName: 'Manejo Defensivo',
    description: 'Evaluación sobre técnicas de manejo defensivo y seguridad vial.',
    questionsCount: 20,
    durationMinutes: 30,
    minimumScore: 70,
    status: 'Pendiente',
  },
  {
    id: '2',
    courseName: 'Primeros Auxilios',
    description: 'Evaluación sobre procedimientos básicos de primeros auxilios.',
    questionsCount: 15,
    durationMinutes: 25,
    minimumScore: 80,
    status: 'Aprobada',
    lastAttempt: {
      date: '2025-01-15',
      score: 85,
    },
  },
  {
    id: '3',
    courseName: 'Transporte de Mercancías Peligrosas',
    description: 'Evaluación sobre normativas y procedimientos para transporte de materiales peligrosos.',
    questionsCount: 25,
    durationMinutes: 40,
    minimumScore: 75,
    status: 'Reprobada',
    lastAttempt: {
      date: '2025-01-18',
      score: 65,
    },
  },
]);

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Pendiente: 'info',
    'En progreso': 'warning',
    Aprobada: 'positive',
    Reprobada: 'negative',
  };
  return colors[status] ?? 'grey';
}

function startEvaluation(id: string) {
  void router.push(`/evaluations/${id}`);
}
</script>

