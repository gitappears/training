// Caso de uso: Eliminar un usuario
// Capa de Aplicación (arquitectura hexagonal)

import type { IUserRepository } from '../user.repository.port';

/**
 * Caso de uso para eliminar un usuario
 * Sigue el principio de Responsabilidad Única (SRP)
 */
export class DeleteUserUseCase {
  constructor(private readonly repository: IUserRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param id - ID del usuario a eliminar
   * @throws Error si el usuario no existe
   */
  async execute(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}

