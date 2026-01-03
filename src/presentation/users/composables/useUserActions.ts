import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { User } from '../../../domain/user/models';
import { useUserRoles } from './useUserRoles';
import { termsService } from '../../../infrastructure/http/terms/terms.service';

/**
 * Composable para manejar acciones de usuarios
 * Incluye toggle status, bulk actions, exportación y navegación
 */
export function useUserActions() {
  const router = useRouter();
  const $q = useQuasar();
  const { getRoleLabel } = useUserRoles();
  const acceptingTerms = ref<Record<string, boolean>>({});

  function viewUser(id: string) {
    void router.push(`/users/${id}`);
  }

  function editUser(id: string) {
    void router.push(`/users/${id}?edit=true`);
  }

  function createUser() {
    void router.push('/users/new');
  }

  async function toggleUserStatus(
    user: User,
    toggleFn: (id: string, enabled: boolean) => Promise<User>,
    onSuccess?: () => void | Promise<void>,
  ) {
    const action = user.enabled ? 'deshabilitar' : 'habilitar';
    $q.dialog({
      title: 'Confirmar acción',
      message: `¿Está seguro de ${action} a ${user.name}?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        await toggleFn(user.id, !user.enabled);
        await onSuccess?.();
      } catch (error) {
        console.error('Error toggling user status:', error);
      }
    });
  }

  async function bulkEnable(
    selectedUsers: User[],
    bulkEnableFn: (ids: string[]) => Promise<unknown>,
    onSuccess?: () => void | Promise<void>,
  ) {
    if (selectedUsers.length === 0) return;

    $q.dialog({
      title: 'Confirmar acción',
      message: `¿Está seguro de habilitar ${selectedUsers.length} usuario(s)?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        const ids = selectedUsers.map((u) => u.id);
        await bulkEnableFn(ids);
        await onSuccess?.();
      } catch (error) {
        console.error('Error enabling users:', error);
      }
    });
  }

  async function bulkDisable(
    selectedUsers: User[],
    bulkDisableFn: (ids: string[]) => Promise<void | unknown>,
    onSuccess?: () => void | Promise<void>,
  ) {
    if (selectedUsers.length === 0) return;

    $q.dialog({
      title: 'Confirmar acción',
      message: `¿Está seguro de deshabilitar ${selectedUsers.length} usuario(s)?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        const ids = selectedUsers.map((u) => u.id);
        await bulkDisableFn(ids);
        await onSuccess?.();
      } catch (error) {
        console.error('Error disabling users:', error);
      }
    });
  }

  function exportToCSV(users: User[]) {
    const headers = ['Nombre', 'Email', 'Documento', 'Rol', 'Tipo', 'Estado', 'Empresa'];
    const rows = users.map((user) => [
      user.name,
      user.email,
      user.document,
      getRoleLabel(user.role),
      user.personType === 'juridica' ? 'Jurídica' : 'Natural',
      user.enabled ? 'Habilitado' : 'Deshabilitado',
      user.company || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    $q.notify({
      type: 'positive',
      message: 'Archivo CSV exportado exitosamente',
      position: 'top',
    });
  }

  function exportToExcel() {
    $q.notify({
      type: 'info',
      message: 'Exportación a Excel próximamente',
      position: 'top',
    });
  }

  async function acceptTermsForUser(
    user: User,
    onSuccess?: () => void | Promise<void>,
  ) {
    $q.dialog({
      title: 'Confirmar aceptación de términos',
      message: `¿Está seguro de aceptar los términos y condiciones en nombre de ${user.name}?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      // Activar loading para este usuario
      acceptingTerms.value[user.id] = true;
      
      try {
        // Obtener documentos activos
        const documentosActivos = await termsService.getActiveDocuments();
        
        if (documentosActivos.length === 0) {
          $q.notify({
            type: 'warning',
            message: 'No hay documentos legales activos para aceptar',
            position: 'top',
          });
          return;
        }

        // Obtener los IDs de los documentos activos
        const documentosIds = documentosActivos.map((doc) => doc.id);

        // Aceptar términos para el usuario
        await termsService.acceptTermsForUser(user.id, documentosIds);
        
        $q.notify({
          type: 'positive',
          message: `Términos y condiciones aceptados exitosamente para ${user.name}`,
          position: 'top',
        });
        
        await onSuccess?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Error al aceptar términos y condiciones';
        $q.notify({
          type: 'negative',
          message: errorMessage,
          position: 'top',
        });
      } finally {
        // Desactivar loading para este usuario
        acceptingTerms.value[user.id] = false;
      }
    });
  }

  return {
    viewUser,
    editUser,
    createUser,
    toggleUserStatus,
    bulkEnable,
    bulkDisable,
    exportToCSV,
    exportToExcel,
    acceptTermsForUser,
    acceptingTerms,
  };
}

