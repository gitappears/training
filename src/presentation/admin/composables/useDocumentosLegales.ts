// Composable para gestionar documentos legales
// Capa de Presentación

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { documentosLegalesService } from '../../../infrastructure/http/documentos-legales/documentos-legales.service';
import type { DocumentoLegal } from '../../../application/documentos-legales/documentos-legales.repository.port';
import type {
  ListDocumentosLegalesUseCase,
  UpdateDocumentoLegalUseCase,
  RemoveDocumentoLegalUseCase,
} from '../../../application/documentos-legales';
import { DocumentosLegalesUseCasesFactory } from '../../../application/documentos-legales';

/**
 * Composable para gestionar la lista y acciones de documentos legales
 */
export function useDocumentosLegales() {
  const router = useRouter();
  const $q = useQuasar();

  // Use cases
  const listDocumentosLegalesUseCase: ListDocumentosLegalesUseCase =
    DocumentosLegalesUseCasesFactory.getListDocumentosLegalesUseCase(documentosLegalesService);
  const updateDocumentoLegalUseCase: UpdateDocumentoLegalUseCase =
    DocumentosLegalesUseCasesFactory.getUpdateDocumentoLegalUseCase(documentosLegalesService);
  const removeDocumentoLegalUseCase: RemoveDocumentoLegalUseCase =
    DocumentosLegalesUseCasesFactory.getRemoveDocumentoLegalUseCase(documentosLegalesService);

  // Estado
  const documentos = ref<DocumentoLegal[]>([]);
  const loading = ref(false);
  const showDeleteDialog = ref(false);
  const documentoAEliminar = ref<DocumentoLegal | null>(null);
  const showViewDialog = ref(false);
  const documentoAVisualizar = ref<DocumentoLegal | null>(null);

  // Filtros
  const filtroTipo = ref<string | null>(null);
  const filtroActivo = ref<boolean | null>(null);

  // Opciones de filtros
  const tiposDocumento = [
    { label: 'Términos y Condiciones', value: 'TERMINOS_CONDICIONES' },
    { label: 'Política de Privacidad', value: 'POLITICA_PRIVACIDAD' },
    { label: 'Política de Datos', value: 'POLITICA_DATOS' },
    { label: 'Otro', value: 'OTRO' },
  ];

  const opcionesEstado = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false },
  ];

  // Documentos filtrados
  const documentosFiltrados = computed(() => {
    let filtrados = documentos.value;

    if (filtroTipo.value) {
      filtrados = filtrados.filter((doc) => doc.tipo === filtroTipo.value);
    }

    if (filtroActivo.value !== null) {
      filtrados = filtrados.filter((doc) => doc.activo === filtroActivo.value);
    }

    return filtrados;
  });

  // Funciones
  const cargarDocumentos = async () => {
    loading.value = true;
    try {
      documentos.value = await listDocumentosLegalesUseCase.execute();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Error al cargar documentos legales',
        position: 'top',
      });
    } finally {
      loading.value = false;
    }
  };

  const toggleActivo = async (id: number, activo: boolean) => {
    loading.value = true;
    try {
      await updateDocumentoLegalUseCase.execute(id, { activo });
      await cargarDocumentos();
      $q.notify({
        type: 'positive',
        message: 'Estado actualizado correctamente',
        position: 'top',
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Error al actualizar el estado',
        position: 'top',
      });
    } finally {
      loading.value = false;
    }
  };

  const editarDocumento = (id: number) => {
    void router.push(`/admin/documentos-legales/${id}/edit`);
  };

  const navigateToCreate = () => {
    void router.push('/admin/documentos-legales/new');
  };

  const confirmarEliminar = (documento: DocumentoLegal) => {
    documentoAEliminar.value = documento;
    showDeleteDialog.value = true;
  };

  const eliminarDocumento = async () => {
    if (!documentoAEliminar.value) return;

    loading.value = true;
    try {
      await removeDocumentoLegalUseCase.execute(documentoAEliminar.value.id);
      showDeleteDialog.value = false;
      documentoAEliminar.value = null;
      await cargarDocumentos();
      $q.notify({
        type: 'positive',
        message: 'Documento eliminado correctamente',
        position: 'top',
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : 'Error al eliminar el documento',
        position: 'top',
      });
    } finally {
      loading.value = false;
    }
  };

  const limpiarFiltros = () => {
    filtroTipo.value = null;
    filtroActivo.value = null;
  };

  const getColorTipo = (tipo: string): string => {
    const colores: Record<string, string> = {
      TERMINOS_CONDICIONES: 'blue',
      POLITICA_PRIVACIDAD: 'green',
      POLITICA_DATOS: 'orange',
      OTRO: 'grey',
    };
    return colores[tipo] || 'grey';
  };

  const verDocumento = (documento: DocumentoLegal) => {
    documentoAVisualizar.value = documento;
    showViewDialog.value = true;
  };

  return {
    // Estado
    documentos,
    loading,
    showDeleteDialog,
    documentoAEliminar,
    showViewDialog,
    documentoAVisualizar,
    filtroTipo,
    filtroActivo,
    tiposDocumento,
    opcionesEstado,
    documentosFiltrados,
    // Funciones
    cargarDocumentos,
    toggleActivo,
    editarDocumento,
    navigateToCreate,
    confirmarEliminar,
    eliminarDocumento,
    limpiarFiltros,
    getColorTipo,
    verDocumento,
  };
}
