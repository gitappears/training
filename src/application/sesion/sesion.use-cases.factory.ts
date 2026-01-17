// Factory para crear instancias de casos de uso de configuración de sesión

import type { IConfiguracionSesionRepository } from './sesion.repository.port';
import { GetActiveConfiguracionSesionUseCase } from './use-cases/get-active-configuracion-sesion.use-case';

/**
 * Factory que crea instancias de casos de uso con sus dependencias
 */
export class SesionUseCasesFactory {
  static getGetActiveConfiguracionSesionUseCase(
    repository: IConfiguracionSesionRepository,
  ): GetActiveConfiguracionSesionUseCase {
    return new GetActiveConfiguracionSesionUseCase(repository);
  }
}
