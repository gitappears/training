/**
 * Composable para obtener la evaluación asociada a una capacitación
 * Sigue principios SOLID y arquitectura hexagonal
 *
 * Responsabilidad única: Obtener y gestionar la evaluación de una capacitación
 */

import { ref, computed, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { trainingsService } from '../../infrastructure/http/trainings/trainings.service';
import type { Training } from '../../domain/training/models';

/**
 * Tipo extendido de Training que incluye evaluaciones del backend
 */
export interface TrainingWithEvaluations extends Training {
  evaluations?: Array<{ id: number | string }>;
}

/**
 * Resultado del composable
 */
export interface UseTrainingEvaluationReturn {
  /**
   * ID de la evaluación asociada a la capacitación
   */
  evaluationId: Ref<number | null>;

  /**
   * Indica si hay una evaluación disponible
   */
  hasEvaluation: Ref<boolean>;

  /**
   * Indica si se está cargando la evaluación
   */
  loading: Ref<boolean>;

  /**
   * Obtiene el ID de la evaluación de una capacitación
   */
  getEvaluationId: (training: TrainingWithEvaluations) => Promise<number | null>;

  /**
   * Navega a la página de presentar evaluación
   */
  navigateToEvaluation: (training: TrainingWithEvaluations) => Promise<void>;
}

/**
 * Composable para gestionar evaluaciones de capacitaciones
 *
 * @returns Funciones y estados para trabajar con evaluaciones
 */
export function useTrainingEvaluation(): UseTrainingEvaluationReturn {
  const router = useRouter();
  const $q = useQuasar();

  const evaluationId = ref<number | null>(null);
  const loading = ref(false);

  const hasEvaluation = computed(() => evaluationId.value !== null);

  /**
   * Obtiene el ID de la evaluación desde una capacitación
   * Primero intenta obtenerlo de las evaluaciones incluidas en el objeto
   * Si no está disponible, carga la capacitación completa
   */
  async function getEvaluationId(training: TrainingWithEvaluations): Promise<number | null> {
    // Si ya tenemos el ID en el objeto training, usarlo directamente
    if (training.evaluations && training.evaluations.length > 0) {
      const firstEvaluation = training.evaluations[0];
      if (firstEvaluation) {
        const evalId = firstEvaluation.id;
        const idNumber = typeof evalId === 'string' ? parseInt(evalId) : evalId;
        if (!isNaN(idNumber) && idNumber > 0) {
          evaluationId.value = idNumber;
          return idNumber;
        }
      }
    }

    // Si no está disponible, cargar la capacitación completa
    loading.value = true;
    try {
      const { TrainingUseCasesFactory } = await import(
        '../../application/training/training.use-cases.factory'
      );
      const getTrainingUseCase = TrainingUseCasesFactory.getGetTrainingUseCase(trainingsService);
      const fullTraining = await getTrainingUseCase.execute(parseInt(training.id));

      const trainingWithEvals = fullTraining as TrainingWithEvaluations;
      if (trainingWithEvals.evaluations && trainingWithEvals.evaluations.length > 0) {
        const firstEvaluation = trainingWithEvals.evaluations[0];
        if (firstEvaluation) {
          const evalId = firstEvaluation.id;
          const idNumber = typeof evalId === 'string' ? parseInt(evalId) : evalId;
          if (!isNaN(idNumber) && idNumber > 0) {
            evaluationId.value = idNumber;
            return idNumber;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error al obtener evaluación de la capacitación:', error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Navega a la página de presentar evaluación
   * Valida que exista una evaluación antes de navegar
   */
  async function navigateToEvaluation(training: TrainingWithEvaluations): Promise<void> {
    const evalId = await getEvaluationId(training);

    if (!evalId) {
      $q.notify({
        type: 'warning',
        message: 'Esta capacitación no tiene una evaluación asociada',
        icon: 'warning',
        position: 'top',
        timeout: 4000,
      });
      return;
    }

    void router.push(`/evaluations/${evalId}`);
  }

  return {
    evaluationId,
    hasEvaluation,
    loading,
    getEvaluationId,
    navigateToEvaluation,
  };
}

