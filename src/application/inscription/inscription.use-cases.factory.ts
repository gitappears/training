// Factory para crear instancias de casos de uso de inscripciones

import type { IInscriptionRepository } from './inscription.repository.port';
import { CreateInscriptionUseCase } from './use-cases';

/**
 * Factory que crea instancias de casos de uso con sus dependencias
 */
export class InscriptionUseCasesFactory {
  static getCreateInscriptionUseCase(
    repository: IInscriptionRepository,
  ): CreateInscriptionUseCase {
    return new CreateInscriptionUseCase(repository);
  }
}

