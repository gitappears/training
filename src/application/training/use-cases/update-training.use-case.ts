// Caso de uso: Actualizar una capacitación existente
// Orquesta la lógica de negocio para actualizar capacitaciones

import type { ITrainingRepository } from '../training.repository.port';
import type { UpdateTrainingDto } from '../training.repository.port';
import type { Training } from '../../../domain/training/models';

export class UpdateTrainingUseCase {
  constructor(private readonly repository: ITrainingRepository) {}

  async execute(id: number, dto: UpdateTrainingDto): Promise<Training> {
    // Aquí se puede agregar lógica de negocio adicional:
    // - Validaciones de negocio
    // - Reglas de actualización
    // - Auditoría de cambios
    
    // Por ahora, delegamos directamente al repositorio
    return await this.repository.update(id, dto);
  }
}

