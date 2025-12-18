// Caso de uso: Iniciar sesión
// Orquesta la lógica de negocio para autenticación

import type { IAuthRepository } from '../auth.repository.port';
import type { LoginDto, TokenResponse } from '../auth.repository.port';

export class LoginUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(dto: LoginDto): Promise<TokenResponse> {
    // Aquí se puede agregar lógica de negocio adicional:
    // - Validaciones de negocio
    // - Rate limiting
    // - Auditoría de intentos de login
    
    // Por ahora, delegamos directamente al repositorio
    return await this.repository.login(dto);
  }
}

