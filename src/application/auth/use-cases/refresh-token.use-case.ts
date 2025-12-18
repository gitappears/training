// Caso de uso: Refrescar token de acceso
// Orquesta la lógica de negocio para renovar sesión

import type { IAuthRepository } from '../auth.repository.port';
import type { TokenResponse } from '../auth.repository.port';

export class RefreshTokenUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(): Promise<TokenResponse> {
    // Aquí se puede agregar lógica de negocio adicional:
    // - Validaciones de token
    // - Auditoría de renovaciones
    // - Rate limiting
    
    // Por ahora, delegamos directamente al repositorio
    return await this.repository.refreshToken();
  }
}

