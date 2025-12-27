/**
 * Composable para gestión de certificados
 * Sigue principios SOLID y arquitectura hexagonal
 * Centraliza la lógica de negocio relacionada con certificados
 */

import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import type { Certificate, CertificateListParams, CertificateFilters } from '../../domain/certificate/models';
import { certificatesService } from '../../infrastructure/http/certificates/certificates.service';
import type { PaginatedResponse } from '../../application/training/training.repository.port';

/**
 * Estado reactivo del composable
 */
const loading = ref(false);
const certificates = ref<Certificate[]>([]);
const currentCertificate = ref<Certificate | null>(null);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});
const filters = ref<CertificateFilters>({
  search: '',
  courseId: null,
  status: null,
  dateFrom: null,
  dateTo: null,
  qrCode: null,
});

/**
 * Composable principal para gestión de certificados
 */
export function useCertificates() {
  const $q = useQuasar();

  /**
   * Carga la lista de certificados desde el backend
   */
  const loadCertificates = async (params?: CertificateListParams): Promise<void> => {
    loading.value = true;
    try {
      const paramsToUse: CertificateListParams = {
        page: params?.page ?? pagination.value.page,
        limit: params?.limit ?? pagination.value.limit,
        filters: params?.filters ?? filters.value,
        ...(params?.sortBy && { sortBy: params.sortBy }),
        ...(params?.sortOrder && { sortOrder: params.sortOrder }),
      };

      console.log('📤 Enviando petición al backend:', {
        page: paramsToUse.page,
        limit: paramsToUse.limit,
        filters: paramsToUse.filters,
      });

      const response: PaginatedResponse<Certificate> = await certificatesService.findAll(paramsToUse);

      console.log('📥 Respuesta del backend:', {
        total: response.total,
        page: response.page,
        dataLength: response.data.length,
        data: response.data,
      });

      certificates.value = response.data;
      pagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      };

      console.log('✅ Certificados mapeados correctamente:', certificates.value.length);
    } catch (error) {
      console.error('❌ Error al cargar certificados:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al cargar los certificados. Por favor, intente nuevamente.';

      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'error',
        position: 'top',
        timeout: 5000,
      });

      // En caso de error, mantener lista vacía
      certificates.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Carga un certificado específico por ID
   */
  const loadCertificate = async (id: string): Promise<void> => {
    loading.value = true;
    try {
      currentCertificate.value = await certificatesService.findOne(id);
    } catch (error) {
      console.error('Error al cargar certificado:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Error al cargar el certificado con ID ${id}`;

      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'error',
        position: 'top',
        timeout: 5000,
      });

      currentCertificate.value = null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Carga certificados de un usuario específico
   */
  const loadUserCertificates = async (userId: string, filters?: CertificateFilters): Promise<void> => {
    loading.value = true;
    try {
      certificates.value = await certificatesService.findByUser(userId, filters);
    } catch (error) {
      console.error('Error al cargar certificados del usuario:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al cargar los certificados del usuario.';

      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'error',
        position: 'top',
        timeout: 5000,
      });

      certificates.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Descarga el PDF de un certificado
   */
  const downloadCertificatePDF = async (id: string): Promise<void> => {
    try {
      const blob = await certificatesService.downloadPDF(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Obtener nombre del certificado para el nombre del archivo
      const certificate = certificates.value.find((c) => c.id === id) || currentCertificate.value;
      const fileName = certificate
        ? `certificado-${certificate.courseName.replace(/\s+/g, '-')}-${certificate.id}.pdf`
        : `certificado-${id}.pdf`;

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      $q.notify({
        type: 'positive',
        message: 'Certificado descargado exitosamente',
        icon: 'download',
        position: 'top',
      });
    } catch (error) {
      console.error('Error al descargar certificado:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al descargar el certificado. Por favor, intente nuevamente.';

      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'error',
        position: 'top',
        timeout: 5000,
      });
    }
  };

  /**
   * Verifica un certificado públicamente por token
   */
  const verifyCertificate = async (token: string) => {
    try {
      return await certificatesService.verifyPublic(token);
    } catch (error) {
      console.error('Error al verificar certificado:', error);
      throw error;
    }
  };

  /**
   * Actualiza los filtros y recarga los certificados
   */
  const updateFilters = async (newFilters: Partial<CertificateFilters>): Promise<void> => {
    filters.value = { ...filters.value, ...newFilters };
    pagination.value.page = 1; // Resetear a primera página
    await loadCertificates();
  };

  /**
   * Limpia todos los filtros
   */
  const clearFilters = async (): Promise<void> => {
    filters.value = {
      search: '',
      courseId: null,
      status: null,
      dateFrom: null,
      dateTo: null,
      qrCode: null,
    };
    pagination.value.page = 1;
    await loadCertificates();
  };

  /**
   * Cambia de página
   */
  const changePage = async (page: number): Promise<void> => {
    pagination.value.page = page;
    await loadCertificates();
  };

  return {
    // Estado
    loading: computed(() => loading.value),
    certificates: computed(() => certificates.value),
    currentCertificate: computed(() => currentCertificate.value),
    pagination: computed(() => pagination.value),
    filters: computed(() => filters.value),

    // Métodos
    loadCertificates,
    loadCertificate,
    loadUserCertificates,
    downloadCertificatePDF,
    verifyCertificate,
    updateFilters,
    clearFilters,
    changePage,
  };
}

