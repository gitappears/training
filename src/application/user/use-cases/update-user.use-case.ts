// Caso de uso: Actualizar un usuario existente
// Capa de Aplicación (arquitectura hexagonal)

import type { IUserRepository, UpdateUserDto } from '../user.repository.port';
import type { User } from '../../../domain/user/models';

/**
 * Caso de uso para actualizar un usuario existente
 * Sigue el principio de Responsabilidad Única (SRP)
 */
export class UpdateUserUseCase {
  constructor(private readonly repository: IUserRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param id - ID del usuario a actualizar
   * @param dto - Datos a actualizar
   * @returns Usuario actualizado
   * @throws Error si el usuario no existe o los datos son inválidos
   */
  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    return this.repository.update(id, dto);
  }
}

