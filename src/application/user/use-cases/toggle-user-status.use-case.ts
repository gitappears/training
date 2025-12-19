// Caso de uso: Habilitar/deshabilitar un usuario (RF-05)
// Capa de Aplicación (arquitectura hexagonal)

import type { IUserRepository } from '../user.repository.port';
import type { User } from '../../../domain/user/models';

/**
 * Caso de uso para habilitar o deshabilitar un usuario
 * RF-05: Los conductores externos no pueden iniciar sesión hasta ser habilitados
 * Sigue el principio de Responsabilidad Única (SRP)
 */
export class ToggleUserStatusUseCase {
  constructor(private readonly repository: IUserRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param id - ID del usuario
   * @param enabled - Estado deseado (true = habilitado, false = deshabilitado)
   * @returns Usuario actualizado
   * @throws Error si el usuario no existe
   */
  async execute(id: string, enabled: boolean): Promise<User> {
    return this.repository.toggleStatus(id, enabled);
  }
}

