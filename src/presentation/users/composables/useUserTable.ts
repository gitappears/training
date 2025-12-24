import { ref } from 'vue';
import type { QTableColumn, QTableProps } from 'quasar';
import type { User } from '../../../domain/user/models';
import { useUserRoles } from './useUserRoles';

/**
 * Composable para manejar la tabla de usuarios
 * Incluye columnas, paginación y selección
 */
export function useUserTable() {
  const selectedUsers = ref<User[]>([]);

  const pagination = ref<QTableProps['pagination']>({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  });

  const columns: QTableColumn<User>[] = [
    {
      name: 'name',
      field: 'name',
      label: 'Nombre',
      align: 'left',
      sortable: true,
    },
    {
      name: 'email',
      field: 'email',
      label: 'Email',
      align: 'left',
      sortable: true,
    },
    {
      name: 'document',
      field: 'document',
      label: 'Documento',
      align: 'left',
    },
    {
      name: 'role',
      field: 'role',
      label: 'Rol',
      align: 'center',
      sortable: true,
    },
    {
      name: 'type',
      field: 'personType',
      label: 'Tipo',
      align: 'center',
    },
    {
      name: 'status',
      field: 'enabled',
      label: 'Estado',
      align: 'center',
      sortable: true,
    },
    {
      name: 'company',
      field: 'company',
      label: 'Empresa',
      align: 'left',
    },
    {
      name: 'actions',
      label: 'Acciones',
      align: 'center',
      field: () => '',
    },
  ];

  function clearSelection() {
    selectedUsers.value = [];
  }

  function updatePagination(response: { page: number; limit: number; total: number }) {
    pagination.value = {
      page: response.page,
      rowsPerPage: response.limit,
      rowsNumber: response.total,
    };
  }

  function resetToFirstPage() {
    pagination.value = {
      ...pagination.value,
      page: 1,
    };
  }

  return {
    selectedUsers,
    pagination,
    columns,
    clearSelection,
    updatePagination,
    resetToFirstPage,
  };
}

