import { ref, watch, computed, type Ref } from 'vue';
import { useQuasar } from 'quasar';
import type { User } from '../../../domain/user/models';
import { useUsers } from './useUsers';
import { useRoles } from './useRoles';

/**
 * Composable para manejar el formulario de edición de datos de usuario
 */
export function useUserEditForm(user: Ref<User | null> | User | null) {
  const $q = useQuasar();
  const { updateUser, loading } = useUsers();
  const { roles } = useRoles();

  // Convertir a ref si es necesario
  const userRef = typeof user === 'object' && 'value' in user ? user : ref(user);

  const formData = ref<{
    username: string;
    role: string;
    roleId?: number;
    habilitado: boolean;
    activo: boolean;
    debeCambiarPassword: boolean;
  }>({
    username: '',
    role: '',
    roleId: undefined,
    habilitado: true,
    activo: true,
    debeCambiarPassword: false,
  });

  // Función para mapear el rol del usuario al código del backend
  function mapUserRoleToBackendCode(userRole: string): string {
    const roleMap: Record<string, string> = {
      admin: 'ADMIN',
      institutional: 'CLIENTE',
      driver: 'ALUMNO',
    };
    return roleMap[userRole] || 'ALUMNO';
  }

  // Inicializar datos cuando cambia el usuario
  watch(
    [userRef, roles],
    ([currentUser, loadedRoles]) => {
      if (currentUser && loadedRoles.length > 0) {
        // Buscar el rol del backend basado en el roleId o mapear desde el role del frontend
        let backendRoleCode = '';
        let roleId: number | undefined = currentUser.roleId;

        if (roleId) {
          // Si tenemos el roleId, buscar el rol correspondiente
          const role = loadedRoles.find((r) => r.id === roleId);
          if (role) {
            backendRoleCode = role.codigo;
          }
        } else {
          // Si no tenemos roleId, mapear desde el role del frontend
          backendRoleCode = mapUserRoleToBackendCode(currentUser.role);
          const role = loadedRoles.find((r) => r.codigo === backendRoleCode);
          if (role) {
            roleId = role.id;
          }
        }

        formData.value = {
          username: currentUser.username || '',
          role: backendRoleCode,
          roleId,
          habilitado: currentUser.enabled ?? true,
          activo: currentUser.active ?? true,
          debeCambiarPassword: currentUser.mustChangePassword ?? false,
        };
      }
    },
    { immediate: true },
  );

  function resetForm() {
    const currentUser = userRef.value;
    if (currentUser && roles.value.length > 0) {
      let backendRoleCode = '';
      let roleId: number | undefined = currentUser.roleId;

      if (roleId) {
        const role = roles.value.find((r) => r.id === roleId);
        if (role) {
          backendRoleCode = role.codigo;
        }
      } else {
        backendRoleCode = mapUserRoleToBackendCode(currentUser.role);
        const role = roles.value.find((r) => r.codigo === backendRoleCode);
        if (role) {
          roleId = role.id;
        }
      }

      formData.value = {
        username: currentUser.username || '',
        role: backendRoleCode,
        roleId,
        habilitado: currentUser.enabled ?? true,
        activo: currentUser.active ?? true,
        debeCambiarPassword: currentUser.mustChangePassword ?? false,
      };
    }
  }

  async function submit(): Promise<void> {
    const currentUser = userRef.value;
    if (!currentUser) return;

    const updateDto: {
      username?: string;
      rolPrincipalId?: number;
      habilitado?: boolean;
      activo?: boolean;
      debeCambiarPassword?: boolean;
    } = {};

    if (formData.value.username && formData.value.username !== currentUser.username) {
      updateDto.username = formData.value.username;
    }

    // Actualizar rol si cambió
    if (formData.value.roleId && formData.value.roleId !== currentUser.roleId) {
      updateDto.rolPrincipalId = formData.value.roleId;
    }

    if (formData.value.habilitado !== currentUser.enabled) {
      updateDto.habilitado = formData.value.habilitado;
    }

    if (formData.value.activo !== (currentUser.active ?? true)) {
      updateDto.activo = formData.value.activo;
    }

    if (formData.value.debeCambiarPassword !== (currentUser.mustChangePassword ?? false)) {
      updateDto.debeCambiarPassword = formData.value.debeCambiarPassword;
    }

    // Solo actualizar si hay cambios
    if (Object.keys(updateDto).length > 0) {
      await updateUser(currentUser.id, updateDto);
      $q.notify({
        type: 'positive',
        message: 'Usuario actualizado exitosamente',
        position: 'top',
      });
    } else {
      $q.notify({
        type: 'info',
        message: 'No hay cambios para guardar',
        position: 'top',
      });
      throw new Error('No hay cambios para guardar');
    }
  }

  return {
    formData,
    loading,
    resetForm,
    submit,
  };
}

