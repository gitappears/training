// Caso de uso: Obtener perfil del usuario autenticado
// Orquesta la lógica de negocio para obtener perfil

import type { IAuthRepository } from '../auth.repository.port';
import type { UserProfile } from '../auth.repository.port';

export class GetProfileUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(): Promise<UserProfile> {
    // Aquí se puede agregar lógica de negocio adicional:
    // - Enriquecimiento de datos
    // - Caché si es necesario
    // - Validaciones de acceso
    
    // Por ahora, delegamos directamente al repositorio
    return await this.repository.getProfile();
  }
}

