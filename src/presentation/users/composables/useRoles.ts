import { ref, computed, onMounted } from 'vue';
import { rolesService } from '../../../infrastructure/http/roles/roles.service';
import { RoleUseCasesFactory } from '../../../application/role/role.use-cases.factory';
import type { Role } from '../../../domain/role/models';

/**
 * Composable para manejar la carga y gestión de roles desde el backend
 */
export function useRoles() {
  const roles = ref<Role[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Mapea los roles del backend a opciones para selects en UserCreatePage
   * Usa directamente los códigos del backend como valores
   * Usa todos los roles activos retornados por el backend
   */
  const roleOptions = computed(() => {
    return roles.value
      .filter((role) => role.activo) // Solo incluir roles activos
      .map((role) => ({
        label: role.nombre,
        value: role.codigo, // Usar directamente el código del backend
        id: role.id,
      }));
  });

  /**
   * Opciones de roles para el diálogo de edición (usa códigos del backend)
   */
  const roleOptionsForEdit = computed(() => {
    return roles.value.map((role) => ({
      label: role.nombre,
      value: role.codigo,
      id: role.id,
    }));
  });

  async function loadRoles() {
    loading.value = true;
    error.value = null;

    try {
      const getRolesUseCase = RoleUseCasesFactory.getGetRolesUseCase(rolesService);
      const loadedRoles = await getRolesUseCase.execute();
      roles.value = loadedRoles;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar los roles';
      console.error('Error loading roles:', err);
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    void loadRoles();
  });

  return {
    roles,
    roleOptions,
    roleOptionsForEdit,
    loading,
    error,
    loadRoles,
  };
}
