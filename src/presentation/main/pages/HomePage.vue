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
          icon="tune"
          color="primary"
          label="Personalizar"
          @click="showCustomizeDialog = true"
        />
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

    <!-- Enhanced KPIs con widgets personalizables -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div
        v-for="widget in visibleWidgets"
        :key="widget.id"
        :class="widget.columnClass"
      >
        <q-card
          flat
          bordered
          class="kpi-card widget-card"
          :class="{ 'widget-dragging': widget.dragging }"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center q-gutter-sm">
                <q-avatar :size="widget.iconSize" :color="widget.color" text-color="white" :icon="widget.icon" />
                <div class="col">
                  <div class="text-caption text-grey-6">{{ widget.label }}</div>
                  <div class="text-h5 text-weight-bold">{{ widget.value }}</div>
                </div>
              </div>
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="more_vert"
                @click.stop
              >
                <q-menu>
                  <q-list>
                    <q-item clickable v-close-popup @click="toggleWidget(widget.id)">
                      <q-item-section avatar>
                        <q-icon :name="widget.visible ? 'visibility_off' : 'visibility'" />
                      </q-item-section>
                      <q-item-section>
                        {{ widget.visible ? 'Ocultar' : 'Mostrar' }}
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
            <div v-if="widget.variation !== undefined" class="text-caption" :class="widget.variation >= 0 ? 'text-positive' : 'text-negative'">
              <q-icon
                :name="widget.variation >= 0 ? 'arrow_upward' : 'arrow_downward'"
                size="14px"
                class="q-mr-xs"
              />
              {{ Math.abs(widget.variation) }}% vs mes anterior
            </div>
            <q-linear-progress
              v-if="widget.progress !== undefined"
              :value="widget.progress"
              rounded
              size="8px"
              :color="widget.color"
              class="q-mt-sm"
            />
            <div v-if="widget.target" class="text-caption text-grey-6 q-mt-xs">
              Objetivo: {{ widget.target }}
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

      <!-- Progreso por Área Mejorado -->
      <div class="col-12 col-md-5">
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle1 text-weight-medium">Progreso por Área</div>
              <q-btn
                flat
                dense
                icon="bar_chart"
                label="Ver Detalle"
                size="sm"
                @click="navigateTo('/reports')"
              />
            </div>
            <q-separator class="q-mb-md" />

            <div class="column q-gutter-md">
              <div
                v-for="area in areaProgress"
                :key="area.id"
                class="area-progress-item"
              >
                <div class="row items-center justify-between q-mb-xs">
                  <div class="row items-center q-gutter-sm">
                    <q-icon :name="area.icon" :color="area.color" size="20px" />
                    <div class="text-body2 text-weight-medium">{{ area.name }}</div>
                  </div>
                  <div class="text-caption text-grey-7">{{ area.completed }} / {{ area.total }}</div>
                </div>
                <q-linear-progress
                  :value="area.completion"
                  rounded
                  size="16px"
                  :color="area.color"
                  track-color="grey-3"
                  class="q-mt-sm"
                >
                  <div class="absolute-full flex flex-center">
                    <q-badge color="white" text-color="grey-8" :label="area.completionLabel" />
                  </div>
                </q-linear-progress>
                <div class="row items-center justify-between q-mt-xs">
                  <div class="text-caption text-grey-6">
                    {{ area.remaining }} restantes
                  </div>
                  <q-btn
                    flat
                    dense
                    size="sm"
                    icon="arrow_forward"
                    label="Ver cursos"
                    @click="navigateTo(`/trainings?area=${area.id}`)"
                  />
                </div>
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

    <!-- Dialog de Personalización -->
    <q-dialog v-model="showCustomizeDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Personalizar Dashboard</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-subtitle2 q-mb-md">Selecciona los widgets a mostrar:</div>
          <q-list>
            <q-item
              v-for="widget in allWidgets"
              :key="widget.id"
              tag="label"
              v-ripple
            >
              <q-item-section avatar>
                <q-checkbox
                  v-model="widget.visible"
                  :color="widget.color"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ widget.label }}</q-item-label>
                <q-item-label caption>{{ widget.description }}</q-item-label>
              </q-item-section>
              <q-item-section avatar>
                <q-icon :name="widget.icon" :color="widget.color" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            @click="showCustomizeDialog = false"
          />
          <q-btn
            color="primary"
            label="Guardar"
            @click="saveWidgetPreferences"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();

// Estado
const showCustomizeDialog = ref(false);

interface Widget {
  id: string;
  label: string;
  description: string;
  value: string | number;
  icon: string;
  color: string;
  iconSize: string;
  columnClass: string;
  visible: boolean;
  variation?: number;
  progress?: number;
  target?: string;
  dragging?: boolean;
}

const allWidgets = ref<Widget[]>([
  {
    id: 'activeCourses',
    label: 'Cursos Activos',
    description: 'Total de cursos disponibles actualmente',
    value: 18,
    icon: 'play_circle',
    color: 'primary',
    iconSize: '48px',
    columnClass: 'col-12 col-sm-6 col-md-3',
    visible: true,
    variation: 12,
  },
  {
    id: 'enrolledUsers',
    label: 'Usuarios Inscritos',
    description: 'Total de usuarios registrados en cursos',
    value: 245,
    icon: 'people',
    color: 'positive',
    iconSize: '48px',
    columnClass: 'col-12 col-sm-6 col-md-3',
    visible: true,
    variation: 8,
  },
  {
    id: 'completionRate',
    label: 'Tasa de Finalización',
    description: 'Porcentaje de cursos completados',
    value: '76%',
    icon: 'check_circle',
    color: 'amber',
    iconSize: '48px',
    columnClass: 'col-12 col-sm-6 col-md-3',
    visible: true,
    progress: 0.76,
    target: '80%',
  },
  {
    id: 'avgSatisfaction',
    label: 'Satisfacción Promedio',
    description: 'Calificación promedio de los cursos',
    value: '4.6/5',
    icon: 'star',
    color: 'purple',
    iconSize: '48px',
    columnClass: 'col-12 col-sm-6 col-md-3',
    visible: true,
  },
  {
    id: 'certificatesIssued',
    label: 'Certificados Emitidos',
    description: 'Total de certificados generados este mes',
    value: 89,
    icon: 'verified',
    color: 'teal',
    iconSize: '48px',
    columnClass: 'col-12 col-sm-6 col-md-3',
    visible: false,
    variation: 15,
  },
  {
    id: 'evaluationsPending',
    label: 'Evaluaciones Pendientes',
    description: 'Evaluaciones que requieren atención',
    value: 12,
    icon: 'quiz',
    color: 'orange',
    iconSize: '48px',
    columnClass: 'col-12 col-sm-6 col-md-3',
    visible: false,
  },
]);

const visibleWidgets = computed(() => allWidgets.value.filter((w) => w.visible));

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
    remaining: 8,
    completion: 0.84,
    completionLabel: '84%',
    color: 'primary',
    icon: 'settings',
  },
  {
    id: 2,
    name: 'Comercial',
    completed: 25,
    total: 40,
    remaining: 15,
    completion: 0.625,
    completionLabel: '62%',
    color: 'amber-7',
    icon: 'store',
  },
  {
    id: 3,
    name: 'Tecnología',
    completed: 18,
    total: 24,
    remaining: 6,
    completion: 0.75,
    completionLabel: '75%',
    color: 'deep-purple-5',
    icon: 'computer',
  },
  {
    id: 4,
    name: 'Recursos Humanos',
    completed: 15,
    total: 20,
    remaining: 5,
    completion: 0.75,
    completionLabel: '75%',
    color: 'pink-6',
    icon: 'groups',
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

function toggleWidget(widgetId: string) {
  const widget = allWidgets.value.find((w) => w.id === widgetId);
  if (widget) {
    widget.visible = !widget.visible;
  }
}

function saveWidgetPreferences() {
  // Guardar preferencias en localStorage
  const preferences = allWidgets.value.map((w) => ({
    id: w.id,
    visible: w.visible,
  }));
  localStorage.setItem('dashboard-widgets', JSON.stringify(preferences));
  showCustomizeDialog.value = false;
  $q.notify({
    type: 'positive',
    message: 'Preferencias guardadas',
    position: 'top',
  });
}

// Cargar preferencias al montar
function loadWidgetPreferences() {
  const saved = localStorage.getItem('dashboard-widgets');
  if (saved) {
    try {
      const preferences = JSON.parse(saved) as Array<{ id: string; visible: boolean }>;
      preferences.forEach((pref) => {
        const widget = allWidgets.value.find((w) => w.id === pref.id);
        if (widget) {
          widget.visible = pref.visible;
        }
      });
    } catch {
      // Ignorar errores de parsing
    }
  }
}

// Cargar preferencias al montar
loadWidgetPreferences();
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

.widget-card {
  position: relative;
  transition: all 0.3s ease;

  &.widget-dragging {
    opacity: 0.5;
    transform: scale(0.95);
  }
}

.area-progress-item {
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
}

body.body--dark {
  .area-progress-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
}
</style>
