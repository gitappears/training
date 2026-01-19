import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { usersService } from '../../../infrastructure/http/users/users.service';
import { UserUseCasesFactory } from '../../../application/user/user.use-cases.factory';
import type { User } from '../../../domain/user/models';
import type {
  UserListParams,
  UserFilters,
  UserStatistics,
  CreateUserDto,
  UpdateUserDto,
} from '../../../application/user/user.repository.port';

/**
 * Composable para gestionar usuarios
 * Centraliza la lógica de CRUD de usuarios
 */
export function useUsers() {
  const $q = useQuasar();
  const loading = ref(false);
  const users = ref<User[]>([]);
  const currentUser = ref<User | null>(null);
  const statistics = ref<UserStatistics>({
    total: 0,
    enabled: 0,
    disabled: 0,
    external: 0,
    byRole: {
      admin: 0,
      institutional: 0,
      driver: 0,
    },
    byType: {
      natural: 0,
      juridica: 0,
    },
  });

  /**
   * Lista usuarios con paginación y filtros
   */
  async function listUsers(params: UserListParams) {
    loading.value = true;
    try {
      const listUsersUseCase = UserUseCasesFactory.getListUsersUseCase(usersService);
      const response = await listUsersUseCase.execute(params);
      users.value = response.data;
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar usuarios';
      $q.notify({
        type: 'negative',
        message: errorMessage,
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  async function getUser(id: string) {
    loading.value = true;
    try {
      const getUserUseCase = UserUseCasesFactory.getGetUserUseCase(usersService);
      const user = await getUserUseCase.execute(id);
      currentUser.value = user;
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar el usuario';
      $q.notify({
        type: 'negative',
        message: errorMessage,
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async function createUser(dto: CreateUserDto) {
    loading.value = true;
    try {
      const createUserUseCase = UserUseCasesFactory.getCreateUserUseCase(usersService);
      const user = await createUserUseCase.execute(dto);
      $q.notify({
        type: 'positive',
        message: 'Usuario creado exitosamente',
      });
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el usuario';
      $q.notify({
        type: 'negative',
        message: errorMessage,
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Actualiza un usuario
   */
  async function updateUser(id: string, dto: UpdateUserDto) {
    loading.value = true;
    try {
      const updateUserUseCase = UserUseCasesFactory.getUpdateUserUseCase(usersService);
      const user = await updateUserUseCase.execute(id, dto);
      $q.notify({
        type: 'positive',
        message: 'Usuario actualizado exitosamente',
      });
      // Actualizar el usuario actual si es el mismo
      if (currentUser.value?.id === id) {
        currentUser.value = user;
      }
      // Actualizar en la lista si existe
      const index = users.value.findIndex((u) => u.id === id);
      if (index !== -1) {
        users.value[index] = user;
      }
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el usuario';
      $q.notify({
        type: 'negative',
        message: errorMessage,
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Actualiza los datos personales de un usuario
   * Nota: Usa el endpoint de perfil que requiere que el usuario esté autenticado
   * Para administradores editando otros usuarios, se necesita un endpoint específico en el backend
   */
  async function updateUserPersonData(
    userId: string,
    personaData: {
      nombres?: string;
      apellidos?: string;
      email?: string;
      telefono?: string;
      fechaNacimiento?: string;
      genero?: 'M' | 'F' | 'O';
      direccion?: string;
    },
  ) {
    loading.value = true;
    try {
      // Por ahora, actualizamos los datos personales a través del método updateUser
      // con los campos mapeados correctamente
      const updateDto: UpdateUserDto = {};

      if (personaData.nombres && personaData.apellidos) {
        updateDto.name = `${personaData.nombres} ${personaData.apellidos}`.trim();
      }
      if (personaData.email) {
        updateDto.email = personaData.email;
      }
      if (personaData.telefono) {
        updateDto.phone = personaData.telefono;
      }
      if (personaData.fechaNacimiento) {
        updateDto.birthDate = personaData.fechaNacimiento;
      }
      if (personaData.genero) {
        updateDto.gender = personaData.genero;
      }
      if (personaData.direccion) {
        updateDto.address = personaData.direccion;
      }

      return await updateUser(userId, updateDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al actualizar los datos personales';
      $q.notify({
        type: 'negative',
        message: errorMessage,
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Elimina un usuario (soft-delete)
   */
  async function deleteUser(id: string) {
    loading.value = true;
    try {
      const deleteUserUseCase = UserUseCasesFactory.getDeleteUserUseCase(usersService);
      await deleteUserUseCase.execute(id);
      $q.notify({
        type: 'positive',
        message: 'Usuario eliminado exitosamente',
      });
      // Remover de la lista
      users.value = users.value.filter((u) => u.id !== id);
      // Limpiar usuario actual si es el mismo
      if (currentUser.value?.id === id) {
        currentUser.value = null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el usuario';
      $q.notify({
        type: 'negative',
        message: errorMessage,
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Cambia el estado de habilitación de un usuario
   */
  async function toggleUserStatus(id: string, enabled: boolean) {
    loading.value = true;
    try {
      const toggleStatusUseCase = UserUseCasesFactory.getToggleUserStatusUseCase(usersService);
      const user = await toggleStatusUseCase.execute(id, enabled);
      $q.notify({
        type: 'positive',
        message: `Usuario ${enabled ? 'habilitado' : 'deshabilitado'} exitosamente`,
      });
      // Actualizar en la lista
      const index = users.value.findIndex((u) => u.id === id);
      if (index !== -1) {
        users.value[index] = user;
      }
      // Actualizar usuario actual si es el mismo
      if (currentUser.value?.id === id) {
        currentUser.value = user;
      }
      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al cambiar el estado del usuario';
      $q.notify({
        type: 'negative',
        message: errorMessage,
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async function getStatistics(filters?: UserFilters) {
    loading.value = true;
    try {
      const getStatisticsUseCase = UserUseCasesFactory.getGetUserStatisticsUseCase(usersService);
      const stats = await getStatisticsUseCase.execute(filters);
      statistics.value = stats;
      return stats;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al obtener estadísticas';
      $q.notify({
        type: 'negative',
        message: errorMessage,
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Habilitar múltiples usuarios
   */
  async function bulkEnable(ids: string[]) {
    loading.value = true;
    try {
      await usersService.bulkEnable(ids);
      $q.notify({
        type: 'positive',
        message: `${ids.length} usuario(s) habilitado(s) exitosamente`,
      });
      // Recargar usuarios
      await listUsers({ page: 1, limit: 100 });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al habilitar usuarios';
      $q.notify({
        type: 'negative',
        message: errorMessage,
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Deshabilitar múltiples usuarios
   */
  async function bulkDisable(ids: string[]) {
    loading.value = true;
    try {
      await usersService.bulkDisable(ids);
      $q.notify({
        type: 'info',
        message: `${ids.length} usuario(s) deshabilitado(s) exitosamente`,
      });
      // Recargar usuarios
      await listUsers({ page: 1, limit: 100 });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al deshabilitar usuarios';
      $q.notify({
        type: 'negative',
        message: errorMessage,
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading: computed(() => loading.value),
    users: computed(() => users.value),
    currentUser: computed(() => currentUser.value),
    statistics: computed(() => statistics.value),
    listUsers,
    getUser,
    createUser,
    updateUser,
    updateUserPersonData,
    deleteUser,
    toggleUserStatus,
    getStatistics,
    bulkEnable,
    bulkDisable,
  };
}

