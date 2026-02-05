<template>
  <q-page class="certificates-list-page q-pa-xl">
    <!-- Header Section -->
    <CertificatesHeader
      :view-mode="viewMode"
      :selected-count="selectedCertificates.length"
      @toggle-view-mode="toggleViewMode"
      @bulk-download="() => handleBulkDownload(selectedCertificates)"
    />

    <!-- Statistics Cards -->
    <CertificatesStatistics :statistics="statistics" />

    <!-- Filters Panel -->
    <CertificatesFilters
      :search-input="searchInput"
      :course-id="filters.courseId"
      :status="filters.status"
      :course-options="courseOptions"
      :status-options="statusOptions"
      :active-filters-count="activeFiltersCount"
      @update-search="handleSearchUpdate"
      @update-course="(v) => updateFilters({ courseId: v })"
      @update-status="(v) => updateFilters({ status: (v as CertificateStatus | null) ?? null })"
      @clear-filters="clearAllFilters"
      @open-qr-scanner="openQRScanner"
    />

    <q-inner-loading :showing="loading" />

    <!-- Certificates Grid View -->
    <div v-if="viewMode === 'grid' && !loading" class="row q-col-gutter-lg">
      <div
        v-for="certificate in filteredCertificates"
        :key="certificate.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <CertificateCard
          :certificate="certificate"
          :is-hovered="hoveredCertificate === certificate.id"
          @view="viewCertificate"
          @download="downloadCertificate"
          @hover="hoveredCertificate = $event"
        />
      </div>
    </div>

    <!-- Certificates Table View -->
    <CertificatesTable
      v-else-if="viewMode === 'table' && !loading"
      :certificates="filteredCertificates"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
      @bulk-download="(certs) => handleBulkDownload(certs)"
      @export-csv="(certs) => exportToCSV(certs)"
      @export-excel="exportToExcel"
      @copy-code="copyCode"
      @view="viewCertificate"
      @download="downloadCertificate"
      @share="shareCertificate"
      @clear-filters="clearAllFilters"
      @update:selected="selectedCertificates = $event"
    />

    <!-- Paginador -->
    <CertificatesPagination
      v-if="!loading && (viewMode === 'grid' || viewMode === 'table')"
      :current-page="pagination.page"
      :total-pages="pagination.totalPages"
      :total="pagination.total"
      :limit="pagination.limit"
      @change-page="changePage"
    />

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
import { useQuasar } from 'quasar';
import type { Certificate, CertificateStatus } from '../../../domain/certificate/models';
import EmptyState from '../../../shared/components/EmptyState.vue';
import { useCertificates } from '../../../shared/composables/useCertificates';
import {
  useCertificatesFilters,
  useCertificatesStatistics,
  useCertificatesExport,
  useCertificateActions,
} from '../composables';
import { useViewMode } from '../../../shared/composables/useViewMode';
import { formatDate } from '../../../shared/utils/dateFormatter';
import CertificatesHeader from '../components/CertificatesHeader.vue';
import CertificatesStatistics from '../components/CertificatesStatistics.vue';
import CertificatesFilters from '../components/CertificatesFilters.vue';
import CertificateCard from '../components/CertificateCard.vue';
import CertificatesTable from '../components/CertificatesTable.vue';
import CertificatesPagination from '../components/CertificatesPagination.vue';

const $q = useQuasar();

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

// Composable para modo de vista
const { viewMode, toggleViewMode } = useViewMode('grid');

// Estado local
const selectedCertificates = ref<Certificate[]>([]);
const hoveredCertificate = ref<string | null>(null);

// Composable para filtros
const { searchInput, courseOptions, statusOptions, onSearchInput, loadCoursesForFilter } =
  useCertificatesFilters(updateFilters);

// Composable para estadísticas
const { statistics } = useCertificatesStatistics(() => certificates.value);

// Composable para exportación
const { exportToCSV, exportToExcel } = useCertificatesExport(formatDate);

// Composable para acciones
const { viewCertificate, downloadCertificate, shareCertificate, copyCode, bulkDownload } =
  useCertificateActions(downloadCertificatePDF, () => certificates.value);

// Computed
const filteredCertificates = computed(() => certificates.value);

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.search || searchInput.value) count++;
  if (filters.value.courseId) count++;
  if (filters.value.status) count++;
  return count;
});

const hasActiveFilters = computed(() => activeFiltersCount.value > 0);

// Handlers
function handleSearchUpdate(value: string) {
  searchInput.value = value;
  onSearchInput(value);
}

async function clearAllFilters() {
  searchInput.value = '';
  await clearFilters();
}

function openQRScanner() {
  $q.notify({
    type: 'info',
    message: 'Escáner de código QR próximamente',
    position: 'top',
  });
}

async function handleBulkDownload(certs: Certificate[] | undefined = undefined) {
  const certificatesToDownload = certs || selectedCertificates.value;
  await bulkDownload(certificatesToDownload);
  selectedCertificates.value = [];
}

// Lifecycle
onMounted(() => {
  searchInput.value = filters.value.search ?? '';
  void loadCoursesForFilter();
  void loadCertificates();
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
</style>
