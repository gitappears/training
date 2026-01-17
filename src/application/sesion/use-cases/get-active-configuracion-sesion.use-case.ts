// Caso de uso: Obtener configuración activa de sesión
// Capa de Aplicación (arquitectura hexagonal)

import type {
  IConfiguracionSesionRepository,
  ConfiguracionSesion,
} from '../sesion.repository.port';

/**
 * Caso de uso para obtener la configuración activa de sesión
 */
export class GetActiveConfiguracionSesionUseCase {
  constructor(private readonly repository: IConfiguracionSesionRepository) {}

  async execute(): Promise<ConfiguracionSesion | null> {
    return this.repository.findActive();
  }
}
