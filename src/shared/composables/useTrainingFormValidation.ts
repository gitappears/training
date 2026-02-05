/**
 * Composable para validaciones específicas del formulario de capacitación
 * Sigue principios SOLID y arquitectura hexagonal
 *
 * Responsabilidad única: Validar datos del formulario de capacitación
 */

import type { TrainingFormModel } from '../../presentation/trainings/components/TrainingForm.vue';

/**
 * Resultado de validación de un paso
 */
export interface StepValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Resultado del composable
 */
export interface UseTrainingFormValidationReturn {
  /**
   * Valida el paso 1 (Información básica)
   */
  validateStep1: (form: TrainingFormModel) => StepValidationResult;

  /**
   * Valida el paso 2 (Contenido y materiales)
   */
  validateStep2: () => StepValidationResult;

  /**
   * Valida el paso 3 (Evaluación o Encuesta)
   */
  validateStep3: (form: TrainingFormModel) => StepValidationResult;

  /**
   * Valida el formulario completo antes de enviar
   */
  validateCompleteForm: (form: TrainingFormModel) => StepValidationResult;
}

/**
 * Composable para validaciones del formulario de capacitación
 *
 * @returns Funciones de validación para cada paso
 */
export function useTrainingFormValidation(): UseTrainingFormValidationReturn {
  /**
   * Valida el paso 1: Información básica
   */
  function validateStep1(form: TrainingFormModel): StepValidationResult {
    const errors: string[] = [];

    // Validar título
    if (!form.title || form.title.trim().length === 0) {
      errors.push('El título es obligatorio');
    } else if (form.title.trim().length < 5) {
      errors.push('El título debe tener al menos 5 caracteres');
    } else if (form.title.length > 200) {
      errors.push('El título no puede exceder 200 caracteres');
    }

    // Validar tipo
    if (!form.type) {
      errors.push('Debe seleccionar un tipo de capacitación');
    }

    // Validar descripción
    if (!form.description || form.description.trim().length === 0) {
      errors.push('La descripción es obligatoria');
    } else if (form.description.trim().length < 20) {
      errors.push('La descripción debe tener al menos 20 caracteres');
    } else if (form.description.length > 2000) {
      errors.push('La descripción no puede exceder 2000 caracteres');
    }

    // Validar modalidad
    if (!form.modality) {
      errors.push('Debe seleccionar una modalidad');
    }

    // Validar duración (opcional pero si existe debe ser válida)
    if (form.durationHours !== null && form.durationHours !== undefined) {
      if (form.durationHours < 0) {
        errors.push('La duración debe ser mayor o igual a 0');
      }
      if (!Number.isInteger(form.durationHours)) {
        errors.push('La duración debe ser un número entero');
      }
    }

    // Validar cupos (opcional pero si existe debe ser válido)
    if (form.capacity !== null && form.capacity !== undefined) {
      if (form.capacity < 1) {
        errors.push('Los cupos deben ser mayor o igual a 1');
      }
    }

    // Validar fechas
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (start > end) {
        errors.push('La fecha de término debe ser posterior a la fecha de inicio');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida el paso 2: Contenido y materiales
   * Este paso es opcional, por lo que siempre es válido
   */
  function validateStep2(): StepValidationResult {
    return {
      isValid: true,
      errors: [],
    };
  }

  /**
   * Valida el paso 3: Evaluación o Encuesta
   */
  function validateStep3(form: TrainingFormModel): StepValidationResult {
    const errors: string[] = [];

    if (!form.evaluationInline) {
      errors.push('Debe configurar la evaluación o encuesta');
      return {
        isValid: false,
        errors,
      };
    }

    const evaluation = form.evaluationInline;
    const isSurvey = form.type === 'survey';

    // Validar título
    if (!evaluation.titulo || evaluation.titulo.trim().length === 0) {
      errors.push('El título de la evaluación/encuesta es obligatorio');
    }

    // Validar preguntas
    if (!evaluation.preguntas || evaluation.preguntas.length === 0) {
      errors.push('Debe agregar al menos una pregunta');
    } else {
      // Validar cada pregunta
      evaluation.preguntas.forEach((pregunta, index) => {
        const preguntaNum = index + 1;

        // Validar enunciado
        if (!pregunta.enunciado || pregunta.enunciado.trim().length === 0) {
          errors.push(`La pregunta ${preguntaNum} debe tener un enunciado`);
        }

        // Validar opciones
        if (!pregunta.opciones || pregunta.opciones.length === 0) {
          errors.push(`La pregunta ${preguntaNum} debe tener al menos una opción`);
        } else {
          // Validar que todas las opciones tengan texto
          pregunta.opciones.forEach((opcion, optIndex) => {
            if (!opcion.texto || opcion.texto.trim().length === 0) {
              errors.push(`La pregunta ${preguntaNum}, opción ${optIndex + 1} debe tener texto`);
            }
          });

          // Para evaluaciones (no encuestas), validar que haya al menos una opción correcta
          if (!isSurvey) {
            const tieneOpcionCorrecta = pregunta.opciones.some(
              (o) => o.esCorrecta && o.texto && o.texto.trim().length > 0,
            );
            if (!tieneOpcionCorrecta) {
              errors.push(`La pregunta ${preguntaNum} debe tener al menos una opción correcta`);
            }
          }
        }

        // Para evaluaciones, validar puntaje
        if (!isSurvey) {
          if (pregunta.puntaje === null || pregunta.puntaje === undefined || pregunta.puntaje < 0) {
            errors.push(
              `La pregunta ${preguntaNum} debe tener un puntaje válido (mayor o igual a 0)`,
            );
          }
        }
      });
    }

    // Validaciones específicas para evaluaciones (no encuestas)
    if (!isSurvey) {
      // Validar intentos permitidos
      if (
        evaluation.intentosPermitidos === null ||
        evaluation.intentosPermitidos === undefined ||
        evaluation.intentosPermitidos < 1
      ) {
        errors.push('Los intentos permitidos deben ser mayor o igual a 1');
      }

      // Validar mínimo de aprobación
      if (
        evaluation.minimoAprobacion === null ||
        evaluation.minimoAprobacion === undefined ||
        evaluation.minimoAprobacion < 0 ||
        evaluation.minimoAprobacion > 100
      ) {
        errors.push('El mínimo para aprobar debe estar entre 0 y 100');
      }

      // Validar que el puntaje total sea mayor a 0
      const puntajeTotal = evaluation.preguntas.reduce((sum, p) => sum + (p.puntaje || 0), 0);
      if (puntajeTotal <= 0) {
        errors.push('El puntaje total debe ser mayor a 0');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida el formulario completo antes de enviar
   */
  function validateCompleteForm(form: TrainingFormModel): StepValidationResult {
    const errors: string[] = [];

    // Validar todos los pasos
    const step1Result = validateStep1(form);
    if (!step1Result.isValid) {
      errors.push(...step1Result.errors);
    }

    const step3Result = validateStep3(form);
    if (!step3Result.isValid) {
      errors.push(...step3Result.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  return {
    validateStep1,
    validateStep2,
    validateStep3,
    validateCompleteForm,
  };
}
