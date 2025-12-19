// Caso de uso: Obtener una evaluación por ID
// Capa de Aplicación (arquitectura hexagonal)

import type { IEvaluationRepository } from '../evaluation.repository.port';
import type { Evaluation } from '../../../domain/evaluation/models';

/**
 * Caso de uso para obtener una evaluación por su ID
 */
export class GetEvaluationUseCase {
  constructor(private readonly repository: IEvaluationRepository) {}

  async execute(id: string): Promise<Evaluation> {
    return this.repository.findOne(id);
  }
}

