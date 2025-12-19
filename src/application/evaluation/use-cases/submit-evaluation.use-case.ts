// Caso de uso: Enviar evaluación (RF-18: Calificación automática)
// Capa de Aplicación (arquitectura hexagonal)

import type { IEvaluationRepository, SubmitEvaluationDto } from '../evaluation.repository.port';
import type { EvaluationAttempt } from '../../../domain/evaluation/models';

/**
 * Caso de uso para enviar una evaluación y obtener calificación automática
 * RF-18: La calificación será automática y en tiempo real
 */
export class SubmitEvaluationUseCase {
  constructor(private readonly repository: IEvaluationRepository) {}

  async execute(dto: SubmitEvaluationDto): Promise<EvaluationAttempt> {
    return this.repository.submitAttempt(dto);
  }
}

