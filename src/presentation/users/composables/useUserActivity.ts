import { ref, computed } from 'vue';
import type { Inscription } from '../../../application/inscription/inscription.repository.port';
import type { Certificate } from '../../../domain/certificate/models';
import type { User } from '../../../domain/user/models';

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  color: string;
  meta?: string;
}

/**
 * Genera actividades a partir de inscripciones y certificados
 */
function generateActivities(
  inscriptions: Inscription[],
  certificates: Certificate[],
  user: User,
): Activity[] {
  const activities: Activity[] = [];

  // Actividad de creación de usuario
  if (user.createdAt) {
    activities.push({
      id: `user-created-${user.id}`,
      title: 'Usuario creado',
      description: 'Usuario registrado en el sistema',
      date: user.createdAt,
      icon: 'person_add',
      color: 'info',
    });
  }

  // Actividades de inscripciones
  inscriptions.forEach((inscription) => {
    activities.push({
      id: `inscription-${inscription.id}`,
      title: 'Inscripción en curso',
      description: `Se inscribió en el curso "${inscription.courseName}"`,
      date: inscription.enrolledDate,
      icon: 'school',
      color: 'primary',
    });

    // Si está completado, agregar actividad de finalización
    if (inscription.status === 'completed' && inscription.completedDate) {
      activities.push({
        id: `completed-${inscription.id}`,
        title: 'Curso completado',
        description: `Completó el curso "${inscription.courseName}"`,
        date: inscription.completedDate,
        icon: 'check_circle',
        color: 'positive',
        meta: inscription.score ? `Calificación: ${inscription.score}%` : undefined,
      });
    }
  });

  // Actividades de certificados
  certificates.forEach((certificate) => {
    activities.push({
      id: `certificate-${certificate.id}`,
      title: 'Certificado obtenido',
      description: `Completó y aprobó el curso "${certificate.courseName}"`,
      date: certificate.issuedDate,
      icon: 'verified',
      color: 'positive',
      meta: certificate.score ? `Calificación: ${certificate.score}%` : undefined,
    });
  });

  // Ordenar por fecha descendente (más reciente primero)
  return activities.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Composable para manejar actividades de usuarios
 */
export function useUserActivity() {
  const activities = ref<Activity[]>([]);
  const loading = ref(false);

  function loadActivities(
    inscriptions: Inscription[],
    certificates: Certificate[],
    user: User,
  ) {
    loading.value = true;
    try {
      activities.value = generateActivities(inscriptions, certificates, user);
    } catch (error) {
      console.error('Error generating activities:', error);
      activities.value = [];
    } finally {
      loading.value = false;
    }
  }

  return {
    activities,
    loading,
    loadActivities,
  };
}

