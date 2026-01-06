import { watch } from 'vue';
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
    listUsers,
    toggleUserStatus: toggleUserStatusUseCase,
    bulkEnable: bulkEnableUseCase,
    bulkDisable: bulkDisableUseCase,
    getStatistics,
  } = useUsers();

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
    pagination.value = props.pagination;
    await loadUsers();
  }

  async function clearAllFilters() {
    clearFilters();
    resetToFirstPage();
    await loadUsers();
  }

  async function handleToggleUserStatus(user: User) {
    await toggleUserStatus(user, toggleUserStatusUseCase, () => {
      void loadUsers();
    });
  }

  async function handleBulkEnable() {
    await bulkEnable(selectedUsers.value, bulkEnableUseCase, () => {
      clearSelection();
      void loadUsers();
    });
  }

  async function handleBulkDisable() {
    await bulkDisable(selectedUsers.value, bulkDisableUseCase, () => {
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

  async function handleAcceptTerms(user: User) {
    await acceptTermsForUser(user, () => {
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
    handleAcceptTerms,
    acceptingTerms,
    viewUser,
    editUser,
    createUser,
    handleExportToCSV,
    handleExportToExcel,
  };
}
