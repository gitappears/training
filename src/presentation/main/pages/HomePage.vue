<template>
  <q-page class="q-pa-xl column gap-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-primary">Dashboard de Capacitación</div>
        <div class="text-subtitle2 text-grey-7">
          Resumen de la actividad de formación de tu organización
        </div>
      </div>

      <q-btn color="primary" unelevated icon="add" label="Nueva capacitación" no-caps />
    </div>

    <!-- KPIs principales -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-card class="q-pa-md">
          <div class="text-caption text-grey-6">Cursos activos</div>
          <div class="text-h5">{{ kpis.activeCourses }}</div>
          <div class="text-caption text-positive">
            {{ kpis.activeCoursesVariation }}% vs mes anterior
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="q-pa-md">
          <div class="text-caption text-grey-6">Usuarios inscritos</div>
          <div class="text-h5">{{ kpis.enrolledUsers }}</div>
          <div class="text-caption text-positive">
            {{ kpis.enrolledUsersVariation }}% vs mes anterior
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="q-pa-md">
          <div class="text-caption text-grey-6">Tasa de finalización</div>
          <div class="text-h5">{{ kpis.completionRate }}%</div>
          <div class="text-caption text-grey-6">Objetivo: {{ kpis.completionTarget }}%</div>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="q-pa-md">
          <div class="text-caption text-grey-6">Satisfacción promedio</div>
          <div class="row items-baseline no-wrap">
            <div class="text-h5 q-mr-xs">{{ kpis.avgSatisfaction }}/5</div>
            <q-rating v-model="kpis.avgSatisfaction" max="5" size="18px" color="amber" readonly />
          </div>
          <div class="text-caption text-grey-6">
            Basado en {{ kpis.satisfactionResponses }} encuestas
          </div>
        </q-card>
      </div>
    </div>

    <!-- Dos columnas: próximas capacitaciones + progreso por área -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- Próximas capacitaciones -->
      <div class="col-12 col-md-7">
        <q-card class="q-pa-md">
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle1">Próximas capacitaciones</div>
            <q-btn flat dense icon="event" label="Ver calendario" no-caps />
          </div>

          <q-separator spaced />

          <q-list separator>
            <q-item v-for="training in upcomingTrainings" :key="training.id" clickable>
              <q-item-section avatar>
                <q-avatar :color="training.color" text-color="white">
                  {{ training.short }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ training.title }}</q-item-label>
                <q-item-label caption>
                  {{ training.date }} · {{ training.time }} · {{ training.duration }} ·
                  {{ training.modality }}
                </q-item-label>
              </q-item-section>

              <q-item-section side top>
                <q-badge :color="training.statusColor" outline>{{ training.statusLabel }}</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Progreso por área -->
      <div class="col-12 col-md-5">
        <q-card class="q-pa-md">
          <div class="text-subtitle1 q-mb-sm">Progreso por área</div>
          <q-separator spaced />

          <div class="column gap-sm">
            <div v-for="area in areaProgress" :key="area.id" class="q-mb-sm">
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-body2">{{ area.name }}</div>
                <div class="text-caption text-grey-7">{{ area.completed }} / {{ area.total }}</div>
              </div>
              <q-linear-progress
                :value="area.completion"
                rounded
                size="12px"
                :color="area.color"
                track-color="grey-3"
              >
                <div class="absolute-full flex flex-center">
                  <q-badge color="white" text-color="grey-8" :label="area.completionLabel" />
                </div>
              </q-linear-progress>
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <!-- Actividad reciente -->
    <q-card class="q-pa-md">
      <div class="text-subtitle1 q-mb-sm">Actividad reciente</div>
      <q-separator spaced />

      <q-timeline color="primary" layout="comfortable" side="right">
        <q-timeline-entry
          v-for="activity in recentActivity"
          :key="activity.id"
          :title="activity.title"
          :subtitle="activity.when"
          :icon="activity.icon"
          :color="activity.color"
        >
          <div class="text-body2">{{ activity.description }}</div>
          <div class="text-caption text-grey-6">{{ activity.meta }}</div>
        </q-timeline-entry>
      </q-timeline>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
// Mocks de datos para el dashboard de capacitación

const kpis = {
  activeCourses: 18,
  activeCoursesVariation: 12,
  enrolledUsers: 245,
  enrolledUsersVariation: 8,
  completionRate: 76,
  completionTarget: 80,
  avgSatisfaction: 4.6,
  satisfactionResponses: 134,
};

const upcomingTrainings = [
  {
    id: 1,
    title: 'Onboarding nuevos ingresos',
    date: '20 Dic',
    time: '09:00',
    duration: '2h',
    modality: 'Online',
    statusLabel: 'Inscripciones abiertas',
    statusColor: 'positive',
    color: 'primary',
    short: 'ON',
  },
  {
    id: 2,
    title: 'Liderazgo para mandos medios',
    date: '22 Dic',
    time: '15:00',
    duration: '3h',
    modality: 'Presencial',
    statusLabel: 'Cupos limitados',
    statusColor: 'warning',
    color: 'deep-purple-5',
    short: 'LD',
  },
  {
    id: 3,
    title: 'Seguridad de la información',
    date: '10 Ene',
    time: '11:00',
    duration: '1.5h',
    modality: 'Online',
    statusLabel: 'Programada',
    statusColor: 'info',
    color: 'teal-6',
    short: 'SI',
  },
];

const areaProgress = [
  {
    id: 1,
    name: 'Operaciones',
    completed: 42,
    total: 50,
    completion: 0.84,
    completionLabel: '84%',
    color: 'primary',
  },
  {
    id: 2,
    name: 'Comercial',
    completed: 25,
    total: 40,
    completion: 0.625,
    completionLabel: '62%',
    color: 'amber-7',
  },
  {
    id: 3,
    name: 'Tecnología',
    completed: 18,
    total: 24,
    completion: 0.75,
    completionLabel: '75%',
    color: 'deep-purple-5',
  },
];

const recentActivity = [
  {
    id: 1,
    title: 'Nuevo curso publicado',
    when: 'Hace 2 horas',
    description: 'Se publicó el curso "Seguridad de la información nivel básico".',
    meta: 'Área responsable: Tecnología',
    icon: 'campaign',
    color: 'primary',
  },
  {
    id: 2,
    title: 'Sesión completada',
    when: 'Hoy · 10:30',
    description: '32 usuarios completaron el curso "Introducción a la compañía".',
    meta: 'Tasa de finalización: 89%',
    icon: 'check_circle',
    color: 'positive',
  },
  {
    id: 3,
    title: 'Encuesta de satisfacción cerrada',
    when: 'Ayer',
    description: 'Encuesta del curso "Atención al cliente" cerrada con nota media 4.7/5.',
    meta: 'Respuestas recibidas: 58',
    icon: 'star',
    color: 'amber-7',
  },
];
</script>
