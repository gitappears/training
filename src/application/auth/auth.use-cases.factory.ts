// Factory para crear instancias de casos de uso de autenticación
// Centraliza la creación y permite inyección de dependencias
// ✅ Inversión de Dependencias: No importa de infrastructure

import type { IAuthRepository } from './auth.repository.port';
import {
  LoginUseCase,
  RegisterUseCase,
  GetProfileUseCase,
  RefreshTokenUseCase,
} from './use-cases';

/**
 * Factory que crea instancias de casos de uso con sus dependencias
 * ✅ Inversión de Dependencias: Recibe el repositorio como parámetro
 */
export class AuthUseCasesFactory {
  /**
   * Crea una instancia del caso de uso para iniciar sesión
   * @param repository - Repositorio inyectado desde la capa de presentación
   */
  static getLoginUseCase(repository: IAuthRepository): LoginUseCase {
    return new LoginUseCase(repository);
  }

  /**
   * Crea una instancia del caso de uso para registrar usuario
   * @param repository - Repositorio inyectado desde la capa de presentación
   */
  static getRegisterUseCase(repository: IAuthRepository): RegisterUseCase {
    return new RegisterUseCase(repository);
  }

  /**
   * Crea una instancia del caso de uso para obtener perfil
   * @param repository - Repositorio inyectado desde la capa de presentación
   */
  static getGetProfileUseCase(repository: IAuthRepository): GetProfileUseCase {
    return new GetProfileUseCase(repository);
  }

  /**
   * Crea una instancia del caso de uso para refrescar token
   * @param repository - Repositorio inyectado desde la capa de presentación
   */
  static getRefreshTokenUseCase(repository: IAuthRepository): RefreshTokenUseCase {
    return new RefreshTokenUseCase(repository);
  }
}

