/**
 * Composable para gestionar el stepper del formulario de capacitación
 * Sigue principios SOLID y arquitectura hexagonal
 *
 * Responsabilidad única: Gestionar la navegación y estado del stepper
 */

import { ref, computed, type Ref } from 'vue';
import { useQuasar } from 'quasar';
import { useTrainingFormValidation, type StepValidationResult } from './useTrainingFormValidation';
import type { TrainingFormModel } from '../../presentation/trainings/components/TrainingForm.vue';

/**
 * Número total de pasos del stepper
 */
const TOTAL_STEPS = 3;

/**
 * Resultado del composable
 */
export interface UseTrainingFormStepperReturn {
  /**
   * Paso actual del stepper (1-3)
   */
  currentStep: Ref<number>;

  /**
   * Indica si se puede avanzar al siguiente paso
   */
  canProceedToNextStep: Ref<boolean>;

  /**
   * Indica si se puede retroceder
   */
  canGoBack: Ref<boolean>;

  /**
   * Indica si se está en el último paso
   */
  isLastStep: Ref<boolean>;

  /**
   * Indica si se está en el primer paso
   */
  isFirstStep: Ref<boolean>;

  /**
   * Resultado de validación del paso actual
   */
  currentStepValidation: Ref<StepValidationResult | null>;

  /**
   * Avanza al siguiente paso si es válido
   */
  nextStep: (form: TrainingFormModel) => Promise<boolean>;

  /**
   * Retrocede al paso anterior
   */
  previousStep: () => void;

  /**
   * Va a un paso específico
   */
  goToStep: (step: number) => void;

  /**
   * Valida el paso actual
   */
  validateCurrentStep: (form: TrainingFormModel) => boolean;

  /**
   * Resetea el stepper al paso inicial
   */
  reset: () => void;
}

/**
 * Composable para gestionar el stepper del formulario
 *
 * @returns Funciones y estados para gestionar el stepper
 */
export function useTrainingFormStepper(): UseTrainingFormStepperReturn {
  const $q = useQuasar();
  const { validateStep1, validateStep2, validateStep3 } = useTrainingFormValidation();

  const currentStep = ref<number>(1);
  const currentStepValidation = ref<StepValidationResult | null>(null);

  /**
   * Indica si se puede avanzar
   */
  const canProceedToNextStep = computed(() => {
    if (!currentStepValidation.value) return false;
    return currentStepValidation.value.isValid;
  });

  /**
   * Indica si se puede retroceder
   */
  const canGoBack = computed(() => {
    return currentStep.value > 1;
  });

  /**
   * Indica si es el último paso
   */
  const isLastStep = computed(() => {
    return currentStep.value === TOTAL_STEPS;
  });

  /**
   * Indica si es el primer paso
   */
  const isFirstStep = computed(() => {
    return currentStep.value === 1;
  });

  /**
   * Valida el paso actual
   */
  function validateCurrentStep(form: TrainingFormModel): boolean {
    let result: StepValidationResult;

    switch (currentStep.value) {
      case 1:
        result = validateStep1(form);
        break;
      case 2:
        result = validateStep2();
        break;
      case 3:
        result = validateStep3(form);
        break;
      default:
        result = { isValid: false, errors: ['Paso inválido'] };
    }

    currentStepValidation.value = result;

    if (!result.isValid && result.errors.length > 0) {
      $q.notify({
        type: 'warning',
        message: result.errors[0],
        position: 'top',
        timeout: 4000,
      });
    }

    return result.isValid;
  }

  /**
   * Avanza al siguiente paso si es válido
   */
  async function nextStep(form: TrainingFormModel): Promise<boolean> {
    // Validar paso actual antes de avanzar
    const isValid = validateCurrentStep(form);

    if (!isValid) {
      return false;
    }

    // Avanzar al siguiente paso si no es el último
    if (currentStep.value < TOTAL_STEPS) {
      currentStep.value++;
      currentStepValidation.value = null; // Resetear validación del nuevo paso
      return true;
    }

    return false;
  }

  /**
   * Retrocede al paso anterior
   */
  function previousStep(): void {
    if (currentStep.value > 1) {
      currentStep.value--;
      currentStepValidation.value = null; // Resetear validación
    }
  }

  /**
   * Va a un paso específico
   */
  function goToStep(step: number): void {
    if (step >= 1 && step <= TOTAL_STEPS) {
      currentStep.value = step;
      currentStepValidation.value = null; // Resetear validación
    }
  }

  /**
   * Resetea el stepper
   */
  function reset(): void {
    currentStep.value = 1;
    currentStepValidation.value = null;
  }

  return {
    currentStep,
    canProceedToNextStep,
    canGoBack,
    isLastStep,
    isFirstStep,
    currentStepValidation,
    nextStep,
    previousStep,
    goToStep,
    validateCurrentStep,
    reset,
  };
}

