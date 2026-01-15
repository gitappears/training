import { ref, computed, onMounted, watch } from 'vue';
import type { User } from '../../../domain/user/models';
import { useUsers } from './useUsers';
import { useUserRoles } from './useUserRoles';
import { useUserFormatters } from './useUserFormatters';
import { useUserCourses } from './useUserCourses';
import { useUserCertificates } from './useUserCertificates';
import { useUserActivity } from './useUserActivity';
import { useUserDetailActions } from './useUserDetailActions';
import { inscriptionsService } from '../../../infrastructure/http/inscriptions/inscriptions.service';
import { certificatesService } from '../../../infrastructure/http/certificates/certificates.service';

export type UserDetailTab = 'info' | 'courses' | 'certificates' | 'activity';

/**
 * Composable principal para el detalle de usuario
 * Combina todos los composables relacionados con el detalle de usuario
 */
export function useUserDetail(userId: string) {
  const { loading, currentUser, getUser, toggleUserStatus } = useUsers();
  const { getRoleLabel, getRoleColor } = useUserRoles();
  const { formatDate, getDocumentTypeLabel, getCourseStatusColor } = useUserFormatters();
  const { assignedCourses, averageProgress, loading: coursesLoading, loadCourses } = useUserCourses();
  const { certificates, loading: certificatesLoading, loadCertificates } = useUserCertificates();
  const { activities, loadActivities } = useUserActivity();
  const {
    editUser: editUserAction,
    assignCourse,
    assignCourseDialogOpen,
    viewCertificate,
    downloadCertificate,
    goBack,
    handleToggleUserStatus: handleToggleStatus,
  } = useUserDetailActions();

  const tab = ref<UserDetailTab>('info');

  const user = computed(() => currentUser.value || ({} as User));
  const isLoading = computed(() => loading.value || coursesLoading.value || certificatesLoading.value);

  async function loadUser() {
    try {
      await getUser(userId);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  async function loadUserData() {
    if (!user.value.personaId) {
      console.warn('No se puede cargar datos del usuario: personaId no está definido', {
        userId: user.value.id,
        personaId: user.value.personaId,
      });
      return;
    }

    try {
      // Cargar cursos y certificados en paralelo
      await Promise.all([
        loadCourses(user.value.personaId),
        loadCertificates(user.value.personaId),
      ]);

      // Cargar datos completos para generar actividades
      // Usar Promise.allSettled para que un error no detenga el otro
      const [inscriptionsResult, backendCertificatesResult] = await Promise.allSettled([
        inscriptionsService.findByUser(user.value.personaId),
        certificatesService.findByUser(user.value.personaId),
      ]);

      // Procesar resultados
      const inscriptions =
        inscriptionsResult.status === 'fulfilled' ? inscriptionsResult.value : [];
      const backendCertificates =
        backendCertificatesResult.status === 'fulfilled'
          ? backendCertificatesResult.value
          : [];

      // Log de errores si los hay
      if (inscriptionsResult.status === 'rejected') {
        console.error('Error al cargar inscripciones:', inscriptionsResult.reason);
      }
      if (backendCertificatesResult.status === 'rejected') {
        console.error('Error al cargar certificados:', backendCertificatesResult.reason);
      }

      // Generar actividades solo si tenemos datos
      if (inscriptions.length > 0 || backendCertificates.length > 0) {
        loadActivities(inscriptions, backendCertificates, user.value);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // No lanzar el error para que la página pueda seguir funcionando
    }
  }

  async function handleCourseAssigned() {
    // Recargar los cursos después de asignar uno nuevo
    if (user.value.personaId) {
      await loadCourses(user.value.personaId);
    }
  }

  // Cargar datos cuando el usuario esté disponible
  watch(
    () => user.value.personaId,
    (personaId) => {
      if (personaId) {
        void loadUserData();
      }
    },
    { immediate: true },
  );

  async function handleToggleUserStatus() {
    await handleToggleStatus(user.value, toggleUserStatus, async () => {
      await loadUser();
    });
  }

  function editUser() {
    editUserAction(userId);
  }

  // Lifecycle
  onMounted(() => {
    void loadUser();
  });

  return {
    // State
    loading: isLoading,
    user,
    tab,
    assignedCourses,
    certificates,
    activities,
    averageProgress,
    assignCourseDialogOpen,

    // Formatters
    formatDate,
    getDocumentTypeLabel,
    getCourseStatusColor,
    getRoleLabel,
    getRoleColor,

    // Actions
    handleToggleUserStatus,
    editUser,
    assignCourse,
    handleCourseAssigned,
    viewCertificate,
    downloadCertificate,
    goBack,
    loadUser,
  };
}

