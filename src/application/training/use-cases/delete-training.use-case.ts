// Caso de uso: Eliminar una capacitación
// Orquesta la lógica de negocio para eliminar capacitaciones

import type { ITrainingRepository } from '../training.repository.port';

export class DeleteTrainingUseCase {
  constructor(private readonly repository: ITrainingRepository) {}

  async execute(id: number): Promise<void> {
    // Aquí se puede agregar lógica de negocio adicional:
    // - Validaciones de eliminación (ej: no eliminar si tiene inscripciones)
    // - Soft delete en lugar de hard delete
    // - Auditoría de eliminación
    
    // Por ahora, delegamos directamente al repositorio
    return await this.repository.remove(id);
  }
}

