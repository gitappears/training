import type { IRoleRepository } from '../role.repository.port';
import type { Role } from '../../../domain/role/models';

/**
 * Caso de uso para obtener todos los roles
 */
export class GetRolesUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(): Promise<Role[]> {
    return await this.roleRepository.findAll();
  }
}

