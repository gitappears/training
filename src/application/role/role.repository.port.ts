import type { Role } from '../../domain/role/models';

/**
 * Puerto para el repositorio de Roles
 * Define la interfaz que debe implementar cualquier adaptador de roles
 */
export interface IRoleRepository {
  /**
   * Obtiene todos los roles activos
   */
  findAll(): Promise<Role[]>;
}

