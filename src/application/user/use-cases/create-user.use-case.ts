// Caso de uso: Crear un nuevo usuario
// Capa de Aplicación (arquitectura hexagonal)

import type { IUserRepository, CreateUserDto } from '../user.repository.port';
import type { User } from '../../../domain/user/models';

/**
 * Caso de uso para crear un nuevo usuario
 * Sigue el principio de Responsabilidad Única (SRP)
 */
export class CreateUserUseCase {
  constructor(private readonly repository: IUserRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param dto - Datos del usuario a crear
   * @returns Usuario creado
   * @throws Error si los datos son inválidos o el usuario ya existe
   */
  async execute(dto: CreateUserDto): Promise<User> {
    // Validaciones de negocio podrían ir aquí
    // Por ahora, delegamos al repositorio
    return this.repository.create(dto);
  }
}

