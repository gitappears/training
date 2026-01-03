// Factory para crear instancias de casos de uso de roles
// Centraliza la creación y permite inyección de dependencias
// ✅ Inversión de Dependencias: No importa de infrastructure

import type { IRoleRepository } from './role.repository.port';
import { GetRolesUseCase } from './use-cases';

/**
 * Factory que crea instancias de casos de uso con sus dependencias
 * ✅ Inversión de Dependencias: Recibe el repositorio como parámetro
 */
export class RoleUseCasesFactory {
  /**
   * Crea una instancia del caso de uso para obtener roles
   * @param repository - Repositorio inyectado desde la capa de presentación
   */
  static getGetRolesUseCase(repository: IRoleRepository): GetRolesUseCase {
    return new GetRolesUseCase(repository);
  }
}

