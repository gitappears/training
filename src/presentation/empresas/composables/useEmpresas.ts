import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import {
  empresasService,
  type Empresa,
  type EmpresaSearchParams,
  type EmpresaSearchResponse,
} from '../../../infrastructure/http/empresas/empresas.service';

/**
 * Composable para gestionar empresas.
 * Centraliza la lógica de búsqueda avanzada y toggle de estado.
 */
export function useEmpresas() {
  const $q = useQuasar();
  const loading = ref(false);
  const empresas = ref<Empresa[]>([]);

  /**
   * Búsqueda avanzada con filtros y paginación.
   */
  async function search(params: EmpresaSearchParams): Promise<EmpresaSearchResponse> {
    loading.value = true;
    try {
      const res = await empresasService.search(params);
      empresas.value = res.data;
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al buscar empresas';
      $q.notify({ type: 'negative', message: msg, icon: 'error' });
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Activa o desactiva una empresa (toggle estado).
   */
  async function toggleStatus(id: number) {
    try {
      return await empresasService.toggleStatus(id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al cambiar el estado de la empresa';
      $q.notify({ type: 'negative', message: msg, icon: 'error' });
      throw e;
    }
  }

  /**
   * Elimina una empresa (soft-delete: desactiva).
   */
  async function remove(id: number) {
    try {
      await empresasService.remove(id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al eliminar la empresa';
      $q.notify({ type: 'negative', message: msg, icon: 'error' });
      throw e;
    }
  }

  return {
    loading: computed(() => loading.value),
    empresas: computed(() => empresas.value),
    search,
    toggleStatus,
    remove,
  };
}
