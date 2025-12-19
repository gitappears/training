// Caso de uso: Crear inscripción
// Capa de Aplicación (arquitectura hexagonal)

import type { IInscriptionRepository, CreateInscriptionDto, Inscription } from '../inscription.repository.port';

/**
 * Caso de uso para crear una nueva inscripción
 */
export class CreateInscriptionUseCase {
  constructor(private readonly repository: IInscriptionRepository) {}

  async execute(dto: CreateInscriptionDto): Promise<Inscription> {
    return this.repository.create(dto);
  }
}

