/**
 * Composable para obtener las capacitaciones donde el usuario está inscrito
 * Sigue principios SOLID y arquitectura hexagonal
 * 
 * Responsabilidad única: Obtener y gestionar las capacitaciones inscritas del usuario actual
 */

import { ref, computed, type Ref } from 'vue';
import { useAuthStore } from '../../stores/auth.store';
import { inscriptionsService } from '../../infrastructure/http/inscriptions/inscriptions.service';

/**
 * Resultado del composable
 */
export interface UseUserEnrolledTrainingsReturn {
  /**
   * IDs de las capacitaciones donde el usuario está inscrito
   * Computed que retorna el Set actualizado
   */
  enrolledTrainingIds: Ref<Set<string>>;
  
  /**
   * Indica si se están cargando las inscripciones
   */
  loading: Ref<boolean>;
  
  /**
   * Verifica si el usuario está inscrito en una capacitación específica
   */
  isEnrolledIn: (trainingId: string) => boolean;
  
  /**
   * Carga las inscripciones del usuario actual
   */
  loadEnrollments: () => Promise<void>;
  
  /**
   * Obtiene los IDs de capacitaciones como array
   */
  enrolledTrainingIdsArray: Ref<string[]>;
}

/**
 * Composable para gestionar las capacitaciones inscritas del usuario
 * 
 * @returns Funciones y estados para trabajar con inscripciones
 */
export function useUserEnrolledTrainings(): UseUserEnrolledTrainingsReturn {
  const authStore = useAuthStore();
  
  const enrolledTrainingIds = ref<Set<string>>(new Set());
  const loading = ref(false);

  /**
   * Verifica si el usuario está inscrito en una capacitación específica
   */
  function isEnrolledIn(trainingId: string): boolean {
    return enrolledTrainingIds.value.has(trainingId);
  }

  /**
   * Carga las inscripciones del usuario actual
   */
  async function loadEnrollments(): Promise<void> {
    // Obtener personaId de diferentes formas posibles
    const profile = authStore.profile as { 
      personaId?: number; 
      persona?: { id?: number } 
    } | null;
    
    const personaId = profile?.personaId || profile?.persona?.id;
    
    // Agregar logs para depuración
    console.log('🔍 Debug - Profile completo:', profile);
    console.log('🔍 Debug - personaId encontrado:', personaId);
    
    if (!personaId) {
      console.warn('⚠️ No se encontró personaId en el perfil del usuario');
      enrolledTrainingIds.value = new Set();
      return;
    }

    loading.value = true;
    try {
      console.log('📡 Obteniendo inscripciones para personaId:', personaId);
      const inscriptions = await inscriptionsService.findByUser(personaId.toString());
      console.log('✅ Inscripciones obtenidas:', inscriptions);
      
      // Extraer los IDs de capacitaciones y almacenarlos en un Set para búsqueda rápida
      const trainingIds = new Set<string>();
      inscriptions.forEach((inscription) => {
        if (inscription.courseId) {
          trainingIds.add(inscription.courseId);
          console.log('📚 Agregando capacitación ID:', inscription.courseId, 'de inscripción:', inscription);
        }
      });
      
      console.log('📋 IDs de capacitaciones inscritas:', Array.from(trainingIds));
      enrolledTrainingIds.value = trainingIds;
    } catch (error) {
      console.error('❌ Error al cargar inscripciones del usuario:', error);
      
      // Si el error es que no hay inscripciones (404), no es crítico
      if (error instanceof Error && error.message.includes('No se encontraron inscripciones')) {
        console.warn('⚠️ El usuario no tiene inscripciones registradas');
        enrolledTrainingIds.value = new Set();
      } else {
        // Para otros errores, también usar Set vacío pero loguear el error
        console.error('❌ Error crítico al cargar inscripciones:', error);
        enrolledTrainingIds.value = new Set();
      }
    } finally {
      loading.value = false;
    }
  }

  /**
   * Computed que convierte el Set a Array para facilitar su uso
   */
  const enrolledTrainingIdsArray = computed(() => {
    return Array.from(enrolledTrainingIds.value);
  });

  return {
    enrolledTrainingIds: computed(() => enrolledTrainingIds.value),
    loading: computed(() => loading.value),
    isEnrolledIn,
    loadEnrollments,
    enrolledTrainingIdsArray,
  };
}

