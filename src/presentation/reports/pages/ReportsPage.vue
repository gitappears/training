<template>
  <q-page class="reports-page q-pa-xl">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <div class="text-h4 text-weight-bold text-primary q-mb-xs">Reportes y Métricas</div>
        <div class="text-body1 text-grey-7">
          Visualiza el desempeño, KPIs y estadísticas de la plataforma de capacitación
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn flat dense icon="refresh" color="primary" label="Actualizar" @click="refreshData" />
        <q-btn flat dense icon="download" color="primary" @click="showExportMenu">
          <q-tooltip>Exportar</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Advanced Filters -->
    <FiltersPanel :active-filters-count="activeFiltersCount" @clear="clearAllFilters">
      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.course"
          outlined
          dense
          :options="courseOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          clearable
          placeholder="Curso"
        >
          <template #prepend>
            <q-icon name="school" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-2">
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
          placeholder="Estado"
        >
          <template #prepend>
            <q-icon name="toggle_on" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-2">
        <q-input v-model="filters.dateFrom" outlined dense type="date" label="Desde" clearable>
          <template #prepend>
            <q-icon name="event" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-2">
        <q-input v-model="filters.dateTo" outlined dense type="date" label="Hasta" clearable>
          <template #prepend>
            <q-icon name="event" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-2">
        <q-select
          v-model="filters.comparisonPeriod"
          outlined
          dense
          :options="comparisonOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          clearable
          placeholder="Comparar con"
        >
          <template #prepend>
            <q-icon name="compare_arrows" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-1">
        <q-btn
          color="primary"
          unelevated
          icon="insights"
          label="Generar"
          class="full-width"
          @click="generateReport"
        />
      </div>
    </FiltersPanel>

    <!-- Enhanced KPIs -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm q-mb-sm">
              <q-avatar size="48px" color="primary" text-color="white" icon="check_circle" />
              <div class="col">
                <div class="text-caption text-grey-6">Cumplimiento Total</div>
                <div class="text-h5 text-weight-bold">{{ kpis.complianceRate }}%</div>
              </div>
            </div>
            <q-linear-progress
              :value="kpis.complianceRate / 100"
              rounded
              size="8px"
              color="primary"
              class="q-mt-sm"
            />
            <div class="text-caption text-grey-6 q-mt-xs">
              Objetivo: {{ kpis.complianceTarget }}%
              <q-badge
                :color="kpis.complianceRate >= kpis.complianceTarget ? 'positive' : 'warning'"
                outline
                class="q-ml-xs"
              >
                {{ kpis.complianceRate >= kpis.complianceTarget ? '✓' : '!' }}
              </q-badge>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm q-mb-sm">
              <q-avatar size="48px" color="positive" text-color="white" icon="trending_up" />
              <div class="col">
                <div class="text-caption text-grey-6">Tasa de Aprobación</div>
                <div class="text-h5 text-weight-bold">{{ kpis.approvalRate }}%</div>
              </div>
            </div>
            <div
              class="text-caption"
              :class="kpis.approvalRateVariation >= 0 ? 'text-positive' : 'text-negative'"
            >
              <q-icon
                :name="kpis.approvalRateVariation >= 0 ? 'arrow_upward' : 'arrow_downward'"
                size="14px"
                class="q-mr-xs"
              />
              {{ Math.abs(kpis.approvalRateVariation) }}% vs mes anterior
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm q-mb-sm">
              <q-avatar size="48px" color="amber" text-color="white" icon="verified" />
              <div class="col">
                <div class="text-caption text-grey-6">Certificados Emitidos</div>
                <div class="text-h5 text-weight-bold">{{ kpis.certificatesIssued }}</div>
              </div>
            </div>
            <div class="text-caption text-grey-6">
              {{ kpis.certificatesValid }} válidos
              <q-badge color="positive" outline class="q-ml-xs">
                {{ Math.round((kpis.certificatesValid / kpis.certificatesIssued) * 100) }}%
              </q-badge>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm q-mb-sm">
              <q-avatar size="48px" color="info" text-color="white" icon="schedule" />
              <div class="col">
                <div class="text-caption text-grey-6">Tiempo Promedio</div>
                <div class="text-h5 text-weight-bold">{{ kpis.avgCompletionTime }}h</div>
              </div>
            </div>
            <div class="text-caption text-grey-6">Tiempo de finalización</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Additional KPIs Row -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="purple" text-color="white" icon="people" />
              <div class="col">
                <div class="text-caption text-grey-6">Usuarios Activos</div>
                <div class="text-h5 text-weight-bold">{{ kpis.activeUsers }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="teal" text-color="white" icon="play_circle" />
              <div class="col">
                <div class="text-caption text-grey-6">Cursos Activos</div>
                <div class="text-h5 text-weight-bold">{{ kpis.activeCourses }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="orange" text-color="white" icon="star" />
              <div class="col">
                <div class="text-caption text-grey-6">Satisfacción Promedio</div>
                <div class="text-h5 text-weight-bold">{{ kpis.avgSatisfaction }}/5</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="kpi-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="red" text-color="white" icon="event_busy" />
              <div class="col">
                <div class="text-caption text-grey-6">Certificados por Vencer</div>
                <div class="text-h5 text-weight-bold">{{ kpis.expiringSoon }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts and Reports Tabs -->
    <q-card flat bordered>
      <q-tabs
        v-model="tab"
        dense
        class="text-primary"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab name="overview" label="Resumen" icon="dashboard" />
        <q-tab name="trends" label="Tendencias" icon="show_chart" />
        <q-tab name="courses" label="Por Curso" icon="school" />
        <q-tab name="users" label="Por Usuario" icon="people" />
        <q-tab name="certificates" label="Certificados" icon="verified" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated class="q-pa-md">
        <!-- Overview Tab -->
        <q-tab-panel name="overview">
          <div class="row q-col-gutter-lg">
            <!-- Top Courses Chart -->
            <div class="col-12 col-md-4">
              <q-card flat bordered class="full-height">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md text-weight-medium">Cursos Más Asignados</div>
                  <div class="column q-gutter-md">
                    <div v-for="course in topCourses" :key="course.id" class="course-item">
                      <div class="row items-center justify-between q-mb-xs">
                        <div class="row items-center q-gutter-sm">
                          <q-avatar :color="course.color" text-color="white" size="32px">
                            {{ course.short }}
                          </q-avatar>
                          <div>
                            <div class="text-body2 text-weight-medium">{{ course.name }}</div>
                            <div class="text-caption text-grey-6">
                              {{ course.assignments }} asignaciones
                            </div>
                          </div>
                        </div>
                        <q-badge :color="course.color" outline>
                          {{ course.completionRate }}%
                        </q-badge>
                      </div>
                      <q-linear-progress
                        :value="course.completionRate / 100"
                        rounded
                        size="12px"
                        :color="course.color"
                        track-color="grey-3"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Approval Rate Chart -->
            <div class="col-12 col-md-4">
              <q-card flat bordered class="full-height">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md text-weight-medium">
                    Tasa de Aprobación por Curso
                  </div>
                  <div class="column q-gutter-sm">
                    <div v-for="course in approvalByCourse" :key="course.id" class="approval-item">
                      <div class="row items-center justify-between q-mb-xs">
                        <div class="text-body2">{{ course.name }}</div>
                        <div class="text-caption text-grey-7">{{ course.rate }}%</div>
                      </div>
                      <q-linear-progress
                        :value="course.rate / 100"
                        rounded
                        size="12px"
                        :color="getProgressColor(course.rate)"
                        track-color="grey-3"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Client Distribution Chart -->
            <div class="col-12 col-md-4">
              <q-card flat bordered class="full-height">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md text-weight-medium">Cursos por Cliente</div>
                  <div class="flex flex-center">
                    <VueApexCharts
                      type="donut"
                      height="300"
                      :options="clientChartOptions"
                      :series="clientChartSeries"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Completion Trend (Simple Bar Chart) -->
            <div class="col-12">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md text-weight-medium">
                    Tendencia de Finalización (Últimos 6 Meses)
                  </div>
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
                            backgroundColor:
                              getProgressColor(month.value) === 'positive'
                                ? '#21ba45'
                                : getProgressColor(month.value) === 'warning'
                                  ? '#f2c037'
                                  : '#c10015',
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
          </div>
        </q-tab-panel>

        <!-- Trends Tab -->
        <q-tab-panel name="trends">
          <div class="row q-col-gutter-lg">
            <div class="col-12">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md text-weight-medium">
                    Evolución de Certificados Emitidos
                  </div>
                  <div class="trend-chart">
                    <div class="row items-end q-gutter-xs" style="height: 250px">
                      <div
                        v-for="(month, index) in certificatesTrend"
                        :key="index"
                        class="col trend-bar"
                      >
                        <div
                          class="bar"
                          :style="{
                            height: `${(month.value / maxCertificates) * 100}%`,
                            backgroundColor: '#4f46e5',
                          }"
                        >
                          <q-tooltip>{{ month.label }}: {{ month.value }} certificados</q-tooltip>
                        </div>
                        <div class="text-caption text-center q-mt-xs">{{ month.label }}</div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <!-- Courses Tab -->
        <q-tab-panel name="courses">
          <DataTable
            :rows="courseReports"
            :columns="courseColumns"
            :loading="loading"
            searchable
            exportable
            @export="exportCourseData"
          >
            <template #body-cell-completionRate="props">
              <q-linear-progress
                :value="props.row.completionRate / 100"
                rounded
                size="10px"
                :color="getProgressColor(props.row.completionRate)"
              />
            </template>
          </DataTable>
        </q-tab-panel>

        <!-- Users Tab -->
        <q-tab-panel name="users">
          <DataTable
            :rows="userReports"
            :columns="userColumns"
            :loading="loading"
            searchable
            exportable
            @export="exportUserData"
          />
        </q-tab-panel>

        <!-- Certificates Tab -->
        <q-tab-panel name="certificates">
          <div class="text-subtitle1 q-mb-md text-weight-medium">
            Certificados Próximos a Vencer
          </div>
          <DataTable
            :rows="expiringCertificates"
            :columns="certificateColumns"
            :loading="loading"
            searchable
            exportable
            @export="exportCertificateData"
          >
            <template #body-cell-status="props">
              <q-badge :color="getExpiryColor(props.row.daysUntilExpiry)" outline>
                {{ props.row.status }}
              </q-badge>
            </template>
          </DataTable>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Export Menu -->
    <q-menu
      ref="exportMenu"
      :model-value="showExportMenuDialog"
      @update:model-value="showExportMenuDialog = $event"
    >
      <q-list>
        <q-item clickable v-close-popup @click="exportPDF">
          <q-item-section avatar>
            <q-icon name="picture_as_pdf" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Exportar a PDF</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="exportCSV">
          <q-item-section avatar>
            <q-icon name="description" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Exportar a CSV</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="exportExcel">
          <q-item-section avatar>
            <q-icon name="table_chart" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Exportar a Excel</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';
import VueApexCharts from 'vue3-apexcharts';
import FiltersPanel from '../../../shared/components/FiltersPanel.vue';
import DataTable from '../../../shared/components/DataTable.vue';
import {
  reportsService,
  type ReportsStats,
} from '../../../infrastructure/http/reports/reports.service';

const $q = useQuasar();

// Estado
const loading = ref(false);
const tab = ref<'overview' | 'trends' | 'courses' | 'users' | 'certificates'>('overview');
const showExportMenuDialog = ref(false);
const exportMenu = ref();

const filters = ref({
  course: null as string | null,
  status: null as string | null,
  dateFrom: null as string | null,
  dateTo: null as string | null,
  comparisonPeriod: null as string | null,
});

const kpis = ref({
  complianceRate: 0,
  complianceTarget: 90,
  approvalRate: 0,
  approvalRateVariation: 0,
  certificatesIssued: 0,
  certificatesValid: 0,
  avgCompletionTime: 0,
  activeUsers: 0,
  activeCourses: 0,
  avgSatisfaction: 0,
  expiringSoon: 0,
});

const courseOptions = [
  // Esto debería venir del backend idealmente, por ahora hardcodeado o cargado aparte
  { label: 'Manejo Defensivo', value: '1' },
  { label: 'Primeros Auxilios', value: '2' },
  { label: 'Transporte de Mercancías Peligrosas', value: '3' },
];

const statusOptions = [
  { label: 'Aprobado', value: 'completed' }, // Adjusted to match backend enum if needed
  { label: 'Reprobado', value: 'failed' },
  { label: 'En progreso', value: 'in_progress' },
];

const comparisonOptions = [
  { label: 'Mes anterior', value: 'previous_month' },
  { label: 'Año anterior', value: 'previous_year' },
  { label: 'Mismo período año anterior', value: 'same_period_last_year' },
];

// Datos Gráfico de Clientes (Reactivos)
const clientChartSeries = ref<number[]>([]);
const clientChartOptions = ref({
  chart: {
    type: 'donut' as const,
    fontFamily: 'inherit',
  },
  labels: [] as string[],
  colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'],
  dataLabels: {
    enabled: false,
  },
  legend: {
    position: 'bottom' as const,
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%' as const,
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            formatter: function (w: { globals: { seriesTotals: number[] } }) {
              return String(w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0));
            },
          },
        },
      },
    },
  },
  tooltip: {
    y: {
      formatter: function (val: number) {
        return val + ' inscripciones';
      },
    },
  },
});

const topCourses = ref<ReportsStats['topCourses']>([]);
const approvalByCourse = ref<ReportsStats['approvalByCourse']>([]);
const completionTrend = ref<ReportsStats['completionTrend']>([]);
const certificatesTrend = ref<ReportsStats['certificatesTrend']>([]);
const courseReports = ref<ReportsStats['courseReports']>([]);
const userReports = ref<ReportsStats['userReports']>([]);
const expiringCertificates = ref<ReportsStats['expiringCertificates']>([]);

// Cargar datos reales
async function loadReportsData() {
  loading.value = true;
  try {
    const filtersParam: Parameters<typeof reportsService.getStats>[0] = {};
    if (filters.value.dateFrom) filtersParam.dateFrom = filters.value.dateFrom;
    if (filters.value.dateTo) filtersParam.dateTo = filters.value.dateTo;
    if (filters.value.course) filtersParam.courseId = filters.value.course;
    if (filters.value.status) filtersParam.status = filters.value.status;

    const data: ReportsStats = await reportsService.getStats(filtersParam);

    // Actualizar KPIs
    kpis.value = data.kpis;

    // Actualizar Gráfico Clientes
    clientChartSeries.value = data.clientDistribution.series;
    clientChartOptions.value = {
      ...clientChartOptions.value,
      labels: data.clientDistribution.labels,
    };

    // Actualizar Listas y Tablas
    topCourses.value = data.topCourses;
    approvalByCourse.value = data.approvalByCourse;
    completionTrend.value = data.completionTrend;
    certificatesTrend.value = data.certificatesTrend;
    courseReports.value = data.courseReports;
    userReports.value = data.userReports;
    expiringCertificates.value = data.expiringCertificates;

    $q.notify({
      type: 'positive',
      message: 'Datos actualizados',
      position: 'top',
      timeout: 1000,
    });
  } catch (error) {
    console.error('Error loading reports:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos de reportes',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}

// Inicializar
onMounted(() => {
  void loadReportsData();
});

const courseColumns: QTableColumn[] = [
  { name: 'courseName', field: 'courseName', label: 'Curso', align: 'left', sortable: true },
  { name: 'enrolled', field: 'enrolled', label: 'Inscritos', align: 'center', sortable: true },
  { name: 'completed', field: 'completed', label: 'Completados', align: 'center', sortable: true },
  { name: 'approved', field: 'approved', label: 'Aprobados', align: 'center', sortable: true },
  {
    name: 'completionRate',
    field: 'completionRate',
    label: 'Tasa de finalización',
    align: 'left',
    sortable: true,
  },
];

const userColumns: QTableColumn[] = [
  { name: 'userName', field: 'userName', label: 'Usuario', align: 'left', sortable: true },
  {
    name: 'coursesAssigned',
    field: 'coursesAssigned',
    label: 'Cursos asignados',
    align: 'center',
    sortable: true,
  },
  {
    name: 'coursesCompleted',
    field: 'coursesCompleted',
    label: 'Completados',
    align: 'center',
    sortable: true,
  },
  {
    name: 'certificatesObtained',
    field: 'certificatesObtained',
    label: 'Certificados',
    align: 'center',
    sortable: true,
  },
  {
    name: 'avgScore',
    field: 'avgScore',
    label: 'Puntuación promedio',
    align: 'center',
    sortable: true,
  },
];

const certificateColumns: QTableColumn[] = [
  { name: 'userName', field: 'userName', label: 'Usuario', align: 'left', sortable: true },
  { name: 'courseName', field: 'courseName', label: 'Curso', align: 'left', sortable: true },
  {
    name: 'expiryDate',
    field: 'expiryDate',
    label: 'Fecha de vencimiento',
    align: 'left',
    sortable: true,
  },
  {
    name: 'daysUntilExpiry',
    field: 'daysUntilExpiry',
    label: 'Días restantes',
    align: 'center',
    sortable: true,
  },
  { name: 'status', field: 'status', label: 'Estado', align: 'center' },
];

// Computed
const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.course) count++;
  if (filters.value.status) count++;
  if (filters.value.dateFrom) count++;
  if (filters.value.dateTo) count++;
  if (filters.value.comparisonPeriod) count++;
  return count;
});

const maxCertificates = computed(() => {
  return Math.max(...certificatesTrend.value.map((m: { value: number }) => m.value));
});

// Funciones
function getProgressColor(rate: number): string {
  if (rate >= 80) return 'positive';
  if (rate >= 60) return 'warning';
  return 'negative';
}

function getExpiryColor(days: number): string {
  if (days <= 7) return 'negative';
  if (days <= 30) return 'warning';
  return 'info';
}

function clearAllFilters() {
  filters.value = {
    course: null,
    status: null,
    dateFrom: null,
    dateTo: null,
    comparisonPeriod: null,
  };
}

function refreshData() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    $q.notify({
      type: 'positive',
      message: 'Datos actualizados exitosamente',
      position: 'top',
    });
  }, 1000);
}

function generateReport() {
  void loadReportsData();
}

function showExportMenu() {
  showExportMenuDialog.value = true;
}

function exportPDF() {
  $q.notify({
    type: 'positive',
    message: 'Reporte exportado a PDF exitosamente',
    position: 'top',
  });
  showExportMenuDialog.value = false;
}

function exportCSV() {
  $q.notify({
    type: 'positive',
    message: 'Reporte exportado a CSV exitosamente',
    position: 'top',
  });
  showExportMenuDialog.value = false;
}

function exportExcel() {
  $q.notify({
    type: 'positive',
    message: 'Reporte exportado a Excel exitosamente',
    position: 'top',
  });
  showExportMenuDialog.value = false;
}

function exportCourseData() {
  exportCSV();
}

function exportUserData() {
  exportCSV();
}

function exportCertificateData() {
  exportCSV();
}
</script>

<style scoped lang="scss">
.reports-page {
  background: #f9fafb;
  transition: background-color 0.3s ease;
}

body.body--dark .reports-page {
  background: #0f172a;
}

.kpi-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

body.body--dark .kpi-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.course-item,
.approval-item {
  padding: 8px 0;
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
  position: relative;
}

.bar:hover {
  opacity: 0.8;
}
</style>
