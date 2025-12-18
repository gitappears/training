<template>
  <q-page class="q-pa-xl column q-gutter-lg">
    <div>
      <div class="heading-main q-mb-xs">Reportes y métricas</div>
      <div class="heading-sub">
        Visualiza el desempeño, KPIs y estadísticas de la plataforma de capacitación.
      </div>
    </div>

    <!-- KPIs principales -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-3">
        <q-card class="q-pa-md">
          <div class="text-caption text-grey-6">Cumplimiento total</div>
          <div class="text-h5">{{ kpis.complianceRate }}%</div>
          <q-linear-progress
            :value="kpis.complianceRate / 100"
            rounded
            size="8px"
            color="primary"
            class="q-mt-sm"
          />
          <div class="text-caption text-grey-6 q-mt-xs">Objetivo: {{ kpis.complianceTarget }}%</div>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="q-pa-md">
          <div class="text-caption text-grey-6">Tasa de aprobación</div>
          <div class="text-h5">{{ kpis.approvalRate }}%</div>
          <div class="text-caption text-positive q-mt-xs">
            {{ kpis.approvalRateVariation }}% vs mes anterior
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="q-pa-md">
          <div class="text-caption text-grey-6">Certificados emitidos</div>
          <div class="text-h5">{{ kpis.certificatesIssued }}</div>
          <div class="text-caption text-grey-6 q-mt-xs">
            {{ kpis.certificatesValid }} válidos
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="q-pa-md">
          <div class="text-caption text-grey-6">Tiempo promedio</div>
          <div class="text-h5">{{ kpis.avgCompletionTime }}h</div>
          <div class="text-caption text-grey-6 q-mt-xs">Tiempo de finalización</div>
        </q-card>
      </div>
    </div>

    <!-- Filtros y exportación -->
    <q-card class="q-pa-md">
      <div class="row items-center justify-between">
        <div class="row q-col-gutter-md">
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
              placeholder="Filtrar por curso"
            />
          </div>
          <div class="col-12 col-md-3">
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
              placeholder="Filtrar por estado"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="filters.dateRange"
              outlined
              dense
              placeholder="Rango de fechas"
              readonly
            >
              <template #prepend>
                <q-icon name="event" />
              </template>
            </q-input>
          </div>
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            color="primary"
            unelevated
            label="Generar reporte"
            icon="insights"
            @click="generateReport"
          />
          <q-btn
            flat
            label="Exportar PDF"
            icon="picture_as_pdf"
            @click="exportPDF"
          />
          <q-btn
            flat
            label="Exportar CSV"
            icon="file_download"
            @click="exportCSV"
          />
        </div>
      </div>
    </q-card>

    <!-- Tabs de reportes -->
    <q-card>
      <q-tabs
        v-model="tab"
        dense
        class="text-primary"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab name="overview" label="Resumen" />
        <q-tab name="courses" label="Por curso" />
        <q-tab name="users" label="Por usuario" />
        <q-tab name="certificates" label="Certificados" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="overview">
          <div class="row q-col-gutter-lg q-mt-md">
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 q-mb-sm">Cursos más asignados</div>
              <q-list bordered separator>
                <q-item
                  v-for="course in topCourses"
                  :key="course.id"
                >
                  <q-item-section avatar>
                    <q-avatar :color="course.color" text-color="white">
                      {{ course.short }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ course.name }}</q-item-label>
                    <q-item-label caption>{{ course.assignments }} asignaciones</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge :color="course.color" outline>
                      {{ course.completionRate }}% completado
                    </q-badge>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-subtitle1 q-mb-sm">Tasa de aprobación por curso</div>
              <div class="column q-gutter-sm">
                <div
                  v-for="course in approvalByCourse"
                  :key="course.id"
                  class="q-mb-sm"
                >
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
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="courses">
          <div class="q-mt-md">
            <q-table
              :rows="courseReports"
              :columns="courseColumns"
              row-key="id"
              flat
              :pagination="{ rowsPerPage: 10 }"
            >
              <template #body-cell-completionRate="props">
                <q-linear-progress
                  :value="props.row.completionRate / 100"
                  rounded
                  size="10px"
                  :color="getProgressColor(props.row.completionRate)"
                />
              </template>
            </q-table>
          </div>
        </q-tab-panel>

        <q-tab-panel name="users">
          <div class="q-mt-md">
            <q-table
              :rows="userReports"
              :columns="userColumns"
              row-key="id"
              flat
              :pagination="{ rowsPerPage: 10 }"
            />
          </div>
        </q-tab-panel>

        <q-tab-panel name="certificates">
          <div class="q-mt-md">
            <div class="text-subtitle1 q-mb-sm">Certificados próximos a vencer</div>
            <q-table
              :rows="expiringCertificates"
              :columns="certificateColumns"
              row-key="id"
              flat
              :pagination="{ rowsPerPage: 10 }"
            >
              <template #body-cell-status="props">
                <q-badge :color="getExpiryColor(props.row.daysUntilExpiry)" outline>
                  {{ props.row.status }}
                </q-badge>
              </template>
            </q-table>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';

const $q = useQuasar();

const tab = ref<'overview' | 'courses' | 'users' | 'certificates'>('overview');

const filters = ref({
  course: null as string | null,
  status: null as string | null,
  dateRange: null as string | null,
});

const kpis = ref({
  complianceRate: 84,
  complianceTarget: 90,
  approvalRate: 76,
  approvalRateVariation: 5,
  certificatesIssued: 245,
  certificatesValid: 198,
  avgCompletionTime: 12.5,
});

const courseOptions = [
  { label: 'Manejo Defensivo', value: '1' },
  { label: 'Primeros Auxilios', value: '2' },
  { label: 'Transporte de Mercancías Peligrosas', value: '3' },
];

const statusOptions = [
  { label: 'Aprobado', value: 'approved' },
  { label: 'Reprobado', value: 'failed' },
  { label: 'En progreso', value: 'in_progress' },
];

const topCourses = ref([
  {
    id: '1',
    name: 'Manejo Defensivo',
    short: 'MD',
    color: 'primary',
    assignments: 152,
    completionRate: 78,
  },
  {
    id: '2',
    name: 'Primeros Auxilios',
    short: 'PA',
    color: 'red',
    assignments: 128,
    completionRate: 85,
  },
  {
    id: '3',
    name: 'Transporte de Mercancías Peligrosas',
    short: 'TM',
    color: 'orange',
    assignments: 95,
    completionRate: 72,
  },
]);

const approvalByCourse = ref([
  { id: '1', name: 'Manejo Defensivo', rate: 78 },
  { id: '2', name: 'Primeros Auxilios', rate: 85 },
  { id: '3', name: 'Transporte de Mercancías Peligrosas', rate: 72 },
]);

const courseReports = ref([
  {
    id: '1',
    courseName: 'Manejo Defensivo',
    enrolled: 152,
    completed: 118,
    approved: 92,
    completionRate: 78,
    approvalRate: 78,
  },
  {
    id: '2',
    courseName: 'Primeros Auxilios',
    enrolled: 128,
    completed: 109,
    approved: 93,
    completionRate: 85,
    approvalRate: 85,
  },
]);

const userReports = ref([
  {
    id: '1',
    userName: 'Juan Pérez',
    coursesAssigned: 3,
    coursesCompleted: 2,
    certificatesObtained: 2,
    avgScore: 85,
  },
  {
    id: '2',
    userName: 'María González',
    coursesAssigned: 2,
    coursesCompleted: 2,
    certificatesObtained: 2,
    avgScore: 90,
  },
]);

const expiringCertificates = ref([
  {
    id: '1',
    userName: 'Juan Pérez',
    courseName: 'Manejo Defensivo',
    expiryDate: '2025-02-15',
    daysUntilExpiry: 30,
    status: 'Próximo a vencer',
  },
  {
    id: '2',
    userName: 'María González',
    courseName: 'Primeros Auxilios',
    expiryDate: '2025-02-20',
    daysUntilExpiry: 35,
    status: 'Próximo a vencer',
  },
]);

const courseColumns: QTableColumn[] = [
  { name: 'courseName', field: 'courseName', label: 'Curso', align: 'left' },
  { name: 'enrolled', field: 'enrolled', label: 'Inscritos', align: 'center' },
  { name: 'completed', field: 'completed', label: 'Completados', align: 'center' },
  { name: 'approved', field: 'approved', label: 'Aprobados', align: 'center' },
  { name: 'completionRate', field: 'completionRate', label: 'Tasa de finalización', align: 'left' },
];

const userColumns: QTableColumn[] = [
  { name: 'userName', field: 'userName', label: 'Usuario', align: 'left' },
  { name: 'coursesAssigned', field: 'coursesAssigned', label: 'Cursos asignados', align: 'center' },
  { name: 'coursesCompleted', field: 'coursesCompleted', label: 'Completados', align: 'center' },
  { name: 'certificatesObtained', field: 'certificatesObtained', label: 'Certificados', align: 'center' },
  { name: 'avgScore', field: 'avgScore', label: 'Puntuación promedio', align: 'center' },
];

const certificateColumns: QTableColumn[] = [
  { name: 'userName', field: 'userName', label: 'Usuario', align: 'left' },
  { name: 'courseName', field: 'courseName', label: 'Curso', align: 'left' },
  { name: 'expiryDate', field: 'expiryDate', label: 'Fecha de vencimiento', align: 'left' },
  { name: 'daysUntilExpiry', field: 'daysUntilExpiry', label: 'Días restantes', align: 'center' },
  { name: 'status', field: 'status', label: 'Estado', align: 'center' },
];

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

function generateReport() {
  // Aquí se llamaría al servicio HTTP para generar el reporte
  console.log('Generar reporte con filtros:', filters.value);
  $q.notify({
    type: 'info',
    message: 'Reporte generado exitosamente',
  });
}

function exportPDF() {
  // Aquí se llamaría al servicio HTTP para exportar a PDF
  console.log('Exportar a PDF');
  $q.notify({
    type: 'positive',
    message: 'Reporte exportado a PDF exitosamente',
  });
}

function exportCSV() {
  // Aquí se llamaría al servicio HTTP para exportar a CSV
  console.log('Exportar a CSV');
  $q.notify({
    type: 'positive',
    message: 'Reporte exportado a CSV exitosamente',
  });
}
</script>

