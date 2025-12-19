// Caso de uso: Listar usuarios
// Capa de Aplicación (arquitectura hexagonal)

import type { IUserRepository, UserListParams } from '../user.repository.port';
import type { PaginatedResponse } from '../../training/training.repository.port';
import type { User } from '../../../domain/user/models';

/**
 * Caso de uso para listar usuarios con paginación y filtros
 * Sigue el principio de Responsabilidad Única (SRP)
 */
export class ListUsersUseCase {
  constructor(private readonly repository: IUserRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param params - Parámetros de paginación y filtros
   * @returns Lista paginada de usuarios
   */
  async execute(params: UserListParams): Promise<PaginatedResponse<User>> {
    return this.repository.findAll(params);
  }
}

