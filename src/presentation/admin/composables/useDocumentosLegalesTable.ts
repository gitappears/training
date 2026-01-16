// Composable para la configuración de la tabla de documentos legales
// Capa de Presentación

import type { QTableColumn } from 'quasar';

/**
 * Composable para obtener la configuración de columnas de la tabla
 */
export function useDocumentosLegalesTable() {
  const columnas: QTableColumn[] = [
    {
      name: 'id',
      label: 'ID',
      field: 'id',
      align: 'left',
      sortable: true,
    },
    {
      name: 'tipo',
      label: 'Tipo',
      field: 'tipo',
      align: 'left',
      sortable: true,
    },
    {
      name: 'titulo',
      label: 'Título',
      field: 'titulo',
      align: 'left',
      sortable: true,
    },
    {
      name: 'version',
      label: 'Versión',
      field: 'version',
      align: 'center',
      sortable: true,
    },
    {
      name: 'activo',
      label: 'Activo',
      field: 'activo',
      align: 'center',
      sortable: true,
    },
    {
      name: 'fechaCreacion',
      label: 'Fecha Creación',
      field: 'fechaCreacion',
      align: 'center',
      sortable: true,
      format: (val: Date) => val.toLocaleDateString('es-CO'),
    },
    {
      name: 'acciones',
      label: 'Acciones',
      field: 'acciones',
      align: 'center',
    },
  ];

  return {
    columnas,
  };
}
