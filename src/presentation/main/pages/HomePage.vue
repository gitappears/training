<template>
  <q-page class="home-page q-pa-xl">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <div class="text-h4 text-weight-bold text-primary q-mb-xs">Dashboard de Capacitación</div>
        <div class="text-body1 text-grey-7">
          Resumen de la actividad de formación de tu organización
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          flat
          dense
          icon="refresh"
          color="primary"
          label="Actualizar"
          @click="refreshData"
        />
        <q-btn
          color="primary"
          unelevated
          icon="add"
          label="Nueva capacitación"
          no-caps
          @click="createTraining"
        />
      </div>
    </div>

    <!-- Quick Actions -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section class="q-pa-md">
        <div class="text-subtitle2 q-mb-md text-weight-medium">Acceso Rápido</div>
        <div class="row q-col-gutter-md">
          <div class="col-6 col-sm-4 col-md-2">
            <q-btn
              flat
              class="quick-action-btn full-width"
              @click="navigateTo('/trainings')"
            >
              <div class="column items-center q-gutter-xs">
                <q-icon name="school" size="32px" color="primary" />
                <div class="text-caption">Cursos</div>
              </div>
            </q-btn>
          </div>
          <div class="col-6 col-sm-4 col-md-2">
            <q-btn
              flat
              class="quick-action-btn full-width"
              @click="navigateTo('/users')"
            >
              <div class="column items-center q-gutter-xs">
                <q-icon name="people" size="32px" color="primary" />
                <div class="text-caption">Usuarios</div>
              </div>
            </q-btn>
          </div>
          <div class="col-6 col-sm-4 col-md-2">
            <q-btn
              flat
              class="quick-action-btn full-width"
              @click="navigateTo('/evaluations')"
            >
              <div class="column items-center q-gutter-xs">
                <q-icon name="quiz" size="32px" color="primary" />
                <div class="text-caption">Evaluaciones</div>
              </div>
            </q-btn>
          </div>
          <div class="col-6 col-sm-4 col-md-2">
            <q-btn
              flat
              class="quick-action-btn full-width"
              @click="navigateTo('/certificates')"
            >
              <div class="column items-center q-gutter-xs">
                <q-icon name="verified" size="32px" color="primary" />
                <div class="text-caption">Certificados</div>
              </div>
            </q-btn>
          </div>
          <div class="col-6 col-sm-4 col-md-2">
            <q-btn
              flat
              class="quick-action-btn full-width"
              @click="navigateTo('/reports')"
            >
              <div class="column items-center q-gutter-xs">
                <q-icon name="insights" size="32px" color="primary" />
                <div class="text-caption">Reportes</div>
              </div>
            </q-btn>
          </div>
          <div class="col-6 col-sm-4 col-md-2">
            <q-btn
              flat
              class="quick-action-btn full-width"
              @click="navigateTo('/trainings/create')"
            >
              <div class="column items-center q-gutter-xs">
                <q-icon name="add_circle" size="32px" color="primary" />
                <div class="text-caption">Nuevo Curso</div>
              </div>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Enhanced KPIs -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm q-mb-sm">
              <q-avatar size="48px" color="primary" text-color="white" icon="play_circle" />
              <div class="col">
                <div class="text-caption text-grey-6">Cursos Activos</div>
                <div class="text-h5 text-weight-bold">{{ kpis.activeCourses }}</div>
              </div>
            </div>
            <div class="text-caption" :class="kpis.activeCoursesVariation >= 0 ? 'text-positive' : 'text-negative'">
              <q-icon
                :name="kpis.activeCoursesVariation >= 0 ? 'arrow_upward' : 'arrow_downward'"
                size="14px"
                class="q-mr-xs"
              />
              {{ Math.abs(kpis.activeCoursesVariation) }}% vs mes anterior
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm q-mb-sm">
              <q-avatar size="48px" color="positive" text-color="white" icon="people" />
              <div class="col">
                <div class="text-caption text-grey-6">Usuarios Inscritos</div>
                <div class="text-h5 text-weight-bold">{{ kpis.enrolledUsers }}</div>
              </div>
            </div>
            <div class="text-caption" :class="kpis.enrolledUsersVariation >= 0 ? 'text-positive' : 'text-negative'">
              <q-icon
                :name="kpis.enrolledUsersVariation >= 0 ? 'arrow_upward' : 'arrow_downward'"
                size="14px"
                class="q-mr-xs"
              />
              {{ Math.abs(kpis.enrolledUsersVariation) }}% vs mes anterior
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm q-mb-sm">
              <q-avatar size="48px" color="amber" text-color="white" icon="check_circle" />
              <div class="col">
                <div class="text-caption text-grey-6">Tasa de Finalización</div>
                <div class="text-h5 text-weight-bold">{{ kpis.completionRate }}%</div>
              </div>
            </div>
            <q-linear-progress
              :value="kpis.completionRate / 100"
              rounded
              size="8px"
              color="amber"
              class="q-mt-sm"
            />
            <div class="text-caption text-grey-6 q-mt-xs">
              Objetivo: {{ kpis.completionTarget }}%
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm q-mb-sm">
              <q-avatar size="48px" color="purple" text-color="white" icon="star" />
              <div class="col">
                <div class="text-caption text-grey-6">Satisfacción Promedio</div>
                <div class="row items-baseline no-wrap">
                  <div class="text-h5 q-mr-xs">{{ kpis.avgSatisfaction }}/5</div>
                  <q-rating
                    :model-value="kpis.avgSatisfaction"
                    max="5"
                    size="18px"
                    color="amber"
                    readonly
                  />
                </div>
              </div>
            </div>
            <div class="text-caption text-grey-6">
              Basado en {{ kpis.satisfactionResponses }} encuestas
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <!-- Próximas Capacitaciones -->
      <div class="col-12 col-md-7">
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle1 text-weight-medium">Próximas Capacitaciones</div>
              <q-btn flat dense icon="event" label="Ver calendario" no-caps @click="navigateTo('/calendar')" />
            </div>
            <q-separator class="q-mb-md" />

            <q-list separator>
              <q-item
                v-for="training in upcomingTrainings"
                :key="training.id"
                clickable
                @click="navigateTo(`/trainings/${training.id}`)"
              >
                <q-item-section avatar>
                  <q-avatar :color="training.color" text-color="white" size="40px">
                    {{ training.short }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ training.title }}</q-item-label>
                  <q-item-label caption>
                    <q-icon name="event" size="14px" class="q-mr-xs" />
                    {{ training.date }} · {{ training.time }}
                    <q-icon name="schedule" size="14px" class="q-ml-sm q-mr-xs" />
                    {{ training.duration }} · {{ training.modality }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side top>
                  <q-badge :color="training.statusColor" outline>{{ training.statusLabel }}</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Progreso por Área -->
      <div class="col-12 col-md-5">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 q-mb-md text-weight-medium">Progreso por Área</div>
            <q-separator class="q-mb-md" />

            <div class="column q-gutter-md">
              <div v-for="area in areaProgress" :key="area.id">
                <div class="row items-center justify-between q-mb-xs">
                  <div class="text-body2 text-weight-medium">{{ area.name }}</div>
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
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts and Activity -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <!-- Completion Trend Chart -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 q-mb-md text-weight-medium">Tendencia de Finalización</div>
            <div class="trend-chart">
              <div class="row items-end q-gutter-xs" style="height: 200px">
                <div
                  v-for="(month, index) in completionTrend"
                  :key="index"
                  class="col trend-bar"
                >
                  <div
                    class="bar"
                    :style="{
                      height: `${month.value}%`,
                      backgroundColor: '#4f46e5',
                    }"
                  >
                    <q-tooltip>{{ month.label }}: {{ month.value }}%</q-tooltip>
                  </div>
                  <div class="text-caption text-center q-mt-xs">{{ month.label }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Notifications Widget -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle1 text-weight-medium">Notificaciones Recientes</div>
              <q-btn flat dense icon="notifications" @click="navigateTo('/notifications')">
                <q-badge color="negative" floating>{{ notifications.length }}</q-badge>
              </q-btn>
            </div>
            <q-separator class="q-mb-md" />

            <q-list separator>
              <q-item
                v-for="notification in notifications.slice(0, 5)"
                :key="notification.id"
                clickable
              >
                <q-item-section avatar>
                  <q-icon
                    :name="notification.icon"
                    :color="notification.color"
                    size="24px"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ notification.title }}</q-item-label>
                  <q-item-label caption>{{ notification.time }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge
                    v-if="!notification.read"
                    color="primary"
                    rounded
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Activity Timeline -->
    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1 q-mb-md text-weight-medium">Actividad Reciente</div>
        <q-separator class="q-mb-md" />

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
            <div class="text-caption text-grey-6 q-mt-xs">{{ activity.meta }}</div>
          </q-timeline-entry>
        </q-timeline>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();

// Estado
const kpis = ref({
  activeCourses: 18,
  activeCoursesVariation: 12,
  enrolledUsers: 245,
  enrolledUsersVariation: 8,
  completionRate: 76,
  completionTarget: 80,
  avgSatisfaction: 4.6,
  satisfactionResponses: 134,
});

const upcomingTrainings = ref([
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
]);

const areaProgress = ref([
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
]);

const completionTrend = ref([
  { label: 'Jul', value: 65 },
  { label: 'Ago', value: 72 },
  { label: 'Sep', value: 68 },
  { label: 'Oct', value: 78 },
  { label: 'Nov', value: 82 },
  { label: 'Dic', value: 84 },
]);

const notifications = ref([
  {
    id: 1,
    title: 'Nuevo certificado emitido',
    time: 'Hace 5 minutos',
    icon: 'verified',
    color: 'positive',
    read: false,
  },
  {
    id: 2,
    title: 'Evaluación pendiente de revisión',
    time: 'Hace 1 hora',
    icon: 'quiz',
    color: 'warning',
    read: false,
  },
  {
    id: 3,
    title: 'Curso próximo a iniciar',
    time: 'Hace 2 horas',
    icon: 'event',
    color: 'info',
    read: true,
  },
  {
    id: 4,
    title: 'Usuario nuevo registrado',
    time: 'Hace 3 horas',
    icon: 'person_add',
    color: 'primary',
    read: true,
  },
  {
    id: 5,
    title: 'Reporte mensual disponible',
    time: 'Ayer',
    icon: 'insights',
    color: 'purple',
    read: true,
  },
]);

const recentActivity = ref([
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
]);

// Funciones
function navigateTo(path: string) {
  void router.push(path);
}

function createTraining() {
  void router.push('/trainings/create');
}

function refreshData() {
  $q.notify({
    type: 'positive',
    message: 'Datos actualizados exitosamente',
    position: 'top',
  });
}
</script>

<style scoped lang="scss">
.home-page {
  background: #f9fafb;
  transition: background-color 0.3s ease;
}

body.body--dark .home-page {
  background: #0f172a;
}

.quick-action-btn {
  padding: 16px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.quick-action-btn:hover {
  background-color: rgba(79, 70, 229, 0.1);
}

body.body--dark .quick-action-btn:hover {
  background-color: rgba(79, 70, 229, 0.2);
}

.kpi-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

body.body--dark .kpi-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.trend-chart {
  padding: 16px;
}

.trend-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.bar {
  width: 100%;
  min-height: 20px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  cursor: pointer;
}

.bar:hover {
  opacity: 0.8;
}
</style>
