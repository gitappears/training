import { ref, computed } from 'vue';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Composable para manejar lógica de paginación
 * Centraliza el estado y las operaciones de paginación
 */
export function usePagination(initialLimit: number = 10) {
  const page = ref(1);
  const limit = ref(initialLimit);
  const total = ref(0);

  const totalPages = computed(() => {
    return Math.ceil(total.value / limit.value) || 1;
  });

  const hasNextPage = computed(() => {
    return page.value < totalPages.value;
  });

  const hasPreviousPage = computed(() => {
    return page.value > 1;
  });

  const startIndex = computed(() => {
    return (page.value - 1) * limit.value + 1;
  });

  const endIndex = computed(() => {
    const end = page.value * limit.value;
    return end > total.value ? total.value : end;
  });

  /**
   * Va a la página siguiente
   */
  function nextPage() {
    if (hasNextPage.value) {
      page.value++;
    }
  }

  /**
   * Va a la página anterior
   */
  function previousPage() {
    if (hasPreviousPage.value) {
      page.value--;
    }
  }

  /**
   * Va a una página específica
   */
  function goToPage(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages.value) {
      page.value = newPage;
    }
  }

  /**
   * Cambia el límite de elementos por página
   */
  function setLimit(newLimit: number) {
    limit.value = newLimit;
    page.value = 1; // Reset a la primera página
  }

  /**
   * Resetea la paginación
   */
  function reset() {
    page.value = 1;
    total.value = 0;
  }

  /**
   * Actualiza el total de elementos
   */
  function setTotal(newTotal: number) {
    total.value = newTotal;
    // Ajustar página si es necesario
    if (page.value > totalPages.value) {
      page.value = totalPages.value || 1;
    }
  }

  /**
   * Obtiene el estado actual de paginación
   */
  function getPaginationState(): PaginationState {
    return {
      page: page.value,
      limit: limit.value,
      total: total.value,
      totalPages: totalPages.value,
    };
  }

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    nextPage,
    previousPage,
    goToPage,
    setLimit,
    reset,
    setTotal,
    getPaginationState,
  };
}

