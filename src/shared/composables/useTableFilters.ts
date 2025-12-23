import { ref, computed, watch } from 'vue';
import { debounce } from 'quasar';

export interface FilterState<T = any> {
  search?: string;
  [key: string]: any;
}

/**
 * Composable para manejar filtros de tablas y listas
 * Proporciona búsqueda, filtros y debounce
 */
export function useTableFilters<T extends FilterState>(initialFilters: T) {
  const filters = ref<T>({ ...initialFilters } as T);
  const activeFiltersCount = ref(0);

  /**
   * Calcula el número de filtros activos
   */
  function calculateActiveFilters() {
    let count = 0;
    for (const [key, value] of Object.entries(filters.value)) {
      if (key === 'search') {
        if (value && String(value).trim().length > 0) count++;
      } else if (value !== null && value !== undefined && value !== '') {
        count++;
      }
    }
    activeFiltersCount.value = count;
  }

  /**
   * Limpia todos los filtros
   */
  function clearAllFilters() {
    filters.value = { ...initialFilters } as T;
    calculateActiveFilters();
  }

  /**
   * Limpia un filtro específico
   */
  function clearFilter(key: keyof T) {
    filters.value[key] = initialFilters[key];
    calculateActiveFilters();
  }

  /**
   * Actualiza un filtro específico
   */
  function setFilter<K extends keyof T>(key: K, value: T[K]) {
    filters.value[key] = value;
    calculateActiveFilters();
  }

  /**
   * Obtiene el valor de un filtro
   */
  function getFilter<K extends keyof T>(key: K): T[K] {
    return filters.value[key];
  }

  /**
   * Crea una función de búsqueda con debounce
   */
  function createDebouncedSearch(callback: (search: string) => void, delay: number = 500) {
    return debounce(callback, delay);
  }

  /**
   * Verifica si hay filtros activos
   */
  const hasActiveFilters = computed(() => activeFiltersCount.value > 0);

  // Calcular filtros activos cuando cambian los filtros
  watch(
    filters,
    () => {
      calculateActiveFilters();
    },
    { deep: true }
  );

  // Calcular inicialmente
  calculateActiveFilters();

  return {
    filters,
    activeFiltersCount,
    hasActiveFilters,
    clearAllFilters,
    clearFilter,
    setFilter,
    getFilter,
    createDebouncedSearch,
  };
}

