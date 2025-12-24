// Servicio para vincular evaluaciones a capacitaciones
import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';

export interface LinkEvaluationDto {
  evaluacionId: number;
}

/**
 * Servicio para vincular evaluaciones a capacitaciones
 */
export class TrainingsLinkEvaluationService {
  private readonly baseUrl = '/capacitaciones';

  async linkEvaluation(
    capacitacionId: number,
    evaluacionId: number,
  ): Promise<void> {
    try {
      await api.post<LinkEvaluationDto>(
        `${this.baseUrl}/${capacitacionId}/evaluaciones`,
        { evaluacionId },
      );
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ??
          `Error al vincular la evaluación a la capacitación ${capacitacionId}`,
      );
    }
  }
}

// Exportar instancia singleton
export const trainingsLinkEvaluationService = new TrainingsLinkEvaluationService();

