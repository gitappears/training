import { ref, computed } from 'vue';
import { inscriptionsService } from '../../../infrastructure/http/inscriptions/inscriptions.service';
import type { Inscription } from '../../../application/inscription/inscription.repository.port';

export interface Course {
  id: string;
  courseName: string;
  status: string;
  progress: number;
  enrolledDate: string;
}

/**
 * Mapea el estado de inscripción al formato del frontend
 */
function mapStatusToFrontend(status: Inscription['status']): string {
  const statusMap: Record<Inscription['status'], string> = {
    enrolled: 'Pendiente',
    in_progress: 'En progreso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };
  return statusMap[status] || 'Pendiente';
}

/**
 * Mapea una inscripción a un curso
 */
function mapInscriptionToCourse(inscription: Inscription): Course {
  return {
    id: inscription.id,
    courseName: inscription.courseName,
    status: mapStatusToFrontend(inscription.status),
    progress: Math.round(inscription.progress * 100), // Convertir de 0-1 a 0-100
    enrolledDate: inscription.enrolledDate,
  };
}

/**
 * Composable para manejar cursos asignados a usuarios
 */
export function useUserCourses() {
  const assignedCourses = ref<Course[]>([]);
  const loading = ref(false);

  const averageProgress = computed(() => {
    if (assignedCourses.value.length === 0) return 0;
    const total = assignedCourses.value.reduce((sum, course) => sum + course.progress, 0);
    return Math.round(total / assignedCourses.value.length);
  });

  async function loadCourses(personaId: string) {
    if (!personaId) return;
    
    loading.value = true;
    try {
      const inscriptions = await inscriptionsService.findByUser(personaId);
      assignedCourses.value = inscriptions.map(mapInscriptionToCourse);
    } catch (error) {
      console.error('Error loading courses:', error);
      assignedCourses.value = [];
    } finally {
      loading.value = false;
    }
  }

  return {
    assignedCourses,
    averageProgress,
    loading,
    loadCourses,
  };
}

