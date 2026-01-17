/**
 * Puerto del repositorio de configuración de sesión
 * Define la interfaz que debe implementar el adaptador de infraestructura
 */

export interface ConfiguracionSesion {
  id: number;
  tiempoInactividadMinutos: number | null;
  tiempoMaximoSesionMinutos: number | null;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface IConfiguracionSesionRepository {
  /**
   * Obtiene la configuración activa de sesión
   */
  findActive(): Promise<ConfiguracionSesion | null>;
}
