import { ref, computed, type Ref } from 'vue';
import type { User } from '../../../domain/user/models';
import { useUserEditForm } from './useUserEditForm';
import { useUserPersonalDataForm } from './useUserPersonalDataForm';

export type UserEditTab = 'user' | 'personal';

/**
 * Composable principal para el diálogo de edición de usuario
 * Combina los formularios de usuario y datos personales
 */
export function useUserEditDialog(user: Ref<User | null> | User | null) {
  const activeTab = ref<UserEditTab>('user');

  // Convertir a ref si es necesario para pasarlo a los composables
  const userRef = typeof user === 'object' && 'value' in user ? user : ref(user);

  const userForm = useUserEditForm(userRef);
  const personalDataForm = useUserPersonalDataForm(userRef);

  const loading = computed(() => userForm.loading.value || personalDataForm.loading.value);

  function handleClose() {
    userForm.resetForm();
    personalDataForm.resetForm();
  }

  async function handleSubmit() {
    try {
      if (activeTab.value === 'user') {
        await userForm.submit();
      } else {
        await personalDataForm.submit();
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar';
      throw new Error(errorMessage);
    }
  }

  return {
    activeTab,
    formData: userForm.formData,
    personalData: personalDataForm.personalData,
    genderOptions: personalDataForm.genderOptions,
    empresas: personalDataForm.empresas,
    loadingEmpresas: personalDataForm.loadingEmpresas,
    isAdmin: personalDataForm.isAdmin,
    loading,
    handleClose,
    handleSubmit,
  };
}
