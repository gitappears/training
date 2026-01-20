import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { QTableProps } from 'quasar';
import type { Empresa } from '../../../infrastructure/http/empresas/empresas.service';
import { useEmpresas } from './useEmpresas';

export type ActivoFilter = 'todos' | 'activas' | 'inactivas' | 'eliminadas';

/**
 * Composable para la lista de empresas: paginación, búsqueda, filtros y acciones.
 */
export function useEmpresaList() {
  const $q = useQuasar();
  const { loading, empresas, search, toggleStatus, remove } = useEmpresas();

  const searchText = ref('');
  const activoFilter = ref<ActivoFilter>('todos');
  const dialogOpen = ref(false);
  const empresaToEdit = ref<Empresa | null>(null);

  const pagination = ref<QTableProps['pagination']>({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  });

  const columns: QTableProps['columns'] = [
    { name: 'razonSocial', required: true, label: 'Empresa', align: 'left', field: 'razonSocial', sortable: true },
    { name: 'tipoDocumento', label: 'Tipo Doc.', align: 'center', field: 'tipoDocumento', sortable: true },
    { name: 'contacto', label: 'Contacto', align: 'left', field: (row: Empresa) => row.email || row.telefono || '' },
    { name: 'direccion', label: 'Dirección', align: 'left', field: 'direccion', format: (val: string) => val || '—' },
    { name: 'activo', label: 'Estado', align: 'center', field: 'activo', sortable: true },
    { name: 'fechaCreacion', label: 'Fecha Creación', align: 'center', field: 'fechaCreacion', format: (val: string) => (val ? new Date(val).toLocaleDateString() : '—'), sortable: true },
    { name: 'actions', label: 'Acciones', align: 'center', field: () => '' },
  ];

  function buildSearchParams() {
    const page = (pagination.value?.page as number) || 1;
    const limit = (pagination.value?.rowsPerPage as number) || 10;
    const params: {
      page: number;
      limit: number;
      search?: string;
      activo?: boolean;
      eliminadas?: boolean;
    } = { page, limit };
    if (searchText.value.trim()) params.search = searchText.value.trim();
    if (activoFilter.value === 'activas') params.activo = true;
    else if (activoFilter.value === 'inactivas') params.activo = false;
    else if (activoFilter.value === 'eliminadas') params.eliminadas = true;
    // 'todos': no activo ni eliminadas → backend excluye eliminadas y devuelve activas + inactivas
    return params;
  }

  async function loadEmpresas() {
    const res = await search(buildSearchParams());
    pagination.value = {
      ...pagination.value,
      rowsNumber: res.total,
    };
  }

  function onRequest(props: { pagination: QTableProps['pagination'] }) {
    pagination.value = props.pagination;
    void loadEmpresas();
  }

  function openCreateDialog() {
    empresaToEdit.value = null;
    dialogOpen.value = true;
  }

  function openEditDialog(empresa: Empresa) {
    empresaToEdit.value = empresa;
    dialogOpen.value = true;
  }

  function handleDialogSuccess() {
    dialogOpen.value = false;
    empresaToEdit.value = null;
    void loadEmpresas();
  }

  function handleToggleStatus(empresa: Empresa) {
    const action = empresa.activo ? 'desactivar' : 'activar';
    $q.dialog({
      title: 'Confirmar',
      message: `¿Está seguro de que desea ${action} la empresa "${empresa.razonSocial}"?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      toggleStatus(empresa.id)
        .then(() => {
          $q.notify({
            type: 'positive',
            message: `Empresa ${action}da exitosamente`,
            icon: 'check_circle',
          });
          void loadEmpresas();
        })
        .catch(() => {});
    });
  }

  function handleRemove(empresa: Empresa) {
    $q.dialog({
      title: 'Confirmar eliminación',
      message: `¿Está seguro de que desea eliminar la empresa "${empresa.razonSocial}"? La empresa se desactivará y podrá verla en el filtro "Eliminadas".`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      remove(empresa.id)
        .then(() => {
          $q.notify({
            type: 'positive',
            message: 'Empresa eliminada correctamente',
            icon: 'check_circle',
          });
          void loadEmpresas();
        })
        .catch(() => {});
    });
  }

  let searchDebounce: ReturnType<typeof setTimeout> | null = null;
  watch(
    [searchText, activoFilter],
    () => {
      if (searchDebounce) clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        pagination.value = { ...pagination.value, page: 1 };
        void loadEmpresas();
      }, 500);
    },
    { deep: true },
  );

  return {
    loading,
    empresas,
    searchText,
    activoFilter,
    pagination,
    columns,
    dialogOpen,
    empresaToEdit,
    loadEmpresas,
    onRequest,
    openCreateDialog,
    openEditDialog,
    handleDialogSuccess,
    handleToggleStatus,
    handleRemove,
  };
}
