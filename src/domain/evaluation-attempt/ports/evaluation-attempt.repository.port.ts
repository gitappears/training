import type { EvaluationAttempt, EvaluationAttemptResult, SubmitAnswerData } from '../models';

/**
 * Puerto (interface) para el repositorio de intentos de evaluación
 * Define el contrato que debe cumplir cualquier implementación
 * Sigue el principio de Inversión de Dependencias (SOLID)
 */
export interface IEvaluationAttemptRepository {
  /**
   * Iniciar un nuevo intento de evaluación
   * @param evaluacionId ID de la evaluación
   * @param inscripcionId ID de la inscripción del estudiante
   * @returns Intento iniciado
   */
  startAttempt(evaluacionId: number, inscripcionId: number): Promise<EvaluationAttempt>;

  /**
   * Guardar una respuesta del estudiante
   * @param evaluacionId ID de la evaluación
   * @param intentoId ID del intento
   * @param answer Datos de la respuesta
   */
  saveAnswer(evaluacionId: number, intentoId: number, answer: SubmitAnswerData): Promise<void>;

  /**
   * Finalizar un intento de evaluación
   * @param evaluacionId ID de la evaluación
   * @param intentoId ID del intento
   * @returns Resultado del intento con puntaje calculado
   */
  finishAttempt(evaluacionId: number, intentoId: number): Promise<EvaluationAttemptResult>;

  /**
   * Obtener todos los intentos de un estudiante para una evaluación
   * @param evaluacionId ID de la evaluación
   * @param inscripcionId ID de la inscripción del estudiante
   * @returns Lista de intentos
   */
  getAttempts(evaluacionId: number, inscripcionId: number): Promise<EvaluationAttempt[]>;

  /**
   * Obtener un intento específico por ID
   * @param evaluacionId ID de la evaluación
   * @param intentoId ID del intento
   * @returns Intento de evaluación
   */
  getAttempt(evaluacionId: number, intentoId: number): Promise<EvaluationAttempt | null>;
}

