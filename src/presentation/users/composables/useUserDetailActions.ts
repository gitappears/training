import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { User } from '../../../domain/user/models';
import { certificatesService } from '../../../infrastructure/http/certificates/certificates.service';

/**
 * Composable para acciones del detalle de usuario
 */
export function useUserDetailActions() {
  const router = useRouter();
  const $q = useQuasar();
  const assignCourseDialogOpen = ref(false);

  function editUser(userId: string) {
    void router.push(`/users/${userId}?edit=true`);
  }

  function assignCourse() {
    assignCourseDialogOpen.value = true;
  }

  function viewCertificate(id: string) {
    void router.push(`/certificates/${id}`);
  }

  async function downloadCertificate(id: string) {
    try {
      const blob = await certificatesService.downloadPDF(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificado-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      $q.notify({
        type: 'positive',
        message: 'Certificado descargado exitosamente',
        position: 'top',
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al descargar el certificado',
        position: 'top',
      });
    }
  }

  function goBack() {
    void router.push('/users');
  }

  async function handleToggleUserStatus(
    user: User,
    toggleFn: (id: string, enabled: boolean) => Promise<User>,
    onSuccess?: () => void,
  ) {
    if (!user.id) return;
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

  return {
    editUser,
    assignCourse,
    assignCourseDialogOpen,
    viewCertificate,
    downloadCertificate,
    goBack,
    handleToggleUserStatus,
  };
}

