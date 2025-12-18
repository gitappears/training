// Factory para crear instancias de casos de uso de capacitaciones
// Centraliza la creación y permite inyección de dependencias
// ✅ CORREGIDO: No importa de infrastructure, recibe el repositorio como parámetro

import type { ITrainingRepository } from './training.repository.port';
import {
  CreateTrainingUseCase,
  ListTrainingsUseCase,
  GetTrainingUseCase,
  UpdateTrainingUseCase,
  DeleteTrainingUseCase,
} from './use-cases';

/**
 * Factory que crea instancias de casos de uso con sus dependencias
 * ✅ Inversión de Dependencias: Recibe el repositorio como parámetro
 * En el futuro, esto podría usar un contenedor de DI (Dependency Injection)
 */
export class TrainingUseCasesFactory {
  /**
   * Crea una instancia del caso de uso para crear capacitaciones
   * @param repository - Repositorio inyectado desde la capa de presentación
   */
  static getCreateTrainingUseCase(repository: ITrainingRepository): CreateTrainingUseCase {
    return new CreateTrainingUseCase(repository);
  }

  /**
   * Crea una instancia del caso de uso para listar capacitaciones
   * @param repository - Repositorio inyectado desde la capa de presentación
   */
  static getListTrainingsUseCase(repository: ITrainingRepository): ListTrainingsUseCase {
    return new ListTrainingsUseCase(repository);
  }

  /**
   * Crea una instancia del caso de uso para obtener una capacitación
   * @param repository - Repositorio inyectado desde la capa de presentación
   */
  static getGetTrainingUseCase(repository: ITrainingRepository): GetTrainingUseCase {
    return new GetTrainingUseCase(repository);
  }

  /**
   * Crea una instancia del caso de uso para actualizar capacitaciones
   * @param repository - Repositorio inyectado desde la capa de presentación
   */
  static getUpdateTrainingUseCase(repository: ITrainingRepository): UpdateTrainingUseCase {
    return new UpdateTrainingUseCase(repository);
  }

  /**
   * Crea una instancia del caso de uso para eliminar capacitaciones
   * @param repository - Repositorio inyectado desde la capa de presentación
   */
  static getDeleteTrainingUseCase(repository: ITrainingRepository): DeleteTrainingUseCase {
    return new DeleteTrainingUseCase(repository);
  }
}

