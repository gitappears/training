// Servicio para toggle de estado de capacitaciones
import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';
import type { Training } from '../../../domain/training/models';

export type EstadoCapacitacion = 'borrador' | 'publicada' | 'en_curso' | 'finalizada' | 'cancelada';

export interface ToggleStatusResponse {
  capacitacion: Training;
  nuevoEstado: EstadoCapacitacion;
  certificadosExistentes: number;
}

/**
 * Servicio para toggle de estado de capacitaciones (RF-10)
 */
export class TrainingsToggleStatusService {
  private readonly baseUrl = '/capacitaciones';

  /**
   * Cambiar el estado de una capacitación
   * @param capacitacionId ID de la capacitación
   * @param estado Nuevo estado
   */
  async toggleStatus(
    capacitacionId: number,
    estado: EstadoCapacitacion,
  ): Promise<Training> {
    try {
      const response = await api.patch<Training>(
        `${this.baseUrl}/${capacitacionId}/toggle-status`,
        { estado },
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ??
          `Error al cambiar el estado de la capacitación ${capacitacionId}`,
      );
    }
  }

  /**
   * Toggle rápido entre activo/inactivo
   * @param capacitacionId ID de la capacitación
   */
  async toggleActivoInactivo(capacitacionId: number): Promise<Training> {
    try {
      const response = await api.patch<Training>(
        `${this.baseUrl}/${capacitacionId}/toggle-activo`,
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ??
          `Error al alternar el estado de la capacitación ${capacitacionId}`,
      );
    }
  }
}

// Exportar instancia singleton
export const trainingsToggleStatusService = new TrainingsToggleStatusService();

