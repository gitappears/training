import { ref, watch, computed, type Ref } from 'vue';
import { useQuasar } from 'quasar';
import type { User } from '../../../domain/user/models';
import { useUsers } from './useUsers';

/**
 * Composable para manejar el formulario de edición de datos de usuario
 */
export function useUserEditForm(user: Ref<User | null> | User | null) {
  const $q = useQuasar();
  const { updateUser, loading } = useUsers();

  // Convertir a ref si es necesario
  const userRef = typeof user === 'object' && 'value' in user ? user : ref(user);

  const formData = ref<{
    username: string;
    habilitado: boolean;
    activo: boolean;
    debeCambiarPassword: boolean;
  }>({
    username: '',
    habilitado: true,
    activo: true,
    debeCambiarPassword: false,
  });

  // Inicializar datos cuando cambia el usuario
  watch(
    userRef,
    (currentUser) => {
      if (currentUser) {
        formData.value = {
          username: currentUser.username || '',
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
    if (currentUser) {
      formData.value = {
        username: currentUser.username || '',
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
      habilitado?: boolean;
      activo?: boolean;
      debeCambiarPassword?: boolean;
    } = {};

    if (formData.value.username && formData.value.username !== currentUser.username) {
      updateDto.username = formData.value.username;
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

