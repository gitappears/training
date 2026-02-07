import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { User } from '../../../domain/user/models';
import { useUserRoles } from './useUserRoles';
import { termsService } from '../../../infrastructure/http/terms/terms.service';
import { usersService } from '../../../infrastructure/http/users/users.service';
import CompleteTrainingsProgressDialog from '../components/CompleteTrainingsProgressDialog.vue';

/**
 * Composable para manejar acciones de usuarios
 * Incluye toggle status, bulk actions, exportación y navegación
 */
export function useUserActions() {
  const router = useRouter();
  const $q = useQuasar();
  const { getRoleLabel } = useUserRoles();
  const acceptingTerms = ref<Record<string, boolean>>({});
  const completingTrainings = ref<Record<string, boolean>>({});

  function viewUser(id: string) {
    void router.push(`/users/${id}`);
  }

  function editUser(id: string) {
    void router.push(`/users/${id}?edit=true`);
  }

  function createUser() {
    void router.push('/users/new');
  }

  function toggleUserStatus(
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
    }).onOk(() => {
      void (async () => {
        try {
          await toggleFn(user.id, !user.enabled);
          await onSuccess?.();
        } catch (error) {
          console.error('Error toggling user status:', error);
        }
      })();
    });
  }

  function bulkEnable(
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
    }).onOk(() => {
      void (async () => {
        try {
          const ids = selectedUsers.map((u) => u.id);
          await bulkEnableFn(ids);
          await onSuccess?.();
        } catch (error) {
          console.error('Error enabling users:', error);
        }
      })();
    });
  }

  function bulkDisable(
    selectedUsers: User[],
    bulkDisableFn: (ids: string[]) => Promise<void>,
    onSuccess?: () => void | Promise<void>,
  ) {
    if (selectedUsers.length === 0) return;

    $q.dialog({
      title: 'Confirmar acción',
      message: `¿Está seguro de deshabilitar ${selectedUsers.length} usuario(s)?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      void (async () => {
        try {
          const ids = selectedUsers.map((u) => u.id);
          await bulkDisableFn(ids);
          await onSuccess?.();
        } catch (error) {
          console.error('Error disabling users:', error);
        }
      })();
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

  function completeUserTrainings(user: User, onSuccess?: () => void | Promise<void>) {
    $q.dialog({
      title: 'Completar capacitaciones',
      message: `¿Completar todas las capacitaciones de ${user.name} y habilitar para certificar? Se marcarán lecciones como completadas y se crearán intentos de evaluación con respuestas correctas.`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      void (async () => {
        completingTrainings.value[user.id] = true;
        const progressDone = ref(false);
        $q.dialog({
          component: CompleteTrainingsProgressDialog,
          componentProps: {
            userName: user.name,
            done: progressDone,
          },
          persistent: true,
        });
        try {
          const result = await usersService.completeTrainings(user.id);
          const msg = result.errors?.length
            ? `${result.message} ${result.inscripcionesProcesadas} inscripción(es). Algunos errores: ${result.errors.slice(0, 2).join('; ')}`
            : result.message;
          $q.notify({
            type: result.inscripcionesProcesadas > 0 ? 'positive' : 'warning',
            message: msg,
            position: 'top',
          });
          await onSuccess?.();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Error al completar capacitaciones';
          $q.notify({
            type: 'negative',
            message: errorMessage,
            position: 'top',
          });
        } finally {
          progressDone.value = true;
          completingTrainings.value[user.id] = false;
        }
      })();
    });
  }

  function bulkCompleteUserTrainings(
    selectedUsers: User[],
    onSuccess?: () => void | Promise<void>,
  ) {
    if (selectedUsers.length === 0) return;

    $q.dialog({
      title: 'Completar capacitaciones (varios usuarios)',
      message: `¿Completar todas las capacitaciones de ${selectedUsers.length} usuario(s) y habilitarlos para certificar? Se marcarán lecciones como completadas y se crearán intentos de evaluación con respuestas correctas para cada uno.`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      void (async () => {
        const progressDone = ref(false);
        $q.dialog({
          component: CompleteTrainingsProgressDialog,
          componentProps: {
            userCount: selectedUsers.length,
            done: progressDone,
          },
          persistent: true,
        });
        try {
          const ids = selectedUsers.map((u) => u.id);
          const result = await usersService.completeTrainingsBulk(ids);
          progressDone.value = true;
          const msg =
            result.totalErrors === 0
              ? `${result.totalSuccess} usuario(s) procesado(s). ${result.results.reduce((acc, r) => acc + r.inscripcionesProcesadas, 0)} inscripción(es) completadas.`
              : `${result.totalSuccess} de ${result.totalProcessed} usuario(s) procesados correctamente. ${result.totalErrors} con errores.`;
          $q.notify({
            type: result.totalErrors === 0 ? 'positive' : 'warning',
            message: msg,
            position: 'top',
          });
          await onSuccess?.();
        } catch (error) {
          progressDone.value = true;
          const errorMessage =
            error instanceof Error ? error.message : 'Error al completar capacitaciones';
          $q.notify({
            type: 'negative',
            message: errorMessage,
            position: 'top',
          });
        }
      })();
    });
  }

  function acceptTermsForUser(user: User, onSuccess?: () => void | Promise<void>) {
    $q.dialog({
      title: 'Confirmar aceptación de términos',
      message: `¿Está seguro de aceptar los términos y condiciones en nombre de ${user.name}?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      void (async () => {
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
            error instanceof Error ? error.message : 'Error al aceptar términos y condiciones';
          $q.notify({
            type: 'negative',
            message: errorMessage,
            position: 'top',
          });
        } finally {
          // Desactivar loading para este usuario
          acceptingTerms.value[user.id] = false;
        }
      })();
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
    completeUserTrainings,
    bulkCompleteUserTrainings,
    completingTrainings,
  };
}
