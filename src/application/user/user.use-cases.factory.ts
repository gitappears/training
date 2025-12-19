// Factory para crear instancias de casos de uso de usuarios
// Centraliza la creación y permite inyección de dependencias

import type { IUserRepository } from './user.repository.port';
import {
  CreateUserUseCase,
  ListUsersUseCase,
  GetUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  ToggleUserStatusUseCase,
  GetUserStatisticsUseCase,
} from './use-cases';

/**
 * Factory que crea instancias de casos de uso con sus dependencias
 * ✅ Inversión de Dependencias: Recibe el repositorio como parámetro
 */
export class UserUseCasesFactory {
  static getListUsersUseCase(repository: IUserRepository): ListUsersUseCase {
    return new ListUsersUseCase(repository);
  }

  static getGetUserUseCase(repository: IUserRepository): GetUserUseCase {
    return new GetUserUseCase(repository);
  }

  static getCreateUserUseCase(repository: IUserRepository): CreateUserUseCase {
    return new CreateUserUseCase(repository);
  }

  static getUpdateUserUseCase(repository: IUserRepository): UpdateUserUseCase {
    return new UpdateUserUseCase(repository);
  }

  static getDeleteUserUseCase(repository: IUserRepository): DeleteUserUseCase {
    return new DeleteUserUseCase(repository);
  }

  static getToggleUserStatusUseCase(repository: IUserRepository): ToggleUserStatusUseCase {
    return new ToggleUserStatusUseCase(repository);
  }

  static getGetUserStatisticsUseCase(repository: IUserRepository): GetUserStatisticsUseCase {
    return new GetUserStatisticsUseCase(repository);
  }
}

