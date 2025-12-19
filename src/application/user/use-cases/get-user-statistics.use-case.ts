// Caso de uso: Obtener estadísticas de usuarios
// Capa de Aplicación (arquitectura hexagonal)

import type { IUserRepository, UserFilters } from '../user.repository.port';
import type { UserStatistics } from '../../../domain/user/models';

/**
 * Caso de uso para obtener estadísticas de usuarios
 * Sigue el principio de Responsabilidad Única (SRP)
 */
export class GetUserStatisticsUseCase {
  constructor(private readonly repository: IUserRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param filters - Filtros opcionales para las estadísticas
   * @returns Estadísticas de usuarios
   */
  async execute(filters?: UserFilters): Promise<UserStatistics> {
    return this.repository.getStatistics(filters);
  }
}

