/**
 * Composable para gestión de filtros de certificados
 */

import { ref } from 'vue';
import { debounce } from 'quasar';
import type { Training } from '../../../domain/training/models';
import type { CertificateFilters } from '../../../domain/certificate/models';

export function useCertificatesFilters(
  updateFilters: (filters: Partial<CertificateFilters>) => Promise<void>,
) {
  const searchInput = ref('');
  const courseOptions = ref<{ label: string; value: string }[]>([]);

  const statusOptions = [
    { label: 'Válidos', value: 'valid' },
    { label: 'Vencidos', value: 'expired' },
    { label: 'Revocados', value: 'revoked' },
  ];

  // Búsqueda con debounce
  const onSearchInput = debounce((v: string) => {
    void updateFilters({ search: v || '' });
  }, 300);

  async function loadCoursesForFilter() {
    try {
      const { trainingsService } = await import('../../../infrastructure/http/trainings/trainings.service');
      const res = await trainingsService.findAll({ page: 1, limit: 200 });
      courseOptions.value = (res.data || []).map((t: Training) => ({
        label: t.title || `Curso ${t.id}`,
        value: t.id,
      }));
    } catch {
      courseOptions.value = [];
    }
  }

  return {
    searchInput,
    courseOptions,
    statusOptions,
    onSearchInput,
    loadCoursesForFilter,
  };
}
