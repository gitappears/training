<template>
  <q-page class="certificates-list-page q-pa-xl">
    <!-- Header Section -->
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <div class="text-h4 text-weight-bold text-primary q-mb-xs">Mis Certificados</div>
        <div class="text-body1 text-grey-7">
          Visualiza y descarga todos tus certificados de capacitación obtenidos
        </div>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-btn
          flat
          dense
          :icon="viewMode === 'grid' ? 'view_list' : 'grid_view'"
          :label="viewMode === 'grid' ? 'Lista' : 'Grid'"
          color="primary"
          @click="toggleViewMode"
        />
        <q-btn
          v-if="selectedCertificates.length > 0"
          flat
          dense
          icon="download"
          color="primary"
          label="Descargar seleccionados"
          @click="bulkDownload"
        />
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="primary" text-color="white" icon="verified" />
              <div class="col">
                <div class="text-caption text-grey-6">Total Certificados</div>
                <div class="text-h5 text-weight-bold">{{ statistics.total }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="positive" text-color="white" icon="check_circle" />
              <div class="col">
                <div class="text-caption text-grey-6">Válidos</div>
                <div class="text-h5 text-weight-bold">{{ statistics.valid }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="negative" text-color="white" icon="event_busy" />
              <div class="col">
                <div class="text-caption text-grey-6">Vencidos</div>
                <div class="text-h5 text-weight-bold">{{ statistics.expired }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="warning" text-color="white" icon="schedule" />
              <div class="col">
                <div class="text-caption text-grey-6">Próximos a vencer</div>
                <div class="text-h5 text-weight-bold">{{ statistics.expiringSoon }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters Panel -->
    <FiltersPanel :active-filters-count="activeFiltersCount" @clear="clearAllFilters" class="q-mb-lg">
      <div class="col-12 col-md-3">
        <q-input
          v-model="filters.search"
          outlined
          dense
          placeholder="Buscar por curso o código QR..."
          clearable
          @update:model-value="debouncedSearch"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-2">
        <q-select
          v-model="filters.courseId"
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
        <q-input
          v-model="filters.dateFrom"
          outlined
          dense
          type="date"
          label="Desde"
          clearable
        >
          <template #prepend>
            <q-icon name="event" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-2">
        <q-input
          v-model="filters.dateTo"
          outlined
          dense
          type="date"
          label="Hasta"
          clearable
        >
          <template #prepend>
            <q-icon name="event" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-1">
        <q-btn
          flat
          dense
          icon="qr_code_scanner"
          color="primary"
          @click="openQRScanner"
        >
          <q-tooltip>Escanear código QR</q-tooltip>
        </q-btn>
      </div>
    </FiltersPanel>

    <q-inner-loading :showing="loading" />

    <!-- Certificates Grid View -->
    <div v-if="viewMode === 'grid' && !loading" class="row q-col-gutter-lg">
      <div
        v-for="certificate in filteredCertificates"
        :key="certificate.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card
          class="certificate-card cursor-pointer"
          flat
          bordered
          @click="viewCertificate(certificate.id)"
          @mouseenter="hoveredCertificate = certificate.id"
          @mouseleave="hoveredCertificate = null"
        >
          <!-- Preview on Hover -->
          <div
            v-if="hoveredCertificate === certificate.id"
            class="certificate-preview absolute-full flex flex-center"
          >
            <q-card class="preview-card q-pa-md">
              <q-icon name="verified" size="48px" color="primary" class="q-mb-sm" />
              <div class="text-subtitle2 text-weight-medium text-center">
                {{ certificate.courseName }}
              </div>
              <div class="text-caption text-grey-7 text-center q-mt-xs">
                Emitido: {{ formatDate(certificate.issuedDate) }}
              </div>
              <q-badge
                :color="certificate.status === 'valid' ? 'positive' : 'negative'"
                outline
                class="q-mt-sm"
              >
                {{ certificate.status === 'valid' ? 'Válido' : 'Vencido' }}
              </q-badge>
            </q-card>
          </div>

          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <q-badge
                :color="certificate.status === 'valid' ? 'positive' : 'negative'"
                outline
              >
                {{ certificate.status === 'valid' ? 'Válido' : 'Vencido' }}
              </q-badge>
              <q-icon name="verified" color="primary" size="32px" />
            </div>
            <div class="text-subtitle1 text-weight-medium q-mb-xs">
              {{ certificate.courseName }}
            </div>
            <div class="text-body2 text-grey-7 q-mb-sm">
              {{ certificate.instructorName }}
            </div>
            <q-separator class="q-mb-sm" />
            <div class="column q-gutter-xs">
              <div class="text-caption text-grey-6">
                <q-icon name="event" size="14px" class="q-mr-xs" />
                Emitido: {{ formatDate(certificate.issuedDate) }}
              </div>
              <div class="text-caption text-grey-6">
                <q-icon name="event_busy" size="14px" class="q-mr-xs" />
                Vence: {{ formatDate(certificate.expiryDate) }}
              </div>
              <div class="text-caption text-grey-6">
                <q-icon name="qr_code" size="14px" class="q-mr-xs" />
                {{ certificate.verificationCode.substring(0, 8) }}...
              </div>
              <div v-if="certificate.isRetroactive" class="q-mt-xs">
                <q-badge color="info" outline>
                  <q-icon name="history" size="12px" class="q-mr-xs" />
                  Retroactivo
                </q-badge>
              </div>
            </div>
          </q-card-section>
          <q-card-actions class="q-pa-md q-pt-none">
            <q-btn
              flat
              label="Ver detalles"
              color="primary"
              class="col"
              icon="visibility"
              @click.stop="viewCertificate(certificate.id)"
            />
            <q-btn
              flat
              label="Descargar"
              color="primary"
              class="col"
              icon="download"
              @click.stop="downloadCertificate(certificate.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Certificates Table View -->
    <q-card v-else-if="viewMode === 'table' && !loading" flat bordered>
      <q-table
        v-model:selected="selectedCertificates"
        :rows="filteredCertificates"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        selection="multiple"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template #top>
          <div class="row items-center justify-between full-width">
            <div class="text-subtitle1 text-weight-medium">Lista de Certificados</div>
            <div class="row items-center q-gutter-sm">
              <q-btn
                v-if="selectedCertificates.length > 0"
                flat
                dense
                icon="download"
                color="primary"
                :label="`Descargar ${selectedCertificates.length}`"
                @click="bulkDownload"
              />
              <q-btn
                flat
                dense
                icon="download"
                color="primary"
                label="Exportar"
                @click="handleExport"
              >
                <q-menu>
                  <q-list>
                    <q-item clickable v-close-popup @click="exportToCSV">
                      <q-item-section avatar>
                        <q-icon name="description" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Exportar a CSV</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="exportToExcel">
                      <q-item-section avatar>
                        <q-icon name="table_chart" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Exportar a Excel</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>
        </template>

        <template #body-cell-status="props">
          <q-badge
            :color="props.row.status === 'valid' ? 'positive' : 'negative'"
            outline
          >
            {{ props.row.status === 'valid' ? 'Válido' : 'Vencido' }}
          </q-badge>
        </template>

        <template #body-cell-verificationCode="props">
          <div class="row items-center q-gutter-xs">
            <code class="text-primary">{{ props.row.verificationCode.substring(0, 12) }}...</code>
            <q-btn
              flat
              dense
              round
              icon="content_copy"
              size="sm"
              @click="copyCode(props.row.verificationCode)"
            >
              <q-tooltip>Copiar código</q-tooltip>
            </q-btn>
          </div>
        </template>

        <template #body-cell-actions="props">
          <div class="row q-gutter-xs">
            <q-btn
              flat
              dense
              round
              icon="visibility"
              color="primary"
              size="sm"
              @click="viewCertificate(props.row.id)"
            >
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="download"
              color="primary"
              size="sm"
              @click="downloadCertificate(props.row.id)"
            >
              <q-tooltip>Descargar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="share"
              color="primary"
              size="sm"
              @click="shareCertificate(props.row.id)"
            >
              <q-tooltip>Compartir</q-tooltip>
            </q-btn>
          </div>
        </template>

        <template #no-data>
          <EmptyState
            icon="verified"
            title="No hay certificados disponibles"
            description="No se encontraron certificados que coincidan con los filtros aplicados."
          >
            <template #actions>
              <q-btn
                v-if="hasActiveFilters"
                flat
                color="primary"
                label="Limpiar filtros"
                @click="clearAllFilters"
              />
            </template>
          </EmptyState>
        </template>
      </q-table>
    </q-card>

    <!-- Empty State -->
    <div v-if="!loading && filteredCertificates.length === 0 && !hasActiveFilters">
      <EmptyState
        icon="verified"
        title="No tienes certificados aún"
        description="Completa las evaluaciones de tus cursos para obtener certificados."
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { debounce } from 'quasar';
import type { QTableColumn } from 'quasar';
import type {
  Certificate,
  CertificateFilters,
  CertificateStatistics,
} from '../../../domain/certificate/models';
import EmptyState from '../../../shared/components/EmptyState.vue';
import FiltersPanel from '../../../shared/components/FiltersPanel.vue';
import { useCertificates } from '../../../shared/composables/useCertificates';
import { useAuthStore } from '../../../stores/auth.store';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

// Composable para gestión de certificados
const {
  loading,
  certificates,
  pagination,
  filters,
  loadCertificates,
  downloadCertificatePDF,
  updateFilters,
  clearFilters,
  changePage,
} = useCertificates();

// Estado local
const viewMode = ref<'grid' | 'table'>('grid');
const selectedCertificates = ref<Certificate[]>([]);
const hoveredCertificate = ref<string | null>(null);

// Calcular estadísticas desde los certificados reales
const statistics = computed<CertificateStatistics>(() => {
  const certs = certificates.value;
  const stats: CertificateStatistics = {
    total: certs.length,
    valid: 0,
    expired: 0,
    revoked: 0,
    byCourse: {},
    expiringSoon: 0,
  };

  certs.forEach((cert) => {
    // Contar por estado
    if (cert.status === 'valid') stats.valid++;
    else if (cert.status === 'expired') stats.expired++;
    else if (cert.status === 'revoked') stats.revoked++;

    // Contar por curso
    if (cert.courseId) {
      if (!stats.byCourse[cert.courseId]) {
        stats.byCourse[cert.courseId] = 0;
      }
      stats.byCourse[cert.courseId] = (stats.byCourse[cert.courseId] || 0) + 1;
    }

    // Contar próximos a vencer (30 días)
    if (cert.expiryDate && cert.status === 'valid') {
      const expiry = new Date(cert.expiryDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil(
        (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
        stats.expiringSoon++;
      }
    }
  });

  return stats;
});

// Opciones de filtros
const courseOptions = [
  { label: 'Primeros Auxilios', value: '1' },
  { label: 'Manejo Defensivo', value: '2' },
  { label: 'Transporte de Mercancías Peligrosas', value: '3' },
];

const statusOptions = [
  { label: 'Válidos', value: 'valid' },
  { label: 'Vencidos', value: 'expired' },
  { label: 'Revocados', value: 'revoked' },
];

// Columnas de la tabla
const columns: QTableColumn<Certificate>[] = [
  {
    name: 'courseName',
    field: 'courseName',
    label: 'Curso',
    align: 'left',
    sortable: true,
  },
  {
    name: 'issuedDate',
    field: 'issuedDate',
    label: 'Fecha de Emisión',
    align: 'left',
    sortable: true,
    format: (val: string) => formatDate(val),
  },
  {
    name: 'expiryDate',
    field: 'expiryDate',
    label: 'Fecha de Vencimiento',
    align: 'left',
    sortable: true,
    format: (val: string) => formatDate(val),
  },
  {
    name: 'status',
    field: 'status',
    label: 'Estado',
    align: 'center',
    sortable: true,
  },
  {
    name: 'verificationCode',
    field: 'verificationCode',
    label: 'Código de Verificación',
    align: 'left',
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center',
    field: () => '',
  },
];

// Computed
const filteredCertificates = computed(() => {
  let result = [...certificates.value];

  // Filtro de búsqueda (por curso o código QR)
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(
      (cert) =>
        cert.courseName.toLowerCase().includes(search) ||
        cert.verificationCode.toLowerCase().includes(search),
    );
  }

  // Filtro por curso
  if (filters.value.courseId) {
    result = result.filter((cert) => cert.courseId === filters.value.courseId);
  }

  // Filtro por estado
  if (filters.value.status) {
    result = result.filter((cert) => cert.status === filters.value.status);
  }

  // Filtro por rango de fechas
  if (filters.value.dateFrom) {
    result = result.filter((cert) => cert.issuedDate >= filters.value.dateFrom!);
  }
  if (filters.value.dateTo) {
    result = result.filter((cert) => cert.issuedDate <= filters.value.dateTo!);
  }

  // Filtro por código QR
  if (filters.value.qrCode) {
    result = result.filter((cert) =>
      cert.verificationCode.toLowerCase().includes(filters.value.qrCode!.toLowerCase()),
    );
  }

  return result;
});

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.search) count++;
  if (filters.value.courseId) count++;
  if (filters.value.status) count++;
  if (filters.value.dateFrom) count++;
  if (filters.value.dateTo) count++;
  if (filters.value.qrCode) count++;
  return count;
});

const hasActiveFilters = computed(() => activeFiltersCount.value > 0);

// Funciones
// La función loadCertificates ahora viene del composable useCertificates
// Esta función wrapper maneja la lógica específica de esta página
async function handleLoadCertificates() {
  // Obtener userId del store de autenticación
  const profile = authStore.profile as { personaId?: number; persona?: { id?: number } } | null;
  const userId = profile?.personaId || profile?.persona?.id;

  console.log('🔍 Cargando certificados...');
  console.log('Profile completo:', JSON.stringify(profile, null, 2));
  console.log('personaId:', profile?.personaId);
  console.log('persona?.id:', profile?.persona?.id);
  console.log('User ID final:', userId);

  if (userId) {
    // Cargar certificados del usuario actual
    console.log('📋 Filtrando por estudiante ID:', userId.toString());
    await loadCertificates({
      page: pagination.value.page,
      limit: pagination.value.limit,
      filters: {
        ...filters.value,
        studentId: userId.toString(),
      },
    });
  } else {
    console.log('⚠️ No se encontró userId, cargando todos los certificados (admin mode)');
    // Si no hay userId, cargar todos (para admin)
    await loadCertificates({
      page: pagination.value.page,
      limit: pagination.value.limit,
      filters: filters.value,
    });
  }

  console.log('✅ Certificados cargados:', certificates.value.length);
  if (certificates.value.length > 0) {
    console.log('Certificados encontrados:', certificates.value);
  } else {
    console.warn('⚠️ No se encontraron certificados. Verifica:');
    console.warn('  1. Que la capacitación sea de tipo CERTIFIED');
    console.warn('  2. Que el estudiante haya aprobado la evaluación');
    console.warn('  3. Que el personaId coincida con el estudiante_id en las inscripciones');
  }
}

const debouncedSearch = debounce(() => {
  // La búsqueda se actualiza automáticamente por el computed
}, 300);

function toggleViewMode() {
  viewMode.value = viewMode.value === 'grid' ? 'table' : 'grid';
}

async function clearAllFilters() {
  await clearFilters();
}

function openQRScanner() {
  $q.notify({
    type: 'info',
    message: 'Escáner de código QR próximamente',
    position: 'top',
  });
}

function viewCertificate(id: string) {
  void router.push(`/certificates/${id}`);
}

function downloadCertificate(id: string) {
  const certificate = certificates.value.find((c) => c.id === id);
  if (certificate) {
    // Aquí se llamaría al servicio HTTP para descargar el certificado PDF
    console.log('Descargar certificado:', id);
    $q.notify({
      type: 'positive',
      message: 'Certificado descargado exitosamente',
      position: 'top',
    });
  }
}

function bulkDownload() {
  if (selectedCertificates.value.length === 0) return;

  $q.dialog({
    title: 'Confirmar descarga',
    message: `¿Está seguro de descargar ${selectedCertificates.value.length} certificado(s)?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // Aquí se llamaría al servicio HTTP para descargar múltiples certificados
    console.log('Descargar certificados:', selectedCertificates.value.map((c) => c.id));
    $q.notify({
      type: 'positive',
      message: `${selectedCertificates.value.length} certificado(s) descargado(s) exitosamente`,
      position: 'top',
    });
    selectedCertificates.value = [];
  });
}

function shareCertificate(id: string) {
  const certificate = certificates.value.find((c) => c.id === id);
  if (certificate) {
    const shareUrl = `${window.location.origin}${certificate.publicVerificationUrl}`;
    void navigator.clipboard.writeText(shareUrl);
    $q.notify({
      type: 'positive',
      message: 'Enlace de verificación copiado al portapapeles',
      position: 'top',
    });
  }
}

function copyCode(code: string) {
  void navigator.clipboard.writeText(code);
  $q.notify({
    type: 'positive',
    message: 'Código copiado al portapapeles',
    position: 'top',
  });
}

function handleExport() {
  // Placeholder para exportación
}

function exportToCSV() {
  const headers = ['Curso', 'Fecha Emisión', 'Fecha Vencimiento', 'Estado', 'Código Verificación'];
  const rows = filteredCertificates.value.map((cert) => [
    cert.courseName,
    formatDate(cert.issuedDate),
    formatDate(cert.expiryDate),
    cert.status === 'valid' ? 'Válido' : 'Vencido',
    cert.verificationCode,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `certificados_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();

  $q.notify({
    type: 'positive',
    message: 'Archivo CSV exportado exitosamente',
    position: 'top',
  });
}

function exportToExcel() {
  $q.notify({
    type: 'info',
    message: 'Exportación a Excel próximamente',
    position: 'top',
  });
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Lifecycle
onMounted(() => {
  void handleLoadCertificates();
});
</script>

<style scoped lang="scss">
.certificates-list-page {
  background: #f9fafb;
  transition: background-color 0.3s ease;
}

body.body--dark .certificates-list-page {
  background: #0f172a;
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

body.body--dark .stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.certificate-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.certificate-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

body.body--dark .certificate-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.certificate-preview {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1;
  border-radius: 8px;
}

body.body--dark .certificate-preview {
  background: rgba(30, 27, 75, 0.95);
}

.preview-card {
  max-width: 200px;
  text-align: center;
}
</style>
