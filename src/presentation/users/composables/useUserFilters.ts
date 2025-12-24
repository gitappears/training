import { ref, computed } from 'vue';
import { useDebounce } from '../../../shared/composables';
import type { UserFilters } from '../../../domain/user/models';

const initialFilters: UserFilters = {
  search: '',
  role: null,
  status: null,
  personType: null,
  isExternal: null,
};

/**
 * Composable para manejar filtros de usuarios
 * Incluye debounce para búsqueda y cálculo de filtros activos
 */
export function useUserFilters() {
  const filters = ref<UserFilters>({ ...initialFilters });

  const { debouncedValue: debouncedSearch } = useDebounce(
    computed(() => filters.value.search || ''),
    300,
  );

  const activeFiltersCount = computed(() => {
    let count = 0;
    if (filters.value.search) count++;
    if (filters.value.role) count++;
    if (filters.value.status) count++;
    if (filters.value.personType) count++;
    if (filters.value.isExternal !== null) count++;
    return count;
  });

  const hasActiveFilters = computed(() => activeFiltersCount.value > 0);

  function clearAllFilters() {
    filters.value = { ...initialFilters };
  }

  function resetToPageOne(callback: () => void) {
    callback();
  }

  return {
    filters,
    debouncedSearch,
    activeFiltersCount,
    hasActiveFilters,
    clearAllFilters,
    resetToPageOne,
  };
}

