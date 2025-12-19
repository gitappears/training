// Puerto (interface) para el repositorio de evaluaciones
// Define el contrato que debe cumplir cualquier implementación

import type {
  Evaluation,
  EvaluationAttempt,
  EvaluationListParams,
  EvaluationFilters,
  EvaluationStatistics,
} from '../../domain/evaluation/models';
import type { PaginatedResponse } from '../training/training.repository.port';

// Re-exportar tipos del dominio para facilitar importaciones
export type {
  EvaluationListParams,
  EvaluationFilters,
  EvaluationStatistics,
};

export interface CreateEvaluationDto {
  courseId: string;
  description: string;
  durationMinutes: number;
  minimumScore: number; // RF-19: Porcentaje mínimo configurable
  attemptsAllowed: number; // RF-21: Número de intentos permitidos
  questions: CreateQuestionDto[];
}

export interface CreateQuestionDto {
  text: string;
  type: 'single' | 'multiple' | 'image' | 'true_false' | 'yes_no'; // RF-16: 5 tipos
  options: CreateQuestionOptionDto[];
  imageUrl?: string; // Para preguntas con imagen
  order: number;
}

export interface CreateQuestionOptionDto {
  text: string;
  imageUrl?: string;
  isCorrect: boolean;
}

export type UpdateEvaluationDto = Partial<Omit<CreateEvaluationDto, 'courseId'>>;

export interface SubmitEvaluationDto {
  evaluationId: string;
  answers: Record<string, string | string[]>; // questionId -> answer(s)
  timeSpentMinutes: number;
}

export interface IEvaluationRepository {
  /**
   * Obtener lista de evaluaciones con paginación y filtros
   */
  findAll(params: EvaluationListParams): Promise<PaginatedResponse<Evaluation>>;

  /**
   * Obtener una evaluación por ID (con preguntas)
   */
  findOne(id: string): Promise<Evaluation>;

  /**
   * Obtener evaluación por curso
   */
  findByCourse(courseId: string): Promise<Evaluation | null>;

  /**
   * Crear una nueva evaluación
   */
  create(dto: CreateEvaluationDto): Promise<Evaluation>;

  /**
   * Actualizar una evaluación existente
   */
  update(id: string, dto: UpdateEvaluationDto): Promise<Evaluation>;

  /**
   * Eliminar una evaluación
   */
  remove(id: string): Promise<void>;

  /**
   * Enviar respuestas de evaluación (RF-18: Calificación automática)
   */
  submitAttempt(dto: SubmitEvaluationDto): Promise<EvaluationAttempt>;

  /**
   * Obtener intentos de un usuario para una evaluación
   */
  getUserAttempts(evaluationId: string, userId: string): Promise<EvaluationAttempt[]>;

  /**
   * Obtener estadísticas de evaluaciones
   */
  getStatistics(filters?: EvaluationFilters): Promise<EvaluationStatistics>;
}

