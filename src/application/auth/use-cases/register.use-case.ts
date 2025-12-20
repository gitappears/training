// Caso de uso: Registrar un nuevo usuario
// Orquesta la lógica de negocio para registro

import type { IAuthRepository } from '../auth.repository.port';
import type { RegisterDto, RegisterResponse } from '../auth.repository.port';

export class RegisterUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(dto: RegisterDto): Promise<RegisterResponse> {
    // Aquí se puede agregar lógica de negocio adicional:
    // - Validaciones de negocio
    // - Verificación de email
    // - Reglas de negocio específicas
    
    // Por ahora, delegamos directamente al repositorio
    return await this.repository.register(dto);
  }
}

