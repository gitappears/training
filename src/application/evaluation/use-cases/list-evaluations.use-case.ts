// Caso de uso: Listar evaluaciones
// Capa de Aplicación (arquitectura hexagonal)

import type { IEvaluationRepository, EvaluationListParams } from '../evaluation.repository.port';
import type { PaginatedResponse } from '../../training/training.repository.port';
import type { Evaluation } from '../../../domain/evaluation/models';

/**
 * Caso de uso para listar evaluaciones con paginación y filtros
 */
export class ListEvaluationsUseCase {
  constructor(private readonly repository: IEvaluationRepository) {}

  async execute(params: EvaluationListParams): Promise<PaginatedResponse<Evaluation>> {
    return this.repository.findAll(params);
  }
}

