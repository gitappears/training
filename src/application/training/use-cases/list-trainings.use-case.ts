// Caso de uso: Listar capacitaciones con paginación
// Orquesta la lógica de negocio para listar capacitaciones

import type { ITrainingRepository } from '../training.repository.port';
import type { PaginationParams, PaginatedResponse } from '../training.repository.port';
import type { Training } from '../../../domain/training/models';

export class ListTrainingsUseCase {
  constructor(private readonly repository: ITrainingRepository) {}

  async execute(params: PaginationParams): Promise<PaginatedResponse<Training>> {
    // Aquí se puede agregar lógica de negocio adicional:
    // - Filtros por defecto
    // - Validaciones de parámetros
    // - Transformaciones de datos
    
    // Por ahora, delegamos directamente al repositorio
    return await this.repository.findAll(params);
  }
}

