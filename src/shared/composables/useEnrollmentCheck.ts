/**
 * Composable para verificar si un usuario está inscrito en una capacitación
 * Sigue principios SOLID y arquitectura hexagonal
 *
 * Responsabilidad única: Verificar el estado de inscripción de un usuario en una capacitación
 */

import { ref, computed, type Ref } from 'vue';
import { useAuthStore } from '../../stores/auth.store';
import { inscriptionsService } from '../../infrastructure/http/inscriptions/inscriptions.service';

export interface UseEnrollmentCheckOptions {
  /**
   * ID de la capacitación a verificar
   * Puede ser un string, number o Ref reactivo
   */
  courseId: string | number | Ref<string | number>;
}

export interface UseEnrollmentCheckReturn {
  /**
   * Indica si el usuario está inscrito en la capacitación
   */
  isEnrolled: Ref<boolean>;

  /**
   * Indica si se está verificando la inscripción
   */
  loading: Ref<boolean>;

  /**
   * Verifica manualmente el estado de inscripción
   * Útil para refrescar el estado después de una inscripción
   */
  checkEnrollment: () => Promise<boolean>;
}

/**
 * Composable para verificar si el usuario actual está inscrito en una capacitación
 *
 * @param options Opciones de configuración
 * @returns Estado y métodos para verificar inscripción
 *
 * @example
 * ```typescript
 * const { isEnrolled, loading, checkEnrollment } = useEnrollmentCheck({
 *   courseId: computed(() => training.value?.id ?? '')
 * });
 *
 * // Verificar automáticamente al montar
 * onMounted(() => {
 *   checkEnrollment();
 * });
 * ```
 */
export function useEnrollmentCheck(
  options: UseEnrollmentCheckOptions,
): UseEnrollmentCheckReturn {
  const authStore = useAuthStore();

  // Estado
  const isEnrolled = ref<boolean>(false);
  const loading = ref(false);

  /**
   * Obtiene el valor del courseId (maneja refs reactivos)
   */
  const getCourseId = (): string | number | null => {
    const courseId = options.courseId;
    if (typeof courseId === 'object' && 'value' in courseId) {
      // Es un Ref
      return courseId.value ?? null;
    }
    return courseId ?? null;
  };

  /**
   * Verifica si el usuario actual está inscrito en la capacitación
   * @returns true si está inscrito, false en caso contrario
   */
  async function checkEnrollment(): Promise<boolean> {
    const courseId = getCourseId();
    if (!courseId) {
      isEnrolled.value = false;
      return false;
    }

    // Verificar que el usuario esté autenticado
    const personaId = authStore.profile?.personaId;
    if (!personaId) {
      isEnrolled.value = false;
      return false;
    }

    loading.value = true;
    try {
      // Obtener todas las inscripciones del usuario
      const inscriptions = await inscriptionsService.findByUser(personaId.toString());

      // Verificar si existe una inscripción para esta capacitación
      const courseIdStr = courseId.toString();
      const enrolled = inscriptions.some(
        (inscription) => inscription.courseId === courseIdStr,
      );

      isEnrolled.value = enrolled;
      return enrolled;
    } catch (error) {
      console.error('Error al verificar inscripción:', error);
      // En caso de error, asumir que no está inscrito para evitar mostrar el botón incorrectamente
      isEnrolled.value = false;
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    isEnrolled: computed(() => isEnrolled.value),
    loading: computed(() => loading.value),
    checkEnrollment,
  };
}

