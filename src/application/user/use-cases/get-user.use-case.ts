// Caso de uso: Obtener un usuario por ID
// Capa de Aplicación (arquitectura hexagonal)

import type { IUserRepository } from '../user.repository.port';
import type { User } from '../../../domain/user/models';

/**
 * Caso de uso para obtener un usuario por su ID
 * Sigue el principio de Responsabilidad Única (SRP)
 */
export class GetUserUseCase {
  constructor(private readonly repository: IUserRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param id - ID del usuario
   * @returns Usuario encontrado
   * @throws Error si el usuario no existe
   */
  async execute(id: string): Promise<User> {
    return this.repository.findOne(id);
  }
}

