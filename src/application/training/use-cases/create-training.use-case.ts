// Caso de uso: Crear una nueva capacitación
// Orquesta la lógica de negocio para crear capacitaciones

import type { ITrainingRepository } from '../training.repository.port';
import type { CreateTrainingDto } from '../training.repository.port';
import type { Training } from '../../../domain/training/models';

export class CreateTrainingUseCase {
  constructor(private readonly repository: ITrainingRepository) {}

  async execute(dto: CreateTrainingDto): Promise<Training> {
    // Aquí se puede agregar lógica de negocio adicional:
    // - Validaciones de negocio
    // - Transformaciones de datos
    // - Reglas de negocio específicas
    
    // Por ahora, delegamos directamente al repositorio
    return await this.repository.create(dto);
  }
}

