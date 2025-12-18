// Caso de uso: Obtener una capacitación por ID
// Orquesta la lógica de negocio para obtener detalles de una capacitación

import type { ITrainingRepository } from '../training.repository.port';
import type { Training } from '../../../domain/training/models';

export class GetTrainingUseCase {
  constructor(private readonly repository: ITrainingRepository) {}

  async execute(id: number): Promise<Training> {
    // Aquí se puede agregar lógica de negocio adicional:
    // - Validaciones de acceso
    // - Enriquecimiento de datos
    // - Caché si es necesario
    
    // Por ahora, delegamos directamente al repositorio
    return await this.repository.findOne(id);
  }
}

