// Implementación HTTP del repositorio de configuración de sesión
// Adaptador que conecta la capa de aplicación con la API REST

import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';
import type {
  IConfiguracionSesionRepository,
  ConfiguracionSesion,
} from '../../../application/sesion/sesion.repository.port';

/**
 * Tipos para las respuestas del backend
 */
interface BackendConfiguracionSesion {
  id: number;
  tiempoInactividadMinutos: number | null;
  tiempoMaximoSesionMinutos: number | null;
  activo: number | boolean; // El backend puede enviar 1/0 o boolean
  fechaCreacion: string;
  fechaActualizacion: string;
}

/**
 * Servicio HTTP para configuración de sesión
 * Implementa el puerto IConfiguracionSesionRepository usando axios
 */
export class ConfiguracionSesionService implements IConfiguracionSesionRepository {
  private readonly baseUrl = '/configuracion-sesion';

  async findActive(): Promise<ConfiguracionSesion | null> {
    try {
      const response = await api.get<BackendConfiguracionSesion>(`${this.baseUrl}/active`);

      return {
        id: response.data.id,
        tiempoInactividadMinutos: response.data.tiempoInactividadMinutos,
        tiempoMaximoSesionMinutos: response.data.tiempoMaximoSesionMinutos,
        // Convertir número (1/0) a boolean
        activo:
          typeof response.data.activo === 'number'
            ? response.data.activo === 1
            : response.data.activo,
        fechaCreacion: new Date(response.data.fechaCreacion),
        fechaActualizacion: new Date(response.data.fechaActualizacion),
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener la configuración de sesión',
      );
    }
  }
}

// Exportar instancia singleton
export const configuracionSesionService = new ConfiguracionSesionService();
