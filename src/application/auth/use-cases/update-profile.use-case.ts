// Caso de uso: Actualizar perfil de usuario
import type { IAuthRepository, RegisterDto } from '../auth.repository.port';

export class UpdateProfileUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(data: Partial<RegisterDto>): Promise<void> {
    return await this.repository.updateProfile(data);
  }
}
