import { ref, watch } from 'vue';
import type { QTableProps } from 'quasar';
import type { User, UserFilters } from '../../../domain/user/models';
import { useUsers } from './useUsers';
import { useUserFilters } from './useUserFilters';
import { useUserTable } from './useUserTable';
import { useUserActions } from './useUserActions';

/**
 * Composable principal para la lista de usuarios
 * Combina todos los composables relacionados con la lista de usuarios
 */
export function useUserList() {
  const {
    loading,
    users,
    statistics,
    setUsersData,
    listUsers,
    toggleUserStatus: toggleUserStatusUseCase,
    bulkEnable: bulkEnableUseCase,
    bulkDisable: bulkDisableUseCase,
    getStatistics,
  } = useUsers();

  /** Cuando totalPages===1, el back ya devolvió todo; la paginación es solo local. */
  const allUsersWhenSinglePage = ref<User[]>([]);
  const lastTotalPages = ref(0);

  const {
    filters,
    debouncedSearch,
    activeFiltersCount,
    hasActiveFilters,
    clearAllFilters: clearFilters,
  } = useUserFilters();

  const { selectedUsers, pagination, columns, clearSelection, updatePagination, resetToFirstPage } =
    useUserTable();

  const {
    viewUser,
    editUser,
    createUser,
    toggleUserStatus,
    bulkEnable,
    bulkDisable,
    acceptTermsForUser,
    acceptingTerms,
    completeUserTrainings,
    bulkCompleteUserTrainings,
    completingTrainings,
    exportToCSV,
    exportToExcel,
  } = useUserActions();

  async function loadUsers() {
    try {
      const filtersObj: UserFilters = {};
      if (filters.value.search) filtersObj.search = filters.value.search;
      if (filters.value.role) filtersObj.role = filters.value.role;
      if (filters.value.status) filtersObj.status = filters.value.status;
      if (filters.value.personType) filtersObj.personType = filters.value.personType;
      if (filters.value.isExternal !== null && filters.value.isExternal !== undefined) {
        filtersObj.isExternal = filters.value.isExternal;
      }

      const params: {
        page: number;
        limit: number;
        filters?: UserFilters;
        sortBy: string;
        sortOrder: 'desc';
      } = {
        page: (pagination.value?.page as number) || 1,
        limit: (pagination.value?.rowsPerPage as number) || 10,
        sortBy: 'fechaCreacion',
        sortOrder: 'desc' as const,
      };

      if (Object.keys(filtersObj).length > 0) {
        params.filters = filtersObj;
      }

      const response = await listUsers(params);
      lastTotalPages.value = response.totalPages ?? 0;
      if (response.totalPages === 1) {
        allUsersWhenSinglePage.value = response.data;
      } else {
        allUsersWhenSinglePage.value = [];
      }
      updatePagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
      });

      // Cargar estadísticas
      await getStatistics(filters.value);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  async function onRequest(props: { pagination: QTableProps['pagination'] }) {
    const p = props.pagination;
    const page = p?.page ?? 1;
    const rowsPerPage = p?.rowsPerPage ?? 10;
    // Actualizar solo page y rowsPerPage; mantener rowsNumber para no perder el total y evitar "0-0" mientras llega la respuesta.
    pagination.value = {
      ...pagination.value,
      page,
      rowsPerPage,
    };

    // Si totalPages===1, todos los datos ya están en memoria: paginar solo en local, sin petición al back.
    if (lastTotalPages.value === 1 && allUsersWhenSinglePage.value.length > 0) {
      const start = (page - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      setUsersData(allUsersWhenSinglePage.value.slice(start, end));
      updatePagination({
        page,
        limit: rowsPerPage,
        total: allUsersWhenSinglePage.value.length,
      });
      return;
    }

    await loadUsers();
  }

  async function clearAllFilters() {
    clearFilters();
    resetToFirstPage();
    await loadUsers();
  }

  function handleToggleUserStatus(user: User) {
    toggleUserStatus(user, toggleUserStatusUseCase, () => {
      void loadUsers();
    });
  }

  function handleBulkEnable() {
    bulkEnable(selectedUsers.value, bulkEnableUseCase, () => {
      clearSelection();
      void loadUsers();
    });
  }

  function handleBulkDisable() {
    bulkDisable(selectedUsers.value, bulkDisableUseCase, () => {
      clearSelection();
      void loadUsers();
    });
  }

  function handleBulkCompleteTrainings() {
    bulkCompleteUserTrainings(selectedUsers.value, () => {
      clearSelection();
      void loadUsers();
    });
  }

  function handleExportToCSV() {
    exportToCSV(users.value);
  }

  function handleExportToExcel() {
    exportToExcel();
  }

  function handleAcceptTerms(user: User) {
    acceptTermsForUser(user, () => {
      void loadUsers();
    });
  }

  function handleCompleteTrainings(user: User) {
    completeUserTrainings(user, () => {
      void loadUsers();
    });
  }

  // Watchers
  watch(
    () => debouncedSearch.value,
    (newValue) => {
      if (newValue !== undefined) {
        resetToFirstPage();
        void loadUsers();
      }
    },
  );

  watch(
    () => [
      filters.value.role,
      filters.value.status,
      filters.value.personType,
      filters.value.isExternal,
    ],
    () => {
      resetToFirstPage();
      void loadUsers();
    },
    { deep: true },
  );

  return {
    // State
    loading,
    users,
    statistics,
    filters,
    selectedUsers,
    pagination,
    columns,
    activeFiltersCount,
    hasActiveFilters,

    // Actions
    loadUsers,
    onRequest,
    clearAllFilters,
    clearSelection,
    handleToggleUserStatus,
    handleBulkEnable,
    handleBulkDisable,
    handleBulkCompleteTrainings,
    handleAcceptTerms,
    acceptingTerms,
    handleCompleteTrainings,
    completingTrainings,
    viewUser,
    editUser,
    createUser,
    handleExportToCSV,
    handleExportToExcel,
  };
}
