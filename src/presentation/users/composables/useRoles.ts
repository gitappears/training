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
   * Convierte los códigos del backend a los valores del frontend
   * Solo incluye roles que se pueden usar para crear usuarios
   */
  const roleOptions = computed(() => {
    return roles.value
      .filter((role) => {
        // Solo incluir roles que se pueden usar para crear usuarios
        return ['ADMIN', 'CLIENTE', 'ALUMNO', 'OPERADOR'].includes(role.codigo);
      })
      .map((role) => {
        // Mapear códigos del backend a valores del frontend
        let frontendValue: 'admin' | 'institutional' | 'driver' = 'driver';
        
        if (role.codigo === 'ADMIN') {
          frontendValue = 'admin';
        } else if (role.codigo === 'CLIENTE') {
          frontendValue = 'institutional';
        } else if (role.codigo === 'ALUMNO' || role.codigo === 'OPERADOR') {
          frontendValue = 'driver';
        }

        return {
          label: role.nombre,
          value: frontendValue,
          codigo: role.codigo, // Mantener el código original para referencia
          id: role.id,
        };
      });
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

