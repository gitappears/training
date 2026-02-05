import { api } from '../../../boot/axios';
import type { IEvaluationAttemptRepository } from '../../../domain/evaluation-attempt/ports/evaluation-attempt.repository.port';
import type {
  EvaluationAttempt,
  EvaluationAttemptResult,
  SubmitAnswerData,
} from '../../../domain/evaluation-attempt/models';

/**
 * Servicio HTTP para intentos de evaluación
 * Implementa IEvaluationAttemptRepository usando Axios
 * Sigue el principio de Inversión de Dependencias (SOLID)
 */
export const evaluationAttemptsService: IEvaluationAttemptRepository = {
  /**
   * Iniciar un nuevo intento de evaluación
   */
  async startAttempt(evaluacionId: number, inscripcionId: number): Promise<EvaluationAttempt> {
    const response = await api.post<EvaluationAttempt>(
      `/evaluaciones/${evaluacionId}/intentos/start`,
      { inscripcionId },
    );
    return mapBackendToDomain(response.data);
  },

  /**
   * Guardar una respuesta del estudiante
   */
  async saveAnswer(
    evaluacionId: number,
    intentoId: number,
    answer: SubmitAnswerData,
  ): Promise<void> {
    await api.post(`/evaluaciones/${evaluacionId}/intentos/${intentoId}/respuestas`, answer);
  },

  /**
   * Finalizar un intento de evaluación
   */
  async finishAttempt(evaluacionId: number, intentoId: number): Promise<EvaluationAttemptResult> {
    const response = await api.post<EvaluationAttempt>(
      `/evaluaciones/${evaluacionId}/intentos/${intentoId}/finish`,
    );
    const attempt = mapBackendToDomain(response.data);
    return {
      id: attempt.id,
      evaluacionId: attempt.evaluacionId,
      numeroIntento: attempt.numeroIntento,
      puntajeObtenido: attempt.puntajeObtenido,
      puntajeTotal: attempt.puntajeTotal,
      porcentaje: attempt.porcentaje ?? 0,
      aprobado: attempt.aprobado ?? false,
      tiempoUtilizadoMinutos: attempt.tiempoUtilizadoMinutos ?? 0,
      fechaFinalizacion: attempt.fechaFinalizacion ?? new Date().toISOString(),
    };
  },

  /**
   * Obtener todos los intentos de un estudiante para una evaluación
   */
  async getAttempts(evaluacionId: number, inscripcionId: number): Promise<EvaluationAttempt[]> {
    const response = await api.get<EvaluationAttempt[]>(`/evaluaciones/${evaluacionId}/intentos`, {
      params: { inscripcionId },
    });
    return response.data.map(mapBackendToDomain);
  },

  /**
   * Obtener un intento específico por ID
   */
  async getAttempt(evaluacionId: number, intentoId: number): Promise<EvaluationAttempt | null> {
    try {
      const attempts = await this.getAttempts(evaluacionId, 0); // Necesitamos inscripcionId
      return attempts.find((a) => a.id === intentoId) ?? null;
    } catch (error) {
      console.error('Error al obtener intento:', error);
      return null;
    }
  },
};

/** Forma del intento tal como viene del backend */
interface BackendAttemptLike {
  id: number;
  evaluacionId?: number;
  evaluacion?: { id: number };
  inscripcionId?: number;
  inscripcion?: { id: number };
  numeroIntento: number;
  fechaInicio: string;
  fechaFinalizacion?: string;
  puntajeObtenido?: number;
  puntajeTotal?: number;
  porcentaje?: number;
  aprobado?: boolean;
  tiempoUtilizadoMinutos?: number;
  estado?: string;
}

/**
 * Mapea los datos del backend al modelo de dominio
 */
function mapBackendToDomain(backendData: BackendAttemptLike): EvaluationAttempt {
  return {
    id: backendData.id,
    evaluacionId: backendData.evaluacion?.id ?? backendData.evaluacionId ?? 0,
    inscripcionId: backendData.inscripcion?.id ?? backendData.inscripcionId ?? 0,
    numeroIntento: backendData.numeroIntento,
    fechaInicio: backendData.fechaInicio,
    fechaFinalizacion: backendData.fechaFinalizacion,
    puntajeObtenido: Number(backendData.puntajeObtenido ?? 0),
    puntajeTotal: Number(backendData.puntajeTotal ?? 0),
    porcentaje: backendData.porcentaje != null ? Number(backendData.porcentaje) : undefined,
    aprobado: backendData.aprobado ?? undefined,
    tiempoUtilizadoMinutos: backendData.tiempoUtilizadoMinutos ?? undefined,
    estado: (backendData.estado === 'completado' || backendData.estado === 'abandonado'
      ? backendData.estado
      : 'en_progreso') as EvaluationAttempt['estado'],
  };
}
